"use client";

import { FormEvent, ReactNode, useEffect, useState } from "react";

type Tab = "inicio" | "extrato" | "metas" | "carteira" | "analise";
type TransactionKind = "expense" | "income";
type ModalName = "assistant" | "settings" | "transfer" | "account" | "card" | "budget" | "goal" | "accountDetail" | "cardDetail" | null;
type IconName =
  | "grid" | "receipt" | "plus" | "trend" | "wallet" | "chart"
  | "arrowUp" | "arrowDown" | "transfer" | "target" | "sparkles"
  | "home" | "food" | "car" | "laptop" | "smile" | "card"
  | "bank" | "close" | "search" | "chevron" | "eye" | "eyeOff"
  | "settings" | "check";

type Transaction = {
  id: number;
  title: string;
  category: string;
  date: string;
  amount: number;
  kind: TransactionKind;
  icon: IconName;
  tone: string;
};

type Account = {
  id: string;
  name: string;
  type: string;
  amount: number;
  tone: string;
  icon: IconName;
};

type CreditCard = {
  id: string;
  name: string;
  invoice: number;
  limit: number;
  dueDay: number;
  closingDay: number;
};

type Budget = {
  id: string;
  name: string;
  spent: number;
  limit: number;
  tone: string;
  icon: IconName;
};

type Goal = {
  id: string;
  name: string;
  current: number;
  target: number;
  tone: string;
  icon: IconName;
};

const initialTransactions: Transaction[] = [
  { id: 1, title: "Supermercado Pão de Açúcar", category: "Alimentação", date: "Ontem", amount: 342.5, kind: "expense", icon: "food", tone: "orange" },
  { id: 2, title: "Uber Viagem", category: "Transporte", date: "Ontem", amount: 28.9, kind: "expense", icon: "car", tone: "violet" },
  { id: 3, title: "Projeto Freelance UX/UI", category: "Freelance", date: "12 de ago.", amount: 3200, kind: "income", icon: "laptop", tone: "green" },
  { id: 4, title: "Aluguel & Condomínio", category: "Moradia", date: "10 de ago.", amount: 2150, kind: "expense", icon: "home", tone: "blue" },
  { id: 5, title: "Jantar Restaurante", category: "Lazer", date: "09 de ago.", amount: 198, kind: "expense", icon: "smile", tone: "pink" },
];

const initialAccounts: Account[] = [
  { id: "nubank", name: "Nubank Conta", type: "Conta corrente", amount: 4850.3, tone: "violet", icon: "bank" },
  { id: "itau", name: "Itaú Uniclass", type: "Conta corrente", amount: 8320, tone: "orange", icon: "bank" },
  { id: "inter", name: "Inter Investimentos", type: "Investimentos", amount: 24500, tone: "orange", icon: "trend" },
  { id: "cash", name: "Dinheiro físico", type: "Carteira", amount: 280, tone: "green", icon: "wallet" },
];

const initialCards: CreditCard[] = [
  { id: "ultravioleta", name: "Nubank Ultravioleta", invoice: 1420.8, limit: 12000, dueDay: 5, closingDay: 25 },
];

const initialBudgets: Budget[] = [
  { id: "home", name: "Moradia & Contas", spent: 2150, limit: 2600, tone: "blue", icon: "home" },
  { id: "food", name: "Alimentação", spent: 342.5, limit: 1800, tone: "orange", icon: "food" },
  { id: "fun", name: "Lazer & Viagens", spent: 198, limit: 800, tone: "pink", icon: "smile" },
  { id: "transport", name: "Transporte & Carro", spent: 28.9, limit: 650, tone: "violet", icon: "car" },
];

const initialGoals: Goal[] = [
  { id: "emergency", name: "Reserva de Emergência", current: 22500, target: 30000, tone: "green", icon: "target" },
  { id: "course", name: "Curso de Decoração", current: 2350, target: 5000, tone: "violet", icon: "laptop" },
  { id: "studio", name: "Novo equipamento", current: 780, target: 2400, tone: "orange", icon: "sparkles" },
];

const STORAGE_KEY = "meu-dinheiro-state-v2";
const BASE_INCOME = 8145.2;
const BASE_EXPENSES = 346.2;
const months = [
  { short: "Agosto", label: "AGOSTO DE 2026", report: "RELATÓRIO · AGOSTO DE 2026", income: 11345.2, expenses: 3065.6 },
  { short: "Julho", label: "JULHO DE 2026", report: "RELATÓRIO · JULHO DE 2026", income: 9840, expenses: 4210.3 },
  { short: "Junho", label: "JUNHO DE 2026", report: "RELATÓRIO · JUNHO DE 2026", income: 8145.2, expenses: 3540.75 },
  { short: "Maio", label: "MAIO DE 2026", report: "RELATÓRIO · MAIO DE 2026", income: 8145.2, expenses: 3890.1 },
];

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const numberValue = (value: string) => Number(value.replace(/\./g, "").replace(",", "."));
const money = (value: number, hidden = false) => hidden ? "••••••" : currency.format(value);

function monthSummary(index: number, transactions: Transaction[]) {
  if (index > 0) return months[index];
  const extraIncome = transactions.filter((item) => item.kind === "income").reduce((sum, item) => sum + item.amount, 0);
  const extraExpenses = transactions.filter((item) => item.kind === "expense").reduce((sum, item) => sum + item.amount, 0);
  return { ...months[0], income: BASE_INCOME + extraIncome, expenses: BASE_EXPENSES + extraExpenses };
}

