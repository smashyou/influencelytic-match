// Payment Service - Handles Stripe payments and Connect payouts
const Stripe = require('stripe');
const { supabase } = require('../config/supabase');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

class PaymentService {
  /**
   * Create a Stripe Connect account for influencer payouts
   */
  async createConnectAccount(userId, email, country = 'US') {
    try {
      // Create Express account
      const account = await stripe.accounts.create({
        type: 'express',
        country,
        email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: {
          user_id: userId,
        },
      });

      // Store account ID in database
      const { error } = await supabase
        .from('profiles')
        .update({ stripe_account_id: account.id })
        .eq('id', userId);

      if (error) throw error;

      // Create account link for onboarding
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${process.env.FRONTEND_URL}/dashboard/payments/refresh`,
        return_url: `${process.env.FRONTEND_URL}/dashboard/payments/success`,
        type: 'account_onboarding',
      });

      return {
        account_id: account.id,
        onboarding_url: accountLink.url,
      };
    } catch (error) {
      console.error('Error creating Connect account:', error);
      throw error;
    }
  }

  /**
   * Check if an influencer's Stripe account is fully onboarded
   */
  async checkAccountStatus(accountId) {
    try {
      const account = await stripe.accounts.retrieve(accountId);
      
      return {
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        details_submitted: account.details_submitted,
        requirements: account.requirements,
      };
    } catch (error) {
      console.error('Error checking account status:', error);
      throw error;
    }
  }

  /**
   * Create a payment intent for campaign payment
   */
  async createCampaignPayment(campaignId, applicationId, amount, currency = 'usd') {
    try {
      // Get campaign and application details
      const { data: application } = await supabase
        .from('campaign_applications')
        .select(`
          *,
          campaign:campaigns!inner(
            id,
            title,
            brand_id
          ),
          influencer:profiles!campaign_applications_influencer_id_fkey(
            id,
            email,
            stripe_account_id
          )
        `)
        .eq('id', applicationId)
        .single();

      if (!application) throw new Error('Application not found');
      if (application.status !== 'accepted') {
        throw new Error('Application must be accepted before payment');
      }

      // Calculate platform fee (5%)
      const platformFeeRate = 0.05;
      const platformFee = Math.round(amount * platformFeeRate);
      const influencerPayout = amount - platformFee;

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, // Convert to cents
        currency,
        payment_method_types: ['card'],
        metadata: {
          campaign_id: campaignId,
          application_id: applicationId,
          brand_id: application.campaign.brand_id,
          influencer_id: application.influencer.id,
        },
        transfer_data: application.influencer.stripe_account_id ? {
          destination: application.influencer.stripe_account_id,
          amount: influencerPayout * 100, // Amount to transfer to influencer
        } : undefined,
        application_fee_amount: platformFee * 100,
      });

      // Create transaction record
      const { error } = await supabase
        .from('transactions')
        .insert({
          campaign_id: campaignId,
          application_id: applicationId,
          brand_id: application.campaign.brand_id,
          influencer_id: application.influencer.id,
          amount: amount * 100,
          currency,
          platform_fee_rate: platformFeeRate * 100,
          platform_fee: platformFee * 100,
          influencer_payout: influencerPayout * 100,
          stripe_payment_intent_id: paymentIntent.id,
          transaction_type: 'campaign_payment',
          status: 'pending',
        });

      if (error) throw error;

      return {
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.id,
        amount,
        platform_fee: platformFee,
        influencer_payout: influencerPayout,
      };
    } catch (error) {
      console.error('Error creating campaign payment:', error);
      throw error;
    }
  }

  /**
   * Handle successful payment
   */
  async handlePaymentSuccess(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        throw new Error('Payment not successful');
      }

      // Update transaction status
      const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .update({
          status: 'completed',
          processed_at: new Date().toISOString(),
        })
        .eq('stripe_payment_intent_id', paymentIntentId)
        .select()
        .single();

      if (txError) throw txError;

      // Update application status to completed
      const { error: appError } = await supabase
        .from('campaign_applications')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', transaction.application_id);

      if (appError) throw appError;

      // Send notifications
      await this.sendPaymentNotifications(transaction);

      return transaction;
    } catch (error) {
      console.error('Error handling payment success:', error);
      throw error;
    }
  }

  /**
   * Create a refund
   */
  async createRefund(transactionId, amount, reason) {
    try {
      // Get transaction details
      const { data: transaction } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (!transaction) throw new Error('Transaction not found');
      if (transaction.status !== 'completed') {
        throw new Error('Can only refund completed transactions');
      }

      // Create Stripe refund
      const refund = await stripe.refunds.create({
        payment_intent: transaction.stripe_payment_intent_id,
        amount: amount ? amount * 100 : undefined, // Partial refund if amount specified
        reason,
        metadata: {
          transaction_id: transactionId,
        },
      });

      // Update transaction record
      const { error } = await supabase
        .from('transactions')
        .update({
          status: 'refunded',
          refund_amount: refund.amount,
          refund_reason: reason,
        })
        .eq('id', transactionId);

      if (error) throw error;

      return refund;
    } catch (error) {
      console.error('Error creating refund:', error);
      throw error;
    }
  }

  /**
   * Get influencer's balance
   */
  async getInfluencerBalance(stripeAccountId) {
    try {
      const balance = await stripe.balance.retrieve({
        stripeAccount: stripeAccountId,
      });

      return {
        available: balance.available.map(b => ({
          amount: b.amount / 100,
          currency: b.currency,
        })),
        pending: balance.pending.map(b => ({
          amount: b.amount / 100,
          currency: b.currency,
        })),
      };
    } catch (error) {
      console.error('Error getting balance:', error);
      throw error;
    }
  }

  /**
   * Create manual payout for influencer
   */
  async createPayout(stripeAccountId, amount, currency = 'usd') {
    try {
      const payout = await stripe.payouts.create(
        {
          amount: amount * 100,
          currency,
          method: 'instant',
          metadata: {
            type: 'manual_payout',
          },
        },
        {
          stripeAccount: stripeAccountId,
        }
      );

      return payout;
    } catch (error) {
      console.error('Error creating payout:', error);
      throw error;
    }
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(userId, role) {
    try {
      let query = supabase
        .from('transactions')
        .select(`
          *,
          campaign:campaigns(title),
          application:campaign_applications(
            proposed_rate,
            influencer:profiles!campaign_applications_influencer_id_fkey(
              first_name,
              last_name,
              username
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (role === 'influencer') {
        query = query.eq('influencer_id', userId);
      } else if (role === 'brand') {
        query = query.eq('brand_id', userId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error getting transaction history:', error);
      throw error;
    }
  }

  /**
   * Calculate platform analytics
   */
  async calculatePlatformRevenue(startDate, endDate) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('platform_fee, created_at')
        .eq('status', 'completed')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (error) throw error;

      const totalRevenue = data.reduce((sum, tx) => sum + (tx.platform_fee / 100), 0);
      const transactionCount = data.length;
      const averageFee = transactionCount > 0 ? totalRevenue / transactionCount : 0;

      return {
        total_revenue: totalRevenue,
        transaction_count: transactionCount,
        average_fee: averageFee,
      };
    } catch (error) {
      console.error('Error calculating platform revenue:', error);
      throw error;
    }
  }

  /**
   * Send payment notifications
   */
  async sendPaymentNotifications(transaction) {
    try {
      // Notify influencer
      await supabase.from('notifications').insert({
        user_id: transaction.influencer_id,
        type: 'payment_received',
        title: 'Payment Received!',
        message: `You've received a payment of $${transaction.influencer_payout / 100}`,
        data: { transaction_id: transaction.id },
      });

      // Notify brand
      await supabase.from('notifications').insert({
        user_id: transaction.brand_id,
        type: 'payment_processed',
        title: 'Payment Processed',
        message: `Your payment of $${transaction.amount / 100} has been processed`,
        data: { transaction_id: transaction.id },
      });
    } catch (error) {
      console.error('Error sending payment notifications:', error);
    }
  }

  /**
   * Webhook handler for Stripe events
   */
  async handleWebhook(event) {
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(event.data.object.id);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentFailure(event.data.object.id);
          break;

        case 'account.updated':
          await this.handleAccountUpdate(event.data.object);
          break;

        case 'payout.paid':
          await this.handlePayoutPaid(event.data.object);
          break;

        case 'payout.failed':
          await this.handlePayoutFailed(event.data.object);
          break;

        default:
          console.log(`Unhandled webhook event: ${event.type}`);
      }
    } catch (error) {
      console.error('Webhook handling error:', error);
      throw error;
    }
  }

  async handlePaymentFailure(paymentIntentId) {
    // Update transaction status to failed
    await supabase
      .from('transactions')
      .update({ status: 'failed' })
      .eq('stripe_payment_intent_id', paymentIntentId);
  }

  async handleAccountUpdate(account) {
    // Update account status in database
    const { error } = await supabase
      .from('profiles')
      .update({
        stripe_charges_enabled: account.charges_enabled,
        stripe_payouts_enabled: account.payouts_enabled,
      })
      .eq('stripe_account_id', account.id);

    if (error) console.error('Error updating account status:', error);
  }

  async handlePayoutPaid(payout) {
    console.log('Payout paid:', payout.id);
    // Could track payout history if needed
  }

  async handlePayoutFailed(payout) {
    console.log('Payout failed:', payout.id);
    // Notify influencer of failed payout
  }
}

module.exports = new PaymentService();