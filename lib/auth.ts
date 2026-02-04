import { API_URL } from "./config";

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  company_name: string | null;
  is_active: boolean;
  created_at: string;
  credits: number;
  // Onboarding status
  onboarding_completed: boolean;
  onboarding_skipped: boolean;
  has_signature: boolean;
  gmail_connected: boolean;
}

export interface CreditBalance {
  current_balance: number;
  total_credits_used: number;
  usage_by_type: Record<string, number>;
  transactions_last_30_days: number;
  credits_per_action: number;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface SignupData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  company_name?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// Store token after login/signup
export const setToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
  }
};

// Get token
export const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

// Check if logged in
export const isLoggedIn = (): boolean => {
  return !!getToken();
};

// Logout
export const logout = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
  }
};

// Authenticated fetch helper
export const authFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getToken();
  
  // Only add Content-Type: application/json if there's a body
  const headers: HeadersInit = {
    ...options.headers,
    ...(token && { Authorization: `Bearer ${token}` }),
  };
  
  // Add Content-Type only if there's a body (for POST, PUT, PATCH with data)
  if (options.body) {
    (headers as Record<string, string>)["Content-Type"] = "application/json";
  }
  
  return fetch(url, {
    ...options,
    headers,
  });
};

// Sign up
export const signup = async (data: SignupData): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Signup failed");
  }

  const result: AuthResponse = await response.json();
  setToken(result.access_token);
  return result;
};

// Login
export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Login failed");
  }

  const result: AuthResponse = await response.json();
  setToken(result.access_token);
  return result;
};

// Get current user
export const getCurrentUser = async (): Promise<User> => {
  const response = await authFetch(`${API_URL}/api/auth/me`);

  if (!response.ok) {
    throw new Error("Failed to get user");
  }

  return response.json();
};

// Get credit balance
export const getCreditBalance = async (): Promise<CreditBalance> => {
  const response = await authFetch(`${API_URL}/api/auth/credits`);

  if (!response.ok) {
    throw new Error("Failed to get credits");
  }

  return response.json();
};

// Update profile
export const updateProfile = async (
  data: Partial<Pick<User, "first_name" | "last_name" | "company_name">>
): Promise<User> => {
  const response = await authFetch(`${API_URL}/api/auth/me`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update profile");
  }

  return response.json();
};
