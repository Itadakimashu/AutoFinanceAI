import { useState } from "react";
import { View } from "react-native";

import { useRouter } from "expo-router";

import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../lib/api";
import { Button, ErrorBanner, ScreenBackdrop, ScreenIntro, TextField } from "../components/ui";

const SIGNUP_BLOBS = [
  "absolute -left-20 top-12 h-44 w-44 rounded-full bg-fuchsia-400/10",
  "absolute -right-16 top-40 h-56 w-56 rounded-full bg-cyan-400/10",
];

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

      router.replace("/transactions");
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, "Unable to create your account right now."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenBackdrop blobs={SIGNUP_BLOBS}>
      <ScreenIntro
        eyebrow="Create account"
        title="Build your dashboard."
        description="Set up a secure account to start importing receipts, tracking transactions, and reviewing monthly AI summaries."
        tone="fuchsia"
        className="mb-6"
      />

      <View className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-5">
        <View className="flex-row gap-3">
          <TextField
            autoCapitalize="words"
            placeholder="First name"
            className="mb-3 flex-1"
            value={firstName}
            onChangeText={setFirstName}
          />
          <TextField
            autoCapitalize="words"
            placeholder="Last name"
            className="mb-3 flex-1"
            value={lastName}
            onChangeText={setLastName}
          />
        </View>

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
          autoComplete="email"
          keyboardType="email-address"
          placeholder="Email address"
          className="mb-3"
          value={email}
          onChangeText={setEmail}
        />

        <TextField
          autoCapitalize="none"
          autoComplete="password-new"
          placeholder="Password"
          secureTextEntry
          className="mb-3"
          value={password}
          onChangeText={setPassword}
        />

        <TextField
          autoCapitalize="none"
          autoComplete="password-new"
          placeholder="Confirm password"
          secureTextEntry
          className="mb-4"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <ErrorBanner message={errorMessage} className="mb-4" />

        <Button
          label="Create account"
          onPress={submitSignup}
          loading={isSubmitting}
        />

        <Button
          label="I already have an account"
          variant="secondary"
          onPress={() => router.push("/login")}
          className="mt-3"
        />
      </View>
    </ScreenBackdrop>
  );
}