function Icon({ name, size = 22, stroke = 2 }: { name: IconName; size?: number; stroke?: number }) {
  const paths: Record<IconName, ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></>,
    receipt: <><path d="M6 3v18l3-2 3 2 3-2 3 2V3l-3 2-3-2-3 2-3-2Z"/><path d="M9 9h6M9 13h6"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    trend: <><path d="m3 17 6-6 4 4 8-9"/><path d="M15 6h6v6"/></>,
    wallet: <><path d="M4 6h15a2 2 0 0 1 2 2v10H5a2 2 0 0 1-2-2V6a3 3 0 0 1 3-3h12"/><path d="M16 11h5v4h-5a2 2 0 0 1 0-4Z"/></>,
    chart: <><path d="M4 19V9M10 19V5M16 19v-7M22 19V3"/></>,
    arrowUp: <><path d="M7 17 17 7M8 7h9v9"/></>,
    arrowDown: <><path d="m7 7 10 10M17 8v9H8"/></>,
    transfer: <><path d="M7 7h11l-3-3M17 17H6l3 3"/></>,
    target: <><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/></>,
    sparkles: <><path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2L12 3Z"/><path d="m19 14 .8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14ZM5 13l.7 2.3L8 16l-2.3.7L5 19l-.7-2.3L2 16l2.3-.7L5 13Z"/></>,
    home: <><path d="m3 11 9-7 9 7"/><path d="M5 10v10h14V10M9 20v-6h6v6"/></>,
    food: <><path d="M6 3v8M3 3v5a3 3 0 0 0 6 0V3M6 11v10M15 3v18M15 3c4 2 5 7 0 10"/></>,
    car: <><path d="m5 16-1 2v2M19 16l1 2v2M3 15h18l-2-7H5l-2 7Z"/><circle cx="7" cy="16" r="1.5"/><circle cx="17" cy="16" r="1.5"/></>,
    laptop: <><rect x="5" y="4" width="14" height="11" rx="2"/><path d="M3 19h18"/></>,
    smile: <><circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/></>,
    card: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/></>,
    bank: <><path d="m3 9 9-5 9 5M5 10v7M9 10v7M15 10v7M19 10v7M3 20h18"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    chevron: <><path d="m9 18 6-6-6-6"/></>,
    eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/></>,
    eyeOff: <><path d="M3 3l18 18M10.6 6.2A10.5 10.5 0 0 1 12 6c6.5 0 10 6 10 6a17.6 17.6 0 0 1-2.2 3M6.6 6.6C3.7 8.4 2 12 2 12s3.5 6 10 6c1 0 2-.2 2.8-.5M9.8 9.8a3 3 0 0 0 4.4 4.4"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H3v-4h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V3h4v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
  };
  return <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function CategoryIcon({ name, tone }: { name: IconName; tone: string }) {
  return <span className={"category-icon " + tone}><Icon name={name} size={23}/></span>;
}

function Header({ hidden, onToggleValues, onAssistant, onSettings }: {
  hidden: boolean;
  onToggleValues: () => void;
  onAssistant: () => void;
  onSettings: () => void;
}) {
  return <header className="app-header">
    <div className="avatar-wrap"><span className="avatar">V</span><i/></div>
    <div className="greeting"><small>BOM DIA</small><strong>Vinicius</strong></div>
    <div className="header-actions">
      <button type="button" aria-label={hidden ? "Mostrar valores" : "Ocultar valores"} aria-pressed={hidden} onClick={onToggleValues}><Icon name={hidden ? "eyeOff" : "eye"}/></button>
      <button type="button" className="ai-button" aria-label="Abrir assistente financeiro" onClick={onAssistant}><Icon name="sparkles"/><i/></button>
      <button type="button" aria-label="Abrir ajustes" onClick={onSettings}><Icon name="settings"/></button>
    </div>
  </header>;
}

function SectionHeader({ title, action, onAction }: { title: string; action: string; onAction: () => void }) {
  return <div className="section-heading"><h2>{title}</h2><button type="button" onClick={onAction}>{action} <Icon name="chevron" size={14}/></button></div>;
}

function TransactionRow({ item, hidden = false }: { item: Transaction; hidden?: boolean }) {
  return <article className="transaction-row">
    <CategoryIcon name={item.icon} tone={item.tone}/>
    <span className="transaction-copy"><strong>{item.title}</strong><small>{item.date} · {item.category}</small></span>
    <span className={"transaction-amount " + item.kind}>
      <strong>{item.kind === "income" ? "+" : "−"}{money(item.amount, hidden)}</strong>
      <small>{item.kind === "income" ? "Pix" : "Cartão"}</small>
    </span>
  </article>;
}

function BudgetRow({ budget, compact = false, hidden = false, onClick }: {
  budget: Budget;
  compact?: boolean;
  hidden?: boolean;
  onClick?: () => void;
}) {
  const percent = budget.limit > 0 ? Math.round((budget.spent / budget.limit) * 100) : 0;
  const content = <>
    <CategoryIcon name={budget.icon} tone={budget.tone}/>
    <span className="budget-copy">
      <strong>{budget.name}</strong>
      <small>Gasto: {money(budget.spent, hidden)} de {money(budget.limit, hidden)}</small>
      <span className="progress"><i className={budget.tone} style={{ width: Math.min(percent, 100) + "%" }}/></span>
    </span>
    <b>{percent}%</b>
  </>;
  const className = "budget-row" + (compact ? " compact" : "") + (onClick ? " budget-row-button" : "");
  return onClick
    ? <button type="button" className={className} onClick={onClick} aria-label={"Editar limite de " + budget.name}>{content}</button>
    : <article className={className}>{content}</article>;
}

