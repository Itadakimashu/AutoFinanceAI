import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import type { TransactionFilterState } from "./types";

type TransactionsFilterDrawerProps = {
  isOpen: boolean;
  value: TransactionFilterState;
  categories: string[];
  onChange: (nextValue: Partial<TransactionFilterState>) => void;
  onApply: () => void;
  onReset: () => void;
  onClose: () => void;
};

const sortOptions = [
  { label: "Date new to old", value: "-date" },
  { label: "Date old to new", value: "date" },
  { label: "Amount high to low", value: "-amount" },
  { label: "Amount low to high", value: "amount" },
];

export function TransactionsFilterDrawer({
  isOpen,
  value,
  categories,
  onChange,
  onApply,
  onReset,
  onClose,
}: TransactionsFilterDrawerProps) {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const categoryOptions = ["all", ...categories];

  const selectedSort =
    sortOptions.find((option) => option.value === value.ordering) ??
    sortOptions[0];
  const selectedCategory = value.category || "all";

  return (
    <>
      {isOpen ? (
        <Pressable
          className="absolute inset-0 z-30 bg-slate-950/70"
          onPress={onClose}
        />
      ) : null}

      <View
        className={`absolute left-0 top-0 bottom-0 z-40 w-[86%] max-w-sm border-r border-white/10 bg-slate-950 px-4 pb-8 pt-14 shadow-2xl shadow-slate-950/60 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <View className="mb-5 flex-row items-start justify-between">
          <View className="flex-1 pr-3">
            <Text className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300/80">
              Controls
            </Text>
            <Text className="mt-2 text-3xl font-bold text-white">
              Filter & Sort
            </Text>
            <Text className="mt-1 text-sm text-slate-400">
              Category, amount, date, ordering, and page size.
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
          contentContainerClassName="space-y-4 pb-10"
          showsVerticalScrollIndicator={false}
        >
          <View className="rounded-[2rem] border border-white/10 bg-slate-900 p-4">
            <View className="mb-4 flex-row items-center justify-between">
              <View>
                <Text className="text-lg font-semibold text-white">
                  Filter options
                </Text>
                <Text className="text-sm text-slate-400">
                  category, amount gte/lte, and date range
                </Text>
              </View>
            </View>

            <Text className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Category
            </Text>
            <View className="mb-4 overflow-hidden rounded-3xl border border-white/10 bg-slate-950">
              <Pressable
                className="flex-row items-center justify-between px-4 py-3"
                onPress={() => setIsCategoryOpen((value) => !value)}
              >
                <View>
                  <Text className="text-sm font-semibold text-white">
                    {selectedCategory}
                  </Text>
                  <Text className="mt-1 text-xs text-slate-500">
                    Choose a backend category or keep all transactions visible
                  </Text>
                </View>

                <Text className="text-lg font-semibold text-slate-300">
                  {isCategoryOpen ? "▴" : "▾"}
                </Text>
              </Pressable>

              {isCategoryOpen ? (
                <View className="border-t border-white/10 px-2 py-2">
                  {categoryOptions.map((option) => {
                    const isActive = option === selectedCategory;

                    return (
                      <Pressable
                        key={option}
                        className={`mb-1 rounded-2xl px-3 py-3 ${isActive ? "bg-cyan-400" : "bg-white/5"}`}
                        onPress={() => {
                          onChange({ category: option });
                          setIsCategoryOpen(false);
                        }}
                      >
                        <Text
                          className={`text-sm font-semibold ${isActive ? "text-slate-950" : "text-slate-200"}`}
                        >
                          {option}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}
            </View>

            <Text className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Amount range
            </Text>
            <View className="mb-4 rounded-3xl border border-white/10 bg-slate-950 px-4 py-5">
              <View className="mb-3 rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
                <Text className="text-sm font-medium text-slate-300">
                  Fine-tune with numeric ranges if you need precise filtering.
                </Text>
              </View>

              <View className="flex-row gap-3">
                <TextInput
                  placeholder="Min amount"
                  placeholderTextColor="#64748b"
                  keyboardType="numeric"
                  className="flex-1 rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
                  value={value.amountMin}
                  onChangeText={(amountMin) => onChange({ amountMin })}
                />
                <TextInput
                  placeholder="Max amount"
                  placeholderTextColor="#64748b"
                  keyboardType="numeric"
                  className="flex-1 rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
                  value={value.amountMax}
                  onChangeText={(amountMax) => onChange({ amountMax })}
                />
              </View>
            </View>

            <Text className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Date range
            </Text>
            <View className="flex-col gap-3">
              <TextInput
                placeholder="From date"
                placeholderTextColor="#64748b"
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
                value={value.dateAfter}
                onChangeText={(dateAfter) => onChange({ dateAfter })}
              />
              <TextInput
                placeholder="To date"
                placeholderTextColor="#64748b"
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
                value={value.dateBefore}
                onChangeText={(dateBefore) => onChange({ dateBefore })}
              />
            </View>

            <View className="mt-4 flex-row gap-3">
              <TextInput
                placeholder="Min amount"
                placeholderTextColor="#64748b"
                keyboardType="numeric"
                className="flex-1 rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
                value={value.amountMin}
                onChangeText={(amountMin) => onChange({ amountMin })}
              />
              <TextInput
                placeholder="Max amount"
                placeholderTextColor="#64748b"
                keyboardType="numeric"
                className="flex-1 rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
                value={value.amountMax}
                onChangeText={(amountMax) => onChange({ amountMax })}
              />
            </View>
          </View>

          <View className="rounded-[2rem] border border-white/10 bg-slate-900 p-4">
            <View className="mb-4 flex-row items-center justify-between">
              <View>
                <Text className="text-lg font-semibold text-white">
                  Sort by
                </Text>
                <Text className="text-sm text-slate-400">
                  Backend-driven ordering
                </Text>
              </View>

              <View className="rounded-full bg-fuchsia-400/15 px-3 py-1">
                <Text className="text-xs font-semibold uppercase tracking-[0.2em] text-fuchsia-200">
                  Sort
                </Text>
              </View>
            </View>

            <View className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950">
              <Pressable
                className="flex-row items-center justify-between px-4 py-3"
                onPress={() => setIsSortOpen((value) => !value)}
              >
                <View>
                  <Text className="text-sm font-semibold text-white">
                    {selectedSort.label}
                  </Text>
                  <Text className="mt-1 text-xs text-slate-500">
                    Choose the backend sort order
                  </Text>
                </View>

                <Text className="text-lg font-semibold text-slate-300">
                  {isSortOpen ? "▴" : "▾"}
                </Text>
              </Pressable>

              {isSortOpen ? (
                <View className="border-t border-white/10 px-2 py-2">
                  {sortOptions.map((option) => {
                    const isActive = option.value === selectedSort.value;

                    return (
                      <Pressable
                        key={option.value}
                        className={`mb-1 rounded-2xl px-3 py-3 ${isActive ? "bg-fuchsia-400" : "bg-white/5"}`}
                        onPress={() => {
                          onChange({ ordering: option.value });
                          setIsSortOpen(false);
                        }}
                      >
                        <Text
                          className={`text-sm font-semibold ${isActive ? "text-slate-950" : "text-slate-200"}`}
                        >
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}
            </View>

            <View className="mt-4 flex-row gap-3">
              <TextInput
                placeholder="Rows per page"
                placeholderTextColor="#64748b"
                keyboardType="numeric"
                className="flex-1 rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
                value={value.pageSize}
                onChangeText={(pageSize) => onChange({ pageSize })}
              />
              <Pressable
                className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                onPress={onReset}
              >
                <Text className="text-center text-sm font-semibold text-slate-200">
                  Reset
                </Text>
              </Pressable>
            </View>

            <Pressable
              className="mt-4 rounded-2xl bg-cyan-400 px-4 py-4"
              onPress={onApply}
            >
              <Text className="text-center text-sm font-semibold text-slate-950">
                Apply filters
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </>
  );
}
