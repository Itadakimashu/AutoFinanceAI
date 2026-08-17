export type Transaction = {
  id: number;
  user?:
    | number
    | {
        id: number;
        username: string;
        email?: string;
        first_name?: string;
        last_name?: string;
      };
  date: string;
  category: string;
  description: string;
  amount: number;
  is_recurring: boolean;
};

export type TransactionTotals = {
  total_income: number;
  total_expenses: number;
  net_amount: number;
  total_transactions: number;
};

export type TransactionFormValues = {
  date: string;
  description: string;
  amount: string;
  category: string;
  is_recurring: boolean;
};

export type TransactionFilterState = {
  search: string;
  category: string;
  ordering: string;
  dateAfter: string;
  dateBefore: string;
  amountMin: string;
  amountMax: string;
};
