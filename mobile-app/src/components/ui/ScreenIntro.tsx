import { Text, View } from "react-native";

type ScreenIntroProps = {
  eyebrow: string;
  title: string;
  description?: string;
  tone?: "cyan" | "fuchsia";
  className?: string;
};

const EYEBROW_TONE: Record<NonNullable<ScreenIntroProps["tone"]>, string> = {
  cyan: "text-cyan-300/80",
  fuchsia: "text-fuchsia-200/80",
};

export function ScreenIntro({
  eyebrow,
  title,
  description,
  tone = "cyan",
  className,
}: ScreenIntroProps) {
  return (
    <View
      className={`rounded-[2rem] border border-white/10 bg-white/5 p-5 ${className ?? ""}`}
    >
      <Text
        className={`text-xs font-semibold uppercase tracking-[0.28em] ${EYEBROW_TONE[tone]}`}
      >
        {eyebrow}
      </Text>
      <Text className="mt-3 text-4xl font-semibold leading-tight text-white">
        {title}
      </Text>
      {description ? (
        <Text className="mt-3 text-base leading-7 text-slate-300">
          {description}
        </Text>
      ) : null}
    </View>
  );
}
