import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";

import * as DocumentPicker from "expo-document-picker";
import DateTimePicker from "@react-native-community/datetimepicker";

import { CategoryPickerModal } from "./CategoryPickerModal";
import { getTransactionCategoryLabel } from "./constants";
import type { TransactionFormValues } from "./types";

type TransactionComposerModalProps = {
  visible: boolean;
  mode: "create" | "detail";
  initialValues: TransactionFormValues;
  onClose: () => void;
  onSubmit: (
    payload: TransactionFormValues | TransactionFormValues[],
  ) => Promise<void>;
  onDelete?: () => Promise<void>;
  onParseReceipt: (file: {
    uri: string;
    name?: string;
    type?: string;
  }) => Promise<TransactionFormValues[] | null>;
};

export function TransactionComposerModal({
  visible,
  mode,
  initialValues,
  onClose,
  onSubmit,
  onDelete,
  onParseReceipt,
}: TransactionComposerModalProps) {
  const { height: screenHeight } = useWindowDimensions();
  const [form, setForm] = useState<TransactionFormValues>(initialValues);
  const [parsedTransactions, setParsedTransactions] = useState<
    TransactionFormValues[]
  >([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(mode === "create");
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [isCategoryPickerVisible, setIsCategoryPickerVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!visible) {
      return;
    }

    setForm(initialValues);
    setParsedTransactions([]);
    setErrorMessage("");
    setIsEditing(mode === "create");
    setIsDatePickerVisible(false);
    setIsCategoryPickerVisible(false);
  }, [initialValues, mode, visible]);

  const isFormMode = mode === "create" || isEditing;

  const selectedDate = new Date(`${form.date}T12:00:00`);

  const handleDateChange = (_event: unknown, date?: Date) => {
    setIsDatePickerVisible(false);
    if (!date) {
      return;
    }

    setForm((current) => ({
      ...current,
      date: date.toISOString().slice(0, 10),
    }));
  };

  const previewLabel = useMemo(() => {
    if (parsedTransactions.length > 1) {
      return `${parsedTransactions.length} parsed transactions ready`;
    }

    if (parsedTransactions.length === 1) {
      return "1 parsed transaction ready";
    }

    return "Scan a receipt to auto-fill entries";
  }, [parsedTransactions.length]);

  const handleScanReceipt = async () => {
    setErrorMessage("");
    setIsScanning(true);

    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        type: "image/*",
      } as any);

      if (result.canceled) {
        return;
      }

      const asset = result.assets?.[0];
      if (!asset) {
        setErrorMessage("Could not read the selected receipt image.");
        return;
      }

      const transactions = await onParseReceipt({
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType ?? "image/jpeg",
      });

      if (!transactions || transactions.length === 0) {
        setErrorMessage("No transactions were extracted from that receipt.");
        return;
      }

      setParsedTransactions(transactions);
      setForm(transactions[0]);
    } catch (error) {
      setErrorMessage("Receipt parsing failed. Try another image.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleSubmit = async () => {
    setErrorMessage("");
    setIsSaving(true);

    try {
      await onSubmit(parsedTransactions.length > 0 ? parsedTransactions : form);
      onClose();
    } catch (error) {
      setErrorMessage("Could not save this transaction right now.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!onDelete || isDeleting) {
      return;
    }

    Alert.alert("Delete transaction?", "This transaction will be permanently removed.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setErrorMessage("");
          setIsDeleting(true);

          try {
            await onDelete();
            onClose();
          } catch (error) {
            setErrorMessage("Could not delete this transaction.");
          } finally {
            setIsDeleting(false);
          }
        },
      },
    ]);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="bg-slate-950/80" style={{ flex: 1, justifyContent: "flex-end" }}>
        <View
          className="rounded-t-[2.25rem] border border-white/10 bg-slate-950 px-5 pb-6 pt-4"
          style={{ maxHeight: screenHeight * 0.92, flexShrink: 1 }}
        >
          <View className="mb-4 flex-row items-start justify-between">
            <View className="flex-1 pr-4">
              <Text className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">
                {mode === "create"
                  ? "Add transaction"
                  : isEditing
                    ? "Edit transaction"
                    : "Transaction details"}
              </Text>
              <Text className="mt-2 text-3xl font-semibold text-white">
                {mode === "create"
                  ? "Capture a new expense"
                  : isEditing
                    ? "Refine the entry"
                    : "Review this entry"}
              </Text>
              <Text className="mt-2 text-sm leading-6 text-slate-400">
                {isFormMode ? previewLabel : "View the recorded transaction details."}
              </Text>
            </View>

            <Pressable
              className="h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5"
              onPress={onClose}
            >
              <Text className="text-lg font-semibold text-white">×</Text>
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ flexGrow: 0, flexShrink: 1 }}
            contentContainerStyle={{ paddingBottom: 12 }}
          >
            <View className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-4">
              {isFormMode ? (
                <>
              <View className="mb-3 flex-row gap-3">
                <Pressable
                  className="flex-1 rounded-2xl border border-white/10 bg-slate-950 px-4 py-3"
                  onPress={() => setIsDatePickerVisible(true)}
                >
                  <Text className="text-sm text-white">{form.date}</Text>
                  <Text className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Select date
                  </Text>
                </Pressable>
                <TextInput
                  placeholder="Amount"
                  placeholderTextColor="#64748b"
                  keyboardType="numeric"
                  className="flex-1 rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
                  value={form.amount}
                  onChangeText={(amount) =>
                    setForm((current) => ({ ...current, amount }))
                  }
                />
              </View>

              <TextInput
                placeholder="Description"
                placeholderTextColor="#64748b"
                className="mb-3 rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
                value={form.description}
                onChangeText={(description) =>
                  setForm((current) => ({ ...current, description }))
                }
              />

              <View className="mb-3 flex-row gap-3">
                <Pressable
                  className="flex-1 rounded-2xl border border-white/10 bg-slate-950 px-4 py-3"
                  onPress={() => setIsCategoryPickerVisible(true)}
                >
                  <Text className="text-sm text-white">
                    {getTransactionCategoryLabel(form.category)}
                  </Text>
                  <Text className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Select category
                  </Text>
                </Pressable>

                <Pressable
                  className={`flex-1 rounded-2xl border px-4 py-3 ${form.is_recurring ? "border-emerald-400/30 bg-emerald-400/10" : "border-white/10 bg-slate-950"}`}
                  onPress={() =>
                    setForm((current) => ({
                      ...current,
                      is_recurring: !current.is_recurring,
                    }))
                  }
                >
                  <Text className="text-center text-sm font-semibold text-white">
                    {form.is_recurring ? "Recurring" : "One-time"}
                  </Text>
                </Pressable>
              </View>

              {errorMessage ? (
                <View className="mb-3 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3">
                  <Text className="text-sm text-rose-200">{errorMessage}</Text>
                </View>
              ) : null}

              <View className="flex-row gap-3">
                {mode === "create" ? (
                  <Pressable
                    className="flex-1 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3"
                    onPress={handleScanReceipt}
                    disabled={isScanning || isSaving}
                  >
                    {isScanning ? (
                      <ActivityIndicator color="#22d3ee" />
                    ) : (
                      <Text className="text-center text-sm font-semibold text-cyan-200">
                        Scan receipt
                      </Text>
                    )}
                  </Pressable>
                ) : null}

                <Pressable
                  className="flex-1 rounded-2xl bg-cyan-400 px-4 py-3"
                  onPress={handleSubmit}
                  disabled={isSaving || isScanning}
                >
                  {isSaving ? (
                    <ActivityIndicator color="#020617" />
                  ) : (
                    <Text className="text-center text-sm font-semibold text-slate-950">
                      {parsedTransactions.length > 0
                        ? "Save parsed"
                        : mode === "detail"
                          ? "Done ✓"
                          : "Save transaction"}
                    </Text>
                  )}
                </Pressable>
              </View>

                </>
              ) : (
                <>
                  <View className="gap-4 px-1 py-2">
                    <DetailRow label="Description" value={form.description} />
                    <DetailRow label="Amount" value={`৳${Number(form.amount).toLocaleString()}`} />
                    <DetailRow label="Category" value={form.category} />
                    <DetailRow label="Date" value={form.date} />
                    <DetailRow
                      label="Frequency"
                      value={form.is_recurring ? "Recurring" : "One-time"}
                    />
                  </View>
                  <View className="mt-5 flex-row gap-3">
                    <Pressable
                      className="flex-1 rounded-2xl bg-cyan-400 px-4 py-3"
                      onPress={() => setIsEditing(true)}
                      disabled={isDeleting}
                    >
                      <Text className="text-center text-sm font-semibold text-slate-950">
                        Edit transaction
                      </Text>
                    </Pressable>

                    {onDelete ? (
                      <Pressable
                        className="flex-1 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3"
                        onPress={handleDelete}
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <ActivityIndicator color="#fda4af" />
                        ) : (
                          <Text className="text-center text-sm font-semibold text-rose-200">
                            Delete
                          </Text>
                        )}
                      </Pressable>
                    ) : null}
                  </View>
                </>
              )}

              {isFormMode && parsedTransactions.length > 0 ? (
                <View className="mt-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                  <Text className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Receipt preview
                  </Text>
                  <View className="mt-3 gap-2">
                    {parsedTransactions.map((transaction, index) => (
                      <View
                        key={`${transaction.description}-${index}`}
                        className="rounded-2xl border border-white/10 bg-slate-950 px-3 py-3"
                      >
                        <Text className="text-sm font-semibold text-white">
                          {transaction.description}
                        </Text>
                        <Text className="mt-1 text-xs text-slate-400">
                          {transaction.category} • {transaction.date} • ৳
                          {Number(transaction.amount).toLocaleString()}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}
            </View>
          </ScrollView>
        </View>
      </View>
      {isDatePickerVisible ? (
        <DateTimePicker
          value={Number.isNaN(selectedDate.getTime()) ? new Date() : selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      ) : null}
      <CategoryPickerModal
        visible={isCategoryPickerVisible}
        value={form.category}
        onClose={() => setIsCategoryPickerVisible(false)}
        onSelect={(category) =>
          setForm((current) => ({ ...current, category }))
        }
      />
    </Modal>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between gap-4 border-b border-white/10 pb-3">
      <Text className="text-sm text-slate-400">{label}</Text>
      <Text className="flex-1 text-right text-base font-semibold text-white">
        {value}
      </Text>
    </View>
  );
}
