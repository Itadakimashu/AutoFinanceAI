import { useState } from "react";
import {
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

import { getErrorMessage } from "../../lib/api";
import { Button, ErrorBanner } from "../ui";
import { CategoryPickerModal } from "./CategoryPickerModal";
import { getTransactionCategoryLabel } from "./constants";
import type { TransactionFormValues } from "./types";

type TransactionComposerModalProps = {
  visible: boolean;
  mode: "create" | "detail";
  initialValues: TransactionFormValues;
  onClose: () => void;
  onSubmit: (payload: TransactionFormValues) => Promise<void>;
  onDelete?: () => Promise<void>;
  onParseReceipt: (file: {
    uri: string;
    name?: string;
    type?: string;
  }) => Promise<TransactionFormValues[] | null>;
  onReceiptScanned: (transactions: TransactionFormValues[]) => void;
};

export function TransactionComposerModal({
  visible,
  mode,
  initialValues,
  onClose,
  onSubmit,
  onDelete,
  onParseReceipt,
  onReceiptScanned,
}: TransactionComposerModalProps) {
  const { height: screenHeight } = useWindowDimensions();
  const [form, setForm] = useState<TransactionFormValues>(initialValues);
  const [isSaving, setIsSaving] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(mode === "create");
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [isCategoryPickerVisible, setIsCategoryPickerVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Reset the form whenever the modal transitions from closed to open,
  // mirroring React's "adjusting state when a prop changes" pattern
  // instead of an effect, so opening the modal never costs an extra render.
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);

    if (visible) {
      setForm(initialValues);
      setErrorMessage("");
      setIsEditing(mode === "create");
      setIsDatePickerVisible(false);
      setIsCategoryPickerVisible(false);
      setIsScanning(false);
      setIsSaving(false);
      setIsDeleting(false);
    }
  }

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

  const handleScanReceipt = async () => {
    setErrorMessage("");
    setIsScanning(true);

    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        type: "image/*",
      });

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

      onReceiptScanned(transactions);
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, "Receipt parsing failed. Try another image."),
      );
    } finally {
      setIsScanning(false);
    }
  };

  const handleSubmit = async () => {
    setErrorMessage("");
    setIsSaving(true);

    try {
      await onSubmit(form);
      onClose();
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, "Could not save this transaction right now."),
      );
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
            setErrorMessage(
              getErrorMessage(error, "Could not delete this transaction."),
            );
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
                {isFormMode ? "Scan a receipt to auto-fill entries" : "View the recorded transaction details."}
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

                  <ErrorBanner message={errorMessage} className="mb-3" />

                  <View className="flex-row gap-3">
                    {mode === "create" ? (
                      <Button
                        label="Scan receipt"
                        variant="outline"
                        onPress={handleScanReceipt}
                        loading={isScanning}
                        disabled={isSaving}
                        className="flex-1"
                      />
                    ) : null}

                    <Button
                      label={mode === "detail" ? "Done ✓" : "Save transaction"}
                      onPress={handleSubmit}
                      loading={isSaving}
                      disabled={isScanning}
                      className="flex-1"
                    />
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
                    <Button
                      label="Edit transaction"
                      onPress={() => setIsEditing(true)}
                      disabled={isDeleting}
                      className="flex-1"
                    />

                    {onDelete ? (
                      <Button
                        label="Delete"
                        variant="danger"
                        onPress={handleDelete}
                        loading={isDeleting}
                        className="flex-1"
                      />
                    ) : null}
                  </View>
                </>
              )}
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
