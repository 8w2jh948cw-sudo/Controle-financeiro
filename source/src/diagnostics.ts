import type { Account, AppState, Diagnostic, Transaction } from "./types";

export const monthKey = (date: string) => date.slice(0, 7);

const dateMonthKey = (date: Date) => date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0");

export const currentMonthKey = () => dateMonthKey(new Date());

export const previousMonthKey = () => {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  return dateMonthKey(date);
};

const previousKeyFor = (key: string) => {
  const [year, month] = key.split("-").map(Number);
  return dateMonthKey(new Date(year, month - 2, 1));
};

export const monthTotals = (transactions: Transaction[], key: string) => transactions
  .filter((transaction) => monthKey(transaction.date) === key)
  .reduce((totals, transaction) => {
    if (transaction.kind === "income") totals.income += transaction.amount;
    if (transaction.kind === "expense") totals.expense += transaction.amount;
    return totals;
  }, { income: 0, expense: 0 });

export const categoryTotals = (state: AppState, key = currentMonthKey()) => {
  const totals = new Map<string, number>();
  state.transactions
    .filter((transaction) => transaction.kind === "expense" && monthKey(transaction.date) === key)
    .forEach((transaction) => totals.set(transaction.categoryId, (totals.get(transaction.categoryId) || 0) + transaction.amount));
  return [...totals.entries()]
    .map(([categoryId, amount]) => ({
      categoryId,
      amount,
      category: state.categories.find((category) => category.id === categoryId),
    }))
    .sort((a, b) => b.amount - a.amount);
};

export const accountBalance = (account: Account, transactions: Transaction[]) => {
  if (account.type === "credit") {
    return transactions
      .filter((transaction) => transaction.accountId === account.id && transaction.kind === "expense")
      .reduce((sum, transaction) => sum + transaction.amount, 0);
  }
  return transactions.reduce((balance, transaction) => {
    if (transaction.kind === "income" && transaction.accountId === account.id) return balance + transaction.amount;
    if (transaction.kind === "expense" && transaction.accountId === account.id) return balance - transaction.amount;
    if (transaction.kind === "transfer") {
      if (transaction.accountId === account.id) return balance - transaction.amount;
      if (transaction.destinationAccountId === account.id) return balance + transaction.amount;
    }
    return balance;
  }, account.openingBalance);
};

export const buildDiagnostics = (state: AppState, currentKey = currentMonthKey()): Diagnostic[] => {
  const previousKey = previousKeyFor(currentKey);
  const current = monthTotals(state.transactions, currentKey);
  const previous = monthTotals(state.transactions, previousKey);
  const categories = categoryTotals(state, currentKey);
  const diagnostics: Diagnostic[] = [];

  if (!current.income && !current.expense) {
    return [{
      id: "empty",
      title: "Comece pelo primeiro lançamento",
      message: "Registre uma receita, uma despesa ou importe um extrato para receber seu diagnóstico.",
      tone: "neutral",
      icon: "sparkles",
    }];
  }

  if (current.income > 0) {
    const rate = Math.round(((current.income - current.expense) / current.income) * 100);
    diagnostics.push(rate >= 20 ? {
      id: "saving",
      title: "Boa margem de economia",
      message: "Você preservou " + rate + "% do que entrou neste mês. Uma margem acima de 20% costuma dar mais segurança.",
      tone: "positive",
      icon: "trend",
    } : {
      id: "saving",
      title: rate >= 0 ? "Margem apertada" : "Você gastou mais do que recebeu",
      message: rate >= 0
        ? "Restaram " + rate + "% da sua renda. Observe as categorias mais altas antes de assumir novos gastos."
        : "As despesas ultrapassaram as receitas em " + Math.abs(rate) + "%. Revise despesas adiáveis e próximos vencimentos.",
      tone: "warning",
      icon: "alert",
    });
  }

  if (previous.expense > 0) {
    const change = Math.round(((current.expense - previous.expense) / previous.expense) * 100);
    diagnostics.push({
      id: "comparison",
      title: change <= 0 ? "Gastos em queda" : "Gastos aumentaram",
      message: change <= 0
        ? "Você gastou " + Math.abs(change) + "% menos que no mês anterior."
        : "Suas saídas estão " + change + "% acima do mês anterior. Confira se o aumento foi planejado.",
      tone: change <= 0 ? "positive" : "warning",
      icon: change <= 0 ? "down" : "up",
    });
  }

  if (categories[0] && current.expense > 0) {
    const share = Math.round((categories[0].amount / current.expense) * 100);
    diagnostics.push({
      id: "top-category",
      title: (categories[0].category?.name || "Uma categoria") + " lidera seus gastos",
      message: "Ela representa " + share + "% das despesas do mês. Toque na análise para ver os lançamentos envolvidos.",
      tone: share >= 50 ? "warning" : "neutral",
      icon: categories[0].category?.icon || "chart",
    });
  }

  const exceeded = state.budgets
    .map((budget) => ({
      budget,
      spent: categories.find((item) => item.categoryId === budget.categoryId)?.amount || 0,
    }))
    .filter((item) => item.spent > item.budget.limit);
  if (exceeded.length) {
    const first = exceeded[0];
    const category = state.categories.find((item) => item.id === first.budget.categoryId);
    diagnostics.push({
      id: "budget",
      title: "Limite ultrapassado",
      message: (category?.name || "Uma categoria") + " passou R$ " + (first.spent - first.budget.limit).toFixed(2).replace(".", ",") + " do valor planejado.",
      tone: "warning",
      icon: "target",
    });
  }

  const small = state.transactions.filter((transaction) =>
    transaction.kind === "expense" &&
    monthKey(transaction.date) === currentKey &&
    transaction.amount <= 50,
  );
  if (small.length >= 4) {
    const total = small.reduce((sum, transaction) => sum + transaction.amount, 0);
    diagnostics.push({
      id: "small-expenses",
      title: "Pequenos gastos somam",
      message: small.length + " despesas de até R$ 50 já totalizam R$ " + total.toFixed(2).replace(".", ",") + " neste mês.",
      tone: "neutral",
      icon: "coins",
    });
  }

  const imported = state.transactions.filter((transaction) => transaction.source === "csv" || transaction.source === "ofx").length;
  if (imported > 0) {
    diagnostics.push({
      id: "automation",
      title: "Importação trabalhando por você",
      message: imported + " lançamentos foram adicionados por extratos. As regras continuam categorizando descrições parecidas.",
      tone: "positive",
      icon: "file",
    });
  }

  return diagnostics.slice(0, 5);
};
