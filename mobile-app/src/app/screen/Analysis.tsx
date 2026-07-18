import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { StatusBar } from "expo-status-bar";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

import { downloadTransactionsPdf, getAnalysis } from "../lib/api";

type AnalysisMonth = {
  month: string;
  year: string;
};

function getDefaultMonthState(): AnalysisMonth {
  const now = new Date();
  return {
    month: String(now.getMonth() + 1),
    year: String(now.getFullYear()),
  };
}

function toBaseMonth(value: string) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return null;
  }

  return Math.min(12, Math.max(1, parsed));
}

function bufferToUint8Array(buffer: ArrayBuffer) {
  return new Uint8Array(buffer);
}

function TextInputPill({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
}) {
  return (
    <View className="flex-1 rounded-2xl border border-white/10 bg-slate-950 px-4 py-3">
      <Text className="text-xs uppercase tracking-[0.2em] text-slate-500">
        {label}
      </Text>
      <TextInput
        keyboardType="number-pad"
        placeholderTextColor="#64748b"
        className="mt-1 text-base text-white"
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}

export default function AnalysisScreen() {
  const [filters, setFilters] = useState(getDefaultMonthState);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const monthNumber = toBaseMonth(filters.month);
  const yearNumber = Number.parseInt(filters.year, 10);
  const summary: any = analysis?.summary ?? {};
  const incomeValue: any = summary?.income ?? analysis?.income ?? "—";
  const expenseValue: any = summary?.expenses ?? analysis?.expenses ?? "—";
  const netValue: any = summary?.net_amount ?? analysis?.net_amount ?? "—";
  const narrativeValue: any =
    summary?.narrative ?? summary?.insight ?? analysis?.message ?? "";

  useEffect(() => {
    const loadAnalysis = async () => {
      if (!monthNumber || Number.isNaN(yearNumber)) {
        return;
      }

      setIsLoading(true);
      setErrorMessage("");

      try {
        const data = await getAnalysis(monthNumber, yearNumber);
        setAnalysis(data);
      } catch (error) {
        setErrorMessage("Unable to load monthly analysis right now.");
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalysis();
  }, [monthNumber, yearNumber]);

  const sharePdf = async () => {
    if (!monthNumber || Number.isNaN(yearNumber)) {
      return;
    }

    setIsExporting(true);
    setErrorMessage("");

    try {
      const pdfBuffer = await downloadTransactionsPdf(monthNumber, yearNumber);
      const file = new FileSystem.File(
        FileSystem.Paths.cache,
        `transactions_${yearNumber}_${String(monthNumber).padStart(2, "0")}.pdf`,
      );

      file.write(bufferToUint8Array(pdfBuffer));

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(file.uri, {
          mimeType: "application/pdf",
          UTI: "com.adobe.pdf",
        });
      }
    } catch (error) {
      setErrorMessage("Could not export the monthly PDF report.");
    } finally {
      setIsExporting(false);
    }
  };

  const highlightCards = [
    {
      label: "Income",
      value: incomeValue,
      accent: "text-emerald-300",
      background: "bg-emerald-400/10",
    },
    {
      label: "Expenses",
      value: expenseValue,
      accent: "text-rose-300",
      background: "bg-rose-400/10",
    },
    {
      label: "Net",
      value: netValue,
      accent: "text-cyan-300",
      background: "bg-cyan-400/10",
    },
  ];

  return (
    <View className="flex-1 bg-slate-950">
      <StatusBar style="light" />

      <View className="absolute -left-20 top-12 h-44 w-44 rounded-full bg-cyan-400/10" />
      <View className="absolute -right-12 top-24 h-56 w-56 rounded-full bg-fuchsia-400/10" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="flex-grow px-5 pb-10 pt-14"
      >
        <View className="mb-5 rounded-[2rem] border border-white/10 bg-white/5 p-5">
          <Text className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300/80">
            Monthly analysis
          </Text>
          <Text className="mt-3 text-4xl font-semibold leading-tight text-white">
            AI insights for your spending rhythm.
          </Text>
          <Text className="mt-3 text-base leading-7 text-slate-300">
            Review the month, refine the filters, and export a report when the
            numbers are ready.
          </Text>
        </View>

        <View className="mb-5 rounded-[2rem] border border-white/10 bg-slate-900/90 p-4">
          <View className="mb-4 flex-row gap-3">
            <TextInputPill
              label="Month"
              value={filters.month}
              onChangeText={(month) =>
                setFilters((current) => ({ ...current, month }))
              }
            />
            <TextInputPill
              label="Year"
              value={filters.year}
              onChangeText={(year) =>
                setFilters((current) => ({ ...current, year }))
              }
            />
          </View>

          <Pressable
            className="flex-row items-center justify-center rounded-2xl bg-cyan-400 px-4 py-4"
            onPress={sharePdf}
            disabled={isExporting}
          >
            {isExporting ? (
              <ActivityIndicator color="#020617" />
            ) : (
              <Text className="text-base font-semibold text-slate-950">
                Export monthly PDF
              </Text>
            )}
          </Pressable>
        </View>

        {errorMessage ? (
          <View className="mb-5 rounded-[1.5rem] border border-rose-400/20 bg-rose-400/10 px-4 py-3">
            <Text className="text-sm text-rose-200">{errorMessage}</Text>
          </View>
        ) : null}

        {isLoading ? (
          <View className="items-center rounded-[2rem] border border-white/10 bg-slate-900/90 px-4 py-10">
            <ActivityIndicator color="#22d3ee" />
            <Text className="mt-4 text-sm text-slate-400">
              Reading the monthly story
            </Text>
          </View>
        ) : (
          <View className="mb-5 flex-row gap-3">
            {highlightCards.map((card) => (
              <View
                key={card.label}
                className={`flex-1 rounded-[1.5rem] border border-white/10 p-4 ${card.background}`}
              >
                <Text className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  {card.label}
                </Text>
                <Text className={`mt-3 text-2xl font-semibold ${card.accent}`}>
                  {String(card.value)}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View className="rounded-[2rem] border border-white/10 bg-white/5 p-5">
          <Text className="text-lg font-semibold text-white">AI narrative</Text>
          <Text className="mt-3 text-sm leading-7 text-slate-300">
            {narrativeValue ||
              "Select a month to load the latest insights from the backend."}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