function HomeView({ transactions, accounts, cards, budgets, goals, hidden, openComposer, onTransfer, navigate, onAssistant, onBudget, onAccount, onCard, onGoal }: {
  transactions: Transaction[];
  accounts: Account[];
  cards: CreditCard[];
  budgets: Budget[];
  goals: Goal[];
  hidden: boolean;
  openComposer: (kind?: TransactionKind) => void;
  onTransfer: () => void;
  navigate: (tab: Tab) => void;
  onAssistant: () => void;
  onBudget: (id: string) => void;
  onAccount: (id: string) => void;
  onCard: (id: string) => void;
  onGoal: (id: string) => void;
}) {
  const summary = monthSummary(0, transactions);
  const saved = Math.max(0, summary.income - summary.expenses);
  const saveRate = summary.income > 0 ? Math.round((saved / summary.income) * 100) : 0;
  const netWorth = accounts.reduce((sum, account) => sum + account.amount, 0);
  const firstCard = cards[0];
  const firstAccount = accounts[0];
  const firstGoal = goals[0];
  const goalPercent = firstGoal ? Math.round((firstGoal.current / firstGoal.target) * 100) : 0;

  return <div className="view home-view">
    <section className="balance-card dark-card">
      <div className="eyebrow-row"><span>PATRIMÔNIO LÍQUIDO</span><span className="month-pill">Agosto</span></div>
      <h1>{money(netWorth, hidden)}</h1>
      <p>Resultado do mês: <b>+{money(saved, hidden)} ({saveRate}% guardado)</b></p>
      <div className="balance-split">
        <div><span className="mini-icon income"><Icon name="arrowDown" size={17}/></span><small>Entradas</small><strong>{money(summary.income, hidden)}</strong></div>
        <div><span className="mini-icon expense"><Icon name="arrowUp" size={17}/></span><small>Saídas</small><strong>{money(summary.expenses, hidden)}</strong></div>
      </div>
    </section>

    <section className="quick-actions" aria-label="Ações rápidas">
      <button type="button" onClick={() => openComposer("expense")}><span><Icon name="arrowUp"/></span>Despesa</button>
      <button type="button" onClick={() => openComposer("income")}><span><Icon name="arrowDown"/></span>Receita</button>
      <button type="button" onClick={onTransfer}><span><Icon name="transfer"/></span>Transferir</button>
      <button type="button" onClick={() => navigate("metas")}><span><Icon name="target"/></span>Metas</button>
    </section>

    <button type="button" className="assistant-card" onClick={onAssistant}>
      <span className="assistant-icon"><Icon name="sparkles" size={20}/></span>
      <span><small>ASSISTENTE FINANCEIRO <i/></small><strong>Você guardou {saveRate}% da renda este mês.</strong></span>
      <Icon name="chevron" size={18}/>
    </button>

    <SectionHeader title="CONTAS & CARTÕES" action="Ver todas" onAction={() => navigate("carteira")}/>
    <div className="account-scroll">
      {firstCard && <button type="button" className="credit-mini dark-card interactive-card" onClick={() => onCard(firstCard.id)}>
        <div><Icon name="card" size={19}/><strong>{firstCard.name}</strong><span>Dia {firstCard.dueDay}</span></div>
        <small>Fatura atual</small><h3>{money(firstCard.invoice, hidden)}</h3>
        <div className="usage-line"><small>{Math.round((firstCard.invoice / firstCard.limit) * 100)}% usado</small><small>Disp. {money(Math.max(0, firstCard.limit - firstCard.invoice), hidden)}</small></div>
        <div className="progress dark"><i style={{ width: Math.min(100, (firstCard.invoice / firstCard.limit) * 100) + "%" }}/></div>
      </button>}
      {firstAccount && <button type="button" className="bank-mini interactive-card" onClick={() => onAccount(firstAccount.id)}>
        <CategoryIcon name={firstAccount.icon} tone={firstAccount.tone}/>
        <small>Saldo disponível</small><h3>{money(firstAccount.amount, hidden)}</h3>
      </button>}
    </div>

    <SectionHeader title="ORÇAMENTOS DO MÊS" action="Gerenciar" onAction={() => navigate("metas")}/>
    <section className="budget-summary card">{budgets.slice(0, 3).map((budget) => <BudgetRow key={budget.id} budget={budget} compact hidden={hidden} onClick={() => onBudget(budget.id)}/>)}</section>

    {firstGoal && <button type="button" className="goal-card card interactive-card" onClick={() => onGoal(firstGoal.id)}>
      <span className="goal-icon"><Icon name="target"/></span>
      <span><small>META PRINCIPAL</small><strong>{firstGoal.name} (6 meses)</strong><p>{money(firstGoal.current, hidden)} de {money(firstGoal.target, hidden)} ({goalPercent}%)</p></span>
      <Icon name="chevron" size={18}/>
    </button>}

    <SectionHeader title="ÚLTIMAS TRANSAÇÕES" action="Extrato completo" onAction={() => navigate("extrato")}/>
    <section className="transaction-list card">{transactions.slice(0, 5).map((item) => <TransactionRow key={item.id} item={item} hidden={hidden}/>)}</section>
  </div>;
}

