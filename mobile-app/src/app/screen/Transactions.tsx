import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";

import transactions from "../data/transactions.json";

export default function TransactionsScreen() {
  const totalBalance = 48750;

  const renderItem = ({ item }) => {
    const expense = item.amount > 0;

    return (
      <View style={styles.card}>
        <View style={styles.left}>
          <View style={styles.icon}>
            <Text style={{ fontSize: 20 }}>💳</Text>
          </View>

          <View>
            <Text style={styles.description}>{item.description}</Text>
            <Text style={styles.category}>
              {item.category} • {item.date}
            </Text>
          </View>
        </View>

        <Text
          style={[styles.amount, { color: expense ? "#EF4444" : "#10B981" }]}
        >
          {expense ? "-" : "+"} ৳{Math.abs(item.amount)}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, Fardin 👋</Text>
        <Text style={styles.subtitle}>Welcome Back</Text>
      </View>

      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceTitle}>Total Balance</Text>

        <Text style={styles.balance}>৳ 48,750</Text>

        <View style={styles.balanceRow}>
          <View>
            <Text style={styles.label}>Income</Text>
            <Text style={styles.income}>৳ 62,000</Text>
          </View>

          <View>
            <Text style={styles.label}>Expense</Text>
            <Text style={styles.expense}>৳ 13,250</Text>
          </View>
        </View>
      </View>

      {/* Recent */}
      <Text style={styles.sectionTitle}>Recent Transactions</Text>

      <FlatList
        data={transactions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Button */}
      <TouchableOpacity style={styles.fab}>
        <Text style={styles.plus}>＋</Text>
      </TouchableOpacity>
    </View>
  );
}

const PRIMARY = "#2563EB";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingTop: 60,
    paddingHorizontal: 20,
  },

  header: {
    marginBottom: 25,
  },

  greeting: {
    fontSize: 30,
    fontWeight: "bold",
  },

  subtitle: {
    color: "#6B7280",
    marginTop: 5,
  },

  balanceCard: {
    backgroundColor: PRIMARY,
    borderRadius: 25,
    padding: 25,
    marginBottom: 30,
  },

  balanceTitle: {
    color: "#DBEAFE",
    fontSize: 16,
  },

  balance: {
    color: "white",
    fontSize: 38,
    fontWeight: "bold",
    marginVertical: 15,
  },

  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  label: {
    color: "#DBEAFE",
    marginBottom: 5,
  },

  income: {
    color: "#A7F3D0",
    fontWeight: "bold",
    fontSize: 18,
  },

  expense: {
    color: "#FECACA",
    fontWeight: "bold",
    fontSize: 18,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
  },

  card: {
    backgroundColor: "white",
    padding: 18,
    borderRadius: 18,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
  },

  icon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },

  description: {
    fontSize: 16,
    fontWeight: "600",
  },

  category: {
    marginTop: 4,
    color: "#6B7280",
  },

  amount: {
    fontWeight: "bold",
    fontSize: 18,
  },

  fab: {
    position: "absolute",
    bottom: 30,
    right: 25,
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: PRIMARY,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },

  plus: {
    color: "white",
    fontSize: 34,
    fontWeight: "300",
  },
});
