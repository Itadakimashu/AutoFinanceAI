import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function Home() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-slate-950">
      <StatusBar style="light" />

      <View className="absolute -left-16 top-8 h-44 w-44 rounded-full bg-cyan-400/10" />
      <View className="absolute -right-12 top-32 h-56 w-56 rounded-full bg-fuchsia-400/10" />
      <View className="absolute bottom-0 left-8 h-40 w-40 rounded-full bg-emerald-400/10" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="flex-grow px-5 pb-10 pt-16"
      >
        <View className="mb-6 flex-row items-center justify-between rounded-[1.75rem] border border-white/10 bg-white/5 px-4 py-3">
          <View>
            <Text className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">
              AutoFinance AI
            </Text>
            <Text className="mt-1 text-sm text-slate-400">
              Private mobile finance cockpit
            </Text>
          </View>

          <View className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1">
            <Text className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
              Secure
            </Text>
          </View>
        </View>

        <View className="mb-6 overflow-hidden rounded-[2rem] border border-cyan-400/15 bg-slate-900/90 p-6">
          <View className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-cyan-400/10" />
          <View className="absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-fuchsia-400/10" />

          <Text className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300/80">
            Premium personal finance
          </Text>
          <Text className="mt-4 text-4xl font-semibold leading-tight text-white">
            Turn receipts into a clear monthly money story.
          </Text>
          <Text className="mt-4 text-base leading-7 text-slate-300">
            Browse transactions, import receipts, review AI analysis, and export
            polished monthly reports without losing the dark, glassy dashboard
            feel.
          </Text>

          <View className="mt-6 flex-row gap-3">
            <Pressable
              className="flex-1 items-center rounded-2xl bg-cyan-400 px-4 py-4"
              onPress={() => router.push("/login" as any)}
            >
              <Text className="text-base font-semibold text-slate-950">
                Login
              </Text>
            </Pressable>

            <Pressable
              className="flex-1 items-center rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
              onPress={() => router.push("/signup" as any)}
            >
              <Text className="text-base font-semibold text-white">
                Create account
              </Text>
            </Pressable>
          </View>
        </View>

        <View className="mb-5 flex-row gap-3">
          <View className="flex-1 rounded-[1.75rem] border border-white/10 bg-white/5 p-4">
            <Text className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Insight
            </Text>
            <Text className="mt-3 text-2xl font-semibold text-white">AI</Text>
            <Text className="mt-2 text-sm leading-6 text-slate-400">
              Monthly analysis and spending signals.
            </Text>
          </View>

          <View className="flex-1 rounded-[1.75rem] border border-white/10 bg-white/5 p-4">
            <Text className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Reports
            </Text>
            <Text className="mt-3 text-2xl font-semibold text-white">PDF</Text>
            <Text className="mt-2 text-sm leading-6 text-slate-400">
              Export clean monthly transaction statements.
            </Text>
          </View>
        </View>

        <View className="mb-5 flex-row gap-3">
          <View className="flex-1 rounded-[1.75rem] border border-white/10 bg-slate-900/85 p-4">
            <Text className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Recurring
            </Text>
            <Text className="mt-3 text-2xl font-semibold text-emerald-300">
              Smart
            </Text>
            <Text className="mt-2 text-sm leading-6 text-slate-400">
              Flag recurring transactions automatically.
            </Text>
          </View>

          <View className="flex-1 rounded-[1.75rem] border border-white/10 bg-slate-900/85 p-4">
            <Text className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Filters
            </Text>
            <Text className="mt-3 text-2xl font-semibold text-fuchsia-300">
              Fast
            </Text>
            <Text className="mt-2 text-sm leading-6 text-slate-400">
              Search, sort, and refine with one thumb.
            </Text>
          </View>
        </View>

        <View className="rounded-[1.75rem] border border-white/10 bg-white/5 p-4">
          <Text className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Designed for mobile
          </Text>
          <Text className="mt-3 text-base leading-7 text-slate-300">
            Built to feel native on small screens while preserving the layered
            finance-dashboard style already established in the app.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
