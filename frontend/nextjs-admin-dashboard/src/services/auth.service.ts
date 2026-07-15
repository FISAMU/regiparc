// ============================================================
// Service d'authentification — Connexion à l'API Django
// ============================================================

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    is_staff: boolean;
    is_superuser: boolean;
    is_online?: boolean;
    photo?: string | null;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

const REMEMBER_EMAIL_KEY = "auth_remember_email";
const REMEMBER_FLAG_KEY = "auth_remember_me";
const SESSION_MAX_AGE_DAYS = 30;
const SESSION_MAX_AGE_SECONDS = SESSION_MAX_AGE_DAYS * 24 * 60 * 60;

async function parseErrorMessage(response: Response, fallback: string) {
  const error = await response.json().catch(() => ({ error: fallback }));
  return error.error || error.detail || fallback;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE}/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error(await parseErrorMessage(response, "Erreur de connexion"));
    }

    return response.json();
  },

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE}/password-reset/request/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error(
        await parseErrorMessage(response, "Impossible d'envoyer le code."),
      );
    }

    return response.json();
  },

  async verifyPasswordResetCode(
    email: string,
    code: string,
  ): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE}/password-reset/verify/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });

    if (!response.ok) {
      throw new Error(
        await parseErrorMessage(response, "Code de vérification invalide."),
      );
    }

    return response.json();
  },

  async confirmPasswordReset(
    email: string,
    code: string,
    password: string,
  ): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE}/password-reset/confirm/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, password }),
    });

    if (!response.ok) {
      throw new Error(
        await parseErrorMessage(response, "Impossible de modifier le mot de passe."),
      );
    }

    return response.json();
  },

  async logout(): Promise<void> {
    if (typeof window === "undefined") {
      return;
    }

    const token = this.getToken();
    if (token) {
      try {
        await fetch(`${API_BASE}/logout/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
        });
      } catch {
        // La session locale sera quand même nettoyée.
      }
    }

    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("auth_user");
    document.cookie =
      "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";
  },

  getToken(): string | null {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token")
      );
    }
    return null;
  },

  getUser(): LoginResponse["user"] | null {
    if (typeof window !== "undefined") {
      const data =
        localStorage.getItem("auth_user") ||
        sessionStorage.getItem("auth_user");
      return data ? JSON.parse(data) : null;
    }
    return null;
  },

  getRememberedEmail(): string {
    if (typeof window === "undefined") {
      return "";
    }
    return localStorage.getItem(REMEMBER_EMAIL_KEY) ?? "";
  },

  wasRememberMeEnabled(): boolean {
    if (typeof window === "undefined") {
      return false;
    }
    return localStorage.getItem(REMEMBER_FLAG_KEY) === "1";
  },

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  },

  /**
   * Sauvegarde le token et les infos utilisateur après connexion.
   * remember=true → session longue (30 jours)
   * remember=false → session navigateur (fermée à la fermeture)
   */
  saveSession(data: LoginResponse, remember = false): void {
    if (typeof window === "undefined") {
      return;
    }

    const storage = remember ? localStorage : sessionStorage;
    const otherStorage = remember ? sessionStorage : localStorage;

    otherStorage.removeItem("auth_token");
    otherStorage.removeItem("auth_user");

    storage.setItem("auth_token", data.token);
    storage.setItem("auth_user", JSON.stringify(data.user));

    if (remember) {
      localStorage.setItem(REMEMBER_FLAG_KEY, "1");
      localStorage.setItem(REMEMBER_EMAIL_KEY, data.user.email);
      document.cookie = `auth_token=${data.token}; path=/; max-age=${SESSION_MAX_AGE_SECONDS}; SameSite=Lax`;
    } else {
      localStorage.removeItem(REMEMBER_FLAG_KEY);
      localStorage.removeItem(REMEMBER_EMAIL_KEY);
      document.cookie = `auth_token=${data.token}; path=/; SameSite=Lax`;
    }
  },

  updateOnlineStatus(isOnline: boolean): void {
    this.updateStoredUser({ is_online: isOnline });
  },

  updateStoredUser(
    updates: Partial<LoginResponse["user"]>,
  ): LoginResponse["user"] | null {
    if (typeof window === "undefined") {
      return null;
    }

    const user = this.getUser();
    if (!user) {
      return null;
    }

    const nextUser = { ...user, ...updates };
    const storage =
      localStorage.getItem("auth_token") !== null ? localStorage : sessionStorage;
    storage.setItem("auth_user", JSON.stringify(nextUser));
    return nextUser;
  },
};
