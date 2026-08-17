import { ActivityIndicator, Pressable, Text, type PressableProps } from "react-native";

type ButtonVariant = "primary" | "secondary" | "outline" | "danger";

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
} & Pick<PressableProps, "hitSlop">;

const VARIANT_STYLES: Record<
  ButtonVariant,
  { container: string; text: string; spinnerColor: string }
> = {
  primary: {
    container: "bg-cyan-400",
    text: "text-slate-950",
    spinnerColor: "#020617",
  },
  secondary: {
    container: "border border-white/10 bg-white/5",
    text: "text-white",
    spinnerColor: "#e2e8f0",
  },
  outline: {
    container: "border border-cyan-400/20 bg-cyan-400/10",
    text: "text-cyan-200",
    spinnerColor: "#22d3ee",
  },
  danger: {
    container: "border border-rose-400/30 bg-rose-400/10",
    text: "text-rose-200",
    spinnerColor: "#fda4af",
  },
};

export function Button({
  label,
  onPress,
  variant = "primary",
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
        <ActivityIndicator color={styles.spinnerColor} />
      ) : (
        <Text className={`text-center text-sm font-semibold ${styles.text}`}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}