function StatementView({ transactions, hidden, monthIndex, setMonthIndex }: {
  transactions: Transaction[];
  hidden: boolean;
  monthIndex: number;
  setMonthIndex: (index: number) => void;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | TransactionKind>("all");
  const summary = monthSummary(monthIndex, transactions);
  const filtered = monthIndex === 0 ? transactions.filter((item) =>
    (filter === "all" || item.kind === filter) &&
    (item.title + " " + item.category).toLowerCase().includes(query.toLowerCase())
  ) : [];

  return <div className="view page-view">
    <div className="month-card card">
      <button type="button" aria-label="Mês anterior" disabled={monthIndex === months.length - 1} onClick={() => setMonthIndex(Math.min(months.length - 1, monthIndex + 1))}>‹</button>
      <span><strong>{summary.label}</strong><small>Entradas: <b>{money(summary.income, hidden)}</b> · Saídas: {money(summary.expenses, hidden)}</small></span>
      <button type="button" aria-label="Mês seguinte" disabled={monthIndex === 0} onClick={() => setMonthIndex(Math.max(0, monthIndex - 1))}>›</button>
    </div>
    <label className="search-box"><Icon name="search" size={20}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nome ou categoria..."/></label>
    <div className="filter-row">
      <button type="button" className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>Todas ({monthIndex === 0 ? transactions.length : 0})</button>
      <button type="button" className={filter === "expense" ? "active" : ""} onClick={() => setFilter("expense")}>Despesas</button>
      <button type="button" className={filter === "income" ? "active" : ""} onClick={() => setFilter("income")}>Receitas</button>
    </div>
    <section className="transaction-list card statement-list">
      {filtered.length > 0 ? filtered.map((item) => <TransactionRow key={item.id} item={item} hidden={hidden}/>) : <div className="empty-state"><Icon name="receipt"/><strong>Nenhuma movimentação encontrada</strong><small>Tente outro filtro ou volte para agosto.</small></div>}
    </section>
  </div>;
}

function GoalsView({ budgets, goals, budgetCeiling, hidden, onCeiling, onBudget, onGoal }: {
  budgets: Budget[];
  goals: Goal[];
  budgetCeiling: number;
  hidden: boolean;
  onCeiling: () => void;
  onBudget: (id: string) => void;
  onGoal: (id: string) => void;
}) {
  const [mode, setMode] = useState<"budgets" | "goals">("budgets");
  const spent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
  const percent = budgetCeiling > 0 ? Math.round((spent / budgetCeiling) * 100) : 0;
  return <div className="view page-view">
    <div className="segmented">
      <button type="button" className={mode === "budgets" ? "active" : ""} onClick={() => setMode("budgets")}>Orçamentos mensais</button>
      <button type="button" className={mode === "goals" ? "active" : ""} onClick={() => setMode("goals")}>Metas & Cofrinhos ({goals.length})</button>
    </div>
    {mode === "budgets" ? <>
      <section className="budget-hero card">
        <div><small>TETO ORÇAMENTÁRIO DO MÊS</small><button type="button" onClick={onCeiling}>＋ Definir teto</button></div>
        <h1>{money(spent, hidden)}</h1>
        <p>de {money(budgetCeiling, hidden)} planejado <b>{percent}% consumido</b></p>
        <div className="progress"><i style={{ width: Math.min(percent, 100) + "%" }}/></div>
        <footer>Restante disponível: <strong>{money(Math.max(0, budgetCeiling - spent), hidden)}</strong></footer>
      </section>
      <h2 className="page-label">CATEGORIAS MONITORADAS</h2>
      <section className="budget-grid">{budgets.map((budget) => <div className="card" key={budget.id}><BudgetRow budget={budget} hidden={hidden} onClick={() => onBudget(budget.id)}/></div>)}</section>
    </> : <>
      <section className="goals-summary dark-card">
        <span><Icon name="target"/></span>
        <div><small>SEUS PLANOS</small><strong>{goals.filter((goal) => goal.current >= goal.target).length} de {goals.length} concluídos</strong><p>Toque em uma meta para guardar dinheiro.</p></div>
      </section>
      <h2 className="page-label">METAS ATIVAS</h2>
      <section className="goal-list">
        {goals.map((goal) => {
          const goalPercent = Math.min(100, Math.round((goal.current / goal.target) * 100));
          return <button type="button" className="goal-item card" key={goal.id} onClick={() => onGoal(goal.id)}>
            <CategoryIcon name={goal.icon} tone={goal.tone}/>
            <span><strong>{goal.name}</strong><small>{money(goal.current, hidden)} de {money(goal.target, hidden)}</small><span className="progress"><i className={goal.tone} style={{ width: goalPercent + "%" }}/></span></span>
            <b>{goalPercent}%</b><Icon name="chevron" size={17}/>
          </button>;
        })}
      </section>
    </>}
  </div>;
}

function WalletView({ accounts, cards, hidden, onTransfer, onAccount, onCard, onNewAccount, onNewCard }: {
  accounts: Account[];
  cards: CreditCard[];
  hidden: boolean;
  onTransfer: () => void;
  onAccount: (id: string) => void;
  onCard: (id: string) => void;
  onNewAccount: () => void;
  onNewCard: () => void;
}) {
  const total = accounts.reduce((sum, account) => sum + account.amount, 0);
  return <div className="view page-view">
    <section className="wallet-hero dark-card">
      <div><small>SALDO LÍQUIDO EM CONTAS</small><button type="button" onClick={onTransfer}><Icon name="transfer" size={18}/> Transferir</button></div>
      <h1>{money(total, hidden)}</h1>
      <p>Distribuição em {accounts.length} {accounts.length === 1 ? "conta" : "contas"} e {cards.length} {cards.length === 1 ? "cartão de crédito" : "cartões de crédito"}.</p>
    </section>
    <SectionHeader title={"CARTÕES DE CRÉDITO (" + cards.length + ")"} action="Novo cartão" onAction={onNewCard}/>
    <section className="card-stack">
      {cards.map((card) => {
        const usage = card.limit > 0 ? Math.round((card.invoice / card.limit) * 100) : 0;
        return <button type="button" className="credit-card dark-card interactive-card" key={card.id} onClick={() => onCard(card.id)}>
          <div className="credit-title"><span><Icon name="card"/></span><strong>{card.name}</strong><Icon name="chevron" size={18}/></div>
          <hr/>
          <div className="credit-values"><span><small>FATURA ATUAL</small><strong>{money(card.invoice, hidden)}</strong></span><span><small>LIMITE DISPONÍVEL</small><strong>{money(Math.max(0, card.limit - card.invoice), hidden)}</strong></span></div>
          <div className="usage-line"><small>Limite: {money(card.limit, hidden)}</small><small>{usage}% utilizado</small></div>
          <div className="progress dark"><i style={{ width: Math.min(100, usage) + "%" }}/></div>
          <footer>Fechamento: dia {card.closingDay} <strong>Vencimento: dia {card.dueDay}</strong></footer>
        </button>;
      })}
    </section>
    <SectionHeader title={"CONTAS & INVESTIMENTOS (" + accounts.length + ")"} action="Nova conta" onAction={onNewAccount}/>
    <section className="account-list card">
      {accounts.map((account) => <button type="button" className="account-entry" key={account.id} onClick={() => onAccount(account.id)}>
        <CategoryIcon name={account.icon} tone={account.tone}/>
        <span><strong>{account.name}</strong><small>{account.type}</small></span>
        <b>{money(account.amount, hidden)}</b><Icon name="chevron" size={16}/>
      </button>)}
    </section>
  </div>;
}

function AnalysisView({ budgets, transactions, hidden, monthIndex, setMonthIndex }: {
  budgets: Budget[];
  transactions: Transaction[];
  hidden: boolean;
  monthIndex: number;
  setMonthIndex: (index: number) => void;
}) {
  const summary = monthSummary(monthIndex, transactions);
  const economy = summary.income > 0 ? Math.round(((summary.income - summary.expenses) / summary.income) * 100) : 0;
  const factor = [1, .84, .72, .62][monthIndex] || 1;
  const bars = [{ m: "Mai", i: 8, e: 6 }, { m: "Jun", i: 8, e: 6 }, { m: "Jul", i: 58, e: 34 }, { m: "Ago", i: 86, e: 30 }];
  return <div className="view page-view">
    <div className="month-card card">
      <button type="button" aria-label="Mês anterior" disabled={monthIndex === months.length - 1} onClick={() => setMonthIndex(Math.min(months.length - 1, monthIndex + 1))}>‹</button>
      <span><strong>{summary.report}</strong></span>
      <button type="button" aria-label="Mês seguinte" disabled={monthIndex === 0} onClick={() => setMonthIndex(Math.max(0, monthIndex - 1))}>›</button>
    </div>
    <div className="stats-grid">
      <article className="card"><small>RECEITAS</small><strong className="income-text">{money(summary.income, hidden)}</strong></article>
      <article className="card"><small>DESPESAS</small><strong>{money(summary.expenses, hidden)}</strong></article>
      <article className="card"><small>ECONOMIA</small><strong>{economy}%</strong></article>
    </div>
    <section className="chart-card card">
      <h2><Icon name="trend" size={18}/> EVOLUÇÃO FINANCEIRA</h2>
      <div className="bars">{bars.map((item) => <div key={item.m}><span><i className="income-bar" style={{ height: Math.max(5, item.i * factor) + "%" }}/><i className="expense-bar" style={{ height: Math.max(4, item.e * factor) + "%" }}/></span><small>{item.m}</small></div>)}</div>
      <footer><span><i className="dot green"/>Receitas</span><span><i className="dot dark"/>Despesas</span></footer>
    </section>
    <section className="card analysis-budgets"><h2>DISTRIBUIÇÃO POR CATEGORIA</h2>{budgets.map((budget) => <BudgetRow budget={budget} compact hidden={hidden} key={budget.id}/>)}</section>
  </div>;
}

function Sheet({ title, close, children, wide = false }: { title: string; close: () => void; children: ReactNode; wide?: boolean }) {
  return <div className="sheet-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
    <section className={"composer action-sheet" + (wide ? " wide-sheet" : "")} role="dialog" aria-modal="true" aria-label={title}>
      <div className="sheet-handle"/>
      <header><h2>{title}</h2><button type="button" onClick={close} aria-label="Fechar"><Icon name="close"/></button></header>
      {children}
    </section>
  </div>;
}

function AssistantSheet({ transactions, budgets, close, openBudgets, addExpense, hidden }: {
  transactions: Transaction[];
  budgets: Budget[];
  close: () => void;
  openBudgets: () => void;
  addExpense: () => void;
  hidden: boolean;
}) {
  const summary = monthSummary(0, transactions);
  const saved = Math.max(0, summary.income - summary.expenses);
  const rate = summary.income > 0 ? Math.round((saved / summary.income) * 100) : 0;
  const tightest = [...budgets].sort((a, b) => (b.spent / b.limit) - (a.spent / a.limit))[0];
  return <Sheet title="ASSISTENTE FINANCEIRO" close={close}>
    <div className="assistant-hero"><span><Icon name="sparkles"/></span><div><small>RESUMO DE AGOSTO</small><strong>Seu mês está saudável.</strong><p>Você preservou {rate}% da renda até agora.</p></div></div>
    <div className="insight-list">
      <article><span className="insight-icon green"><Icon name="trend" size={19}/></span><div><strong>{money(saved, hidden)} disponíveis</strong><small>Esse é o valor que sobrou depois das saídas do mês.</small></div></article>
      {tightest && <article><span className="insight-icon orange"><Icon name={tightest.icon} size={19}/></span><div><strong>Atenção em {tightest.name}</strong><small>{Math.round((tightest.spent / tightest.limit) * 100)}% do limite dessa categoria já foi usado.</small></div></article>}
      <article><span className="insight-icon violet"><Icon name="target" size={19}/></span><div><strong>Próximo passo simples</strong><small>Revise os limites antes de registrar a próxima compra.</small></div></article>
    </div>
    <div className="sheet-actions"><button type="button" className="secondary-action" onClick={openBudgets}>Ver orçamentos</button><button type="button" className="primary-action" onClick={addExpense}>Adicionar despesa</button></div>
  </Sheet>;
}

function SettingsSheet({ hidden, toggleValues, close, reset }: {
  hidden: boolean;
  toggleValues: () => void;
  close: () => void;
  reset: () => void;
}) {
  const [armed, setArmed] = useState(false);
  return <Sheet title="AJUSTES" close={close}>
    <div className="settings-list">
      <button type="button" onClick={toggleValues}><span><Icon name={hidden ? "eyeOff" : "eye"}/></span><div><strong>{hidden ? "Mostrar valores" : "Ocultar valores"}</strong><small>Proteja seus saldos quando estiver em público.</small></div><i className={hidden ? "switch on" : "switch"}/></button>
      <article><span><Icon name="check"/></span><div><strong>Salvamento automático</strong><small>As mudanças ficam guardadas neste aparelho.</small></div><b>Ativo</b></article>
    </div>
    {!armed ? <button type="button" className="reset-link" onClick={() => setArmed(true)}>Restaurar dados de exemplo</button> :
      <div className="reset-confirm"><p>Isso apaga somente as alterações salvas neste aparelho.</p><div><button type="button" onClick={() => setArmed(false)}>Cancelar</button><button type="button" onClick={reset}>Confirmar restauração</button></div></div>}
  </Sheet>;
}

function TransferSheet({ accounts, defaultFrom, hidden, close, transfer }: {
  accounts: Account[];
  defaultFrom?: string;
  hidden: boolean;
  close: () => void;
  transfer: (from: string, to: string, amount: number) => string | null;
}) {
  const [from, setFrom] = useState(defaultFrom || accounts[0]?.id || "");
  const [to, setTo] = useState(accounts.find((account) => account.id !== (defaultFrom || accounts[0]?.id))?.id || "");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const source = accounts.find((account) => account.id === from);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const result = transfer(from, to, numberValue(amount));
    if (result) setError(result);
  };
  return <div className="sheet-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
    <form className="composer action-sheet" onSubmit={submit}>
      <div className="sheet-handle"/><header><h2>TRANSFERIR ENTRE CONTAS</h2><button type="button" onClick={close} aria-label="Fechar"><Icon name="close"/></button></header>
      <div className="available-balance"><span>Saldo disponível</span><strong>{money(source?.amount || 0, hidden)}</strong></div>
      <label>Conta de origem<select value={from} onChange={(event) => { setFrom(event.target.value); setError(""); }}><option value="">Selecione</option>{accounts.map((account) => <option value={account.id} key={account.id}>{account.name}</option>)}</select></label>
      <label>Conta de destino<select value={to} onChange={(event) => { setTo(event.target.value); setError(""); }}><option value="">Selecione</option>{accounts.map((account) => <option value={account.id} key={account.id}>{account.name}</option>)}</select></label>
      <label>Valor<input autoFocus inputMode="decimal" value={amount} onChange={(event) => { setAmount(event.target.value); setError(""); }} placeholder="R$ 0,00"/></label>
      {error && <p className="form-error">{error}</p>}
      <button className="submit-transaction" type="submit">Confirmar transferência</button>
    </form>
  </div>;
}

