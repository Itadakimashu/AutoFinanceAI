import type { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { StatusBar } from "expo-status-bar";

type ScreenBackdropProps = {
  children: ReactNode;
  blobs?: string[];
  scroll?: boolean;
  contentClassName?: string;
};

const DEFAULT_BLOBS = [
  "absolute -left-20 top-10 h-44 w-44 rounded-full bg-cyan-400/10",
  "absolute -right-10 top-40 h-52 w-52 rounded-full bg-fuchsia-400/10",
];

export function ScreenBackdrop({
  children,
  blobs = DEFAULT_BLOBS,
  scroll = true,
  contentClassName = "flex-grow px-5 pb-10 pt-16",
}: ScreenBackdropProps) {
  return (
    <View className="flex-1 bg-slate-950">
      <StatusBar style="light" />

      {blobs.map((blobClassName, index) => (
        <View key={index} className={blobClassName} />
      ))}

      {scroll ? (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerClassName={contentClassName}
        >
          {children}
        </ScrollView>
      ) : (
        children
      )}
    </View>
  );
}
