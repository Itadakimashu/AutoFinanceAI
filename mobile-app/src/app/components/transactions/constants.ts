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

export function getTransactionCategoryLabel(category: string) {
  return (
    TRANSACTION_CATEGORY_CHOICES.find(([value]) => value === category)?.[1] ??
    category
  );
}