function AccountSheet({ close, add }: { close: () => void; add: (account: Omit<Account, "id" | "tone" | "icon">) => void }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("Conta corrente");
  const [amount, setAmount] = useState("");
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const numeric = numberValue(amount || "0");
    if (!name.trim() || Number.isNaN(numeric) || numeric < 0) return;
    add({ name: name.trim(), type, amount: numeric });
  };
  return <div className="sheet-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
    <form className="composer action-sheet" onSubmit={submit}>
      <div className="sheet-handle"/><header><h2>NOVA CONTA</h2><button type="button" onClick={close}><Icon name="close"/></button></header>
      <label>Nome da conta<input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: PicPay"/></label>
      <label>Tipo<select value={type} onChange={(event) => setType(event.target.value)}><option>Conta corrente</option><option>Conta digital</option><option>Investimentos</option><option>Poupança</option><option>Carteira</option></select></label>
      <label>Saldo inicial<input inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="R$ 0,00"/></label>
      <button className="submit-transaction" type="submit">Adicionar conta</button>
    </form>
  </div>;
}

function CardSheet({ close, add }: { close: () => void; add: (card: Omit<CreditCard, "id" | "invoice">) => void }) {
  const [name, setName] = useState("");
  const [limit, setLimit] = useState("");
  const [dueDay, setDueDay] = useState("10");
  const [closingDay, setClosingDay] = useState("3");
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const numeric = numberValue(limit);
    if (!name.trim() || !numeric || numeric <= 0) return;
    add({ name: name.trim(), limit: numeric, dueDay: Number(dueDay), closingDay: Number(closingDay) });
  };
  return <div className="sheet-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
    <form className="composer action-sheet" onSubmit={submit}>
      <div className="sheet-handle"/><header><h2>NOVO CARTÃO</h2><button type="button" onClick={close}><Icon name="close"/></button></header>
      <label>Nome do cartão<input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Inter Gold"/></label>
      <label>Limite total<input inputMode="decimal" value={limit} onChange={(event) => setLimit(event.target.value)} placeholder="R$ 0,00"/></label>
      <div className="form-columns"><label>Vencimento<input inputMode="numeric" value={dueDay} onChange={(event) => setDueDay(event.target.value)} min="1" max="31" type="number"/></label><label>Fechamento<input inputMode="numeric" value={closingDay} onChange={(event) => setClosingDay(event.target.value)} min="1" max="31" type="number"/></label></div>
      <button className="submit-transaction" type="submit">Adicionar cartão</button>
    </form>
  </div>;
}

