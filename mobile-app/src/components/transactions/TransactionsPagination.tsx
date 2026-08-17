import { Pressable, Text, View } from "react-native";

type TransactionsPaginationProps = {
  page: number;
  totalPages: number;
  count: number;
  pageSize: number;
  onPrevious: () => void;
  onNext: () => void;
};

export function TransactionsPagination({
  page,
  totalPages,
  count,
  pageSize,
  onPrevious,
  onNext,
}: TransactionsPaginationProps) {
  const previousDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  return (
    <View className="mt-6 gap-3 pb-2">
      <View className="flex-row items-center justify-between rounded-[1.5rem] border border-white/10 bg-slate-900/90 px-4 py-3">
        <View>
          <Text className="text-xs uppercase tracking-[0.18em] text-slate-500">
            Records
          </Text>
          <Text className="mt-1 text-sm font-semibold text-white">
            {count} total • {pageSize} per page
          </Text>
        </View>

        <View className="rounded-full border border-cyan-400/15 bg-cyan-400/10 px-3 py-1">
          <Text className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
            Page {page}/{totalPages}
          </Text>
        </View>
      </View>

      <View className="flex-row flex-wrap items-center justify-center gap-2 pb-2">
        <Pressable
          className={`rounded-full border px-4 py-2 ${previousDisabled ? "border-white/5 bg-white/5 opacity-40" : "border-white/10 bg-white/5"}`}
          onPress={onPrevious}
          disabled={previousDisabled}
        >
          <Text className="text-sm font-semibold text-slate-200">Previous</Text>
        </Pressable>

        <View className="rounded-full bg-cyan-400 px-4 py-2">
          <Text className="text-sm font-semibold text-slate-950">{page}</Text>
        </View>

        <Pressable
          className={`rounded-full border px-4 py-2 ${nextDisabled ? "border-white/5 bg-white/5 opacity-40" : "border-white/10 bg-white/5"}`}
          onPress={onNext}
          disabled={nextDisabled}
        >
          <Text className="text-sm font-semibold text-slate-200">Next</Text>
        </Pressable>
      </View>
    </View>
  );
}
