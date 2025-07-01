// src/services/auth.ts - Fixed Authentication Service
import { toast } from "@/components/ui/use-toast";
import type { User, AuthResponse, UserType } from "@/types/api";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

interface SignUpData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  user_type: UserType;
}

interface SignInData {
  email: string;
  password: string;
}

class AuthService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
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
        title: "Authentication Error",
        description: message,
        variant: "destructive",
      });
      throw error;
    }
  }

  async signUp(userData: SignUpData): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    if (response.session?.access_token) {
      this.setToken(response.session.access_token);
    }

    return response;
  }

  async signIn(credentials: SignInData): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/api/auth/signin", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    if (response.session?.access_token) {
      this.setToken(response.session.access_token);
    }

    return response;
  }

  async signOut(): Promise<void> {
    try {
      const token = this.getToken();
      if (token) {
        await this.request<void>("/api/auth/signout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      // Even if signout fails on server, we still want to clear local token
      console.error("Signout error:", error);
    } finally {
      this.removeToken();
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const token = this.getToken();
      if (!token) {
        return null;
      }

      const response = await this.request<{ user: User }>("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.user;
    } catch (error) {
      console.error("Get current user error:", error);
      this.removeToken();
      return null;
    }
  }

  setToken(token: string): void {
    localStorage.setItem("token", token);
  }

  getToken(): string | null {
    return localStorage.getItem("token");
  }

  removeToken(): void {
    localStorage.removeItem("token");
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Helper method to get auth headers
  getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }
}

export const authService = new AuthService();
export default authService;