function BudgetSheet({ budget, ceiling, close, save }: { budget?: Budget; ceiling: number; close: () => void; save: (value: number) => void }) {
  const [value, setValue] = useState(String(budget?.limit || ceiling).replace(".", ","));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const numeric = numberValue(value);
    if (!numeric || numeric <= 0) return;
    save(numeric);
  };
  return <div className="sheet-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
    <form className="composer action-sheet" onSubmit={submit}>
      <div className="sheet-handle"/><header><h2>{budget ? "EDITAR ORÇAMENTO" : "TETO DO MÊS"}</h2><button type="button" onClick={close}><Icon name="close"/></button></header>
      {budget && <div className="selected-item"><CategoryIcon name={budget.icon} tone={budget.tone}/><span><strong>{budget.name}</strong><small>Gasto atual: {currency.format(budget.spent)}</small></span></div>}
      <label>{budget ? "Novo limite da categoria" : "Valor máximo para gastar no mês"}<input autoFocus inputMode="decimal" value={value} onChange={(event) => setValue(event.target.value)} placeholder="R$ 0,00"/></label>
      <button className="submit-transaction" type="submit">Salvar limite</button>
    </form>
  </div>;
}

function GoalSheet({ goal, hidden, close, contribute }: { goal: Goal; hidden: boolean; close: () => void; contribute: (value: number) => void }) {
  const [value, setValue] = useState("");
  const percent = Math.min(100, Math.round((goal.current / goal.target) * 100));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const numeric = numberValue(value);
    if (!numeric || numeric <= 0) return;
    contribute(numeric);
  };
  return <div className="sheet-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
    <form className="composer action-sheet" onSubmit={submit}>
      <div className="sheet-handle"/><header><h2>GUARDAR NA META</h2><button type="button" onClick={close}><Icon name="close"/></button></header>
      <div className="goal-sheet-summary"><CategoryIcon name={goal.icon} tone={goal.tone}/><div><strong>{goal.name}</strong><small>{money(goal.current, hidden)} de {money(goal.target, hidden)}</small><span className="progress"><i className={goal.tone} style={{ width: percent + "%" }}/></span></div><b>{percent}%</b></div>
      <label>Quanto deseja guardar?<input autoFocus inputMode="decimal" value={value} onChange={(event) => setValue(event.target.value)} placeholder="R$ 0,00"/></label>
      <button className="submit-transaction" type="submit">Guardar valor</button>
    </form>
  </div>;
}

function AccountDetailSheet({ account, hidden, close, startTransfer }: { account: Account; hidden: boolean; close: () => void; startTransfer: () => void }) {
  return <Sheet title="DETALHES DA CONTA" close={close}>
    <div className="detail-hero"><CategoryIcon name={account.icon} tone={account.tone}/><span><small>{account.type}</small><strong>{account.name}</strong></span></div>
    <div className="detail-balance"><small>SALDO DISPONÍVEL</small><strong>{money(account.amount, hidden)}</strong></div>
    <button type="button" className="primary-action full-action" onClick={startTransfer}><Icon name="transfer" size={18}/> Transferir desta conta</button>
  </Sheet>;
}

function CardDetailSheet({ card, hidden, close }: { card: CreditCard; hidden: boolean; close: () => void }) {
  const usage = Math.min(100, Math.round((card.invoice / card.limit) * 100));
  return <Sheet title="DETALHES DO CARTÃO" close={close}>
    <div className="card-detail dark-card"><Icon name="card"/><small>{card.name}</small><strong>{money(card.invoice, hidden)}</strong><span>Fatura atual · {usage}% do limite</span><div className="progress dark"><i style={{ width: usage + "%" }}/></div></div>
    <div className="detail-grid"><article><small>LIMITE TOTAL</small><strong>{money(card.limit, hidden)}</strong></article><article><small>DISPONÍVEL</small><strong>{money(Math.max(0, card.limit - card.invoice), hidden)}</strong></article><article><small>FECHAMENTO</small><strong>Dia {card.closingDay}</strong></article><article><small>VENCIMENTO</small><strong>Dia {card.dueDay}</strong></article></div>
  </Sheet>;
}

