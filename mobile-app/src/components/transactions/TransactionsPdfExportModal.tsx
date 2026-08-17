import { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

import { downloadTransactionsPdf, getErrorMessage } from "../../lib/api";
import { ErrorBanner } from "../ui";

const MONTH_OPTIONS = [
  [1, "January"],
  [2, "February"],
  [3, "March"],
  [4, "April"],
  [5, "May"],
  [6, "June"],
  [7, "July"],
  [8, "August"],
  [9, "September"],
  [10, "October"],
  [11, "November"],
  [12, "December"],
] as const;

function getYearOptions() {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 6 }, (_, index) => currentYear - index);
}

function arrayBufferToFile(buffer: ArrayBuffer, filename: string) {
  const file = new FileSystem.File(FileSystem.Paths.cache, filename);
  file.write(new Uint8Array(buffer));
  return file;
}

type TransactionsPdfExportModalProps = {
  visible: boolean;
  onClose: () => void;
};

export function TransactionsPdfExportModal({
  visible,
  onClose,
}: TransactionsPdfExportModalProps) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [activePicker, setActivePicker] = useState<"month" | "year" | null>(
    null,
  );
  const [isExporting, setIsExporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const yearOptions = getYearOptions();
  const monthLabel =
    MONTH_OPTIONS.find(([value]) => value === month)?.[1] ?? "";

  const handleClose = () => {
    setActivePicker(null);
    setErrorMessage("");
    onClose();
  };

  const handleExport = async () => {
    setIsExporting(true);
    setErrorMessage("");

    try {
      const pdfBuffer = await downloadTransactionsPdf(month, year);
      const file = arrayBufferToFile(
        pdfBuffer,
        `transactions_${year}_${String(month).padStart(2, "0")}.pdf`,
      );

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
          mimeType: "application/pdf",
          UTI: "com.adobe.pdf",
        });
      }

      handleClose();
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, "PDF export failed for the selected month."),
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View className="flex-1 justify-end bg-slate-950/80">
        <View className="max-h-[75%] rounded-t-[2.25rem] border border-white/10 bg-slate-950 px-5 pb-7 pt-5">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-xl font-semibold text-white">
              Export PDF
            </Text>
            <Pressable
              onPress={handleClose}
              className="rounded-xl bg-white/10 px-3 py-2"
            >
              <Text className="font-semibold text-white">Close</Text>
            </Pressable>
          </View>

          <Text className="mb-3 text-sm text-slate-400">
            Choose the month and year to export.
          </Text>

          <View className="mb-4 flex-row gap-3">
            <Pressable
              className="flex-1 rounded-2xl border border-white/10 bg-slate-900 px-4 py-4"
              onPress={() =>
                setActivePicker(activePicker === "month" ? null : "month")
              }
            >
              <Text className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Month
              </Text>
              <Text className="mt-1 text-base font-semibold text-white">
                {monthLabel}
              </Text>
            </Pressable>

            <Pressable
              className="flex-1 rounded-2xl border border-white/10 bg-slate-900 px-4 py-4"
              onPress={() =>
                setActivePicker(activePicker === "year" ? null : "year")
              }
            >
              <Text className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Year
              </Text>
              <Text className="mt-1 text-base font-semibold text-white">
                {year}
              </Text>
            </Pressable>
          </View>

          {activePicker === "month" ? (
            <ScrollView
              className="mb-4 max-h-56"
              showsVerticalScrollIndicator={false}
              contentContainerClassName="gap-2"
            >
              {MONTH_OPTIONS.map(([value, label]) => {
                const selected = value === month;
                return (
                  <Pressable
                    key={value}
                    className={`rounded-2xl border px-4 py-3 ${selected ? "border-cyan-400 bg-cyan-400/15" : "border-white/10 bg-slate-900"}`}
                    onPress={() => {
                      setMonth(value);
                      setActivePicker(null);
                    }}
                  >
                    <Text
                      className={`text-base font-semibold ${selected ? "text-cyan-200" : "text-white"}`}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          ) : null}

          {activePicker === "year" ? (
            <ScrollView
              className="mb-4 max-h-56"
              showsVerticalScrollIndicator={false}
              contentContainerClassName="gap-2"
            >
              {yearOptions.map((value) => {
                const selected = value === year;
                return (
                  <Pressable
                    key={value}
                    className={`rounded-2xl border px-4 py-3 ${selected ? "border-cyan-400 bg-cyan-400/15" : "border-white/10 bg-slate-900"}`}
                    onPress={() => {
                      setYear(value);
                      setActivePicker(null);
                    }}
                  >
                    <Text
                      className={`text-base font-semibold ${selected ? "text-cyan-200" : "text-white"}`}
                    >
                      {value}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          ) : null}

          <ErrorBanner message={errorMessage} className="mb-3" />

          <Pressable
            className="rounded-2xl bg-fuchsia-400/10 px-4 py-4"
            onPress={handleExport}
            disabled={isExporting}
          >
            <Text className="text-center text-base font-semibold text-fuchsia-200">
              {isExporting ? "Exporting..." : "Export"}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
