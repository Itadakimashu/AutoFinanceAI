import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { Stack, useRouter, useSegments } from "expo-router";

import { AuthProvider, useAuth } from "../context/AuthContext";

import "../../global.css";

const PUBLIC_ROUTES = new Set(["index", "login", "signup"]);

function RouteGate() {
  const { authState } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!authState.hydrated) {
      return;
    }

    const currentRoute = segments[0] ?? "index";
    const isPublicRoute = PUBLIC_ROUTES.has(currentRoute);

    if (!authState.authenticated && !isPublicRoute) {
      router.replace("/login");
      return;
    }

    if (authState.authenticated && isPublicRoute) {
      router.replace("/transactions");
    }
  }, [authState.authenticated, authState.hydrated, router, segments]);

  if (!authState.hydrated) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-950 px-6">
        <View className="rounded-[2rem] border border-white/10 bg-white/5 px-6 py-5">
          <ActivityIndicator color="#22d3ee" />
          <Text className="mt-4 text-sm font-medium text-slate-300">
            Restoring secure session
          </Text>
        </View>
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#020617" },
      }}
    />
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RouteGate />
    </AuthProvider>
  );
}
