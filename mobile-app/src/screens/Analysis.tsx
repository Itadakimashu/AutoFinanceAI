import { useState } from "react";
import { ActivityIndicator, Text, TextInput, View } from "react-native";

import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

import { downloadTransactionsPdf, getAnalysis, getErrorMessage } from "../lib/api";
import { Button, ErrorBanner, ScreenBackdrop } from "../components/ui";

type AnalysisMonth = {
  month: string;
  year: string;
};

type FinancialScore = {
  score: number;
  status: string;
};

type AnalysisResult = {
  overview?: string;
  financial_score?: FinancialScore;
  quick_tips?: string[];
  warnings?: string[];
  good_habits?: string[];
  error?: string;
  analysis?: string;
};

type Tone = "cyan" | "emerald" | "amber" | "rose";

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

const TONE_STYLES: Record<
  Tone,
  { text: string; background: string; border: string; fill: string }
> = {
  cyan: {
    text: "text-cyan-300",
    background: "bg-cyan-400/10",
    border: "border-cyan-400/25",
    fill: "bg-cyan-400",
  },
  emerald: {
    text: "text-emerald-300",
    background: "bg-emerald-400/10",
    border: "border-emerald-400/25",
    fill: "bg-emerald-400",
  },
  amber: {
    text: "text-amber-300",
    background: "bg-amber-400/10",
    border: "border-amber-400/25",
    fill: "bg-amber-400",
  },
  rose: {
    text: "text-rose-300",
    background: "bg-rose-400/10",
    border: "border-rose-400/25",
    fill: "bg-rose-400",
  },
};

function scoreTone(status?: string): Tone {
  const normalized = (status ?? "").toLowerCase();
  if (normalized === "good") return "emerald";
  if (normalized === "fair") return "amber";
  if (normalized === "poor") return "rose";
  return "cyan";
}

function TextInputPill({
  label,
  value,
  onChangeText,
  onSubmitEditing,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  onSubmitEditing: () => void;
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
        onSubmitEditing={onSubmitEditing}
        returnKeyType="done"
      />
    </View>
  );
}

function SectionHeading({ tone, label }: { tone: Tone; label: string }) {
  const styles = TONE_STYLES[tone];
  return (
    <View className="flex-row items-center gap-2">
      <View className={`h-1.5 w-1.5 rounded-full ${styles.fill}`} />
      <Text className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
        {label}
      </Text>
    </View>
  );
}

function InsightRow({ tone, glyph, text }: { tone: Tone; glyph: string; text: string }) {
  const styles = TONE_STYLES[tone];
  return (
    <View className="flex-row gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-3">
      <View
        className={`h-6 w-6 items-center justify-center rounded-lg ${styles.background}`}
      >
        <Text className={`text-xs font-bold ${styles.text}`}>{glyph}</Text>
      </View>
      <Text className="flex-1 pt-0.5 text-sm leading-6 text-slate-200">
        {text}
      </Text>
    </View>
  );
}

function InsightSection({
  tone,
  label,
  glyph,
  items,
  divider,
}: {
  tone: Tone;
  label: string;
  glyph: string;
  items: string[];
  divider: boolean;
}) {
  if (!items.length) {
    return null;
  }

  return (
    <View className={divider ? "mt-6 border-t border-white/5 pt-6" : "mt-5"}>
      <SectionHeading tone={tone} label={label} />
      <View className="mt-3 gap-2">
        {items.map((item, index) => (
          <InsightRow key={`${label}-${index}`} tone={tone} glyph={glyph} text={item} />
        ))}
      </View>
    </View>
  );
}

