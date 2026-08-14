import { useEffect, useMemo, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, ChevronRight, CircleDollarSign, Home, Layers3, Plus, ReceiptText, Settings, Trash2 } from 'lucide-react'

type Kind = 'income' | 'expense'
type Tab = 'home' | 'transactions' | 'categories' | 'settings'
type Transaction = { id: string; kind: Kind; title: string; amount: number; date: string; category: string; note: string }

const STORAGE_KEY = 'meu-dinheiro:transactions'
const CATEGORIES: Record<Kind, string[]> = {
  income: ['Salário', 'Freelance', 'Investimentos', 'Presente', 'Outros'],
  expense: ['Alimentação', 'Casa', 'Transporte', 'Saúde', 'Lazer', 'Compras', 'Educação', 'Outros'],
}
const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const shortDate = (date: string) => new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(`${date}T12:00:00`)).replace('.', '')
const todayLabel = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }).format(new Date()).toUpperCase()

function readTransactions(): Transaction[] {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    if (!Array.isArray(stored)) return []

    return stored.filter((item): item is Transaction => {
      if (!item || typeof item !== 'object') return false
      const transaction = item as Partial<Transaction>
      return typeof transaction.id === 'string'
        && (transaction.kind === 'income' || transaction.kind === 'expense')
        && typeof transaction.title === 'string'
        && typeof transaction.amount === 'number'
        && Number.isFinite(transaction.amount)
        && typeof transaction.date === 'string'
        && typeof transaction.category === 'string'
        && typeof transaction.note === 'string'
    })
  } catch {
    return []
  }
}

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(readTransactions)
  const [tab, setTab] = useState<Tab>('home')
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))
    } catch {
      // Safari can block localStorage in private/restricted contexts. The app
      // should remain usable for the current session instead of going blank.
    }
  }, [transactions])

  const totals = useMemo(() => transactions.reduce((acc, item) => {
    acc[item.kind] += item.amount
    return acc
  }, { income: 0, expense: 0 }), [transactions])
  const sorted = useMemo(() => [...transactions].sort((a, b) => b.date.localeCompare(a.date)), [transactions])
  const openNew = (kind?: Kind) => { setEditing(kind ? { id: '', kind, title: '', amount: 0, date: new Date().toISOString().slice(0, 10), category: CATEGORIES[kind][0], note: '' } : null); setFormOpen(true) }
  const save = (item: Transaction) => { setTransactions(old => item.id ? old.map(value => value.id === item.id ? item : value) : [...old, { ...item, id: createId() }]); setFormOpen(false) }
  const remove = (id: string) => setTransactions(old => old.filter(item => item.id !== id))

  return <div className="app-shell">
    <main>
      {tab === 'home' && <HomeView transactions={sorted} totals={totals} onAdd={openNew} onEdit={item => { setEditing(item); setFormOpen(true) }} onSeeAll={() => setTab('transactions')} />}
      {tab === 'transactions' && <TransactionsView items={sorted} onAdd={() => openNew()} onEdit={item => { setEditing(item); setFormOpen(true) }} />}
      {tab === 'categories' && <CategoriesView transactions={transactions} />}
      {tab === 'settings' && <SettingsView hasData={transactions.length > 0} onClear={() => setConfirmClear(true)} />}
    </main>
    <Nav tab={tab} onChange={setTab} />
    {formOpen && <TransactionForm initial={editing} onClose={() => setFormOpen(false)} onSave={save} onDelete={editing?.id ? () => { remove(editing.id); setFormOpen(false) } : undefined} />}
    {confirmClear && <ConfirmDialog onCancel={() => setConfirmClear(false)} onConfirm={() => { setTransactions([]); setConfirmClear(false) }} />}
  </div>
}

function Header({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: React.ReactNode }) {
  return <header className="page-header"><div>{eyebrow && <p>{eyebrow}</p>}<h1>{title}</h1></div>{action}</header>
}

