import { StatusBar } from "expo-status-bar";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function Home() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Logo */}
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>💰</Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>AutoFinance AI</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Track your daily expenses, understand your spending habits, and let AI
        help you save smarter.
      </Text>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.loginButton}>
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.signupButton}>
          <Text style={styles.signupText}>Create Account</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>AI-powered personal finance assistant</Text>
    </View>
  );
}

const PRIMARY = "#2563EB";
const DARK = "#0F172A";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  logoContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#1E3A8A",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
  },

  logo: {
    fontSize: 52,
  },

  title: {
    fontSize: 34,
    fontWeight: "bold",
    color: "white",
    marginBottom: 12,
  },

  subtitle: {
    color: "#CBD5E1",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 50,
  },

  buttonContainer: {
    width: "100%",
  },

  loginButton: {
    backgroundColor: PRIMARY,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 15,
  },

  loginText: {
    color: "white",
    fontWeight: "700",
    fontSize: 17,
  },

  signupButton: {
    borderWidth: 2,
    borderColor: PRIMARY,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },

  signupText: {
    color: PRIMARY,
    fontWeight: "700",
    fontSize: 17,
  },

  footer: {
    position: "absolute",
    bottom: 40,
    color: "#64748B",
    fontSize: 13,
  },
});
