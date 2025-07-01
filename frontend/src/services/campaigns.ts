// src/services/campaigns.ts - Fixed Campaigns Service
import { toast } from "@/components/ui/use-toast";
import { authService } from "./auth";
import type {
  Campaign,
  CampaignApplication,
  CreateCampaignRequest,
  CampaignFilters,
  ApplyCampaignRequest,
} from "@/types/api";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

class CampaignsService {
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
        title: "Campaigns Error",
        description: message,
        variant: "destructive",
      });
      throw error;
    }
  }

  async getCampaigns(filters?: CampaignFilters): Promise<Campaign[]> {
    try {
      const params = new URLSearchParams();

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              params.append(key, value.join(","));
            } else {
              params.append(key, value.toString());
            }
          }
        });
      }

      const queryString = params.toString();
      const endpoint = `/api/campaigns${queryString ? `?${queryString}` : ""}`;

      return await this.request<Campaign[]>(endpoint);
    } catch (error) {
      console.error("Failed to fetch campaigns:", error);
      return [];
    }
  }

  async getCampaign(id: string): Promise<Campaign | null> {
    try {
      return await this.request<Campaign>(`/api/campaigns/${id}`);
    } catch (error) {
      console.error("Failed to fetch campaign:", error);
      return null;
    }
  }

  async createCampaign(campaignData: CreateCampaignRequest): Promise<Campaign> {
    const response = await this.request<Campaign>("/api/campaigns", {
      method: "POST",
      body: JSON.stringify(campaignData),
    });

    toast({
      title: "Campaign Created",
      description: "Your campaign has been created successfully.",
    });

    return response;
  }

  async updateCampaign(
    id: string,
    updates: Partial<CreateCampaignRequest>
  ): Promise<Campaign> {
    const response = await this.request<Campaign>(`/api/campaigns/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });

    toast({
      title: "Campaign Updated",
      description: "Your campaign has been updated successfully.",
    });

    return response;
  }

  async deleteCampaign(id: string): Promise<void> {
    await this.request<void>(`/api/campaigns/${id}`, {
      method: "DELETE",
    });

    toast({
      title: "Campaign Deleted",
      description: "Your campaign has been deleted successfully.",
    });
  }

  async applyCampaign(
    campaignId: string,
    applicationData: ApplyCampaignRequest
  ): Promise<CampaignApplication> {
    const response = await this.request<CampaignApplication>(
      `/api/campaigns/${campaignId}/apply`,
      {
        method: "POST",
        body: JSON.stringify(applicationData),
      }
    );

    toast({
      title: "Application Submitted",
      description: "Your campaign application has been submitted successfully.",
    });

    return response;
  }

  async getCampaignApplications(
    campaignId?: string
  ): Promise<CampaignApplication[]> {
    try {
      const endpoint = campaignId
        ? `/api/campaigns/${campaignId}/applications`
        : "/api/applications";

      return await this.request<CampaignApplication[]>(endpoint);
    } catch (error) {
      console.error("Failed to fetch applications:", error);
      return [];
    }
  }

  async getMyApplications(): Promise<CampaignApplication[]> {
    try {
      return await this.request<CampaignApplication[]>("/api/applications/my");
    } catch (error) {
      console.error("Failed to fetch my applications:", error);
      return [];
    }
  }

  async updateApplicationStatus(
    applicationId: string,
    status: string,
    feedback?: string
  ): Promise<CampaignApplication> {
    const response = await this.request<CampaignApplication>(
      `/api/applications/${applicationId}`,
      {
        method: "PUT",
        body: JSON.stringify({
          status,
          brand_feedback: feedback,
        }),
      }
    );

    const statusText =
      status === "accepted"
        ? "accepted"
        : status === "rejected"
        ? "rejected"
        : "updated";

    toast({
      title: "Application Updated",
      description: `Application has been ${statusText}.`,
    });

    return response;
  }

  async withdrawApplication(applicationId: string): Promise<void> {
    await this.request<void>(`/api/applications/${applicationId}/withdraw`, {
      method: "POST",
    });

    toast({
      title: "Application Withdrawn",
      description: "Your application has been withdrawn successfully.",
    });
  }

  // Helper methods for campaign data
  formatCampaignBudget(campaign: Campaign): string {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: campaign.currency || "USD",
    });

    if (campaign.budget_min === campaign.budget_max) {
      return formatter.format(campaign.budget_min);
    }

    return `${formatter.format(campaign.budget_min)} - ${formatter.format(
      campaign.budget_max
    )}`;
  }

  getCampaignStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case "active":
        return "text-green-600 bg-green-100";
      case "draft":
        return "text-gray-600 bg-gray-100";
      case "paused":
        return "text-yellow-600 bg-yellow-100";
      case "completed":
        return "text-blue-600 bg-blue-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  }

  getApplicationStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "accepted":
        return "text-green-600 bg-green-100";
      case "rejected":
        return "text-red-600 bg-red-100";
      case "completed":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  }

  isApplicationDeadlinePassed(campaign: Campaign): boolean {
    if (!campaign.application_deadline) return false;
    return new Date(campaign.application_deadline) < new Date();
  }

  canApplyToCampaign(campaign: Campaign): boolean {
    return (
      campaign.status === "active" &&
      !this.isApplicationDeadlinePassed(campaign) &&
      (!campaign.max_applications ||
        campaign.selected_influencers_count < campaign.max_applications)
    );
  }

  // Calculate days until deadline
  getDaysUntilDeadline(campaign: Campaign): number | null {
    if (!campaign.application_deadline) return null;

    const deadline = new Date(campaign.application_deadline);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }
}

export const campaignsService = new CampaignsService();
