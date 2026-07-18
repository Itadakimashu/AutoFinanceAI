import { useState } from "react";
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

export default function SignupScreen() {
  const router = useRouter();
  const { onRegister } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const submitSignup = async () => {
    if (!username.trim() || !password.trim() || !email.trim()) {
      setErrorMessage("Username, email, and password are required.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await onRegister({
        username: username.trim(),
        email: email.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        password,
      });

      router.replace("/transactions" as any);
    } catch (error) {
      const responseData = (error as any)?.response?.data;
      const firstError = responseData ? Object.values(responseData)[0] : null;

      setErrorMessage(
        Array.isArray(firstError)
          ? firstError[0]
          : firstError ?? "Unable to create your account right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-950">
      <StatusBar style="light" />

      <View className="absolute -left-20 top-12 h-44 w-44 rounded-full bg-fuchsia-400/10" />
      <View className="absolute -right-16 top-40 h-56 w-56 rounded-full bg-cyan-400/10" />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="flex-grow px-5 pb-10 pt-16"
      >
        <View className="mb-6 rounded-[2rem] border border-white/10 bg-white/5 p-5">
          <Text className="text-xs font-semibold uppercase tracking-[0.28em] text-fuchsia-200/80">
            Create account
          </Text>
          <Text className="mt-3 text-4xl font-semibold leading-tight text-white">
            Build your dashboard.
          </Text>
          <Text className="mt-3 text-base leading-7 text-slate-300">
            Set up a secure account to start importing receipts, tracking
            transactions, and reviewing monthly AI summaries.
          </Text>
        </View>

        <View className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-5">
          <View className="flex-row gap-3">
            <TextInput
              autoCapitalize="words"
              placeholder="First name"
              placeholderTextColor="#64748b"
              className="mb-3 flex-1 rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 text-white"
              value={firstName}
              onChangeText={setFirstName}
            />
            <TextInput
              autoCapitalize="words"
              placeholder="Last name"
              placeholderTextColor="#64748b"
              className="mb-3 flex-1 rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 text-white"
              value={lastName}
              onChangeText={setLastName}
            />
          </View>

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
            autoComplete="email"
            keyboardType="email-address"
            placeholder="Email address"
            placeholderTextColor="#64748b"
            className="mb-3 rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 text-white"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            autoCapitalize="none"
            autoComplete="password-new"
            placeholder="Password"
            placeholderTextColor="#64748b"
            secureTextEntry
            className="mb-3 rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 text-white"
            value={password}
            onChangeText={setPassword}
          />

          <TextInput
            autoCapitalize="none"
            autoComplete="password-new"
            placeholder="Confirm password"
            placeholderTextColor="#64748b"
            secureTextEntry
            className="mb-4 rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 text-white"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          {errorMessage ? (
            <View className="mb-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3">
              <Text className="text-sm text-rose-200">{errorMessage}</Text>
            </View>
          ) : null}

          <Pressable
            className="items-center rounded-2xl bg-cyan-400 px-4 py-4"
            onPress={submitSignup}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#020617" />
            ) : (
              <Text className="text-base font-semibold text-slate-950">
                Create account
              </Text>
            )}
          </Pressable>

          <Pressable
            className="mt-3 items-center rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
            onPress={() => router.push("/login" as any)}
          >
            <Text className="text-base font-semibold text-white">
              I already have an account
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}