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
  { id: "nubank", name: "Nubank Conta", type: "checking", openingBalance: 4850.3, color: "violet" },
  { id: "itau", name: "Itaú Uniclass", type: "checking", openingBalance: 8320, color: "orange" },
  { id: "inter", name: "Inter Investimentos", type: "investment", openingBalance: 24500, color: "yellow" },
  { id: "cash", name: "Dinheiro físico", type: "cash", openingBalance: 280, color: "green" },
  { id: "card-nubank", name: "Nubank Ultravioleta", type: "credit", openingBalance: 0, creditLimit: 12000, color: "violet" },
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
  tx("t-1", "expense", "Supermercado Pão de Açúcar", 342.5, offsetDate(-1), "market", "card-nubank", "credit", "18:42"),
  tx("t-2", "expense", "Uber Viagem", 28.9, offsetDate(-1), "transport", "card-nubank", "credit", "15:10"),
  tx("t-3", "income", "Projeto Freelance UX/UI", 3200, offsetDate(-4), "salary", "nubank", "pix", "09:30"),
  tx("t-4", "expense", "Aluguel e Condomínio", 2150, offsetDate(-6), "housing", "nubank", "pix", "08:15"),
  tx("t-5", "expense", "Jantar Restaurante", 198, offsetDate(-7), "food", "card-nubank", "credit", "21:05"),
  tx("t-6", "expense", "Netflix", 44.9, offsetDate(-10), "subscriptions", "card-nubank", "credit", "06:00"),
  tx("t-7", "expense", "Reposição materiais", 125.06, offsetDate(-11), "nails", "nubank", "pix", "14:25"),
  tx("t-8", "income", "Atendimentos da semana", 8145.2, offsetDate(-13), "salary", "itau", "pix", "19:00"),
  tx("t-9", "expense", "Mercado do mês", 444.61, offsetDate(-34), "market", "card-nubank", "credit", "17:20"),
  tx("t-10", "expense", "Aluguel e Condomínio", 2150, offsetDate(-37), "housing", "nubank", "pix", "08:10"),
  tx("t-11", "expense", "Plano de saúde", 361.79, offsetDate(-40), "health", "nubank", "debit", "07:45"),
  tx("t-12", "income", "Atendimentos do mês", 9840, offsetDate(-44), "salary", "itau", "pix", "18:30"),
];

export const budgets: Budget[] = [
  { id: "b-1", categoryId: "housing", limit: 2600 },
  { id: "b-2", categoryId: "market", limit: 1200 },
  { id: "b-3", categoryId: "food", limit: 800 },
  { id: "b-4", categoryId: "transport", limit: 650 },
  { id: "b-5", categoryId: "leisure", limit: 500 },
  { id: "b-6", categoryId: "nails", limit: 600 },
];

export const goals: Goal[] = [
  { id: "g-1", name: "Reserva de emergência", current: 22500, target: 30000 },
  { id: "g-2", name: "Curso de decoração", current: 2350, target: 5000 },
  { id: "g-3", name: "Novo equipamento", current: 780, target: 2400 },
];

export const initialState: AppState = {
  version: 1,
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
