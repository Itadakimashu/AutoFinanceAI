import type { ComponentProps } from "react";
import type { Ionicons } from "@expo/vector-icons";

export const TRANSACTION_CATEGORY_CHOICES = [
  ["income", "Income"],
  ["food", "Food"],
  ["transport", "Transport"],
  ["utilities", "Utilities"],
  ["entertainment", "Entertainment"],
  ["health", "Health"],
  ["education", "Education"],
  ["clothing", "Clothing"],
  ["housing", "Housing"],
  ["savings", "Savings"],
  ["investment", "Investment"],
  ["miscellaneous", "Miscellaneous"],
  ["tax", "Tax"],
] as const;

type IoniconName = ComponentProps<typeof Ionicons>["name"];

const TRANSACTION_CATEGORY_ICONS: Record<string, IoniconName> = {
  income: "cash-outline",
  food: "fast-food-outline",
  transport: "car-outline",
  utilities: "flash-outline",
  entertainment: "film-outline",
  health: "medkit-outline",
  education: "school-outline",
  clothing: "shirt-outline",
  housing: "home-outline",
  savings: "wallet-outline",
  investment: "trending-up-outline",
  miscellaneous: "pricetag-outline",
  tax: "receipt-outline",
};

export function getTransactionCategoryIcon(category: string): IoniconName {
  return TRANSACTION_CATEGORY_ICONS[category] ?? "pricetag-outline";
}

export function getTransactionCategoryLabel(category: string) {
  return (
    TRANSACTION_CATEGORY_CHOICES.find(([value]) => value === category)?.[1] ??
    category
  );
}

export function isValidTransactionCategory(category: string) {
  return TRANSACTION_CATEGORY_CHOICES.some(([value]) => value === category);
}

// The backend rejects anything outside TRANSACTION_CATEGORY_CHOICES with an
// exact, case-sensitive match. AI-scanned receipts don't always come back
// perfectly formatted (stray whitespace, different casing, a near-miss
// synonym), so snap to a known choice - or a safe default - up front rather
// than letting a bad value reach the save request.
export function normalizeTransactionCategory(category: string | undefined) {
  const normalized = category?.trim().toLowerCase() ?? "";
  const match = TRANSACTION_CATEGORY_CHOICES.find(
    ([value]) => value === normalized,
  );
  return match ? match[0] : "miscellaneous";
}
