import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";

import DateTimePicker from "@react-native-community/datetimepicker";

import { getErrorMessage } from "../../lib/api";
import { Button, ErrorBanner } from "../ui";
import { CategoryPickerModal } from "./CategoryPickerModal";
import { getTransactionCategoryLabel, isValidTransactionCategory } from "./constants";
import type { TransactionFormValues } from "./types";

type TransactionReceiptReviewModalProps = {
  visible: boolean;
  transactions: TransactionFormValues[];
  onClose: () => void;
  onSave: (transactions: TransactionFormValues[]) => Promise<void>;
};

function computeTotal(items: TransactionFormValues[]) {
  return items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
}

export function TransactionReceiptReviewModal({
  visible,
  transactions,
  onClose,
  onSave,
}: TransactionReceiptReviewModalProps) {
  const { height: screenHeight } = useWindowDimensions();
  const [items, setItems] = useState<TransactionFormValues[]>([]);
  const [activeDateIndex, setActiveDateIndex] = useState<number | null>(null);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState<
    number | null
  >(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Reset the review list whenever the modal transitions from closed to
  // open, using the render-time "adjusting state" pattern instead of an
  // effect so opening the modal never costs an extra render.
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);

    if (visible) {
      setItems(transactions);
      setActiveDateIndex(null);
      setActiveCategoryIndex(null);
      setErrorMessage("");
    }
  }

  const updateItem = (index: number, patch: Partial<TransactionFormValues>) => {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    );
  };

  const removeItem = (index: number) => {
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleDateChange = (_event: unknown, date?: Date) => {
    const index = activeDateIndex;
    setActiveDateIndex(null);
    if (!date || index === null) {
      return;
    }

    updateItem(index, { date: date.toISOString().slice(0, 10) });
  };

  const handleSave = async () => {
    if (items.length === 0) {
      return;
    }

    // Matches the backend's own validation (amount must be greater than
    // zero). Catching it here means a single bad scanned row can't silently
    // fail the whole batch after a round trip to the server.
    const invalidIndex = items.findIndex(
      (item) =>
        !(Number(item.amount) > 0) ||
        !item.description.trim() ||
        !isValidTransactionCategory(item.category),
    );
    if (invalidIndex !== -1) {
      setErrorMessage(
        `Item ${invalidIndex + 1} needs a description, a category, and an amount greater than zero.`,
      );
      return;
    }

    setErrorMessage("");
    setIsSaving(true);

    try {
      await onSave(items);
      onClose();
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, "Could not save these transactions right now."),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const activeDate =
    activeDateIndex !== null
      ? new Date(`${items[activeDateIndex]?.date}T12:00:00`)
      : new Date();

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
                Review scanned receipt
              </Text>
              <Text className="mt-2 text-3xl font-semibold text-white">
                Confirm the details
              </Text>
              <Text className="mt-2 text-sm leading-6 text-slate-400">
                Edit any field below, remove entries you don&apos;t want, then save
                everything at once.
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
            {items.length === 0 ? (
              <View className="items-center rounded-[2rem] border border-white/10 bg-slate-900/90 px-4 py-10">
                <Text className="text-center text-base font-semibold text-white">
                  No transactions left to save
                </Text>
                <Text className="mt-2 text-center text-sm text-slate-400">
                  Every scanned item was removed. Close this and scan again if
                  needed.
                </Text>
              </View>
            ) : (
              <View className="gap-3">
                {items.map((item, index) => (
                  <View
                    key={`receipt-item-${index}`}
                    className="rounded-[1.75rem] border border-white/10 bg-slate-900/90 p-4"
                  >
                    <View className="mb-3 flex-row items-center justify-between">
                      <Text className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Item {index + 1} of {items.length}
                      </Text>
                      <Pressable
                        className="h-7 w-7 items-center justify-center rounded-lg border border-rose-400/20 bg-rose-400/10"
                        onPress={() => removeItem(index)}
                        hitSlop={8}
                      >
                        <Text className="text-xs font-semibold text-rose-200">
                          ×
                        </Text>
                      </Pressable>
                    </View>

                    <View className="mb-3 flex-row gap-3">
                      <Pressable
                        className="flex-1 rounded-2xl border border-white/10 bg-slate-950 px-4 py-3"
                        onPress={() => setActiveDateIndex(index)}
                      >
                        <Text className="text-sm text-white">{item.date}</Text>
                        <Text className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Date
                        </Text>
                      </Pressable>
                      <View className="flex-1 rounded-2xl border border-white/10 bg-slate-950 px-4 py-3">
                        <TextInput
                          placeholder="Amount"
                          placeholderTextColor="#64748b"
                          keyboardType="numeric"
                          className="text-sm text-white"
                          value={item.amount}
                          onChangeText={(amount) => updateItem(index, { amount })}
                        />
                        <Text className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Amount (BDT)
                        </Text>
                      </View>
                    </View>

                    <View className="mb-3 rounded-2xl border border-white/10 bg-slate-950 px-4 py-3">
                      <TextInput
                        placeholder="Description"
                        placeholderTextColor="#64748b"
                        className="text-sm text-white"
                        value={item.description}
                        onChangeText={(description) =>
                          updateItem(index, { description })
                        }
                      />
                      <Text className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Description
                      </Text>
                    </View>

                    <View className="flex-row gap-3">
                      <Pressable
                        className="flex-1 rounded-2xl border border-white/10 bg-slate-950 px-4 py-3"
                        onPress={() => setActiveCategoryIndex(index)}
                      >
                        <Text className="text-sm text-white">
                          {getTransactionCategoryLabel(item.category)}
                        </Text>
                        <Text className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Category
                        </Text>
                      </Pressable>

                      <Pressable
                        className={`flex-1 rounded-2xl border px-4 py-3 ${item.is_recurring ? "border-emerald-400/30 bg-emerald-400/10" : "border-white/10 bg-slate-950"}`}
                        onPress={() =>
                          updateItem(index, { is_recurring: !item.is_recurring })
                        }
                      >
                        <Text className="text-center text-sm font-semibold text-white">
                          {item.is_recurring ? "Recurring" : "One-time"}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          <ErrorBanner message={errorMessage} className="mt-3" />

          <View className="mt-4 flex-row items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <Text className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Total
            </Text>
            <Text className="text-base font-semibold text-white">
              ৳ {computeTotal(items).toLocaleString()}
            </Text>
          </View>

          <View className="mt-3 flex-row gap-3">
            <Button
              label="Cancel"
              variant="secondary"
              onPress={onClose}
              disabled={isSaving}
              className="flex-1"
            />

            <Button
              label={`Save ${items.length} transaction${items.length === 1 ? "" : "s"}`}
              onPress={handleSave}
              loading={isSaving}
              disabled={items.length === 0}
              className="flex-1"
            />
          </View>
        </View>
      </View>

      {activeDateIndex !== null ? (
        <DateTimePicker
          value={Number.isNaN(activeDate.getTime()) ? new Date() : activeDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      ) : null}

      <CategoryPickerModal
        visible={activeCategoryIndex !== null}
        value={activeCategoryIndex !== null ? items[activeCategoryIndex]?.category ?? "" : ""}
        onClose={() => setActiveCategoryIndex(null)}
        onSelect={(category) => {
          if (activeCategoryIndex !== null) {
            updateItem(activeCategoryIndex, { category });
          }
          setActiveCategoryIndex(null);
        }}
      />
    </Modal>
  );
}
