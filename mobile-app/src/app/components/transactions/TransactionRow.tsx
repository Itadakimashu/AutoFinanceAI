import { Pressable, Text, View } from "react-native";

import type { Transaction } from "./types";

type TransactionRowProps = {
  item: Transaction;
  onPress?: () => void;
};

export function TransactionRow({ item, onPress }: TransactionRowProps) {
  const isIncome = item.category?.toLowerCase() === "income";
  const amountLabel = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(item.amount));

  return (
    <Pressable
      className="mb-4 rounded-3xl border border-white/10 bg-slate-900/90 p-4 shadow-lg shadow-slate-950/30 active:scale-[0.99]"
      onPress={onPress}
    >
      <View className="flex-row items-center justify-between gap-4">
        <View className="flex-1 flex-row items-center gap-3">
          <View
            className={`h-12 w-12 items-center justify-center rounded-2xl ${isIncome ? "bg-emerald-400/15" : "bg-fuchsia-400/15"}`}
          >
            <Text className="text-xl">{isIncome ? "＋" : "−"}</Text>
          </View>

          <View className="flex-1">
            <View className="mb-1 flex-row items-center gap-2">
              <Text
                className="text-base font-semibold text-white"
                numberOfLines={1}
              >
                {item.description}
              </Text>
              {item.is_recurring ? (
                <View className="rounded-full bg-emerald-400/15 px-2 py-0.5">
                  <Text className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
                    Recurring
                  </Text>
                </View>
              ) : null}
            </View>

            <View className="flex-row flex-wrap items-center gap-2">
              <View className="rounded-full bg-white/5 px-2.5 py-1">
                <Text className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-300">
                  {item.category}
                </Text>
              </View>
              <Text className="text-sm text-slate-400">{item.date}</Text>
            </View>
          </View>
        </View>

        <Text
          className={`text-base font-bold ${isIncome ? "text-emerald-300" : "text-rose-300"}`}
        >
          {isIncome ? "+" : "-"} ৳{amountLabel}
        </Text>
      </View>
    </Pressable>
  );
}
