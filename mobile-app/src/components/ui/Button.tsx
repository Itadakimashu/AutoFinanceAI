import type { ComponentProps } from "react";
import { ActivityIndicator, Pressable, Text, View, type PressableProps } from "react-native";

import { Ionicons } from "@expo/vector-icons";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

type ButtonVariant = "primary" | "secondary" | "outline" | "danger";

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: IoniconName;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
} & Pick<PressableProps, "hitSlop">;

const VARIANT_STYLES: Record<
  ButtonVariant,
  { container: string; text: string; iconColor: string }
> = {
  primary: {
    container: "bg-cyan-400",
    text: "text-slate-950",
    iconColor: "#020617",
  },
  secondary: {
    container: "border border-white/10 bg-white/5",
    text: "text-white",
    iconColor: "#e2e8f0",
  },
  outline: {
    container: "border border-cyan-400/20 bg-cyan-400/10",
    text: "text-cyan-200",
    iconColor: "#22d3ee",
  },
  danger: {
    container: "border border-rose-400/30 bg-rose-400/10",
    text: "text-rose-200",
    iconColor: "#fda4af",
  },
};

export function Button({
  label,
  onPress,
  variant = "primary",
  icon,
  loading = false,
  disabled = false,
  className,
  hitSlop,
}: ButtonProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <Pressable
      className={`items-center justify-center rounded-2xl px-4 py-4 ${styles.container} ${className ?? ""}`}
      onPress={onPress}
      disabled={disabled || loading}
      hitSlop={hitSlop}
    >
      {loading ? (
        <ActivityIndicator color={styles.iconColor} />
      ) : (
        <View className="flex-row items-center justify-center gap-2">
          {icon ? (
            <Ionicons name={icon} size={16} color={styles.iconColor} />
          ) : null}
          <Text className={`text-center text-sm font-semibold ${styles.text}`}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
