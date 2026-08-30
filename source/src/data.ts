import type { Account, AppState, Budget, Category, CategoryRule, Goal, Transaction } from "./types";

const pad = (value: number) => String(value).padStart(2, "0");
const toISO = (date: Date) => date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate());
const offsetDate = (days: number) => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return toISO(date);
};

export const categories: Category[] = [
  { id: "housing", name: "Moradia", icon: "home", tone: "blue" },
  { id: "market", name: "Mercado", icon: "basket", tone: "yellow" },
  { id: "food", name: "Alimentação", icon: "food", tone: "orange" },
  { id: "transport", name: "Transporte", icon: "car", tone: "violet" },
  { id: "health", name: "Saúde", icon: "heart", tone: "green" },
  { id: "leisure", name: "Lazer", icon: "smile", tone: "pink" },
  { id: "subscriptions", name: "Assinaturas", icon: "repeat", tone: "indigo" },
  { id: "work", name: "Trabalho", icon: "briefcase", tone: "teal" },
  { id: "nails", name: "Materiais de unhas", icon: "sparkles", tone: "coral" },
  { id: "salary", name: "Salário e renda", icon: "income", tone: "emerald" },
  { id: "other", name: "Outros", icon: "wallet", tone: "slate" },
];

export const accounts: Account[] = [
  { id: "nubank", name: "Nubank Conta", type: "checking", openingBalance: 120.4, color: "violet" },
  { id: "itau", name: "Conta secundária", type: "checking", openingBalance: 86.2, color: "orange" },
  { id: "inter", name: "Dinheiro guardado", type: "investment", openingBalance: 720, color: "yellow" },
  { id: "cash", name: "Dinheiro físico", type: "cash", openingBalance: 70, color: "green" },
  { id: "card-nubank", name: "Cartão principal", type: "credit", openingBalance: 0, creditLimit: 2800, color: "violet" },
];

export const rules: CategoryRule[] = [
  { id: "r-1", keyword: "aluguel", categoryId: "housing" },
  { id: "r-2", keyword: "condominio", categoryId: "housing" },
  { id: "r-3", keyword: "energia", categoryId: "housing" },
  { id: "r-4", keyword: "supermercado", categoryId: "market" },
  { id: "r-5", keyword: "mercado", categoryId: "market" },
  { id: "r-6", keyword: "ifood", categoryId: "food" },
  { id: "r-7", keyword: "restaurante", categoryId: "food" },
  { id: "r-8", keyword: "uber", categoryId: "transport" },
  { id: "r-9", keyword: "99app", categoryId: "transport" },
  { id: "r-10", keyword: "farmacia", categoryId: "health" },
  { id: "r-11", keyword: "drogaria", categoryId: "health" },
  { id: "r-12", keyword: "netflix", categoryId: "subscriptions" },
  { id: "r-13", keyword: "spotify", categoryId: "subscriptions" },
  { id: "r-14", keyword: "apple.com/bill", categoryId: "subscriptions" },
  { id: "r-15", keyword: "material", categoryId: "nails" },
  { id: "r-16", keyword: "esmalte", categoryId: "nails" },
  { id: "r-17", keyword: "salario", categoryId: "salary" },
  { id: "r-18", keyword: "freelance", categoryId: "salary" },
];

const tx = (
  id: string,
  kind: Transaction["kind"],
  description: string,
  amount: number,
  date: string,
  categoryId: string,
  accountId: string,
  paymentMethod: Transaction["paymentMethod"],
  time = "12:00",
): Transaction => ({
  id,
  kind,
  description,
  amount,
  date,
  time,
  categoryId,
  accountId,
  paymentMethod,
  notes: "",
  source: "manual",
});

export const transactions: Transaction[] = [
  tx("t-1", "expense", "Supermercado do mês", 296.4, offsetDate(-1), "market", "card-nubank", "credit", "18:42"),
  tx("t-2", "expense", "Transporte para atendimento", 34.8, offsetDate(-1), "transport", "card-nubank", "credit", "15:10"),
  tx("t-3", "income", "Vendas do minicurso", 394, offsetDate(-4), "salary", "nubank", "pix", "09:30"),
  tx("t-4", "expense", "Aluguel", 1684, offsetDate(-6), "housing", "nubank", "pix", "08:15"),
  tx("t-5", "expense", "Lanche após atendimento", 68.4, offsetDate(-7), "food", "card-nubank", "credit", "21:05"),
  tx("t-6", "expense", "Conta de energia", 243.7, offsetDate(-10), "housing", "nubank", "pix", "10:20"),
  tx("t-7", "expense", "Reposição de gel e lixas", 214.9, offsetDate(-11), "nails", "nubank", "pix", "14:25"),
  tx("t-8", "income", "Atendimentos de unhas", 3780, offsetDate(-13), "salary", "nubank", "pix", "19:00"),
  tx("t-9", "expense", "Mercado do mês", 352.8, offsetDate(-34), "market", "card-nubank", "credit", "17:20"),
  tx("t-10", "expense", "Aluguel", 1684, offsetDate(-37), "housing", "nubank", "pix", "08:10"),
  tx("t-11", "expense", "Conta de energia", 256.3, offsetDate(-40), "housing", "nubank", "pix", "10:05"),
  tx("t-12", "income", "Atendimentos de unhas", 4200, offsetDate(-44), "salary", "itau", "pix", "18:30"),
];

export const budgets: Budget[] = [
  { id: "b-1", categoryId: "housing", limit: 2150 },
  { id: "b-2", categoryId: "market", limit: 700 },
  { id: "b-3", categoryId: "food", limit: 350 },
  { id: "b-4", categoryId: "transport", limit: 250 },
  { id: "b-5", categoryId: "leisure", limit: 200 },
  { id: "b-6", categoryId: "nails", limit: 400 },
];

export const goals: Goal[] = [
  { id: "g-1", name: "Reserva de emergência", current: 720, target: 6000 },
  { id: "g-2", name: "Curso de decoração", current: 180, target: 1500 },
  { id: "g-3", name: "Novo equipamento", current: 260, target: 2200 },
];

export const initialState: AppState = {
  version: 2,
  demoMode: true,
  transactions,
  accounts,
  categories,
  budgets,
  goals,
  rules,
  settings: {
    userName: "Vinícius",
    hiddenValues: false,
    diagnosticsEnabled: true,
    theme: "system",
    incomeColor: "#55b87a",
    expenseColor: "#ff7075",
  },
};

export const emptyState = (): AppState => ({
  ...initialState,
  demoMode: false,
  transactions: [],
  accounts: [
    { id: "my-account", name: "Minha conta", type: "checking", openingBalance: 0, color: "green" },
    { id: "cash", name: "Dinheiro físico", type: "cash", openingBalance: 0, color: "slate" },
  ],
  budgets: [],
  goals: [],
});
