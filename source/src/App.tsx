"use client";

import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";

type Tab = "inicio" | "extrato" | "metas" | "carteira" | "analise";
type TransactionKind = "expense" | "income";
type IconName = "grid" | "receipt" | "plus" | "trend" | "wallet" | "chart" | "arrowUp" | "arrowDown" | "transfer" | "target" | "sparkles" | "home" | "food" | "car" | "laptop" | "smile" | "card" | "bank" | "close" | "search" | "chevron" | "eye";
type Transaction = { id: number; title: string; category: string; date: string; amount: number; kind: TransactionKind; icon: IconName; tone: string };

const initialTransactions: Transaction[] = [
  { id: 1, title: "Supermercado Pão de Açúcar", category: "Alimentação", date: "Ontem", amount: 342.5, kind: "expense", icon: "food", tone: "orange" },
  { id: 2, title: "Uber Viagem", category: "Transporte", date: "Ontem", amount: 28.9, kind: "expense", icon: "car", tone: "violet" },
  { id: 3, title: "Projeto Freelance UX/UI", category: "Freelance", date: "12 de ago.", amount: 3200, kind: "income", icon: "laptop", tone: "green" },
  { id: 4, title: "Aluguel & Condomínio", category: "Moradia", date: "10 de ago.", amount: 2150, kind: "expense", icon: "home", tone: "blue" },
  { id: 5, title: "Jantar Restaurante", category: "Lazer", date: "09 de ago.", amount: 198, kind: "expense", icon: "smile", tone: "pink" },
];

const accounts = [
  { name: "Nubank Conta", type: "Conta corrente", amount: 4850.3, tone: "violet", icon: "bank" as IconName },
  { name: "Itaú Uniclass", type: "Conta corrente", amount: 8320, tone: "orange", icon: "bank" as IconName },
  { name: "Inter Investimentos", type: "Investimentos", amount: 24500, tone: "orange", icon: "trend" as IconName },
  { name: "Dinheiro físico", type: "Carteira", amount: 280, tone: "green", icon: "wallet" as IconName },
];

const budgets = [
  { name: "Moradia & Contas", spent: 2150, limit: 2600, tone: "blue", icon: "home" as IconName },
  { name: "Alimentação", spent: 342.5, limit: 1800, tone: "orange", icon: "food" as IconName },
  { name: "Lazer & Viagens", spent: 198, limit: 800, tone: "pink", icon: "smile" as IconName },
  { name: "Transporte & Carro", spent: 28.9, limit: 650, tone: "violet", icon: "car" as IconName },
];

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

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
  };
  return <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function CategoryIcon({ name, tone }: { name: IconName; tone: string }) { return <span className={`category-icon ${tone}`}><Icon name={name} size={23}/></span>; }

function Header() {
  return <header className="app-header"><div className="avatar-wrap"><span className="avatar">V</span><i/></div><div className="greeting"><small>BOM DIA</small><strong>Vinicius</strong></div><div className="header-actions"><button aria-label="Ocultar valores"><Icon name="eye"/></button><button className="ai-button" aria-label="Assistente"><Icon name="sparkles"/><i/></button><button aria-label="Ajustes">⚙︎</button></div></header>;
}

function SectionHeader({ title, action }: { title: string; action: string }) { return <div className="section-heading"><h2>{title}</h2><button>{action} <Icon name="chevron" size={14}/></button></div>; }

function TransactionRow({ item }: { item: Transaction }) {
  return <article className="transaction-row"><CategoryIcon name={item.icon} tone={item.tone}/><span className="transaction-copy"><strong>{item.title}</strong><small>{item.date} · {item.category}</small></span><span className={`transaction-amount ${item.kind}`}><strong>{item.kind === "income" ? "+" : "−"}{currency.format(item.amount)}</strong><small>{item.kind === "income" ? "Pix" : "Cartão"}</small></span></article>;
}

function BudgetRow({ budget, compact = false }: { budget: typeof budgets[number]; compact?: boolean }) {
  const percent = Math.round((budget.spent / budget.limit) * 100);
  return <article className={`budget-row ${compact ? "compact" : ""}`}><CategoryIcon name={budget.icon} tone={budget.tone}/><span className="budget-copy"><strong>{budget.name}</strong><small>Gasto: {currency.format(budget.spent)} de {currency.format(budget.limit)}</small><span className="progress"><i className={budget.tone} style={{width:`${Math.min(percent,100)}%`}}/></span></span><b>{percent}%</b></article>;
}

