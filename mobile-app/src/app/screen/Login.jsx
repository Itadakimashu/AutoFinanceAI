import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";

import { useAuth } from "../context/AuthContext";

export default function LoginScreen() {
  const router = useRouter();
  const { onLogin } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const submitLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setErrorMessage("Enter your username and password.");
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await onLogin(username.trim(), password);
      router.replace("/transactions");
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.detail ?? "Unable to sign in right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-950">
      <StatusBar style="light" />

      <View className="absolute -left-20 top-10 h-44 w-44 rounded-full bg-cyan-400/10" />
      <View className="absolute -right-10 top-40 h-52 w-52 rounded-full bg-fuchsia-400/10" />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="flex-grow px-5 pb-10 pt-16"
      >
        <View className="mb-6 rounded-[2rem] border border-white/10 bg-white/5 p-5">
          <Text className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">
            Secure login
          </Text>
          <Text className="mt-3 text-4xl font-semibold leading-tight text-white">
            Welcome back.
          </Text>
          <Text className="mt-3 text-base leading-7 text-slate-300">
            Sign in to browse transactions, import receipts, and export monthly
            reports.
          </Text>
        </View>

        <View className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-5">
          <TextInput
            autoCapitalize="none"
            autoComplete="username"
            placeholder="Username"
            placeholderTextColor="#64748b"
            className="mb-3 rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 text-white"
            value={username}
            onChangeText={setUsername}
          />

          <TextInput
            autoCapitalize="none"
            autoComplete="password"
            placeholder="Password"
            placeholderTextColor="#64748b"
            secureTextEntry
            className="mb-4 rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 text-white"
            value={password}
            onChangeText={setPassword}
          />

          {errorMessage ? (
            <View className="mb-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3">
              <Text className="text-sm text-rose-200">{errorMessage}</Text>
            </View>
          ) : null}

          <Pressable
            className="items-center rounded-2xl bg-cyan-400 px-4 py-4"
            onPress={submitLogin}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#020617" />
            ) : (
              <Text className="text-base font-semibold text-slate-950">
                Login
              </Text>
            )}
          </Pressable>

          <Pressable
            className="mt-3 items-center rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
            onPress={() => router.push("/signup")}
          >
            <Text className="text-base font-semibold text-white">
              Create account
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
