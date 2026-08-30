import type { Account, AppState, Diagnostic, Transaction } from "./types";

export const monthKey = (date: string) => date.slice(0, 7);

const dateMonthKey = (date: Date) => date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0");
const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

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

const daysInMonth = (key: string) => {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month, 0).getDate();
};

const dayOf = (transaction: Transaction) => Number(transaction.date.slice(8, 10));

const transactionsFor = (transactions: Transaction[], key: string, dayLimit = daysInMonth(key)) => transactions
  .filter((transaction) => monthKey(transaction.date) === key && dayOf(transaction) <= dayLimit);

const totalsFor = (transactions: Transaction[]) => transactions.reduce((totals, transaction) => {
  if (transaction.kind === "income") totals.income += transaction.amount;
  if (transaction.kind === "expense") totals.expense += transaction.amount;
  return totals;
}, { income: 0, expense: 0 });

const expensesByCategory = (transactions: Transaction[]) => {
  const totals = new Map<string, number>();
  transactions.filter((transaction) => transaction.kind === "expense")
    .forEach((transaction) => totals.set(transaction.categoryId, (totals.get(transaction.categoryId) || 0) + transaction.amount));
  return totals;
};

const percentChange = (current: number, previous: number) => previous > 0
  ? Math.round(((current - previous) / previous) * 100)
  : 0;

const firstDayAtAmount = (transactions: Transaction[], categoryId: string, amount: number) => {
  let total = 0;
  const ordered = transactions
    .filter((transaction) => transaction.kind === "expense" && transaction.categoryId === categoryId)
    .sort((a, b) => a.date.localeCompare(b.date));
  for (const transaction of ordered) {
    total += transaction.amount;
    if (total >= amount) return dayOf(transaction);
  }
  return null;
};

export const monthTotals = (transactions: Transaction[], key: string) => totalsFor(transactionsFor(transactions, key));

