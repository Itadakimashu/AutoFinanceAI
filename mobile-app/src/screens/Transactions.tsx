// @ts-nocheck
import { useCallback, useState } from "react";
import { FlatList, Pressable, RefreshControl, Text, View } from "react-native";

import { useFocusEffect, useRouter } from "expo-router";

import { useAuth } from "../context/AuthContext";
import {
  createTransaction,
  deleteTransaction,
  getErrorMessage,
  getTransactions,
  parseTransactionsFromImage,
  updateTransaction,
} from "../lib/api";
import {
  TransactionComposerModal,
  TransactionReceiptReviewModal,
  TransactionRow,
  TransactionsFilterDrawer,
  TransactionsHeader,
  TransactionsPagination,
  TransactionsPdfExportModal,
  normalizeTransactionCategory,
  type Transaction,
  type TransactionFilterState,
  type TransactionFormValues,
  type TransactionTotals,
} from "../components/transactions";
import { ErrorBanner } from "../components/ui";

const DEFAULT_FILTERS: TransactionFilterState = {
  search: "",
  category: "all",
  ordering: "-date",
  dateAfter: "",
  dateBefore: "",
  amountMin: "",
  amountMax: "",
};

const DEFAULT_FORM_VALUES: TransactionFormValues = {
  date: new Date().toISOString().slice(0, 10),
  description: "",
  amount: "",
  category: "miscellaneous",
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
    amount__gte:
      filters.amountMin.trim() !== ""
        ? Number(filters.amountMin.trim())
        : undefined,
    amount__lte:
      filters.amountMax.trim() !== ""
        ? Number(filters.amountMax.trim())
        : undefined,
    page,
  };
}

export default function TransactionsScreen() {
  const router = useRouter();
  const { authState, onLogout } = useAuth();
  const displayName = authState.user?.first_name || authState.user?.username;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totals, setTotals] = useState<TransactionTotals | null>(null);
  const [count, setCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(0);
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
  const [isPdfExportModalOpen, setIsPdfExportModalOpen] = useState(false);
  const [scannedReceiptTransactions, setScannedReceiptTransactions] =
    useState<TransactionFormValues[]>([]);
  const [isReceiptReviewOpen, setIsReceiptReviewOpen] = useState(false);
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
      setTotalPages(Math.max(1, data.total_pages));
      setPageSize(data.page_size);
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, "Transactions could not be loaded right now."),
      );
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

  const openCreateComposer = () => {
    setSelectedTransaction(null);
    setIsComposerOpen(true);
  };

  const openTransactionDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsComposerOpen(true);
  };

  const submitComposer = async (payload: TransactionFormValues) => {
    if (selectedTransaction) {
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

  const handleReceiptScanned = (transactions: TransactionFormValues[]) => {
    setIsComposerOpen(false);
    setSelectedTransaction(null);
    setScannedReceiptTransactions(transactions);

    // Wait for the composer modal's close animation to finish before
    // presenting the review modal so the two native modals never overlap.
    setTimeout(() => setIsReceiptReviewOpen(true), 300);
  };

  const saveScannedTransactions = async (
    transactions: TransactionFormValues[],
  ) => {
    await createTransaction(
      transactions.map((item) => ({
        date: item.date,
        description: item.description,
        amount: Number(item.amount),
        category: item.category,
        is_recurring: item.is_recurring,
      })),
    );

    await loadTransactions();
  };

  const deleteSelectedTransaction = async () => {
    if (!selectedTransaction) {
      return;
    }

    await deleteTransaction(selectedTransaction.id);
    await loadTransactions();
  };

  const parseReceiptImage = async (file: {
    uri: string;
    name?: string;
    type?: string;
  }) => {
    const parsed = await parseTransactionsFromImage(file);

    if (!parsed.transactions?.length) {
      return null;
    }

    return parsed.transactions.map((transaction) => ({
      date: transaction.date,
      description: transaction.description,
      amount: String(transaction.amount),
      category: normalizeTransactionCategory(transaction.category),
      is_recurring: transaction.is_recurring,
    }));
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

  const handleLogout = async () => {
    await onLogout();
    router.replace("/login");
  };

  return (
    <View className="flex-1 bg-slate-950" style={{ flex: 1 }}>
      <TransactionsFilterDrawer
        isOpen={isFilterDrawerOpen}
        value={filters}
        onChange={handleFilterChange}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        onClose={() => setIsFilterDrawerOpen(false)}
        onLogout={handleLogout}
      />

      <TransactionComposerModal
        visible={isComposerOpen}
        mode={selectedTransaction ? "detail" : "create"}
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
        onReceiptScanned={handleReceiptScanned}
      />

      <TransactionReceiptReviewModal
        visible={isReceiptReviewOpen}
        transactions={scannedReceiptTransactions}
        onClose={() => {
          setIsReceiptReviewOpen(false);
          setScannedReceiptTransactions([]);
        }}
        onSave={saveScannedTransactions}
      />

      <TransactionsPdfExportModal
        visible={isPdfExportModalOpen}
        onClose={() => setIsPdfExportModalOpen(false)}
      />

      <FlatList
        data={transactions}
        renderItem={({ item }) => (
          <TransactionRow item={item} onPress={() => openTransactionDetails(item)} />
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
        contentContainerClassName="px-4 pt-14 pb-28"
        ListHeaderComponent={
          <View className="mb-5 gap-4">
            <TransactionsHeader
              userName={displayName}
              totals={totals}
              searchValue={searchInput}
              onSearchChange={setSearchInput}
              onSearchSubmit={handleSearchSubmit}
              onOpenFilters={() => setIsFilterDrawerOpen(true)}
              onOpenComposer={openCreateComposer}
              onOpenAnalysis={() => router.push("/analysis")}
              onExportPdf={() => setIsPdfExportModalOpen(true)}
            />

            <ErrorBanner message={errorMessage} className="rounded-[1.5rem]" />
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
            pageSize={pageSize}
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
          onPress={() => router.push("/analysis")}
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
