import { createContext, useContext, useEffect, useState } from "react";

import {
  clearStoredAuthTokens,
  fetchCurrentUser,
  getAuthTokens,
  loadStoredAuthTokens,
  persistAuthTokens,
  setAuthTokens,
  signIn,
  signUp,
  updateCurrentUser,
  updatePassword,
  type CurrentUser,
} from "../lib/api";

type AuthTokens = {
  accessToken: string | null;
  refreshToken: string | null;
};

type AuthState = AuthTokens & {
  authenticated: boolean;
  hydrated: boolean;
  user: CurrentUser | null;
};

type RegisterPayload = {
  username: string;
  password: string;
  email?: string;
  first_name?: string;
  last_name?: string;
};

type AuthContextValue = {
  authState: AuthState;
  tokens: AuthTokens;
  onRegister: (payload: RegisterPayload) => Promise<CurrentUser>;
  onLogin: (username: string, password: string) => Promise<CurrentUser>;
  onLogout: () => Promise<void>;
  onRefreshUser: () => Promise<CurrentUser>;
  onUpdateProfile: (payload: Partial<CurrentUser>) => Promise<CurrentUser>;
  onChangePassword: (payload: {
    current_password: string;
    new_password: string;
    re_new_password: string;
  }) => Promise<unknown>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    accessToken: null,
    refreshToken: null,
    authenticated: false,
    hydrated: false,
    user: null,
  });

  const bootstrapSession = async () => {
    const storedTokens = await loadStoredAuthTokens();

    if (!storedTokens.accessToken || !storedTokens.refreshToken) {
      setAuthState((current) => ({
        ...current,
        hydrated: true,
      }));
      return;
    }

    try {
      setAuthTokens(storedTokens);
      const user = await fetchCurrentUser();

      setAuthState({
        accessToken: storedTokens.accessToken,
        refreshToken: storedTokens.refreshToken,
        authenticated: true,
        hydrated: true,
        user,
      });
    } catch {
      await clearStoredAuthTokens();
      setAuthState({
        accessToken: null,
        refreshToken: null,
        authenticated: false,
        hydrated: true,
        user: null,
      });
    }
  };

  useEffect(() => {
    void bootstrapSession();
  }, []);

  const completeAuthentication = async ({ access, refresh }: { access: string; refresh: string }) => {
    const tokens: AuthTokens = {
      accessToken: access,
      refreshToken: refresh,
    };

    await persistAuthTokens(tokens);
    const user = await fetchCurrentUser();

    setAuthState({
      accessToken: access,
      refreshToken: refresh,
      authenticated: true,
      hydrated: true,
      user,
    });

    return user;
  };

  const login = async (username: string, password: string) => {
    const tokens = await signIn({ username, password });
    return completeAuthentication(tokens);
  };

  const register = async (payload: RegisterPayload) => {
    await signUp(payload);
    return login(payload.username, payload.password);
  };

  const logout = async () => {
    await clearStoredAuthTokens();

    setAuthState({
      accessToken: null,
      refreshToken: null,
      authenticated: false,
      hydrated: true,
      user: null,
    });
  };

  const refreshUser = async () => {
    const user = await fetchCurrentUser();

    setAuthState((current) => ({
      ...current,
      user,
      authenticated: true,
    }));

    return user;
  };

  const updateProfile = async (payload: Partial<CurrentUser>) => {
    const user = await updateCurrentUser(payload);

    setAuthState((current) => ({
      ...current,
      user,
    }));

    return user;
  };

  const changePassword = async (payload: {
    current_password: string;
    new_password: string;
    re_new_password: string;
  }) => {
    return updatePassword(payload);
  };

  const value: AuthContextValue = {
    authState,
    tokens: getAuthTokens(),
    onRegister: register,
    onLogin: login,
    onLogout: logout,
    onRefreshUser: refreshUser,
    onUpdateProfile: updateProfile,
    onChangePassword: changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};