export const categoryTotals = (state: AppState, key = currentMonthKey()) => {
  const totals = expensesByCategory(transactionsFor(state.transactions, key));
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

export const buildDiagnostics = (state: AppState, selectedKey = currentMonthKey()): Diagnostic[] => {
  const settings = state.settings;
  const previousKey = previousKeyFor(selectedKey);
  const isCurrentMonth = selectedKey === currentMonthKey();
  const currentDay = isCurrentMonth ? new Date().getDate() : daysInMonth(selectedKey);
  const comparisonDay = settings.diagnosticSamePeriod ? Math.min(currentDay, daysInMonth(previousKey)) : daysInMonth(previousKey);
  const currentTransactions = transactionsFor(state.transactions, selectedKey, currentDay);
  const previousTransactions = transactionsFor(state.transactions, previousKey, comparisonDay);
  const current = totalsFor(currentTransactions);
  const previous = totalsFor(previousTransactions);
  const currentCategories = expensesByCategory(currentTransactions);
  const previousCategories = expensesByCategory(previousTransactions);
  const threshold = settings.diagnosticSensitivity === "low" ? 20 : settings.diagnosticSensitivity === "high" ? 5 : 10;
  const comparisonText = settings.diagnosticSamePeriod && isCurrentMonth
    ? "até o dia " + currentDay + " em comparação com o mesmo período do mês passado"
    : "em comparação com o mês anterior";
  const diagnostics: Diagnostic[] = [];
  const add = (diagnostic: Diagnostic) => diagnostics.push(diagnostic);

  if (!current.income && !current.expense) {
    return [{ id: "empty", title: "Comece pelo primeiro lançamento", message: "Registre uma entrada, uma saída ou importe um extrato para receber diagnósticos feitos no próprio aparelho.", tone: "neutral", icon: "sparkles", priority: 100 }];
  }

  if (settings.diagnosticBudgetPace) {
    state.budgets.forEach((budget) => {
      const spent = currentCategories.get(budget.categoryId) || 0;
      const percentage = budget.limit > 0 ? Math.round((spent / budget.limit) * 100) : 0;
      const category = state.categories.find((item) => item.id === budget.categoryId);
      if (percentage >= 100) {
        add({ id: "budget-over-" + budget.id, title: (category?.name || "Uma categoria") + " passou do limite", message: "Você usou " + percentage + "% do planejado e ultrapassou o limite em " + currency.format(spent - budget.limit) + ".", tone: "warning", icon: "alert", priority: 100 + percentage });
      } else if (percentage >= 80) {
        add({ id: "budget-close-" + budget.id, title: (category?.name || "Uma categoria") + " está perto do limite", message: "Você já usou " + percentage + "% do valor planejado. Ainda restam " + currency.format(Math.max(0, budget.limit - spent)) + ".", tone: "warning", icon: "target", priority: 90 + percentage / 10 });
      }

      const halfway = budget.limit * .5;
      const currentReached = firstDayAtAmount(currentTransactions, budget.categoryId, halfway);
      const previousReached = firstDayAtAmount(previousTransactions, budget.categoryId, halfway);
      if (currentReached && previousReached && currentReached < previousReached) {
        const earlier = previousReached - currentReached;
        add({ id: "budget-early-" + budget.id, title: "O limite de " + (category?.name || "uma categoria") + " está avançando mais cedo", message: "Você chegou a 50% do valor " + earlier + (earlier === 1 ? " dia" : " dias") + " antes do que no mês passado.", tone: "warning", icon: "clock", priority: 88 });
      }
    });
  }

  if (settings.diagnosticExpenseTrends && previous.expense > 0) {
    const change = percentChange(current.expense, previous.expense);
    if (Math.abs(change) >= threshold) {
      add(change < 0
        ? { id: "expense-down", title: "Você está gastando menos", message: "Parabéns: suas saídas estão " + Math.abs(change) + "% menores " + comparisonText + ". Foram " + currency.format(current.expense) + " até agora.", tone: "positive", icon: "down", priority: 85 + Math.min(Math.abs(change), 30) / 10 }
        : { id: "expense-up", title: "Seus gastos aceleraram", message: "Suas saídas estão " + change + "% maiores " + comparisonText + ". Veja quais categorias explicam o aumento.", tone: "warning", icon: "up", priority: 94 + Math.min(change, 30) / 10 });
    }
  }

  if (settings.diagnosticIncomeTrends && previous.income > 0) {
    const change = percentChange(current.income, previous.income);
    if (Math.abs(change) >= threshold) {
      add(change > 0
        ? { id: "income-up", title: "Você está recebendo mais em menos tempo", message: "Suas entradas cresceram " + change + "% " + comparisonText + ". Até agora entraram " + currency.format(current.income) + ".", tone: "positive", icon: "trend", priority: 89 + Math.min(change, 30) / 10 }
        : { id: "income-down", title: "As entradas estão mais lentas", message: "Você recebeu " + Math.abs(change) + "% menos " + comparisonText + ". Isso não é necessariamente ruim, mas merece acompanhamento.", tone: "warning", icon: "down", priority: 86 });
    }
  }

  if (settings.diagnosticCategoryTrends && previousCategories.size) {
    const strongest = [...currentCategories.entries()]
      .filter(([categoryId]) => categoryId !== "other")
      .map(([categoryId, amount]) => ({ categoryId, amount, oldAmount: previousCategories.get(categoryId) || 0, change: percentChange(amount, previousCategories.get(categoryId) || 0) }))
      .filter((item) => item.oldAmount > 0 && Math.abs(item.change) >= threshold)
      .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))[0];
    if (strongest) {
      const category = state.categories.find((item) => item.id === strongest.categoryId);
      add(strongest.change > 0
        ? { id: "category-up-" + strongest.categoryId, title: (category?.name || "Uma categoria") + " aumentou", message: "Você já gastou " + strongest.change + "% mais com " + (category?.name.toLowerCase() || "essa categoria") + " " + comparisonText + ".", tone: "warning", icon: category?.icon || "chart", priority: 84 }
        : { id: "category-down-" + strongest.categoryId, title: "Economia em " + (category?.name || "uma categoria"), message: "Seus gastos com " + (category?.name.toLowerCase() || "essa categoria") + " caíram " + Math.abs(strongest.change) + "% " + comparisonText + ".", tone: "positive", icon: category?.icon || "chart", priority: 76 });
    }
  }

  if (settings.diagnosticBillAlerts) {
    const energyPattern = /(energia|conta de luz|eletric)/i;
    const currentEnergy = currentTransactions.filter((item) => item.kind === "expense" && energyPattern.test(item.description)).sort((a, b) => b.date.localeCompare(a.date))[0];
    const previousEnergy = previousTransactions.filter((item) => item.kind === "expense" && energyPattern.test(item.description)).sort((a, b) => b.date.localeCompare(a.date))[0];
    if (currentEnergy && currentEnergy.amount > settings.energyExpectedMax) {
      add({ id: "energy-high", title: "A conta de energia merece atenção", message: "Ela veio em " + currency.format(currentEnergy.amount) + ", " + currency.format(currentEnergy.amount - settings.energyExpectedMax) + " acima da faixa de " + currency.format(settings.energyExpectedMax) + " que você definiu.", tone: "warning", icon: "alert", priority: 96 });
    } else if (currentEnergy && previousEnergy) {
      const change = percentChange(currentEnergy.amount, previousEnergy.amount);
      add(change <= 0
        ? { id: "energy-ok", title: "Sua conta de energia ficou menor", message: "Ela caiu " + Math.abs(change) + "%: de " + currency.format(previousEnergy.amount) + " para " + currency.format(currentEnergy.amount) + ". Sua faixa de alerta é " + currency.format(settings.energyExpectedMax) + ".", tone: "positive", icon: "down", priority: 64 }
        : { id: "energy-rise", title: "A conta de energia subiu", message: "Ela aumentou " + change + "% e chegou a " + currency.format(currentEnergy.amount) + ". Ainda está abaixo da faixa de alerta definida.", tone: "neutral", icon: "up", priority: 62 });
    }
  }

  if (settings.diagnosticProjections && isCurrentMonth && currentDay >= 5 && current.expense > 0) {
    const projected = current.expense / currentDay * daysInMonth(selectedKey);
    const projectedResult = current.income - projected;
    add(projectedResult < 0
      ? { id: "projection-deficit", title: "O ritmo atual pode fechar o mês no vermelho", message: "Mantendo a média diária, as saídas podem chegar a " + currency.format(projected) + ", cerca de " + currency.format(Math.abs(projectedResult)) + " acima das entradas atuais.", tone: "warning", icon: "trend", priority: 91 }
      : { id: "projection-positive", title: "O ritmo do mês ainda está saudável", message: "Mantendo a média atual, a projeção é terminar com aproximadamente " + currency.format(projectedResult) + " entre entradas e saídas.", tone: "neutral", icon: "trend", priority: 58 });
  }

  if (current.income > 0) {
    const margin = Math.round(((current.income - current.expense) / current.income) * 100);
    add(margin >= 20
      ? { id: "saving-margin", title: "Boa margem entre entradas e saídas", message: "Até agora, " + margin + "% do que entrou não foi consumido pelas despesas. Esse valor não inclui uma sugestão de quanto você pode gastar.", tone: "positive", icon: "trend", priority: 68 }
      : { id: "saving-margin", title: margin >= 0 ? "A margem do mês está apertada" : "Você gastou mais do que recebeu", message: margin >= 0 ? "Restaram " + margin + "% das entradas depois das saídas. Observe os próximos vencimentos antes de assumir novos gastos." : "As despesas ultrapassaram as entradas em " + Math.abs(margin) + "%. Revise o que pode ser adiado.", tone: "warning", icon: "alert", priority: margin < 0 ? 99 : 82 });
  }

  if (settings.diagnosticSmallExpenses) {
    const small = currentTransactions.filter((transaction) => transaction.kind === "expense" && transaction.amount <= settings.smallExpenseLimit);
    if (small.length >= settings.smallExpenseCount) {
      const total = small.reduce((sum, transaction) => sum + transaction.amount, 0);
      add({ id: "small-expenses", title: "Os pequenos gastos já estão somando", message: small.length + " despesas de até " + currency.format(settings.smallExpenseLimit) + " totalizam " + currency.format(total) + " neste mês.", tone: "neutral", icon: "coins", priority: 66 });
    }
  }

  if (current.expense > 0 && currentCategories.size) {
    const topKnown = [...currentCategories.entries()].filter(([categoryId]) => categoryId !== "other").sort((a, b) => b[1] - a[1])[0];
    if (topKnown) {
      const [categoryId, amount] = topKnown;
    const category = state.categories.find((item) => item.id === categoryId);
    const share = Math.round(amount / current.expense * 100);
    add({ id: "top-category", title: (category?.name || "Uma categoria") + " concentra seus gastos", message: "Ela representa " + share + "% de todas as saídas registradas neste mês. Isso ajuda a entender para onde o dinheiro está indo.", tone: share >= 50 ? "warning" : "neutral", icon: category?.icon || "chart", priority: share >= 50 ? 80 : 52 });
    }
  }

  const imported = state.transactions.filter((transaction) => transaction.source === "csv" || transaction.source === "ofx").length;
  if (imported > 0) {
    add({ id: "automation", title: "A importação está poupando trabalho", message: imported + " lançamentos vieram de extratos. Suas regras continuam categorizando descrições parecidas sem usar IA.", tone: "positive", icon: "file", priority: 30 });
  }

  return diagnostics
    .filter((item) => item.tone !== "positive" || settings.diagnosticShowPositive)
    .filter((item) => item.tone !== "warning" || settings.diagnosticShowWarnings)
    .filter((item) => item.tone !== "neutral" || settings.diagnosticShowNeutral)
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 12);
};