function HomeView({ transactions, totals, onAdd, onEdit, onSeeAll }: { transactions: Transaction[]; totals: Record<Kind, number>; onAdd: (kind: Kind) => void; onEdit: (t: Transaction) => void; onSeeAll: () => void }) {
  const balance = totals.income - totals.expense
  return <div className="page home-page">
    <Header eyebrow={todayLabel} title="Olá!" action={<button className="avatar" aria-label="Meu Dinheiro"><CircleDollarSign /></button>} />
    <section className="balance-card">
      <div className="balance-top"><span>Saldo atual</span><span className="privacy-dot">•••</span></div>
      <strong>{money.format(balance)}</strong>
      <div className="balance-stats">
        <div><span className="stat-icon income"><ArrowDownLeft /></span><p>Recebido</p><b>{money.format(totals.income)}</b></div>
        <div><span className="stat-icon expense"><ArrowUpRight /></span><p>Gasto</p><b>{money.format(totals.expense)}</b></div>
      </div>
    </section>
    <div className="quick-actions">
      <button onClick={() => onAdd('income')}><span className="quick-icon income"><Plus /></span><span><b>Nova entrada</b><small>Dinheiro que entrou</small></span><ChevronRight /></button>
      <button onClick={() => onAdd('expense')}><span className="quick-icon expense"><Plus /></span><span><b>Nova saída</b><small>Dinheiro que saiu</small></span><ChevronRight /></button>
    </div>
    <section className="recent"><div className="section-title"><h2>Recentes</h2>{transactions.length > 0 && <button onClick={onSeeAll}>Ver todos</button>}</div>
      {transactions.length === 0 ? <EmptyState compact onAdd={() => onAdd('expense')} /> : <div className="transaction-list">{transactions.slice(0, 5).map(item => <TransactionRow key={item.id} item={item} onClick={() => onEdit(item)} />)}</div>}
    </section>
  </div>
}

function TransactionsView({ items, onAdd, onEdit }: { items: Transaction[]; onAdd: () => void; onEdit: (t: Transaction) => void }) {
  return <div className="page"><Header title="Lançamentos" action={<button className="circle-button" onClick={onAdd} aria-label="Adicionar lançamento"><Plus /></button>} />
    {items.length === 0 ? <EmptyState onAdd={onAdd} /> : <div className="transaction-list full-list">{items.map(item => <TransactionRow key={item.id} item={item} onClick={() => onEdit(item)} />)}</div>}
  </div>
}

function TransactionRow({ item, onClick }: { item: Transaction; onClick: () => void }) {
  return <button className="transaction-row" onClick={onClick}><span className={`row-icon ${item.kind}`}>{item.kind === 'income' ? <ArrowDownLeft /> : <ArrowUpRight />}</span><span className="row-info"><b>{item.title}</b><small>{item.category} · {shortDate(item.date)}</small></span><span className={`row-amount ${item.kind}`}>{item.kind === 'income' ? '+' : '−'} {money.format(item.amount)}</span><ChevronRight className="chevron" /></button>
}

function EmptyState({ onAdd, compact = false }: { onAdd: () => void; compact?: boolean }) {
  return <div className={`empty ${compact ? 'compact' : ''}`}><span><ReceiptText /></span><h3>Nenhum lançamento ainda</h3><p>Adicione uma entrada ou saída para começar a acompanhar seu dinheiro.</p>{!compact && <button className="primary" onClick={onAdd}><Plus /> Adicionar lançamento</button>}</div>
}

function CategoriesView({ transactions }: { transactions: Transaction[] }) {
  return <div className="page"><Header title="Categorias" /><p className="page-intro">Organize seus lançamentos por categoria.</p>{(['expense', 'income'] as Kind[]).map(kind => <section className="category-section" key={kind}><h2>{kind === 'expense' ? 'Saídas' : 'Entradas'}</h2><div className="settings-card">{CATEGORIES[kind].map(category => <div className="category-row" key={category}><span className={`category-dot ${kind}`} /><span>{category}</span><small>{transactions.filter(t => t.kind === kind && t.category === category).length}</small></div>)}</div></section>)}</div>
}

