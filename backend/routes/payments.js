// backend/routes/payments.js - Complete Stripe Payment Integration
const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { supabase } = require("../config/supabase");
const { requireRole } = require("../middleware/auth");
const router = express.Router();

// Create Stripe Connect account for influencer
router.post(
  "/connect/create-account",
  requireRole(["influencer"]),
  async (req, res) => {
    try {
      const { country = "US", type = "express" } = req.body;

      // Check if user already has a connected account
      const { data: existingAccount } = await supabase
        .from("stripe_accounts")
        .select("stripe_account_id")
        .eq("user_id", req.user.id)
        .single();

      if (existingAccount) {
        return res.status(400).json({ error: "Stripe account already exists" });
      }

      // Create Stripe Connect account
      const account = await stripe.accounts.create({
        type: type,
        country: country,
        email: req.user.email,
        capabilities: {
          transfers: { requested: true },
        },
        business_type: "individual",
        metadata: {
          user_id: req.user.id,
          user_type: "influencer",
        },
      });

      // Store account info in database
      await supabase.from("stripe_accounts").insert({
        user_id: req.user.id,
        stripe_account_id: account.id,
        account_type: type,
        country: country,
        status: "pending",
      });

      // Create account link for onboarding
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${process.env.FRONTEND_URL}/dashboard?tab=payments&refresh=true`,
        return_url: `${process.env.FRONTEND_URL}/dashboard?tab=payments&success=true`,
        type: "account_onboarding",
      });

      res.json({
        account_id: account.id,
        onboarding_url: accountLink.url,
      });
    } catch (error) {
      console.error("Create Stripe account error:", error);
      res.status(500).json({ error: "Failed to create Stripe account" });
    }
  }
);

// Get Stripe account status
router.get("/connect/status", requireRole(["influencer"]), async (req, res) => {
  try {
    const { data: stripeAccount } = await supabase
      .from("stripe_accounts")
      .select("*")
      .eq("user_id", req.user.id)
      .single();

    if (!stripeAccount) {
      return res.json({ status: "not_created" });
    }

    // Get account details from Stripe
    const account = await stripe.accounts.retrieve(
      stripeAccount.stripe_account_id
    );

    // Update status in database
    const accountStatus =
      account.details_submitted && account.charges_enabled
        ? "active"
        : "pending";

    await supabase
      .from("stripe_accounts")
      .update({
        status: accountStatus,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        details_submitted: account.details_submitted,
      })
      .eq("user_id", req.user.id);

    res.json({
      status: accountStatus,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      details_submitted: account.details_submitted,
      requirements: account.requirements,
    });
  } catch (error) {
    console.error("Get Stripe status error:", error);
    res.status(500).json({ error: "Failed to get account status" });
  }
});

// Create payment intent for campaign
router.post(
  "/create-payment-intent",
  requireRole(["brand"]),
  async (req, res) => {
    try {
      const { application_id, amount, currency = "usd" } = req.body;

      // Validate application belongs to brand
      const { data: application, error: appError } = await supabase
        .from("campaign_applications")
        .select(
          `
        *,
        campaigns:campaign_id (brand_id, title),
        profiles:influencer_id (first_name, last_name)
      `
        )
        .eq("id", application_id)
        .single();

      if (appError || application.campaigns.brand_id !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      if (application.status !== "accepted") {
        return res
          .status(400)
          .json({ error: "Application must be accepted before payment" });
      }

      // Check if influencer has Stripe account
      const { data: influencerStripeAccount } = await supabase
        .from("stripe_accounts")
        .select("stripe_account_id, status")
        .eq("user_id", application.influencer_id)
        .single();

      if (
        !influencerStripeAccount ||
        influencerStripeAccount.status !== "active"
      ) {
        return res.status(400).json({
          error: "Influencer has not completed payment setup",
        });
      }

      // Calculate fees
      const platformFeeRate = 5.0; // 5%
      const amountInCents = Math.round(amount * 100);
      const platformFee = Math.round(amountInCents * (platformFeeRate / 100));
      const influencerPayout = amountInCents - platformFee;

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: currency,
        application_fee_amount: platformFee,
        transfer_data: {
          destination: influencerStripeAccount.stripe_account_id,
        },
        metadata: {
          application_id: application_id,
          campaign_id: application.campaign_id,
          brand_id: req.user.id,
          influencer_id: application.influencer_id,
          platform_fee: platformFee.toString(),
        },
      });

      // Create transaction record
      await supabase.from("transactions").insert({
        campaign_id: application.campaign_id,
        application_id: application_id,
        brand_id: req.user.id,
        influencer_id: application.influencer_id,
        amount: amountInCents,
        currency: currency,
        platform_fee_rate: platformFeeRate,
        platform_fee: platformFee,
        influencer_payout: influencerPayout,
        stripe_payment_intent_id: paymentIntent.id,
        status: "pending",
      });

      res.json({
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.id,
        amount: amountInCents,
        platform_fee: platformFee,
        influencer_payout: influencerPayout,
      });
    } catch (error) {
      console.error("Create payment intent error:", error);
      res.status(500).json({ error: "Failed to create payment intent" });
    }
  }
);

// Webhook to handle Stripe events
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      switch (event.type) {
        case "payment_intent.succeeded":
          await handlePaymentSucceeded(event.data.object);
          break;
        case "payment_intent.payment_failed":
          await handlePaymentFailed(event.data.object);
          break;
        case "account.updated":
          await handleAccountUpdated(event.data.object);
          break;
        case "transfer.created":
          await handleTransferCreated(event.data.object);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error("Webhook handling error:", error);
      res.status(500).json({ error: "Webhook handling failed" });
    }
  }
);

// Handle successful payment
const handlePaymentSucceeded = async (paymentIntent) => {
  try {
    const { application_id, campaign_id, brand_id, influencer_id } =
      paymentIntent.metadata;

    // Update transaction status
    await supabase
      .from("transactions")
      .update({
        status: "completed",
        processed_at: new Date().toISOString(),
      })
      .eq("stripe_payment_intent_id", paymentIntent.id);

    // Update campaign application status
    await supabase
      .from("campaign_applications")
      .update({
        status: "paid",
        completed_at: new Date().toISOString(),
      })
      .eq("id", application_id);

    // Create notifications
    await Promise.all([
      // Notify brand
      supabase.from("notifications").insert({
        user_id: brand_id,
        type: "payment_confirmed",
        title: "Payment Processed",
        message: "Your payment has been successfully processed",
        data: { application_id, payment_intent_id: paymentIntent.id },
      }),
      // Notify influencer
      supabase.from("notifications").insert({
        user_id: influencer_id,
        type: "payment_received",
        title: "Payment Received",
        message: "You have received a payment for your campaign work",
        data: { application_id, payment_intent_id: paymentIntent.id },
      }),
    ]);

    console.log(`Payment succeeded for application ${application_id}`);
  } catch (error) {
    console.error("Handle payment succeeded error:", error);
  }
};

// Handle failed payment
const handlePaymentFailed = async (paymentIntent) => {
  try {
    const { application_id, brand_id } = paymentIntent.metadata;

    // Update transaction status
    await supabase
      .from("transactions")
      .update({
        status: "failed",
        processed_at: new Date().toISOString(),
      })
      .eq("stripe_payment_intent_id", paymentIntent.id);

    // Notify brand
    await supabase.from("notifications").insert({
      user_id: brand_id,
      type: "payment_failed",
      title: "Payment Failed",
      message: "Your payment could not be processed. Please try again.",
      data: { application_id, payment_intent_id: paymentIntent.id },
    });

    console.log(`Payment failed for application ${application_id}`);
  } catch (error) {
    console.error("Handle payment failed error:", error);
  }
};

// Handle Stripe account updates
const handleAccountUpdated = async (account) => {
  try {
    const accountStatus =
      account.details_submitted && account.charges_enabled
        ? "active"
        : "pending";

    await supabase
      .from("stripe_accounts")
      .update({
        status: accountStatus,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        details_submitted: account.details_submitted,
      })
      .eq("stripe_account_id", account.id);

    console.log(`Account ${account.id} updated to status: ${accountStatus}`);
  } catch (error) {
    console.error("Handle account updated error:", error);
  }
};

// Handle transfer creation
const handleTransferCreated = async (transfer) => {
  try {
    // Update transaction with transfer ID
    await supabase
      .from("transactions")
      .update({
        stripe_transfer_id: transfer.id,
        payout_date: new Date().toISOString(),
      })
      .eq("stripe_payment_intent_id", transfer.source_transaction);

    console.log(`Transfer created: ${transfer.id}`);
  } catch (error) {
    console.error("Handle transfer created error:", error);
  }
};

// Get payment history for user
router.get("/history", async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from("transactions")
      .select(
        `
        *,
        campaigns (title, description),
        brand_profiles:brand_id (company_name),
        influencer_profiles:influencer_id (first_name, last_name)
      `
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by user role
    if (req.profile.user_type === "brand") {
      query = query.eq("brand_id", req.user.id);
    } else if (req.profile.user_type === "influencer") {
      query = query.eq("influencer_id", req.user.id);
    }

    if (status) {
      query = query.eq("status", status);
    }

    const { data: transactions, error } = await query;

    if (error) throw error;

    // Calculate summary statistics
    const { data: summary } = await supabase
      .from("transactions")
      .select("amount, status, platform_fee, influencer_payout")
      .eq(
        req.profile.user_type === "brand" ? "brand_id" : "influencer_id",
        req.user.id
      );

    const summaryStats = summary.reduce(
      (acc, transaction) => {
        acc.total_amount += transaction.amount || 0;
        acc.total_fees += transaction.platform_fee || 0;
        if (req.profile.user_type === "influencer") {
          acc.total_earnings += transaction.influencer_payout || 0;
        }
        if (transaction.status === "completed") {
          acc.completed_transactions += 1;
        }
        return acc;
      },
      {
        total_amount: 0,
        total_fees: 0,
        total_earnings: 0,
        completed_transactions: 0,
      }
    );

    res.json({
      transactions,
      summary: summaryStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: transactions.length === parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get payment history error:", error);
    res.status(500).json({ error: "Failed to fetch payment history" });
  }
});

// Get earnings dashboard for influencer
router.get("/earnings", requireRole(["influencer"]), async (req, res) => {
  try {
    // Get earnings summary
    const { data: transactions } = await supabase
      .from("transactions")
      .select("amount, influencer_payout, status, created_at, platform_fee")
      .eq("influencer_id", req.user.id);

    // Calculate monthly earnings
    const monthlyEarnings = transactions.reduce((acc, transaction) => {
      if (transaction.status !== "completed") return acc;

      const month = new Date(transaction.created_at)
        .toISOString()
        .substring(0, 7);
      if (!acc[month]) {
        acc[month] = {
          earnings: 0,
          transactions: 0,
          fees_paid: 0,
        };
      }

      acc[month].earnings += transaction.influencer_payout || 0;
      acc[month].transactions += 1;
      acc[month].fees_paid += transaction.platform_fee || 0;

      return acc;
    }, {});

    // Get pending payouts
    const { data: pendingPayouts } = await supabase
      .from("transactions")
      .select("influencer_payout, created_at, campaigns(title)")
      .eq("influencer_id", req.user.id)
      .eq("status", "completed")
      .is("payout_date", null);

    const totalPending = pendingPayouts.reduce(
      (sum, payout) => sum + (payout.influencer_payout || 0),
      0
    );

    // Get Stripe account status
    const { data: stripeAccount } = await supabase
      .from("stripe_accounts")
      .select("status, payouts_enabled")
      .eq("user_id", req.user.id)
      .single();

    res.json({
      monthly_earnings: monthlyEarnings,
      pending_payouts: {
        total_amount: totalPending,
        transactions: pendingPayouts,
      },
      stripe_status: stripeAccount || { status: "not_created" },
      total_lifetime_earnings: transactions
        .filter((t) => t.status === "completed")
        .reduce((sum, t) => sum + (t.influencer_payout || 0), 0),
    });
  } catch (error) {
    console.error("Get earnings error:", error);
    res.status(500).json({ error: "Failed to fetch earnings data" });
  }
});

// Manual payout request (for influencers with pending earnings)
router.post(
  "/request-payout",
  requireRole(["influencer"]),
  async (req, res) => {
    try {
      // Check Stripe account status
      const { data: stripeAccount } = await supabase
        .from("stripe_accounts")
        .select("stripe_account_id, status, payouts_enabled")
        .eq("user_id", req.user.id)
        .single();

      if (!stripeAccount || !stripeAccount.payouts_enabled) {
        return res.status(400).json({
          error:
            "Payouts not enabled. Please complete your Stripe account setup.",
        });
      }

      // Get pending earnings
      const { data: pendingTransactions } = await supabase
        .from("transactions")
        .select("id, influencer_payout, stripe_payment_intent_id")
        .eq("influencer_id", req.user.id)
        .eq("status", "completed")
        .is("payout_date", null);

      if (!pendingTransactions.length) {
        return res.status(400).json({ error: "No pending earnings to payout" });
      }

      const totalPayout = pendingTransactions.reduce(
        (sum, t) => sum + (t.influencer_payout || 0),
        0
      );

      // Create Stripe transfer (this would normally be automated)
      const transfer = await stripe.transfers.create({
        amount: totalPayout,
        currency: "usd",
        destination: stripeAccount.stripe_account_id,
        metadata: {
          user_id: req.user.id,
          transaction_count: pendingTransactions.length.toString(),
        },
      });

      // Update transactions with payout date
      const transactionIds = pendingTransactions.map((t) => t.id);
      await supabase
        .from("transactions")
        .update({
          payout_date: new Date().toISOString(),
          stripe_transfer_id: transfer.id,
        })
        .in("id", transactionIds);

      // Create notification
      await supabase.from("notifications").insert({
        user_id: req.user.id,
        type: "payout_processed",
        title: "Payout Processed",
        message: `Your payout of $${(totalPayout / 100).toFixed(
          2
        )} has been processed`,
        data: { transfer_id: transfer.id, amount: totalPayout },
      });

      res.json({
        message: "Payout processed successfully",
        transfer_id: transfer.id,
        amount: totalPayout,
        transaction_count: pendingTransactions.length,
      });
    } catch (error) {
      console.error("Payout request error:", error);
      res.status(500).json({ error: "Failed to process payout" });
    }
  }
);

// Create refund (for brands)
router.post("/refund", requireRole(["brand"]), async (req, res) => {
  try {
    const { transaction_id, reason, amount } = req.body;

    // Verify transaction belongs to brand
    const { data: transaction, error: transactionError } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", transaction_id)
      .eq("brand_id", req.user.id)
      .single();

    if (transactionError || !transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    if (transaction.status !== "completed") {
      return res
        .status(400)
        .json({ error: "Can only refund completed transactions" });
    }

    const refundAmount = amount ? Math.round(amount * 100) : transaction.amount;

    // Create Stripe refund
    const refund = await stripe.refunds.create({
      payment_intent: transaction.stripe_payment_intent_id,
      amount: refundAmount,
      reason: "requested_by_customer",
      metadata: {
        transaction_id: transaction_id,
        reason: reason || "Brand requested refund",
      },
    });

    // Update transaction
    await supabase
      .from("transactions")
      .update({
        status: "refunded",
        refund_amount: refundAmount,
        refund_reason: reason,
      })
      .eq("id", transaction_id);

    // Create notifications
    await Promise.all([
      // Notify brand
      supabase.from("notifications").insert({
        user_id: req.user.id,
        type: "refund_processed",
        title: "Refund Processed",
        message: `Refund of $${(refundAmount / 100).toFixed(
          2
        )} has been processed`,
        data: { transaction_id, refund_id: refund.id },
      }),
      // Notify influencer
      supabase.from("notifications").insert({
        user_id: transaction.influencer_id,
        type: "payment_refunded",
        title: "Payment Refunded",
        message: `A payment has been refunded by the brand`,
        data: { transaction_id, refund_id: refund.id },
      }),
    ]);

    res.json({
      message: "Refund processed successfully",
      refund_id: refund.id,
      amount: refundAmount,
    });
  } catch (error) {
    console.error("Refund error:", error);
    res.status(500).json({ error: "Failed to process refund" });
  }
});

// Get Stripe dashboard login link for influencers
router.get(
  "/stripe-dashboard",
  requireRole(["influencer"]),
  async (req, res) => {
    try {
      const { data: stripeAccount } = await supabase
        .from("stripe_accounts")
        .select("stripe_account_id")
        .eq("user_id", req.user.id)
        .single();

      if (!stripeAccount) {
        return res.status(404).json({ error: "No Stripe account found" });
      }

      const loginLink = await stripe.accounts.createLoginLink(
        stripeAccount.stripe_account_id
      );

      res.json({
        dashboard_url: loginLink.url,
      });
    } catch (error) {
      console.error("Stripe dashboard error:", error);
      res.status(500).json({ error: "Failed to create dashboard link" });
    }
  }
);

module.exports = router;
