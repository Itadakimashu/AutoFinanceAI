import { create as createAxiosInstance, isAxiosError, type AxiosError } from "axios";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "https://autofinanceai.onrender.com";

const ACCESS_TOKEN_KEY = "autofinance_access_token";
const REFRESH_TOKEN_KEY = "autofinance_refresh_token";

type AuthTokens = {
  accessToken: string | null;
  refreshToken: string | null;
};

type AuthCredentials = {
  username: string;
  password: string;
};

type RegisterPayload = AuthCredentials & {
  email?: string;
  first_name?: string;
  last_name?: string;
};

export type CurrentUser = {
  id: number;
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
};

export type TransactionRecord = {
  id: number;
  user?: number | CurrentUser;
  date: string;
  description: string;
  amount: number;
  category: string;
  is_recurring: boolean;
};

export type TransactionTotals = {
  total_income: number;
  total_expenses: number;
  net_amount: number;
  total_transactions: number;
};

export type TransactionListResponse = {
  count: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  next: string | null;
  previous: string | null;
  results: TransactionRecord[];
  totals: TransactionTotals;
};

type TransactionQueryParams = {
  search?: string;
  ordering?: string;
  category?: string;
  date?: string;
  date_after?: string;
  date_before?: string;
  amount_min?: number;
  amount_max?: number;
  page?: number;
};

type TransactionPayload = {
  date: string;
  description: string;
  amount: number;
  category: string;
  is_recurring?: boolean;
};

type TransactionPayloadInput = TransactionPayload | TransactionPayload[];

type ImageParseResult = {
  success: boolean;
  message?: string;
  transactions?: TransactionRecord[];
  error?: string;
};

type AuthContextTokens = AuthTokens & {
  source?: "bootstrap" | "login" | "refresh";
};

// Generous enough to survive a cold start on the backend host plus a slow
// Gemini vision call for receipt scanning, but still fails instead of
// leaving callers (like the scan button's loading state) hanging forever.
const REQUEST_TIMEOUT_MS = 60000;

const api = createAxiosInstance({
  baseURL: API_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
  },
});

const refreshClient = createAxiosInstance({
  baseURL: API_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
  },
});

let activeTokens: AuthTokens = {
  accessToken: null,
  refreshToken: null,
};

let refreshPromise: Promise<string | null> | null = null;

const webFallbackStorage = new Map<string, string>();

function canUseSecureStore() {
  return Platform.OS === "android" || Platform.OS === "ios";
}

function readWebStorage(key: string) {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage.getItem(key);
  }

  return webFallbackStorage.get(key) ?? null;
}

function writeWebStorage(key: string, value: string) {
  if (typeof window !== "undefined" && window.localStorage) {
    window.localStorage.setItem(key, value);
    return;
  }

  webFallbackStorage.set(key, value);
}

function deleteWebStorage(key: string) {
  if (typeof window !== "undefined" && window.localStorage) {
    window.localStorage.removeItem(key);
    return;
  }

  webFallbackStorage.delete(key);
}

function setAuthorizationHeader(accessToken: string | null) {
  if (accessToken) {
    api.defaults.headers.common.Authorization = `JWT ${accessToken}`;
    refreshClient.defaults.headers.common.Authorization = `JWT ${accessToken}`;
  } else {
    delete api.defaults.headers.common.Authorization;
    delete refreshClient.defaults.headers.common.Authorization;
  }
}

export function getAuthTokens() {
  return { ...activeTokens };
}

export function setAuthTokens(tokens: AuthContextTokens) {
  activeTokens = {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };

  setAuthorizationHeader(tokens.accessToken);
}

export async function persistAuthTokens(tokens: AuthTokens) {
  if (tokens.accessToken) {
    if (canUseSecureStore()) {
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.accessToken);
    } else {
      writeWebStorage(ACCESS_TOKEN_KEY, tokens.accessToken);
    }
  } else {
    if (canUseSecureStore()) {
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    } else {
      deleteWebStorage(ACCESS_TOKEN_KEY);
    }
  }

  if (tokens.refreshToken) {
    if (canUseSecureStore()) {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken);
    } else {
      writeWebStorage(REFRESH_TOKEN_KEY, tokens.refreshToken);
    }
  } else {
    if (canUseSecureStore()) {
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    } else {
      deleteWebStorage(REFRESH_TOKEN_KEY);
    }
  }

  setAuthTokens(tokens);
}

export async function loadStoredAuthTokens() {
  const [accessToken, refreshToken] = canUseSecureStore()
    ? await Promise.all([
        SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
        SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
      ])
    : [readWebStorage(ACCESS_TOKEN_KEY), readWebStorage(REFRESH_TOKEN_KEY)];

  const tokens = { accessToken, refreshToken };
  setAuthTokens(tokens);
  return tokens;
}

export async function clearStoredAuthTokens() {
  if (canUseSecureStore()) {
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    ]);
  } else {
    deleteWebStorage(ACCESS_TOKEN_KEY);
    deleteWebStorage(REFRESH_TOKEN_KEY);
  }

  setAuthTokens({ accessToken: null, refreshToken: null });
}