function Composer({ defaultKind, close, add }: {
  defaultKind: TransactionKind;
  close: () => void;
  add: (transaction: Omit<Transaction, "id" | "date" | "icon" | "tone">) => void;
}) {
  const [kind, setKind] = useState(defaultKind);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Alimentação");
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const numeric = numberValue(amount);
    if (!title.trim() || !numeric || numeric <= 0) return;
    add({ title: title.trim(), amount: numeric, category, kind });
  };
  return <div className="sheet-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
    <form className="composer" onSubmit={submit}>
      <div className="sheet-handle"/><header><h2>NOVA TRANSAÇÃO</h2><button type="button" onClick={close}><Icon name="close"/></button></header>
      <div className="type-toggle"><button type="button" className={kind === "expense" ? "active" : ""} onClick={() => setKind("expense")}>Despesa</button><button type="button" className={kind === "income" ? "active income" : ""} onClick={() => setKind("income")}>Receita</button></div>
      <label>Descrição<input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ex.: supermercado"/></label>
      <label>Valor<input inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="R$ 0,00"/></label>
      <label>Categoria<select value={category} onChange={(event) => setCategory(event.target.value)}><option>Alimentação</option><option>Moradia</option><option>Transporte</option><option>Lazer</option><option>Saúde</option><option>Freelance</option><option>Outros</option></select></label>
      <button className="submit-transaction" type="submit">Adicionar transação</button>
    </form>
  </div>;
}

const navItems: { id: Tab; label: string; icon: IconName }[] = [
  { id: "inicio", label: "Início", icon: "grid" },
  { id: "extrato", label: "Extrato", icon: "receipt" },
  { id: "metas", label: "Metas", icon: "trend" },
  { id: "carteira", label: "Carteira", icon: "wallet" },
  { id: "analise", label: "Análise", icon: "chart" },
];