function SettingsView({ hasData, onClear }: { hasData: boolean; onClear: () => void }) {
  return <div className="page"><Header title="Ajustes" /><section className="category-section"><h2>Dados</h2><div className="settings-card"><div className="setting-copy"><b>Armazenamento local</b><p>Seus dados ficam somente neste aparelho e nunca são enviados para um servidor.</p></div><button className="danger-button" onClick={onClear} disabled={!hasData}><Trash2 /> Apagar todos os dados</button></div></section><p className="version">Meu Dinheiro · Versão 1.0</p></div>
}

function TransactionForm({ initial, onClose, onSave, onDelete }: { initial: Transaction | null; onClose: () => void; onSave: (t: Transaction) => void; onDelete?: () => void }) {
  const [kind, setKind] = useState<Kind>(initial?.kind || 'expense')
  const [title, setTitle] = useState(initial?.title || '')
  const [amount, setAmount] = useState(initial?.amount ? String(initial.amount).replace('.', ',') : '')
  const [date, setDate] = useState(initial?.date || new Date().toISOString().slice(0, 10))
  const [category, setCategory] = useState(initial?.category || CATEGORIES.expense[0])
  const [note, setNote] = useState(initial?.note || '')
  const changeKind = (next: Kind) => { setKind(next); setCategory(CATEGORIES[next][0]) }
  const parsedAmount = Number(amount.replace(',', '.'))
  const submit = (event: React.FormEvent) => { event.preventDefault(); if (!title.trim() || !parsedAmount || parsedAmount < 0) return; onSave({ id: initial?.id || '', kind, title: title.trim(), amount: parsedAmount, date, category, note: note.trim() }) }
  return <div className="modal-backdrop"><section className="sheet"><div className="sheet-handle" /><header><button onClick={onClose}>Cancelar</button><h2>{initial?.id ? 'Editar lançamento' : 'Novo lançamento'}</h2><button className="save-link" form="transaction-form" type="submit">Salvar</button></header><form id="transaction-form" onSubmit={submit}>
    <div className="segmented"><button type="button" className={kind === 'expense' ? 'active' : ''} onClick={() => changeKind('expense')}>Saída</button><button type="button" className={kind === 'income' ? 'active' : ''} onClick={() => changeKind('income')}>Entrada</button></div>
    <label>Título<input value={title} onChange={e => setTitle(e.target.value)} placeholder={kind === 'expense' ? 'Ex.: Supermercado' : 'Ex.: Salário'} required autoFocus /></label>
    <label>Valor<div className="money-input"><span>R$</span><input value={amount} onChange={e => setAmount(e.target.value.replace(/[^0-9,.]/g, ''))} inputMode="decimal" placeholder="0,00" required /></div></label>
    <div className="form-grid"><label>Data<input type="date" value={date} onChange={e => setDate(e.target.value)} required /></label><label>Categoria<select value={category} onChange={e => setCategory(e.target.value)}>{CATEGORIES[kind].map(item => <option key={item}>{item}</option>)}</select></label></div>
    <label>Observação <small>(opcional)</small><textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Adicione um detalhe" rows={3} /></label>
    {onDelete && <button className="delete-transaction" type="button" onClick={onDelete}><Trash2 /> Apagar lançamento</button>}
  </form></section></div>
}

function ConfirmDialog({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return <div className="modal-backdrop dialog-wrap"><div className="dialog"><span><Trash2 /></span><h2>Apagar todos os dados?</h2><p>Todos os lançamentos serão removidos deste aparelho. Esta ação não pode ser desfeita.</p><button className="confirm-delete" onClick={onConfirm}>Apagar tudo</button><button onClick={onCancel}>Cancelar</button></div></div>
}

function Nav({ tab, onChange }: { tab: Tab; onChange: (tab: Tab) => void }) {
  const items: [Tab, string, React.ReactNode][] = [['home', 'Início', <Home />], ['transactions', 'Lançamentos', <ReceiptText />], ['categories', 'Categorias', <Layers3 />], ['settings', 'Ajustes', <Settings />]]
  return <nav className="tab-bar">{items.map(([value, label, icon]) => <button key={value} className={tab === value ? 'active' : ''} onClick={() => onChange(value)}>{icon}<span>{label}</span></button>)}</nav>
}