function HomeView({ transactions, openComposer }: { transactions: Transaction[]; openComposer: (kind?: TransactionKind) => void }) {
  const expenses = transactions.filter((item)=>item.kind === "expense").reduce((sum,item)=>sum+item.amount,0);
  const income = 11345.2 + transactions.filter((item)=>item.id > 5 && item.kind === "income").reduce((sum,item)=>sum+item.amount,0);
  const saved = Math.max(0,income-expenses); const saveRate = Math.round((saved/income)*100);
  return <div className="view home-view">
    <section className="balance-card dark-card"><div className="eyebrow-row"><span>PATRIMÔNIO LÍQUIDO</span><span className="month-pill">Agosto</span></div><h1>{currency.format(37950.3 + transactions.filter((t)=>t.id>5).reduce((sum,t)=>sum+(t.kind==="income"?t.amount:-t.amount),0))}</h1><p>Resultado do mês: <b>+{currency.format(saved)} ({saveRate}% guardado)</b></p><div className="balance-split"><div><span className="mini-icon income"><Icon name="arrowDown" size={17}/></span><small>Entradas</small><strong>{currency.format(income)}</strong></div><div><span className="mini-icon expense"><Icon name="arrowUp" size={17}/></span><small>Saídas</small><strong>{currency.format(expenses)}</strong></div></div></section>
    <section className="quick-actions" aria-label="Ações rápidas"><button onClick={()=>openComposer("expense")}><span><Icon name="arrowUp"/></span>Despesa</button><button onClick={()=>openComposer("income")}><span><Icon name="arrowDown"/></span>Receita</button><button><span><Icon name="transfer"/></span>Transferir</button><button><span><Icon name="target"/></span>Metas</button></section>
    <button className="assistant-card"><span className="assistant-icon"><Icon name="sparkles" size={20}/></span><span><small>ASSISTENTE IA <i/></small><strong>Você guardou {saveRate}% da renda este mês.</strong></span><Icon name="chevron" size={18}/></button>
    <SectionHeader title="CONTAS & CARTÕES" action="Ver todas"/><div className="account-scroll"><article className="credit-mini dark-card"><div><Icon name="card" size={19}/><strong>Nubank Ultravioleta</strong><span>Dia 5</span></div><small>Fatura atual</small><h3>{currency.format(1420.8)}</h3><div className="usage-line"><small>12% usado</small><small>Disp. {currency.format(10579.2)}</small></div><div className="progress dark"><i style={{width:"12%"}}/></div></article><article className="bank-mini"><CategoryIcon name="bank" tone="violet"/><small>Saldo disponível</small><h3>{currency.format(4850.3)}</h3></article></div>
    <SectionHeader title="ORÇAMENTOS DO MÊS" action="Gerenciar"/><section className="budget-summary card">{budgets.slice(0,3).map((budget)=><BudgetRow key={budget.name} budget={budget} compact/>)}</section>
    <section className="goal-card card"><span className="goal-icon"><Icon name="target"/></span><span><small>META PRINCIPAL</small><strong>Reserva de Emergência (6 meses)</strong><p>{currency.format(22500)} de {currency.format(30000)} (75%)</p></span><Icon name="chevron" size={18}/></section>
    <SectionHeader title="ÚLTIMAS TRANSAÇÕES" action="Extrato completo"/><section className="transaction-list card">{transactions.slice(0,5).map((item)=><TransactionRow key={item.id} item={item}/>)}</section>
  </div>;
}