export default function AnalysisScreen() {
  const [filters, setFilters] = useState(getDefaultMonthState);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const monthNumber = toBaseMonth(filters.month);
  const yearNumber = Number.parseInt(filters.year, 10);

  const loadAnalysis = async () => {
    if (!monthNumber || Number.isNaN(yearNumber)) {
      setErrorMessage("Enter a valid month and year.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setHasSearched(true);

    try {
      const data: AnalysisResult = await getAnalysis(monthNumber, yearNumber);
      if (data?.error) {
        setAnalysis(null);
        setErrorMessage(data.error);
      } else {
        setAnalysis(data);
      }
    } catch (error) {
      setAnalysis(null);
      setErrorMessage(
        getErrorMessage(error, "Unable to load monthly analysis right now."),
      );
    } finally {
      setIsLoading(false);
    }
  };

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
      setErrorMessage(
        getErrorMessage(error, "Could not export the monthly PDF report."),
      );
    } finally {
      setIsExporting(false);
    }
  };

  const score = analysis?.financial_score;
  const tone = scoreTone(score?.status);
  const toneStyles = TONE_STYLES[tone];
  const scoreValue = Math.max(0, Math.min(100, score?.score ?? 0));
  const monthLabel = new Date(yearNumber || 2000, (monthNumber ?? 1) - 1, 1).toLocaleString(
    "en-US",
    { month: "long" },
  );

  return (
    <ScreenBackdrop contentClassName="flex-grow px-5 pb-10 pt-14">
      <View className="mb-5 rounded-[2rem] border border-white/10 bg-white/5 p-5">
        <Text className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300/80">
          Monthly analysis
        </Text>
        <Text className="mt-3 text-4xl font-semibold leading-tight text-white">
          AI insights for your spending rhythm.
        </Text>
        <Text className="mt-3 text-base leading-7 text-slate-300">
          Enter a month and year, then press enter to load the AI review.
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
            onSubmitEditing={loadAnalysis}
          />
          <TextInputPill
            label="Year"
            value={filters.year}
            onChangeText={(year) =>
              setFilters((current) => ({ ...current, year }))
            }
            onSubmitEditing={loadAnalysis}
          />
        </View>

        <Button
          label="Get analysis"
          onPress={loadAnalysis}
          loading={isLoading}
          className="mb-3"
        />

        <Button
          label="Export monthly PDF"
          variant="outline"
          onPress={sharePdf}
          loading={isExporting}
        />
      </View>

      <ErrorBanner message={errorMessage} className="mb-5" />

      {!hasSearched && !isLoading ? (
        <View className="items-center rounded-[2rem] border border-white/10 bg-slate-900/90 px-4 py-10">
          <Text className="text-center text-sm text-slate-400">
            Select a month and year above, then press enter to load your AI
            financial review.
          </Text>
        </View>
      ) : null}

      {isLoading ? (
        <View className="items-center rounded-[2rem] border border-white/10 bg-slate-900/90 px-4 py-10">
          <ActivityIndicator color="#22d3ee" />
          <Text className="mt-4 text-sm text-slate-400">
            Reading the monthly story
          </Text>
        </View>
      ) : null}

      {!isLoading && hasSearched && analysis ? (
        <>
          <View className="mb-5 overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/90 p-5">
            <View className="flex-row items-start justify-between">
              <View>
                <Text className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Financial health score
                </Text>
                <Text className="mt-1 text-xs text-slate-500">
                  {monthLabel} {yearNumber}
                </Text>
              </View>
              <View
                className={`rounded-full border px-3 py-1 ${toneStyles.border} ${toneStyles.background}`}
              >
                <Text
                  className={`text-xs font-semibold uppercase tracking-wide ${toneStyles.text}`}
                >
                  {score?.status ?? "Unknown"}
                </Text>
              </View>
            </View>

            <View className="mt-5 flex-row items-baseline gap-1">
              <Text className={`text-5xl font-bold ${toneStyles.text}`}>
                {score?.score ?? "—"}
              </Text>
              <Text className="text-base font-medium text-slate-500">
                / 100
              </Text>
            </View>

            <View className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/5">
              <View
                className={`h-full rounded-full ${toneStyles.fill}`}
                style={{ width: `${scoreValue}%` }}
              />
            </View>
          </View>

          {analysis.overview ? (
            <View className="mb-5 rounded-[2rem] border border-white/10 bg-white/5 p-5">
              <Text className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Overview
              </Text>
              <View className="mt-3 border-l-2 border-cyan-400/40 pl-4">
                <Text className="text-sm leading-7 text-slate-200">
                  {analysis.overview}
                </Text>
              </View>
            </View>
          ) : null}

          {analysis.quick_tips?.length ||
          analysis.warnings?.length ||
          analysis.good_habits?.length ? (
            <View className="mb-5 rounded-[2rem] border border-white/10 bg-slate-900/90 p-5">
              <Text className="text-lg font-semibold text-white">
                Key insights
              </Text>
              <Text className="mt-1 text-xs text-slate-500">
                Tips, watch-outs, and habits worth keeping
              </Text>

              <InsightSection
                tone="cyan"
                label="Quick tips"
                glyph="+"
                items={analysis.quick_tips ?? []}
                divider={false}
              />
              <InsightSection
                tone="rose"
                label="Warnings"
                glyph="!"
                items={analysis.warnings ?? []}
                divider={Boolean(analysis.quick_tips?.length)}
              />
              <InsightSection
                tone="emerald"
                label="Good habits"
                glyph="✓"
                items={analysis.good_habits ?? []}
                divider={Boolean(
                  analysis.quick_tips?.length || analysis.warnings?.length,
                )}
              />
            </View>
          ) : null}

          {analysis.analysis ? (
            <View className="mb-5 rounded-[2rem] border border-white/10 bg-white/5 p-5">
              <Text className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Raw analysis
              </Text>
              <Text className="mt-3 text-sm leading-7 text-slate-300">
                {analysis.analysis}
              </Text>
            </View>
          ) : null}
        </>
      ) : null}
    </ScreenBackdrop>
  );
}
