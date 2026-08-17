import { useState } from "react";
import { View } from "react-native";

import { useRouter } from "expo-router";

import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../lib/api";
import { Button, ErrorBanner, ScreenBackdrop, ScreenIntro, TextField } from "../components/ui";

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
      setErrorMessage(getErrorMessage(error, "Unable to sign in right now."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenBackdrop>
      <ScreenIntro
        eyebrow="Secure login"
        title="Welcome back."
        description="Sign in to browse transactions, import receipts, and export monthly reports."
        className="mb-6"
      />

      <View className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-5">
        <TextField
          autoCapitalize="none"
          autoComplete="username"
          placeholder="Username"
          className="mb-3"
          value={username}
          onChangeText={setUsername}
        />

        <TextField
          autoCapitalize="none"
          autoComplete="password"
          placeholder="Password"
          secureTextEntry
          className="mb-4"
          value={password}
          onChangeText={setPassword}
        />

        <ErrorBanner message={errorMessage} className="mb-4" />

        <Button label="Login" onPress={submitLogin} loading={isSubmitting} />

        <Button
          label="Create account"
          variant="secondary"
          onPress={() => router.push("/signup")}
          className="mt-3"
        />
      </View>
    </ScreenBackdrop>
  );
}