function StatementView({ transactions }: { transactions: Transaction[] }) {
  const [query,setQuery]=useState(""); const [filter,setFilter]=useState<"all"|TransactionKind>("all");
  const filtered=transactions.filter((item)=>(filter==="all"||item.kind===filter)&&`${item.title} ${item.category}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="view page-view"><div className="month-card card"><button>‹</button><span><strong>AGOSTO DE 2026</strong><small>Entradas: <b>R$ 11.345,20</b> · Saídas: R$ 3.065,60</small></span><button>›</button></div><label className="search-box"><Icon name="search" size={20}/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Buscar por nome ou categoria..."/></label><div className="filter-row"><button className={filter==="all"?"active":""} onClick={()=>setFilter("all")}>Todas ({transactions.length})</button><button className={filter==="expense"?"active":""} onClick={()=>setFilter("expense")}>Despesas</button><button className={filter==="income"?"active":""} onClick={()=>setFilter("income")}>Receitas</button></div><section className="transaction-list card statement-list">{filtered.map((item)=><TransactionRow key={item.id} item={item}/>)}</section></div>;
}

function GoalsView() { return <div className="view page-view"><div className="segmented"><button className="active">Orçamentos mensais</button><button>Metas & Cofrinhos (3)</button></div><section className="budget-hero card"><div><small>TETO ORÇAMENTÁRIO DO MÊS</small><button>＋ Definir teto</button></div><h1>{currency.format(2799.2)}</h1><p>de {currency.format(6570)} planejado <b>43% consumido</b></p><div className="progress"><i style={{width:"43%"}}/></div><footer>Restante disponível: <strong>{currency.format(3770.8)}</strong></footer></section><h2 className="page-label">CATEGORIAS MONITORADAS</h2><section className="budget-grid">{budgets.map((budget)=><div className="card" key={budget.name}><BudgetRow budget={budget}/></div>)}</section></div>; }

function WalletView() { return <div className="view page-view"><section className="wallet-hero dark-card"><div><small>SALDO LÍQUIDO EM CONTAS</small><button><Icon name="transfer" size={18}/> Transferir</button></div><h1>{currency.format(37950.3)}</h1><p>Distribuição em 4 contas bancárias e 1 cartão de crédito.</p></section><SectionHeader title="CARTÕES DE CRÉDITO (1)" action="Novo cartão"/><section className="credit-card dark-card"><div className="credit-title"><span><Icon name="card"/></span><strong>Nubank Ultravioleta</strong></div><hr/><div className="credit-values"><span><small>FATURA ATUAL</small><strong>{currency.format(1420.8)}</strong></span><span><small>LIMITE DISPONÍVEL</small><strong>{currency.format(10579.2)}</strong></span></div><div className="usage-line"><small>Limite: {currency.format(12000)}</small><small>12% utilizado</small></div><div className="progress dark"><i style={{width:"12%"}}/></div><footer>Fechamento: dia 25 <strong>Vencimento: dia 5</strong></footer></section><SectionHeader title="CONTAS & INVESTIMENTOS (4)" action="Nova conta"/><section className="account-list card">{accounts.map((account)=><article key={account.name}><CategoryIcon name={account.icon} tone={account.tone}/><span><strong>{account.name}</strong><small>{account.type}</small></span><b>{currency.format(account.amount)}</b></article>)}</section></div>; }

function AnalysisView() { return <div className="view page-view"><div className="month-card card"><button>‹</button><span><strong>RELATÓRIO · AGOSTO DE 2026</strong></span><button>›</button></div><div className="stats-grid"><article className="card"><small>RECEITAS</small><strong className="income-text">R$ 11.345,20</strong></article><article className="card"><small>DESPESAS</small><strong>R$ 3.065,60</strong></article><article className="card"><small>ECONOMIA</small><strong>73%</strong></article></div><section className="chart-card card"><h2><Icon name="trend" size={18}/> EVOLUÇÃO FINANCEIRA</h2><div className="bars">{[{m:"Mai",i:8,e:6},{m:"Jun",i:8,e:6},{m:"Jul",i:58,e:34},{m:"Ago",i:86,e:30}].map((x)=><div key={x.m}><span><i className="income-bar" style={{height:`${x.i}%`}}/><i className="expense-bar" style={{height:`${x.e}%`}}/></span><small>{x.m}</small></div>)}</div><footer><span><i className="dot green"/>Receitas</span><span><i className="dot dark"/>Despesas</span></footer></section><section className="card analysis-budgets"><h2>DISTRIBUIÇÃO POR CATEGORIA</h2>{budgets.map((budget)=><BudgetRow budget={budget} compact key={budget.name}/>)}</section></div>; }

function Composer({defaultKind,close,add}:{defaultKind:TransactionKind;close:()=>void;add:(transaction:Omit<Transaction,"id"|"date"|"icon"|"tone">)=>void}) {
  const [kind,setKind]=useState(defaultKind); const [title,setTitle]=useState(""); const [amount,setAmount]=useState(""); const [category,setCategory]=useState("Alimentação");
  const submit=(event:FormEvent)=>{event.preventDefault();const numeric=Number(amount.replace(",","."));if(!title.trim()||!numeric)return;add({title:title.trim(),amount:numeric,category,kind});};
  return <div className="sheet-backdrop" onMouseDown={(e)=>{if(e.target===e.currentTarget)close();}}><form className="composer" onSubmit={submit}><div className="sheet-handle"/><header><h2>NOVA TRANSAÇÃO</h2><button type="button" onClick={close}><Icon name="close"/></button></header><div className="type-toggle"><button type="button" className={kind==="expense"?"active":""} onClick={()=>setKind("expense")}>Despesa</button><button type="button" className={kind==="income"?"active income":""} onClick={()=>setKind("income")}>Receita</button></div><label>Descrição<input autoFocus value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Ex.: supermercado"/></label><label>Valor<input inputMode="decimal" value={amount} onChange={(e)=>setAmount(e.target.value)} placeholder="R$ 0,00"/></label><label>Categoria<select value={category} onChange={(e)=>setCategory(e.target.value)}><option>Alimentação</option><option>Moradia</option><option>Transporte</option><option>Lazer</option><option>Saúde</option><option>Freelance</option><option>Outros</option></select></label><button className="submit-transaction" type="submit">Adicionar transação</button></form></div>;
}

const navItems:{id:Tab;label:string;icon:IconName}[]=[{id:"inicio",label:"Início",icon:"grid"},{id:"extrato",label:"Extrato",icon:"receipt"},{id:"metas",label:"Metas",icon:"trend"},{id:"carteira",label:"Carteira",icon:"wallet"},{id:"analise",label:"Análise",icon:"chart"}];

export default function Home() {
  const [tab,setTab]=useState<Tab>("inicio"); const [composer,setComposer]=useState<{open:boolean;kind:TransactionKind}>({open:false,kind:"expense"}); const [transactions,setTransactions]=useState<Transaction[]>(initialTransactions); const [hydrated,setHydrated]=useState(false);
  useEffect(()=>{const stored=window.localStorage.getItem("meu-dinheiro-transactions");if(stored){try{setTransactions(JSON.parse(stored));}catch{/* mantém os exemplos */}}setHydrated(true);},[]);
  useEffect(()=>{if(hydrated)window.localStorage.setItem("meu-dinheiro-transactions",JSON.stringify(transactions));},[transactions,hydrated]);
  const view=useMemo(()=>{if(tab==="extrato")return <StatementView transactions={transactions}/>;if(tab==="metas")return <GoalsView/>;if(tab==="carteira")return <WalletView/>;if(tab==="analise")return <AnalysisView/>;return <HomeView transactions={transactions} openComposer={(kind="expense")=>setComposer({open:true,kind})}/>;},[tab,transactions]);
  const addTransaction=(data:Omit<Transaction,"id"|"date"|"icon"|"tone">)=>{const meta:Record<string,{icon:IconName;tone:string}>={Alimentação:{icon:"food",tone:"orange"},Moradia:{icon:"home",tone:"blue"},Transporte:{icon:"car",tone:"violet"},Lazer:{icon:"smile",tone:"pink"},Saúde:{icon:"wallet",tone:"red"},Freelance:{icon:"laptop",tone:"green"},Outros:{icon:"wallet",tone:"slate"}};setTransactions((current)=>[{...data,id:Date.now(),date:"Hoje",...(meta[data.category]??meta.Outros)},...current]);setComposer({open:false,kind:"expense"});setTab("inicio");};
  const navButton=(item:typeof navItems[number])=><button key={item.id} className={`nav-item ${tab===item.id?"active":""}`} onClick={()=>setTab(item.id)}><Icon name={item.icon}/><small>{item.label}</small></button>;
  return <main className="app-shell"><div className="phone-app"><Header/>{view}<nav className="bottom-nav">{navItems.slice(0,2).map(navButton)}<span className="nav-add"><button className="add-button" onClick={()=>setComposer({open:true,kind:"expense"})} aria-label="Adicionar transação"><Icon name="plus" size={30}/></button></span>{navItems.slice(2).map(navButton)}</nav>{composer.open&&<Composer defaultKind={composer.kind} close={()=>setComposer({...composer,open:false})} add={addTransaction}/>}</div></main>;
}
