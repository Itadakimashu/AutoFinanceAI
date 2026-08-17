import { Pressable, Text, TextInput, View } from "react-native";

import { Button } from "../ui";
import type { TransactionTotals } from "./types";

type TransactionsHeaderProps = {
  userName?: string;
  totals?: TransactionTotals | null;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onOpenFilters: () => void;
  onOpenComposer: () => void;
  onOpenAnalysis: () => void;
  onExportPdf: () => void;
};

function StatTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "emerald" | "rose";
}) {
  const backgroundClassName =
    tone === "emerald" ? "bg-emerald-400/10" : "bg-rose-400/10";
  const textClassName =
    tone === "emerald" ? "text-emerald-300" : "text-rose-300";

  return (
    <View className={`flex-1 rounded-2xl p-4 ${backgroundClassName}`}>
      <Text className="text-[10px] uppercase tracking-[0.22em] text-slate-400">
        {label}
      </Text>
      <Text
        className={`mt-2 text-xl font-semibold ${textClassName}`}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.6}
      >
        {value}
      </Text>
    </View>
  );
}

export function TransactionsHeader({
  userName,
  totals,
  searchValue,
  onSearchChange,
  onSearchSubmit,
  onOpenFilters,
  onOpenComposer,
  onOpenAnalysis,
  onExportPdf,
}: TransactionsHeaderProps) {
  const income = totals?.total_income ?? 0;
  const expenses = totals?.total_expenses ?? 0;
  const net = totals?.net_amount ?? 0;
  const isNetPositive = net >= 0;

  return (
    <View className="overflow-hidden rounded-[2rem] border border-cyan-400/15 bg-slate-900 px-5 py-6">
      <View className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-cyan-400/10" />
      <View className="absolute -bottom-10 -left-6 h-24 w-24 rounded-full bg-fuchsia-400/10" />

      <View className="mb-5 flex-row items-center gap-3">
        <Pressable
          className="h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5"
          onPress={onOpenFilters}
        >
          <View className="gap-1.5">
            <View className="h-0.5 w-5 rounded-full bg-white" />
            <View className="h-0.5 w-5 rounded-full bg-white" />
            <View className="h-0.5 w-5 rounded-full bg-white" />
          </View>
        </Pressable>

        <View className="flex-1">
          <Text className="text-sm uppercase tracking-[0.25em] text-cyan-300/80">
            Transactions
          </Text>
          <Text
            className="mt-2 text-3xl font-bold text-white"
            numberOfLines={1}
          >
            Hello{userName ? `, ${userName}` : ""}
          </Text>
        </View>

        <Pressable
          className="h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10"
          onPress={onOpenComposer}
        >
          <Text className="text-2xl font-light text-cyan-200">＋</Text>
        </Pressable>
      </View>

      <View className="mb-4 rounded-2xl border border-white/10 bg-slate-950 px-4 py-3">
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Search descriptions, categories, or merchants"
          placeholderTextColor="#64748b"
          className="text-base text-white"
          value={searchValue}
          onChangeText={onSearchChange}
          onSubmitEditing={onSearchSubmit}
          returnKeyType="search"
        />
      </View>

      <View
        className={`mb-3 rounded-2xl p-4 ${isNetPositive ? "bg-emerald-400/10" : "bg-rose-400/10"}`}
      >
        <Text className="text-[10px] uppercase tracking-[0.22em] text-slate-400">
          Net balance
        </Text>
        <Text
          className={`mt-2 text-3xl font-bold ${isNetPositive ? "text-emerald-300" : "text-rose-300"}`}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.6}
        >
          ৳ {net.toLocaleString()}
        </Text>
      </View>

      <View className="mb-4 flex-row gap-3">
        <StatTile
          label="Income"
          value={`৳ ${income.toLocaleString()}`}
          tone="emerald"
        />
        <StatTile
          label="Expense"
          value={`৳ ${expenses.toLocaleString()}`}
          tone="rose"
        />
      </View>

      <View className="flex-row gap-3">
        <Button
          label="Analysis"
          variant="secondary"
          onPress={onOpenAnalysis}
          className="flex-1"
        />

        <Pressable
          className="flex-1 items-center justify-center rounded-2xl bg-fuchsia-400/10 px-4 py-4"
          onPress={onExportPdf}
        >
          <Text className="text-center text-sm font-semibold text-fuchsia-200">
            Export PDF
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
