import { Text, View } from "react-native";

type ErrorBannerProps = {
  message?: string | null;
  className?: string;
};

export function ErrorBanner({ message, className }: ErrorBannerProps) {
  if (!message) {
    return null;
  }

  return (
    <View
      className={`rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 ${className ?? ""}`}
    >
      <Text className="text-sm text-rose-200">{message}</Text>
    </View>
  );
}