export default function Home() {
  const [tab, setTab] = useState<Tab>("inicio");
  const [composer, setComposer] = useState<{ open: boolean; kind: TransactionKind }>({ open: false, kind: "expense" });
  const [modal, setModal] = useState<ModalName>(null);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [cards, setCards] = useState<CreditCard[]>(initialCards);
  const [budgets, setBudgets] = useState<Budget[]>(initialBudgets);
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [budgetCeiling, setBudgetCeiling] = useState(6570);
  const [hidden, setHidden] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [monthIndex, setMonthIndex] = useState(0);
  const [selectedBudgetId, setSelectedBudgetId] = useState<string>();
  const [selectedGoalId, setSelectedGoalId] = useState<string>();
  const [selectedAccountId, setSelectedAccountId] = useState<string>();
  const [selectedCardId, setSelectedCardId] = useState<string>();
  const [transferFrom, setTransferFrom] = useState<string>();
  const [toast, setToast] = useState("");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (Array.isArray(data.transactions)) setTransactions(data.transactions);
        if (Array.isArray(data.accounts)) setAccounts(data.accounts);
        if (Array.isArray(data.cards)) setCards(data.cards);
        if (Array.isArray(data.budgets)) setBudgets(data.budgets);
        if (Array.isArray(data.goals)) setGoals(data.goals);
        if (typeof data.budgetCeiling === "number") setBudgetCeiling(data.budgetCeiling);
        if (typeof data.hidden === "boolean") setHidden(data.hidden);
      } catch {
        // Mantém os dados de exemplo se o armazenamento estiver inválido.
      }
    } else {
      const oldTransactions = window.localStorage.getItem("meu-dinheiro-transactions");
      if (oldTransactions) {
        try { setTransactions(JSON.parse(oldTransactions)); } catch { /* mantém os exemplos */ }
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ transactions, accounts, cards, budgets, goals, budgetCeiling, hidden }));
  }, [transactions, accounts, cards, budgets, goals, budgetCeiling, hidden, hydrated]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const showToast = (message: string) => setToast(message);
  const openBudget = (id?: string) => { setSelectedBudgetId(id); setModal("budget"); };
  const openGoal = (id: string) => { setSelectedGoalId(id); setModal("goal"); };
  const openAccount = (id: string) => { setSelectedAccountId(id); setModal("accountDetail"); };
  const openCard = (id: string) => { setSelectedCardId(id); setModal("cardDetail"); };
  const openTransfer = (from?: string) => { setTransferFrom(from); setModal("transfer"); };

  const selectedBudget = budgets.find((budget) => budget.id === selectedBudgetId);
  const selectedGoal = goals.find((goal) => goal.id === selectedGoalId);
  const selectedAccount = accounts.find((account) => account.id === selectedAccountId);
  const selectedCard = cards.find((card) => card.id === selectedCardId);

  const addTransaction = (data: Omit<Transaction, "id" | "date" | "icon" | "tone">) => {
    const meta: Record<string, { icon: IconName; tone: string; budget?: string }> = {
      Alimentação: { icon: "food", tone: "orange", budget: "food" },
      Moradia: { icon: "home", tone: "blue", budget: "home" },
      Transporte: { icon: "car", tone: "violet", budget: "transport" },
      Lazer: { icon: "smile", tone: "pink", budget: "fun" },
      Saúde: { icon: "wallet", tone: "red" },
      Freelance: { icon: "laptop", tone: "green" },
      Outros: { icon: "wallet", tone: "slate" },
    };
    const selectedMeta = meta[data.category] || meta.Outros;
    setTransactions((current) => [{ ...data, id: Date.now(), date: "Hoje", icon: selectedMeta.icon, tone: selectedMeta.tone }, ...current]);
    setAccounts((current) => current.map((account, index) => index === 0 ? { ...account, amount: account.amount + (data.kind === "income" ? data.amount : -data.amount) } : account));
    if (data.kind === "expense" && selectedMeta.budget) setBudgets((current) => current.map((budget) => budget.id === selectedMeta.budget ? { ...budget, spent: budget.spent + data.amount } : budget));
    setComposer({ open: false, kind: "expense" });
    setTab("inicio");
    showToast(data.kind === "income" ? "Receita adicionada" : "Despesa adicionada");
  };

  const transfer = (from: string, to: string, amount: number) => {
    const source = accounts.find((account) => account.id === from);
    if (!from || !to) return "Escolha as duas contas.";
    if (from === to) return "A conta de destino precisa ser diferente.";
    if (!amount || Number.isNaN(amount) || amount <= 0) return "Digite um valor válido.";
    if (!source || source.amount < amount) return "Saldo insuficiente na conta de origem.";
    setAccounts((current) => current.map((account) => account.id === from ? { ...account, amount: account.amount - amount } : account.id === to ? { ...account, amount: account.amount + amount } : account));
    setModal(null);
    showToast("Transferência concluída");
    return null;
  };

  const addAccount = (account: Omit<Account, "id" | "tone" | "icon">) => {
    setAccounts((current) => [...current, { ...account, id: "account-" + Date.now(), tone: current.length % 2 ? "blue" : "green", icon: account.type === "Investimentos" ? "trend" : account.type === "Carteira" ? "wallet" : "bank" }]);
    setModal(null);
    showToast("Nova conta adicionada");
  };

  const addCard = (card: Omit<CreditCard, "id" | "invoice">) => {
    setCards((current) => [...current, { ...card, id: "card-" + Date.now(), invoice: 0 }]);
    setModal(null);
    showToast("Novo cartão adicionado");
  };

  const saveBudget = (value: number) => {
    if (selectedBudgetId) {
      setBudgets((current) => current.map((budget) => budget.id === selectedBudgetId ? { ...budget, limit: value } : budget));
      showToast("Limite da categoria atualizado");
    } else {
      setBudgetCeiling(value);
      showToast("Teto do mês atualizado");
    }
    setModal(null);
  };

  const contributeGoal = (value: number) => {
    if (!selectedGoalId) return;
    setGoals((current) => current.map((goal) => goal.id === selectedGoalId ? { ...goal, current: Math.min(goal.target, goal.current + value) } : goal));
    setModal(null);
    showToast("Valor guardado na meta");
  };

  const resetData = () => {
    setTransactions(initialTransactions);
    setAccounts(initialAccounts);
    setCards(initialCards);
    setBudgets(initialBudgets);
    setGoals(initialGoals);
    setBudgetCeiling(6570);
    setHidden(false);
    window.localStorage.removeItem("meu-dinheiro-transactions");
    setModal(null);
    setTab("inicio");
    showToast("Dados de exemplo restaurados");
  };

  const shared = { hidden, transactions };
  let view: ReactNode;
  if (tab === "extrato") view = <StatementView {...shared} monthIndex={monthIndex} setMonthIndex={setMonthIndex}/>;
  else if (tab === "metas") view = <GoalsView budgets={budgets} goals={goals} budgetCeiling={budgetCeiling} hidden={hidden} onCeiling={() => openBudget()} onBudget={openBudget} onGoal={openGoal}/>;
  else if (tab === "carteira") view = <WalletView accounts={accounts} cards={cards} hidden={hidden} onTransfer={() => openTransfer()} onAccount={openAccount} onCard={openCard} onNewAccount={() => setModal("account")} onNewCard={() => setModal("card")}/>;
  else if (tab === "analise") view = <AnalysisView budgets={budgets} transactions={transactions} hidden={hidden} monthIndex={monthIndex} setMonthIndex={setMonthIndex}/>;
  else view = <HomeView transactions={transactions} accounts={accounts} cards={cards} budgets={budgets} goals={goals} hidden={hidden} openComposer={(kind = "expense") => setComposer({ open: true, kind })} onTransfer={() => openTransfer()} navigate={setTab} onAssistant={() => setModal("assistant")} onBudget={openBudget} onAccount={openAccount} onCard={openCard} onGoal={openGoal}/>;

  const navButton = (item: typeof navItems[number]) => <button type="button" key={item.id} className={"nav-item " + (tab === item.id ? "active" : "")} onClick={() => setTab(item.id)}><Icon name={item.icon}/><small>{item.label}</small></button>;

  return <main className="app-shell">
    <div className="phone-app">
      <Header hidden={hidden} onToggleValues={() => setHidden((value) => !value)} onAssistant={() => setModal("assistant")} onSettings={() => setModal("settings")}/>
      {view}
      <nav className="bottom-nav">{navItems.slice(0, 2).map(navButton)}<span className="nav-add"><button type="button" className="add-button" onClick={() => setComposer({ open: true, kind: "expense" })} aria-label="Adicionar transação"><Icon name="plus" size={30}/></button></span>{navItems.slice(2).map(navButton)}</nav>

      {composer.open && <Composer defaultKind={composer.kind} close={() => setComposer((current) => ({ ...current, open: false }))} add={addTransaction}/>}
      {modal === "assistant" && <AssistantSheet transactions={transactions} budgets={budgets} hidden={hidden} close={() => setModal(null)} openBudgets={() => { setModal(null); setTab("metas"); }} addExpense={() => { setModal(null); setComposer({ open: true, kind: "expense" }); }}/>}
      {modal === "settings" && <SettingsSheet hidden={hidden} toggleValues={() => setHidden((value) => !value)} close={() => setModal(null)} reset={resetData}/>}
      {modal === "transfer" && <TransferSheet accounts={accounts} defaultFrom={transferFrom} hidden={hidden} close={() => setModal(null)} transfer={transfer}/>}
      {modal === "account" && <AccountSheet close={() => setModal(null)} add={addAccount}/>}
      {modal === "card" && <CardSheet close={() => setModal(null)} add={addCard}/>}
      {modal === "budget" && <BudgetSheet budget={selectedBudget} ceiling={budgetCeiling} close={() => setModal(null)} save={saveBudget}/>}
      {modal === "goal" && selectedGoal && <GoalSheet goal={selectedGoal} hidden={hidden} close={() => setModal(null)} contribute={contributeGoal}/>}
      {modal === "accountDetail" && selectedAccount && <AccountDetailSheet account={selectedAccount} hidden={hidden} close={() => setModal(null)} startTransfer={() => openTransfer(selectedAccount.id)}/>}
      {modal === "cardDetail" && selectedCard && <CardDetailSheet card={selectedCard} hidden={hidden} close={() => setModal(null)}/>}
      {toast && <div className="toast" role="status"><Icon name="check" size={18}/>{toast}</div>}
    </div>
  </main>;
}
