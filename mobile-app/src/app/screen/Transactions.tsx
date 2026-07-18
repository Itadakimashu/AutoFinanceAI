import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";

import { useFocusEffect, useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

import "../../../global.css";

import {
  createTransaction,
  deleteTransaction,
  downloadTransactionsPdf,
  getTransactions,
  parseTransactionsFromImage,
  updateTransaction,
} from "../lib/api";
import {
  TransactionComposerModal,
  TransactionRow,
  TransactionsFilterDrawer,
  TransactionsHeader,
  TransactionsPagination,
  type Transaction,
  type TransactionFilterState,
  type TransactionFormValues,
  type TransactionTotals,
} from "../components/transactions";

const DEFAULT_FILTERS: TransactionFilterState = {
  search: "",
  category: "all",
  ordering: "-date",
  dateAfter: "",
  dateBefore: "",
  amountMin: "",
  amountMax: "",
  pageSize: "10",
};

const DEFAULT_FORM_VALUES: TransactionFormValues = {
  date: new Date().toISOString().slice(0, 10),
  description: "",
  amount: "",
  category: "expense",
  is_recurring: false,
};

function mapTransactionToForm(transaction: Transaction): TransactionFormValues {
  return {
    date: transaction.date,
    description: transaction.description,
    amount: String(transaction.amount),
    category: transaction.category,
    is_recurring: transaction.is_recurring,
  };
}

function buildQueryParams(filters: TransactionFilterState, page: number) {
  return {
    search: filters.search.trim() || undefined,
    ordering: filters.ordering,
    category: filters.category === "all" ? undefined : filters.category,
    date_after: filters.dateAfter.trim() || undefined,
    date_before: filters.dateBefore.trim() || undefined,
    amount_min:
      filters.amountMin.trim() !== ""
        ? Number(filters.amountMin.trim())
        : undefined,
    amount_max:
      filters.amountMax.trim() !== ""
        ? Number(filters.amountMax.trim())
        : undefined,
    page,
    page_size: Number.parseInt(filters.pageSize, 10) || 10,
  };
}

function arrayBufferToFile(buffer: ArrayBuffer, filename: string) {
  const file = new FileSystem.File(FileSystem.Paths.cache, filename);
  file.write(new Uint8Array(buffer));
  return file;
}

export default function TransactionsScreen() {
  const router = useRouter();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totals, setTotals] = useState<TransactionTotals | null>(null);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] =
    useState<TransactionFilterState>(DEFAULT_FILTERS);
  const [searchInput, setSearchInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadTransactions = useCallback(async () => {
    const shouldShowFullLoading = transactions.length === 0;

    if (shouldShowFullLoading) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    setErrorMessage("");

    try {
      const data = await getTransactions(buildQueryParams(filters, page));
      setTransactions(data.results);
      setTotals(data.totals);
      setCount(data.count);
    } catch (error) {
      setErrorMessage("Transactions could not be loaded right now.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [filters, page, transactions.length]);

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [loadTransactions]),
  );

  const totalPages = Math.max(
    1,
    Math.ceil(count / Number(filters.pageSize || 10)),
  );

  const categoryOptions = useMemo(() => {
    const values = new Set<string>();
    transactions.forEach((transaction) => {
      if (transaction.category) {
        values.add(transaction.category);
      }
    });

    return Array.from(values).sort((left, right) => left.localeCompare(right));
  }, [transactions]);

  const openCreateComposer = () => {
    setSelectedTransaction(null);
    setIsComposerOpen(true);
  };

  const openEditComposer = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsComposerOpen(true);
  };

  const submitComposer = async (
    payload: TransactionFormValues | TransactionFormValues[],
  ) => {
    if (Array.isArray(payload)) {
      await createTransaction(
        payload.map((item) => ({
          date: item.date,
          description: item.description,
          amount: Number(item.amount),
          category: item.category,
          is_recurring: item.is_recurring,
        })),
      );
    } else if (selectedTransaction) {
      await updateTransaction(selectedTransaction.id, {
        date: payload.date,
        description: payload.description,
        amount: Number(payload.amount),
        category: payload.category,
        is_recurring: payload.is_recurring,
      });
    } else {
      await createTransaction({
        date: payload.date,
        description: payload.description,
        amount: Number(payload.amount),
        category: payload.category,
        is_recurring: payload.is_recurring,
      });
    }

    await loadTransactions();
  };

  const deleteSelectedTransaction = async () => {
    if (!selectedTransaction) {
      return;
    }

    await deleteTransaction(selectedTransaction.id);
    await loadTransactions();
  };

  const parseReceiptImage = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      type: "image/*",
    } as any);

    if (result.canceled) {
      return null;
    }

    const asset = result.assets?.[0];
    if (!asset) {
      return null;
    }

    const parsed = await parseTransactionsFromImage({
      uri: asset.uri,
      name: asset.name,
      type: asset.mimeType ?? "image/jpeg",
    });

    if (!parsed.transactions?.length) {
      return null;
    }

    return parsed.transactions.map((transaction) => ({
      date: transaction.date,
      description: transaction.description,
      amount: String(transaction.amount),
      category: transaction.category,
      is_recurring: transaction.is_recurring,
    }));
  };

  const exportMonthlyPdf = async () => {
    setIsExportingPdf(true);

    try {
      const now = new Date();
      const pdfBuffer = await downloadTransactionsPdf(
        now.getMonth() + 1,
        now.getFullYear(),
      );
      const file = arrayBufferToFile(
        pdfBuffer,
        `transactions_${now.getFullYear()}_${String(now.getMonth() + 1).padStart(2, "0")}.pdf`,
      );

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
          mimeType: "application/pdf",
          UTI: "com.adobe.pdf",
        });
      }
    } catch (error) {
      setErrorMessage("PDF export failed for the selected month.");
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleFilterChange = (nextValue: Partial<TransactionFilterState>) => {
    setFilters((current) => ({ ...current, ...nextValue }));
  };

  const handleApplyFilters = () => {
    setPage(1);
    setIsFilterDrawerOpen(false);
    loadTransactions();
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSearchInput("");
    setPage(1);
  };

  const handleSearchSubmit = () => {
    setFilters((current) => ({ ...current, search: searchInput.trim() }));
    setPage(1);
  };

  return (
    <View className="flex-1 bg-slate-950">
      <TransactionsFilterDrawer
        isOpen={isFilterDrawerOpen}
        value={filters}
        categories={categoryOptions}
        onChange={handleFilterChange}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        onClose={() => setIsFilterDrawerOpen(false)}
      />

      <TransactionComposerModal
        visible={isComposerOpen}
        mode={selectedTransaction ? "edit" : "create"}
        initialValues={
          selectedTransaction
            ? mapTransactionToForm(selectedTransaction)
            : DEFAULT_FORM_VALUES
        }
        onClose={() => {
          setIsComposerOpen(false);
          setSelectedTransaction(null);
        }}
        onSubmit={submitComposer}
        onDelete={selectedTransaction ? deleteSelectedTransaction : undefined}
        onParseReceipt={parseReceiptImage}
      />

      <FlatList
        data={transactions}
        renderItem={({ item }) => (
          <TransactionRow item={item} onPress={() => openEditComposer(item)} />
        )}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={loadTransactions}
            tintColor="#22d3ee"
            colors={["#22d3ee"]}
          />
        }
        contentContainerClassName="px-4 pb-10 pt-14"
        ListHeaderComponent={
          <View className="mb-5 gap-4">
            <TransactionsHeader
              userName="Fardin"
              totals={totals}
              searchValue={searchInput}
              onSearchChange={setSearchInput}
              onSearchSubmit={handleSearchSubmit}
              onOpenFilters={() => setIsFilterDrawerOpen(true)}
              onOpenComposer={openCreateComposer}
              onOpenAnalysis={() => router.push("/analysis" as any)}
              onExportPdf={exportMonthlyPdf}
              isExportingPdf={isExportingPdf}
            />

            {errorMessage ? (
              <View className="rounded-[1.5rem] border border-rose-400/20 bg-rose-400/10 px-4 py-3">
                <Text className="text-sm text-rose-200">{errorMessage}</Text>
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View className="mt-4 rounded-[2rem] border border-white/10 bg-slate-900/90 px-4 py-10">
              <Text className="text-center text-lg font-semibold text-white">
                Loading transactions
              </Text>
              <Text className="mt-2 text-center text-sm text-slate-400">
                Pulling the latest backend data and monthly totals.
              </Text>
            </View>
          ) : (
            <View className="mt-4 rounded-[2rem] border border-white/10 bg-slate-900/90 px-4 py-10">
              <Text className="text-center text-lg font-semibold text-white">
                No transactions yet
              </Text>
              <Text className="mt-2 text-center text-sm text-slate-400">
                Add a manual entry or scan a receipt to populate the timeline.
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          <TransactionsPagination
            page={page}
            totalPages={totalPages}
            count={count}
            pageSize={Number(filters.pageSize || 10)}
            onPrevious={() => setPage((current) => Math.max(1, current - 1))}
            onNext={() =>
              setPage((current) => Math.min(totalPages, current + 1))
            }
          />
        }
      />

      <View className="absolute bottom-6 right-5 gap-3">
        <Pressable
          className="h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5"
          onPress={() => router.push("/analysis" as any)}
        >
          <Text className="text-lg font-semibold text-white">AI</Text>
        </Pressable>

        <Pressable
          className="h-16 w-16 items-center justify-center rounded-2xl bg-cyan-400 shadow-lg shadow-cyan-500/30"
          onPress={openCreateComposer}
        >
          <Text className="text-3xl font-light text-slate-950">＋</Text>
        </Pressable>
      </View>
    </View>
  );
}