async function refreshAccessToken() {
  if (!activeTokens.refreshToken) {
    return null;
  }

  const response = await refreshClient.post<{ access: string }>(
    "/auth/jwt/refresh/",
    {
      refresh: activeTokens.refreshToken,
    },
  );

  const nextAccessToken = response.data?.access ?? null;
  if (nextAccessToken) {
    if (canUseSecureStore()) {
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, nextAccessToken);
    } else {
      writeWebStorage(ACCESS_TOKEN_KEY, nextAccessToken);
    }
    setAuthTokens({
      accessToken: nextAccessToken,
      refreshToken: activeTokens.refreshToken,
    });
  }

  return nextAccessToken;
}

api.interceptors.request.use((config) => {
  if (activeTokens.accessToken) {
    config.headers.Authorization = `JWT ${activeTokens.accessToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (typeof error.config & {
          _retry?: boolean;
        })
      | null;

    if (
      !originalRequest ||
      error.response?.status !== 401 ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    const url = originalRequest.url ?? "";
    if (
      url.includes("/auth/jwt/create/") ||
      url.includes("/auth/jwt/refresh/") ||
      url.includes("/auth/users/")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }

    const nextAccessToken = await refreshPromise;
    if (!nextAccessToken) {
      return Promise.reject(error);
    }

    originalRequest.headers.Authorization = `JWT ${nextAccessToken}`;
    return api(originalRequest);
  },
);

export async function signIn(credentials: AuthCredentials) {
  const response = await api.post<{ access: string; refresh: string }>(
    "/auth/jwt/create/",
    credentials,
  );

  return response.data;
}

export async function signUp(payload: RegisterPayload) {
  const response = await api.post("/auth/users/", payload);
  return response.data;
}

export async function fetchCurrentUser() {
  const response = await api.get<CurrentUser>("/auth/users/me/");
  return response.data;
}

export async function updateCurrentUser(payload: Partial<CurrentUser>) {
  const response = await api.patch<CurrentUser>("/api/user/update/", payload);
  return response.data;
}

export async function updatePassword(payload: {
  current_password: string;
  new_password: string;
  re_new_password: string;
}) {
  const response = await api.post("/auth/users/set_password/", payload);
  return response.data;
}

export async function getTransactions(params: TransactionQueryParams = {}) {
  const response = await api.get<TransactionListResponse>(
    "/api/transactions/",
    {
      params,
    },
  );

  return response.data;
}

export async function createTransaction(payload: TransactionPayloadInput) {
  const response = await api.post<TransactionRecord | TransactionRecord[]>(
    "/api/transactions/",
    payload,
  );

  return response.data;
}

export async function updateTransaction(
  id: number,
  payload: Partial<TransactionPayload>,
) {
  const response = await api.patch<TransactionRecord>(
    `/api/transactions/${id}/`,
    payload,
  );
  return response.data;
}

export async function deleteTransaction(id: number) {
  await api.delete(`/api/transactions/${id}/`);
}

export async function parseTransactionsFromImage(file: {
  uri: string;
  name?: string;
  type?: string;
}) {
  const formData = new FormData();
  formData.append("image", {
    uri: file.uri,
    name: file.name ?? "receipt.jpg",
    type: file.type ?? "image/jpeg",
  } as never);

  const response = await api.post<ImageParseResult>(
    "/api/image-to-trasaction/",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
}

export async function getAnalysis(month: number, year: number) {
  const response = await api.get("/api/analysis/", {
    params: { month, year },
  });

  return response.data;
}

export async function downloadTransactionsPdf(month: number, year: number) {
  const response = await api.get<ArrayBuffer>(
    "/api/transactions/pdf/download/",
    {
      params: { month, year },
      responseType: "arraybuffer",
    },
  );

  return response.data;
}

function extractFieldMessage(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) {
    return value;
  }
  if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim()) {
    return value[0];
  }
  return null;
}

// A single-item validation error is a flat field-keyed object, e.g.
// {"amount": ["Amount must be greater than zero."]}. Returns the first
// field's message, if any.
function extractFirstFieldMessage(value: unknown): string | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const [, fieldValue] = Object.entries(value as Record<string, unknown>)[0] ?? [];
  return extractFieldMessage(fieldValue);
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (!isAxiosError(error)) {
    return fallback;
  }

  if (error.code === "ECONNABORTED") {
    return "That took too long to respond. Please try again.";
  }

  const data = error.response?.data;

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (Array.isArray(data)) {
    // Older/alternate DRF shape: one object per submitted item, {} for
    // items that passed validation.
    for (let index = 0; index < data.length; index += 1) {
      const message = extractFirstFieldMessage(data[index]);
      if (message) {
        return `Item ${index + 1}: ${message}`;
      }
    }

    return fallback;
  }

  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    const detail = record.detail ?? record.error;
    if (typeof detail === "string" && detail.trim()) {
      return detail;
    }

    const keys = Object.keys(record);

    // DRF's actual bulk-create (many=True) validation error shape is
    // "compact": only the indices that failed are present at all, each
    // keyed by their position in the submitted list, e.g.
    // {"1": {"amount": ["Amount must be greater than zero."]}}. It is NOT
    // a plain array with empty placeholders for the items that passed.
    const isIndexKeyed = keys.length > 0 && keys.every((key) => /^\d+$/.test(key));
    if (isIndexKeyed) {
      for (const [index, itemErrors] of Object.entries(record)) {
        const message = extractFirstFieldMessage(itemErrors);
        if (message) {
          return `Item ${Number(index) + 1}: ${message}`;
        }
      }

      return fallback;
    }

    const message = extractFirstFieldMessage(record);
    if (message) {
      return message;
    }
  }

  return fallback;
}

export default api;
