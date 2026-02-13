import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useAuth } from '../contexts/AuthContext'
import { loadModuleData, saveModuleData } from '../lib/remoteStore'

type FinanceTactic = {
  id: number
  title: string
  description: string
  priority: 'High' | 'Medium' | 'Low'
}

type LoanPlan = {
  id: number
  purpose: string
  amount: number
  rate: number
  termMonths: number
  status: 'Planned' | 'Active' | 'Avoid'
  note: string
}

type NewsItem = {
  id: number
  title: string
  source: string
  impact: 'Bullish' | 'Bearish' | 'Neutral'
  note: string
}

type FinanceRitual = {
  id: number
  title: string
  done: boolean
}

type FinanceWin = {
  id: number
  date: string
  highlight: string
  impact: string
}

type MarketMetric = {
  id: number
  asset: string
  value: string
  change: string
  source: string
  note: string
}

type FinancePayload = {
  tactics: FinanceTactic[]
  rituals: FinanceRitual[]
  wins: FinanceWin[]
  loanPlans: LoanPlan[]
  newsItems: NewsItem[]
  marketMetrics: MarketMetric[]
}

const Finance: React.FC = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [darkMode, setDarkMode] = useState(false)
  const [tactics, setTactics] = useLocalStorage<FinanceTactic[]>('financeTactics', [
    { id: 1, title: '50/30/20 cashflow', description: 'Giữ tỷ lệ tiết kiệm tối thiểu 20% tổng thu nhập.', priority: 'High' },
    { id: 2, title: '3 nguồn thu', description: 'Chủ động tạo thêm 1 nguồn thu phụ trong 90 ngày.', priority: 'Medium' },
    { id: 3, title: 'Quỹ dự phòng 6 tháng', description: 'Ưu tiên nâng quỹ dự phòng lên 6 tháng chi phí.', priority: 'High' }
  ])
  const [rituals, setRituals] = useLocalStorage<FinanceRitual[]>('financeRituals', [
    { id: 1, title: 'Check cashflow hôm nay', done: false },
    { id: 2, title: 'Ghi lại 1 khoản chi quan trọng', done: false },
    { id: 3, title: 'Xem lại quỹ dự phòng/đầu tư', done: false }
  ])
  const [wins, setWins] = useLocalStorage<FinanceWin[]>('financeWins', [
    { id: 1, date: '2026-02-01', highlight: 'Tăng tỷ lệ tiết kiệm lên 25%', impact: 'Cashflow dư thêm 2 triệu' }
  ])
  const [winDraft, setWinDraft] = useState<Omit<FinanceWin, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    highlight: '',
    impact: ''
  })
  const [loanPlans, setLoanPlans] = useLocalStorage<LoanPlan[]>('financeLoanPlans', [
    { id: 1, purpose: 'Đầu tư nâng kỹ năng', amount: 3000, rate: 9.5, termMonths: 24, status: 'Planned', note: 'Chỉ vay nếu ROI > 2x trong 12 tháng.' },
    { id: 2, purpose: 'Thiết bị làm việc', amount: 2000, rate: 8.0, termMonths: 18, status: 'Active', note: 'Theo dõi dòng tiền trả nợ mỗi tháng.' }
  ])
  const [newsItems, setNewsItems] = useLocalStorage<NewsItem[]>('financeNewsWatch', [
    { id: 1, title: 'Lãi suất có dấu hiệu giảm', source: 'VnEconomy', impact: 'Bullish', note: 'Cân nhắc tái cấu trúc khoản vay.' },
    { id: 2, title: 'Xu hướng đầu tư AI tăng mạnh', source: 'TechCrunch', impact: 'Bullish', note: 'Theo dõi cơ hội side project.' }
  ])
  const [marketMetrics, setMarketMetrics] = useLocalStorage<MarketMetric[]>('financeMarketMetrics', [
    { id: 1, asset: 'Gold (SJC)', value: '79.2M VND/lượng', change: '+0.4%', source: 'SJC', note: 'Theo dõi biên độ giá trong 7 ngày.' },
    { id: 2, asset: 'Silver', value: '26.4 USD/oz', change: '-0.8%', source: 'Kitco', note: 'Tập trung biến động theo USD.' },
    { id: 3, asset: 'Lãi suất ngân hàng', value: '6.8%/năm', change: '+0.1%', source: 'Vietcombank', note: 'Xem lại kỳ hạn gửi 6-12 tháng.' },
    { id: 4, asset: 'Quỹ đầu tư', value: 'VN30 ETF +1.2%', change: '+1.2%', source: 'HOSE', note: 'Review phân bổ quỹ hàng tuần.' }
  ])

  // Sync Supabase per-user with fallback localStorage
  useEffect(() => {
    if (!user) return
    let mounted = true
    ;(async () => {
      try {
        const remote = await loadModuleData<FinancePayload>('finance', user.id)
        if (remote && mounted) {
          setTactics(remote.tactics)
          setRituals(remote.rituals)
          setWins(remote.wins)
          setLoanPlans(remote.loanPlans)
          setNewsItems(remote.newsItems)
          setMarketMetrics(remote.marketMetrics)
        } else if (!remote) {
          await saveModuleData('finance', user.id, {
            tactics,
            rituals,
            wins,
            loanPlans,
            newsItems,
            marketMetrics
          })
        }
      } catch (err) {
        console.error('Sync finance load failed', err)
      }
    })()
    return () => { mounted = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  useEffect(() => {
    if (!user) return
    ;(async () => {
      try {
        await saveModuleData('finance', user.id, {
          tactics,
          rituals,
          wins,
          loanPlans,
          newsItems,
          marketMetrics
        })
      } catch (err) {
        console.error('Sync finance save failed', err)
      }
    })()
  }, [user, tactics, rituals, wins, loanPlans, newsItems, marketMetrics])

  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings) as { darkMode?: boolean }
        setDarkMode(Boolean(parsed.darkMode))
      } catch (err) {
        console.error('Failed to parse app settings', err)
      }
    }

    const handleSettings = (event: Event) => {
      const detail = (event as CustomEvent<{ darkMode?: boolean }>).detail
      if (!detail) return
      setDarkMode(Boolean(detail.darkMode))
    }

    window.addEventListener('app-settings-changed', handleSettings)
    return () => window.removeEventListener('app-settings-changed', handleSettings)
  }, [])

  const cardBase = darkMode
    ? 'bg-slate-900/70 border-slate-700 text-slate-100'
    : 'bg-white border-slate-100 text-slate-900'
  const rowBorder = darkMode ? 'border-slate-700' : 'border-slate-200'
  const cardSoft = darkMode
    ? 'bg-slate-900 border-slate-700 text-slate-100'
    : 'bg-gray-50 border-gray-200 text-slate-900'
  const inputBase = darkMode
    ? 'border-slate-700 bg-slate-900 text-slate-100 placeholder:text-slate-500'
    : 'border'

  // Mock data
  const mockTransactions = [
    { id: 1, type: 'income', amount: 5000, description: 'Salary', date: '2024-01-01' },
    { id: 2, type: 'expense', amount: 1000, description: 'Rent', date: '2024-01-02' },
    { id: 3, type: 'expense', amount: 500, description: 'Groceries', date: '2024-01-03' },
    { id: 4, type: 'income', amount: 2000, description: 'Freelance', date: '2024-01-05' },
  ]

  const cashflowData = [
    { name: 'Jan', income: 7000, expense: 1500, net: 5500 },
    { name: 'Feb', income: 7200, expense: 1600, net: 5600 },
    { name: 'Mar', income: 7500, expense: 1700, net: 5800 },
  ]

  const financeScore = useMemo(() => {
    const totalIncome = cashflowData.reduce((sum, item) => sum + item.income, 0)
    const totalExpense = cashflowData.reduce((sum, item) => sum + item.expense, 0)
    if (!totalIncome) return 0
    const savingsRate = Math.round(((totalIncome - totalExpense) / totalIncome) * 100)
    return Math.max(0, Math.min(100, savingsRate))
  }, [cashflowData])

  const addWin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!winDraft.highlight.trim()) return
    setWins((prev) => [{ id: Date.now(), ...winDraft }, ...prev])
    setWinDraft({ date: new Date().toISOString().split('T')[0], highlight: '', impact: '' })
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">{t('finance.title')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className={`p-4 rounded-2xl border ${cardBase}`}>
          <p className="text-xs uppercase tracking-wide opacity-70">Savings Rate</p>
          <h2 className="text-3xl font-semibold mt-2">{financeScore}%</h2>
          <p className={`mt-2 text-sm ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>Tỷ lệ tiết kiệm ước tính theo cashflow.</p>
        </div>
        <div className={`p-4 rounded-2xl border ${cardBase}`}>
          <p className="text-xs uppercase tracking-wide opacity-70">Capital Strategy</p>
          <p className={`mt-2 text-sm ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>Theo dõi chiến lược vốn + quy tắc dòng tiền.</p>
          <div className={`mt-3 text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Tactics active: {tactics.length}</div>
        </div>
        <div className={`p-4 rounded-2xl border ${cardBase}`}>
          <p className="text-xs uppercase tracking-wide opacity-70">Debt Load</p>
          <p className={`mt-2 text-sm ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>Theo dõi kế hoạch vay và trả nợ.</p>
          <div className={`mt-3 text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Plans: {loanPlans.length}</div>
        </div>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className={`p-4 rounded-2xl border ${cardBase}`}>
          <h3 className="text-base font-semibold mb-3">Daily Money Ops</h3>
          <div className="space-y-2 text-sm">
            {rituals.map((ritual) => (
              <label key={ritual.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={ritual.done}
                  onChange={(e) => setRituals((prev) => prev.map((item) => (item.id === ritual.id ? { ...item, done: e.target.checked } : item)))}
                />
                <span className={ritual.done ? 'line-through opacity-60' : ''}>{ritual.title}</span>
              </label>
            ))}
          </div>
        </div>
        <div className={`p-4 rounded-2xl border ${cardBase}`}>
          <h3 className="text-base font-semibold mb-2">Cross-module actions</h3>
          <p className={`text-sm mb-3 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>Kết nối tài chính với mục tiêu nghề nghiệp và thời gian.</p>
          <div className="flex flex-wrap gap-2 text-xs">
            <Link className={`px-3 py-1 rounded-full border ${cardSoft}`} to="/career">Career mục tiêu thu nhập</Link>
            <Link className={`px-3 py-1 rounded-full border ${cardSoft}`} to="/time-energy">Time & Energy</Link>
            <Link className={`px-3 py-1 rounded-full border ${cardSoft}`} to="/decisions">Decision log</Link>
          </div>
        </div>
        <div className={`p-4 rounded-2xl border ${cardBase}`}>
          <h3 className="text-base font-semibold mb-2">Wins & Outcomes</h3>
          <form onSubmit={addWin} className="space-y-2 text-sm">
            <input className={`px-2 py-1 rounded w-full ${inputBase}`} type="date" value={winDraft.date} onChange={(e) => setWinDraft({ ...winDraft, date: e.target.value })} />
            <input className={`px-2 py-1 rounded w-full ${inputBase}`} placeholder="Thành quả tài chính" value={winDraft.highlight} onChange={(e) => setWinDraft({ ...winDraft, highlight: e.target.value })} />
            <input className={`px-2 py-1 rounded w-full ${inputBase}`} placeholder="Tác động (cashflow/đầu tư)" value={winDraft.impact} onChange={(e) => setWinDraft({ ...winDraft, impact: e.target.value })} />
            <button className="px-3 py-1.5 rounded bg-emerald-600 text-white text-xs" type="submit">Lưu thành quả</button>
          </form>
          <div className="mt-3 space-y-2 text-xs">
            {wins.slice(0, 3).map((win) => (
              <div key={win.id} className={`p-2 rounded border ${cardSoft}`}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{win.highlight}</span>
                  <span className="opacity-70">{win.date}</span>
                </div>
                <p className="mt-1 opacity-80">{win.impact || '—'}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`p-5 rounded-2xl border mt-6 ${cardBase}`}>
        <h3 className="text-lg font-semibold mb-3">Market Watch (Vàng, bạc, lãi suất, quỹ)</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-sm">
          {marketMetrics.map((metric) => (
            <div key={metric.id} className={`p-3 rounded-xl border ${cardSoft}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <input
                  className={`px-2 py-1 rounded text-sm ${inputBase}`}
                  value={metric.asset}
                  onChange={(e) => setMarketMetrics((prev) => prev.map((row) => (row.id === metric.id ? { ...row, asset: e.target.value } : row)))}
                />
                <input
                  className={`px-2 py-1 rounded text-sm ${inputBase}`}
                  value={metric.value}
                  onChange={(e) => setMarketMetrics((prev) => prev.map((row) => (row.id === metric.id ? { ...row, value: e.target.value } : row)))}
                />
                <input
                  className={`px-2 py-1 rounded text-xs ${inputBase}`}
                  value={metric.change}
                  onChange={(e) => setMarketMetrics((prev) => prev.map((row) => (row.id === metric.id ? { ...row, change: e.target.value } : row)))}
                  placeholder="Change"
                />
                <input
                  className={`px-2 py-1 rounded text-xs ${inputBase}`}
                  value={metric.source}
                  onChange={(e) => setMarketMetrics((prev) => prev.map((row) => (row.id === metric.id ? { ...row, source: e.target.value } : row)))}
                  placeholder="Source"
                />
              </div>
              <textarea
                className={`px-2 py-1 rounded w-full text-xs mt-2 ${inputBase}`}
                rows={2}
                value={metric.note}
                onChange={(e) => setMarketMetrics((prev) => prev.map((row) => (row.id === metric.id ? { ...row, note: e.target.value } : row)))}
              />
            </div>
          ))}
        </div>
      </section>
      
      {/* Transactions Table */}
      <div className={`p-4 rounded-lg shadow mb-6 border ${cardBase}`}>
        <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className={darkMode ? 'bg-slate-800 text-slate-200' : 'bg-gray-50'}>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Description</th>
                <th className="px-4 py-2 text-left">Amount</th>
                <th className="px-4 py-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {mockTransactions.map((transaction) => (
                <tr key={transaction.id} className={`border-t ${rowBorder}`}>
                  <td className={`px-4 py-2 capitalize ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type}
                  </td>
                  <td className="px-4 py-2">{transaction.description}</td>
                  <td className="px-4 py-2">${transaction.amount}</td>
                  <td className="px-4 py-2">{transaction.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cashflow Chart */}
      <div className={`p-4 rounded-lg shadow border ${cardBase}`}>
        <h3 className="text-lg font-semibold mb-4">Cashflow Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={cashflowData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} />
            <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} />
            <Line type="monotone" dataKey="net" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <section className={`p-5 rounded-2xl border mt-6 ${cardBase}`}>
        <h3 className="text-lg font-semibold mb-3">Capital & Cashflow Tactics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          {tactics.map((tactic) => (
            <div key={tactic.id} className={`p-3 rounded-xl border ${cardSoft}`}>
              <input
                className={`px-2 py-1 rounded w-full text-sm mb-2 ${inputBase}`}
                value={tactic.title}
                onChange={(e) => setTactics((prev) => prev.map((item) => (item.id === tactic.id ? { ...item, title: e.target.value } : item)))}
              />
              <textarea
                className={`px-2 py-1 rounded w-full text-xs mb-2 ${inputBase}`}
                rows={3}
                value={tactic.description}
                onChange={(e) => setTactics((prev) => prev.map((item) => (item.id === tactic.id ? { ...item, description: e.target.value } : item)))}
              />
              <select
                className={`px-2 py-1 rounded w-full text-xs ${inputBase}`}
                value={tactic.priority}
                onChange={(e) => setTactics((prev) => prev.map((item) => (item.id === tactic.id ? { ...item, priority: e.target.value as FinanceTactic['priority'] } : item)))}
              >
                {['High', 'Medium', 'Low'].map((level) => <option key={level}>{level}</option>)}
              </select>
            </div>
          ))}
        </div>
      </section>

      <section className={`p-5 rounded-2xl border mt-6 ${cardBase}`}>
        <h3 className="text-lg font-semibold mb-3">Loan & Debt Planning</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-sm">
          {loanPlans.map((plan) => (
            <div key={plan.id} className={`p-3 rounded-xl border ${cardSoft}`}>
              <input
                className={`px-2 py-1 rounded w-full text-sm mb-2 ${inputBase}`}
                value={plan.purpose}
                onChange={(e) => setLoanPlans((prev) => prev.map((item) => (item.id === plan.id ? { ...item, purpose: e.target.value } : item)))}
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  className={`px-2 py-1 rounded text-xs ${inputBase}`}
                  type="number"
                  value={plan.amount}
                  onChange={(e) => setLoanPlans((prev) => prev.map((item) => (item.id === plan.id ? { ...item, amount: Number(e.target.value) } : item)))}
                  placeholder="Amount"
                />
                <input
                  className={`px-2 py-1 rounded text-xs ${inputBase}`}
                  type="number"
                  step="0.1"
                  value={plan.rate}
                  onChange={(e) => setLoanPlans((prev) => prev.map((item) => (item.id === plan.id ? { ...item, rate: Number(e.target.value) } : item)))}
                  placeholder="Rate %"
                />
                <input
                  className={`px-2 py-1 rounded text-xs ${inputBase}`}
                  type="number"
                  value={plan.termMonths}
                  onChange={(e) => setLoanPlans((prev) => prev.map((item) => (item.id === plan.id ? { ...item, termMonths: Number(e.target.value) } : item)))}
                  placeholder="Term months"
                />
                <select
                  className={`px-2 py-1 rounded text-xs ${inputBase}`}
                  value={plan.status}
                  onChange={(e) => setLoanPlans((prev) => prev.map((item) => (item.id === plan.id ? { ...item, status: e.target.value as LoanPlan['status'] } : item)))}
                >
                  {['Planned', 'Active', 'Avoid'].map((status) => <option key={status}>{status}</option>)}
                </select>
              </div>
              <textarea
                className={`px-2 py-1 rounded w-full text-xs mt-2 ${inputBase}`}
                rows={2}
                value={plan.note}
                onChange={(e) => setLoanPlans((prev) => prev.map((item) => (item.id === plan.id ? { ...item, note: e.target.value } : item)))}
              />
            </div>
          ))}
        </div>
      </section>

      <section className={`p-5 rounded-2xl border mt-6 ${cardBase}`}>
        <h3 className="text-lg font-semibold mb-3">Financial News Watch</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 text-sm">
          {newsItems.map((item) => (
            <div key={item.id} className={`p-3 rounded-xl border ${cardSoft}`}>
              <input
                className={`px-2 py-1 rounded w-full text-sm mb-2 ${inputBase}`}
                value={item.title}
                onChange={(e) => setNewsItems((prev) => prev.map((row) => (row.id === item.id ? { ...row, title: e.target.value } : row)))}
              />
              <input
                className={`px-2 py-1 rounded w-full text-xs mb-2 ${inputBase}`}
                value={item.source}
                onChange={(e) => setNewsItems((prev) => prev.map((row) => (row.id === item.id ? { ...row, source: e.target.value } : row)))}
              />
              <select
                className={`px-2 py-1 rounded w-full text-xs mb-2 ${inputBase}`}
                value={item.impact}
                onChange={(e) => setNewsItems((prev) => prev.map((row) => (row.id === item.id ? { ...row, impact: e.target.value as NewsItem['impact'] } : row)))}
              >
                {['Bullish', 'Bearish', 'Neutral'].map((impact) => <option key={impact}>{impact}</option>)}
              </select>
              <textarea
                className={`px-2 py-1 rounded w-full text-xs ${inputBase}`}
                rows={2}
                value={item.note}
                onChange={(e) => setNewsItems((prev) => prev.map((row) => (row.id === item.id ? { ...row, note: e.target.value } : row)))}
              />
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

export default Finance
