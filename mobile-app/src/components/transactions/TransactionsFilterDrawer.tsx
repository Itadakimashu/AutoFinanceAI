import { useState, type ReactNode } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import DateTimePicker from "@react-native-community/datetimepicker";

import { Button } from "../ui";
import { TRANSACTION_CATEGORY_CHOICES } from "./constants";
import type { TransactionFilterState } from "./types";

type DateField = "dateAfter" | "dateBefore";

type TransactionsFilterDrawerProps = {
  isOpen: boolean;
  value: TransactionFilterState;
  onChange: (nextValue: Partial<TransactionFilterState>) => void;
  onApply: () => void;
  onReset: () => void;
  onClose: () => void;
};

const CATEGORY_OPTIONS = [
  ["all", "All categories"],
  ...TRANSACTION_CATEGORY_CHOICES,
] as const;

const SORT_OPTIONS = [
  { label: "Newest first", value: "-date" },
  { label: "Oldest first", value: "date" },
  { label: "Amount: high to low", value: "-amount" },
  { label: "Amount: low to high", value: "amount" },
];

function FilterSection({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <View className="mb-4 rounded-[1.75rem] border border-white/10 bg-slate-900 p-4">
      <Text className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        {label}
      </Text>
      {description ? (
        <Text className="mt-1 text-xs text-slate-500">{description}</Text>
      ) : null}
      <View className="mt-3">{children}</View>
    </View>
  );
}

function Chip({
  label,
  active,
  tone,
  onPress,
}: {
  label: string;
  active: boolean;
  tone: "cyan" | "fuchsia";
  onPress: () => void;
}) {
  const activeClass =
    tone === "cyan"
      ? "border-cyan-400 bg-cyan-400"
      : "border-fuchsia-400 bg-fuchsia-400";

  return (
    <Pressable
      className={`rounded-full border px-4 py-2 ${active ? activeClass : "border-white/10 bg-white/5"}`}
      onPress={onPress}
    >
      <Text
        className={`text-sm font-semibold ${active ? "text-slate-950" : "text-slate-300"}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function DateFieldPill({
  label,
  value,
  onPress,
  onClear,
}: {
  label: string;
  value: string;
  onPress: () => void;
  onClear: () => void;
}) {
  return (
    <View className="flex-row items-center gap-2">
      <Pressable
        className="flex-1 rounded-2xl border border-white/10 bg-slate-950 px-4 py-3"
        onPress={onPress}
      >
        <Text className="text-sm text-white">{value || "Any"}</Text>
        <Text className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          {label}
        </Text>
      </Pressable>

      {value ? (
        <Pressable
          className="h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5"
          onPress={onClear}
          hitSlop={8}
        >
          <Text className="text-sm font-semibold text-slate-300">×</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function TransactionsFilterDrawer({
  isOpen,
  value,
  onChange,
  onApply,
  onReset,
  onClose,
}: TransactionsFilterDrawerProps) {
  const [activeDateField, setActiveDateField] = useState<DateField | null>(
    null,
  );

  const selectedCategory = value.category || "all";
  const selectedSort =
    SORT_OPTIONS.find((option) => option.value === value.ordering) ??
    SORT_OPTIONS[0];

  const activeDateValue = activeDateField ? value[activeDateField] : "";
  const activeDate = activeDateValue
    ? new Date(`${activeDateValue}T12:00:00`)
    : new Date();

  const handleDateChange = (_event: unknown, date?: Date) => {
    const field = activeDateField;
    setActiveDateField(null);
    if (!date || !field) {
      return;
    }

    onChange({ [field]: date.toISOString().slice(0, 10) });
  };

  return (
    <>
      {isOpen ? (
        <Pressable
          className="absolute inset-0 z-30 bg-slate-950/70"
          onPress={onClose}
        />
      ) : null}

      <View
        pointerEvents={isOpen ? "auto" : "none"}
        className={`absolute left-0 top-0 bottom-0 z-40 w-[86%] max-w-sm border-r border-white/10 bg-slate-950 px-4 pb-8 pt-14 shadow-2xl shadow-slate-950/60 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <View className="mb-5 flex-row items-start justify-between">
          <View className="flex-1 pr-3">
            <Text className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300/80">
              Controls
            </Text>
            <Text className="mt-2 text-3xl font-bold text-white">
              Filter & sort
            </Text>
            <Text className="mt-1 text-sm text-slate-400">
              Narrow down the timeline, then apply.
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
          className="flex-1"
          contentContainerClassName="pb-10"
          showsVerticalScrollIndicator={false}
        >
          <FilterSection label="Category">
            <View className="flex-row flex-wrap gap-2">
              {CATEGORY_OPTIONS.map(([optionValue, label]) => (
                <Chip
                  key={optionValue}
                  label={label}
                  tone="cyan"
                  active={optionValue === selectedCategory}
                  onPress={() => onChange({ category: optionValue })}
                />
              ))}
            </View>
          </FilterSection>

          <FilterSection label="Sort by">
            <View className="flex-row flex-wrap gap-2">
              {SORT_OPTIONS.map((option) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  tone="fuchsia"
                  active={option.value === selectedSort.value}
                  onPress={() => onChange({ ordering: option.value })}
                />
              ))}
            </View>
          </FilterSection>

          <FilterSection label="Amount range">
            <View className="flex-row gap-3">
              <TextInput
                placeholder="Min"
                placeholderTextColor="#64748b"
                keyboardType="numeric"
                className="flex-1 rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
                value={value.amountMin}
                onChangeText={(amountMin) => onChange({ amountMin })}
              />
              <TextInput
                placeholder="Max"
                placeholderTextColor="#64748b"
                keyboardType="numeric"
                className="flex-1 rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
                value={value.amountMax}
                onChangeText={(amountMax) => onChange({ amountMax })}
              />
            </View>
          </FilterSection>

          <FilterSection label="Date range">
            <View className="gap-3">
              <DateFieldPill
                label="From date"
                value={value.dateAfter}
                onPress={() => setActiveDateField("dateAfter")}
                onClear={() => onChange({ dateAfter: "" })}
              />
              <DateFieldPill
                label="To date"
                value={value.dateBefore}
                onPress={() => setActiveDateField("dateBefore")}
                onClear={() => onChange({ dateBefore: "" })}
              />
            </View>
          </FilterSection>

          <View className="flex-row gap-3">
            <Button
              label="Reset"
              variant="secondary"
              onPress={onReset}
              className="flex-1"
            />
            <Button
              label="Apply filters"
              onPress={onApply}
              className="flex-1"
            />
          </View>
        </ScrollView>
      </View>

      {activeDateField ? (
        <DateTimePicker
          value={Number.isNaN(activeDate.getTime()) ? new Date() : activeDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      ) : null}
    </>
  );
}
