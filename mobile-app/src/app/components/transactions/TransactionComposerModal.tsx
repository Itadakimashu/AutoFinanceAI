import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import * as DocumentPicker from "expo-document-picker";

import type { TransactionFormValues } from "./types";

type TransactionComposerModalProps = {
  visible: boolean;
  mode: "create" | "edit";
  initialValues: TransactionFormValues;
  onClose: () => void;
  onSubmit: (
    payload: TransactionFormValues | TransactionFormValues[],
  ) => Promise<void>;
  onDelete?: () => void | Promise<void>;
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
  const [form, setForm] = useState<TransactionFormValues>(initialValues);
  const [parsedTransactions, setParsedTransactions] = useState<
    TransactionFormValues[]
  >([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!visible) {
      return;
    }

    setForm(initialValues);
    setParsedTransactions([]);
    setErrorMessage("");
  }, [initialValues, visible]);

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

  const handleDelete = async () => {
    if (!onDelete) {
      return;
    }

    setIsDeleting(true);

    try {
      await Promise.resolve(onDelete());
      onClose();
    } catch (error) {
      setErrorMessage("Could not delete this transaction.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-slate-950/80">
        <View className="max-h-[92%] rounded-t-[2.25rem] border border-white/10 bg-slate-950 px-5 pb-6 pt-4">
          <View className="mb-4 flex-row items-start justify-between">
            <View className="flex-1 pr-4">
              <Text className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">
                {mode === "edit" ? "Edit transaction" : "Add transaction"}
              </Text>
              <Text className="mt-2 text-3xl font-semibold text-white">
                {mode === "edit" ? "Refine the entry" : "Capture a new expense"}
              </Text>
              <Text className="mt-2 text-sm leading-6 text-slate-400">
                {previewLabel}
              </Text>
            </View>

            <Pressable
              className="h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5"
              onPress={onClose}
            >
              <Text className="text-lg font-semibold text-white">×</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
            <View className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-4">
              <View className="mb-3 flex-row gap-3">
                <TextInput
                  placeholder="Date (YYYY-MM-DD)"
                  placeholderTextColor="#64748b"
                  className="flex-1 rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
                  value={form.date}
                  onChangeText={(date) =>
                    setForm((current) => ({ ...current, date }))
                  }
                />
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
                <TextInput
                  placeholder="Category"
                  placeholderTextColor="#64748b"
                  className="flex-1 rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
                  value={form.category}
                  onChangeText={(category) =>
                    setForm((current) => ({ ...current, category }))
                  }
                />

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
                        : mode === "edit"
                          ? "Save changes"
                          : "Save transaction"}
                    </Text>
                  )}
                </Pressable>
              </View>

              {mode === "edit" && onDelete ? (
                <Pressable
                  className="mt-3 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3"
                  onPress={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <ActivityIndicator color="#fb7185" />
                  ) : (
                    <Text className="text-center text-sm font-semibold text-rose-200">
                      Delete transaction
                    </Text>
                  )}
                </Pressable>
              ) : null}

              {parsedTransactions.length > 0 ? (
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
    </Modal>
  );
}
