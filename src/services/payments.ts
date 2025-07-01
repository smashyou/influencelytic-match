// src/services/payments.ts - Fixed Payments Service
import { toast } from "@/components/ui/use-toast";
import { authService } from "./auth";
import type {
  PaymentHistory,
  StripeAccountStatus,
  CreatePaymentIntentRequest,
  Transaction,
} from "@/types/api";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

class PaymentsService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...authService.getAuthHeaders(),
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An error occurred";
      toast({
        title: "Payment Error",
        description: message,
        variant: "destructive",
      });
      throw error;
    }
  }

  async createPaymentIntent(
    data: CreatePaymentIntentRequest
  ): Promise<{ client_secret: string }> {
    return await this.request<{ client_secret: string }>(
      "/api/payments/create-payment-intent",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }

  async getPaymentHistory(): Promise<PaymentHistory> {
    try {
      return await this.request<PaymentHistory>("/api/payments/history");
    } catch (error) {
      console.error("Failed to fetch payment history:", error);
      // Return default empty payment history
      return {
        transactions: [],
        summary: {
          total_earned: 0,
          total_spent: 0,
          pending_amount: 0,
          completed_transactions: 0,
          failed_transactions: 0,
        },
      };
    }
  }

  async createStripeAccount(): Promise<{
    account_id: string;
    onboarding_url: string;
  }> {
    const response = await this.request<{
      account_id: string;
      onboarding_url: string;
    }>("/api/payments/connect/create-account", {
      method: "POST",
    });

    toast({
      title: "Stripe Account Created",
      description:
        "Your Stripe Connect account has been created. Complete the onboarding process.",
    });

    return response;
  }

  async getStripeAccountStatus(): Promise<StripeAccountStatus> {
    try {
      return await this.request<StripeAccountStatus>(
        "/api/payments/connect/status"
      );
    } catch (error) {
      console.error("Failed to fetch Stripe account status:", error);
      // Return default status indicating no account
      return {
        status: "not_created",
        details_submitted: false,
        charges_enabled: false,
        payouts_enabled: false,
      };
    }
  }

  async requestPayout(amount: number): Promise<void> {
    await this.request<void>("/api/payments/request-payout", {
      method: "POST",
      body: JSON.stringify({ amount }),
    });

    toast({
      title: "Payout Requested",
      description: "Your payout request has been submitted successfully.",
    });
  }

  async getStripeAccountLink(): Promise<{ url: string }> {
    return await this.request<{ url: string }>(
      "/api/payments/connect/account-link",
      {
        method: "POST",
      }
    );
  }

  async getStripeDashboardUrl(): Promise<{ dashboard_url: string }> {
    const response = await this.request<{ dashboard_url: string }>(
      "/api/payments/connect/dashboard-url",
      {
        method: "POST",
      }
    );

    return response;
  }

  async cancelPayment(paymentIntentId: string): Promise<void> {
    await this.request<void>(`/api/payments/cancel/${paymentIntentId}`, {
      method: "POST",
    });

    toast({
      title: "Payment Cancelled",
      description: "The payment has been cancelled successfully.",
    });
  }

  async refundPayment(
    transactionId: string,
    amount?: number,
    reason?: string
  ): Promise<void> {
    await this.request<void>(`/api/payments/refund/${transactionId}`, {
      method: "POST",
      body: JSON.stringify({ amount, reason }),
    });

    toast({
      title: "Refund Processed",
      description: "The refund has been processed successfully.",
    });
  }

  // Helper methods for payment data formatting
  formatCurrency(amount: number, currency: string = "USD"): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount / 100); // Convert from cents to dollars
  }

  getTransactionStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case "completed":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "processing":
        return "text-blue-600 bg-blue-100";
      case "failed":
        return "text-red-600 bg-red-100";
      case "refunded":
        return "text-purple-600 bg-purple-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  }

  getStripeAccountStatusText(status: StripeAccountStatus): string {
    if (status.status === "not_created") {
      return "Not Created";
    }

    if (!status.details_submitted) {
      return "Setup Required";
    }

    if (!status.charges_enabled || !status.payouts_enabled) {
      return "Under Review";
    }

    return "Active";
  }

  getStripeAccountStatusColor(status: StripeAccountStatus): string {
    if (status.status === "not_created") {
      return "text-gray-600 bg-gray-100";
    }

    if (!status.details_submitted) {
      return "text-yellow-600 bg-yellow-100";
    }

    if (!status.charges_enabled || !status.payouts_enabled) {
      return "text-blue-600 bg-blue-100";
    }

    return "text-green-600 bg-green-100";
  }

  canRequestPayout(
    status: StripeAccountStatus,
    availableBalance: number
  ): boolean {
    return (
      status.payouts_enabled && status.charges_enabled && availableBalance > 0
    );
  }

  calculatePlatformFee(amount: number, feeRate: number = 5): number {
    return Math.round(amount * (feeRate / 100));
  }

  calculateInfluencerPayout(amount: number, feeRate: number = 5): number {
    const platformFee = this.calculatePlatformFee(amount, feeRate);
    return amount - platformFee;
  }

  // Group transactions by date for history display
  groupTransactionsByDate(
    transactions: Transaction[]
  ): Record<string, Transaction[]> {
    return transactions.reduce((groups, transaction) => {
      const date = new Date(transaction.created_at).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
      return groups;
    }, {} as Record<string, Transaction[]>);
  }

  // Calculate earnings for a specific time period
  calculateEarningsForPeriod(
    transactions: Transaction[],
    days: number
  ): { total: number; count: number } {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const filteredTransactions = transactions.filter(
      (t) => t.status === "completed" && new Date(t.created_at) >= cutoffDate
    );

    const total = filteredTransactions.reduce(
      (sum, t) => sum + t.influencer_payout,
      0
    );

    return {
      total,
      count: filteredTransactions.length,
    };
  }

  // Validate payment amounts
  isValidPaymentAmount(amount: number): boolean {
    return amount > 0 && amount <= 999999; // Max $9,999.99
  }

  // Get minimum payout amount (typically $10)
  getMinimumPayoutAmount(): number {
    return 1000; // $10.00 in cents
  }
}

export const paymentsService = new PaymentsService();
