import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useAuth } from '../contexts/AuthContext'
import { loadModuleData, saveModuleData } from '../lib/remoteStore'

type Decision = {
  id: number
  title: string
  outcome: 'Positive' | 'Negative' | 'Neutral'
  emotionBefore: number
  emotionAfter: number
  risk: 'Low' | 'Medium' | 'High'
  expected: string
  confidence: 'Low' | 'Medium' | 'High'
  followUp: string
  date: string
  reviewDue: string
  tags: string
  learning: string
  context: string
  principles: string
  goal: string
  cost: string
  upside: string
  downside: string
  alternatives: string
  reversibility: string
  isUrgent?: boolean
  isImportant?: boolean
  collaboration?: 'Solo' | 'Collaborative'
}

type DecisionWin = {
  id: number
  date: string
  highlight: string
  impact: string
}

const Decisions: React.FC = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [darkMode, setDarkMode] = useState(false)

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
  const inputBase = darkMode
    ? 'border-slate-700 bg-slate-900 text-slate-100 placeholder:text-slate-500'
    : 'border'

  const [decisions, setDecisions] = useLocalStorage<Decision[]>('decisionsData', (() => {
    const saved = localStorage.getItem('decisionsData')
      || localStorage.getItem('decisionData')
      || localStorage.getItem('decisionLogs')
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Partial<Decision>[]
        return parsed.map((item, index) => ({
          id: item.id ?? Date.now() + index,
          title: item.title ?? '',
          outcome: item.outcome ?? 'Neutral',
          emotionBefore: item.emotionBefore ?? 5,
          emotionAfter: item.emotionAfter ?? 5,
          risk: item.risk ?? 'Medium',
          expected: item.expected ?? '',
          confidence: item.confidence ?? 'Medium',
          followUp: item.followUp ?? 'Chưa theo dõi',
          date: item.date ?? '',
          reviewDue: item.reviewDue ?? '',
          tags: item.tags ?? '',
          learning: item.learning ?? '',
          context: item.context ?? '',
          principles: item.principles ?? '',
          goal: item.goal ?? '',
          cost: item.cost ?? '',
          upside: item.upside ?? '',
          downside: item.downside ?? '',
          alternatives: item.alternatives ?? '',
          reversibility: item.reversibility ?? 'Medium',
          isUrgent: item.isUrgent ?? false,
          isImportant: item.isImportant ?? true,
          collaboration: item.collaboration ?? 'Solo'
        }))
      } catch (err) {
        console.error('Failed to parse decisions', err)
      }
    }
    return []
  })())
  const [wins, setWins] = useLocalStorage<DecisionWin[]>('decisionWins', [
    { id: 1, date: '2026-02-01', highlight: 'Chốt quyết định đầu tư đúng thời điểm', impact: 'Lợi nhuận +15% trong 2 tuần' }
  ])
  const [winDraft, setWinDraft] = useState<Omit<DecisionWin, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    highlight: '',
    impact: ''
  })

  const blankDecision: Omit<Decision, 'id'> = {
    title: '',
    outcome: 'Neutral',
    emotionBefore: 5,
    emotionAfter: 5,
    risk: 'Medium',
    expected: '',
    confidence: 'Medium',
    followUp: 'Chưa theo dõi',
    date: new Date().toISOString().split('T')[0],
    reviewDue: '',
    tags: '',
    learning: '',
    context: '',
    principles: '',
    goal: '',
    cost: '',
    upside: '',
    downside: '',
    alternatives: '',
    reversibility: 'Medium',
    isUrgent: false,
    isImportant: true,
    collaboration: 'Solo'
  }

  const [draft, setDraft] = useState<Omit<Decision, 'id'>>(blankDecision)
  const [quickDraft, setQuickDraft] = useState({
    title: '',
    goal: '',
    principles: '',
    emotionBefore: 5,
    isUrgent: false,
    isImportant: true,
    collaboration: 'Solo' as Decision['collaboration']
  })
  const [showAddModal, setShowAddModal] = useState(false)
  const [expandedFormula, setExpandedFormula] = useState<number | null>(null)
  const [expandedResult, setExpandedResult] = useState<number | null>(null)
  const [filters, setFilters] = useState({
    urgency: 'all' as 'all' | 'urgent' | 'not_urgent',
    importance: 'all' as 'all' | 'important' | 'normal',
    collaboration: 'all' as 'all' | 'solo' | 'collab',
    principle: ''
  })
  const [celebrateId, setCelebrateId] = useState<number | null>(null)

  const emotionOptions = [
    { label: '😡', value: 1, hint: 'Rất tệ' },
    { label: '😣', value: 3, hint: 'Căng thẳng' },
    { label: '😐', value: 5, hint: 'Lưng chừng' },
    { label: '🙂', value: 7, hint: 'Tạm ổn' },
    { label: '😎', value: 8, hint: 'Tự tin' },
    { label: '🤩', value: 10, hint: 'Rất tốt / hứng khởi' }
  ]

  const emotionSwatch: Record<number, string> = {
    1: 'bg-rose-500/15 text-rose-600 border border-rose-500/30',
    3: 'bg-amber-500/15 text-amber-600 border border-amber-500/30',
    5: 'bg-slate-500/10 text-slate-600 border border-slate-400/30',
    7: 'bg-sky-500/15 text-sky-600 border border-sky-500/30',
    8: 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30',
    10: 'bg-fuchsia-500/15 text-fuchsia-600 border border-fuchsia-500/30'
  }

  const renderPill = (label: string, color: string) => (
    <span className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${color}`}>
      {label}
    </span>
  )

  const getEmotionDisplay = (val?: number) => emotionOptions.find((o) => o.value === val)

  const outcomeColor = {
    Positive: 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30',
    Neutral: 'bg-slate-500/10 text-slate-600 border border-slate-400/30',
    Negative: 'bg-rose-500/15 text-rose-600 border border-rose-500/30'
  }

  const statusBadge = (followUp?: string) => {
    const lower = (followUp || '').toLowerCase()
    if (lower.includes('done') || lower.includes('success') || lower.includes('hoàn')) return renderPill('Hoàn thành', 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30')
    if (lower.includes('đang') || lower.includes('doing')) return renderPill('Đang làm', 'bg-sky-500/15 text-sky-600 border border-sky-500/30')
    return renderPill('Chưa theo dõi', 'bg-slate-500/10 text-slate-600 border border-slate-400/30')
  }

  const playCelebrate = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=')
      audio.play().catch(() => {})
    } catch (e) {
      // ignore
    }
  }

  const markCompleted = (id: number) => {
    updateDecision(id, { followUp: 'Done' })
    setCelebrateId(id)
    playCelebrate()
    setTimeout(() => setCelebrateId(null), 1500)
  }

  const addDecision = (e: React.FormEvent) => {
    e.preventDefault()
    setDecisions((prev) => [{ id: Date.now(), ...draft }, ...prev])
    setDraft(blankDecision)
    setShowAddModal(false)
  }

  const addQuickDecision = (e: React.FormEvent) => {
    e.preventDefault()
    if (!quickDraft.title.trim()) return
    setDecisions((prev) => [{
      id: Date.now(),
      ...blankDecision,
      ...quickDraft,
      emotionAfter: quickDraft.emotionBefore
    }, ...prev])
    setQuickDraft({ title: '', goal: '', principles: '', emotionBefore: 5, isUrgent: false, isImportant: true, collaboration: 'Solo' })
  }

  const addWin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!winDraft.highlight.trim()) return
    setWins((prev) => [{ id: Date.now(), ...winDraft }, ...prev])
    setWinDraft({ date: new Date().toISOString().split('T')[0], highlight: '', impact: '' })
  }

  const updateDecision = (id: number, partial: Partial<Decision>) => {
    setDecisions((prev) => prev.map((d) => (d.id === id ? { ...d, ...partial } : d)))
  }

  const markFollowUp = (id: number, status: string) => updateDecision(id, { followUp: status })
  const quickReviewToday = (id: number) => updateDecision(id, { reviewDue: new Date().toISOString().split('T')[0] })

  const riskyDecisions = useMemo(() => decisions.filter((d) => d.risk === 'High' && d.confidence !== 'High'), [decisions])
  const pendingFollowUps = useMemo(() => decisions.filter((d) => d.followUp !== 'Success' && d.followUp !== 'Done'), [decisions])

  const monthlyInsights = useMemo(() => {
    const positive = decisions.filter((d) => d.outcome === 'Positive').length
    const negative = decisions.filter((d) => d.outcome === 'Negative').length
    const avgDelta = decisions.length ? Math.round(decisions.reduce((s, d) => s + (d.emotionAfter - d.emotionBefore), 0) / decisions.length) : 0
    return { positive, negative, avgDelta }
  }, [decisions])

  // Sync with Supabase (per user) + fallback localStorage
  useEffect(() => {
    if (!user) return
    let mounted = true
    ;(async () => {
      try {
        const remote = await loadModuleData<Decision[]>('decisions', user.id)
        if (remote && mounted) {
          setDecisions(remote)
        } else if (!remote) {
          await saveModuleData('decisions', user.id, decisions)
        }
      } catch (err) {
        console.error('Sync decisions load failed', err)
      }
    })()
    return () => { mounted = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  useEffect(() => {
    if (!user) return
    ;(async () => {
      try {
        await saveModuleData('decisions', user.id, decisions)
      } catch (err) {
        console.error('Sync decisions save failed', err)
      }
    })()
  }, [decisions, user])

  const decisionInsights = useMemo(() => {
    const total = decisions.length
    const positive = decisions.filter((d) => d.outcome === 'Positive').length
    const highRisk = decisions.filter((d) => d.risk === 'High').length
    const overdue = decisions.filter((d) => d.reviewDue && new Date(d.reviewDue) < new Date()).length
    const successRate = total ? Math.round((positive / total) * 100) : 0
    return { total, highRisk, overdue, successRate }
  }, [decisions])

  const filteredDecisions = useMemo(() => {
    return decisions.filter((d) => {
      if (filters.urgency === 'urgent' && !d.isUrgent) return false
      if (filters.urgency === 'not_urgent' && d.isUrgent) return false
      if (filters.importance === 'important' && !d.isImportant) return false
      if (filters.importance === 'normal' && d.isImportant) return false
      if (filters.collaboration === 'solo' && d.collaboration === 'Collaborative') return false
      if (filters.collaboration === 'collab' && d.collaboration === 'Solo') return false
      if (filters.principle && !d.principles.toLowerCase().includes(filters.principle.toLowerCase())) return false
      return true
    })
  }, [decisions, filters])

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">{t('decisions.title')}</h1>

      <div className={`text-sm p-4 rounded-lg mb-4 border ${darkMode ? 'bg-blue-900/20 border-blue-800 text-blue-100' : 'bg-blue-50 border-blue-100 text-blue-900'}`}>
        <p className="font-semibold mb-2">Flow quyết định (customer-centric):</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Bối cảnh & đích đến: quyết định này phục vụ mục tiêu nào?</li>
          <li>Nguyên tắc cá nhân nào áp dụng? Ai cần thông báo/phê duyệt?</li>
          <li>Kỳ vọng, rủi ro, phương án dự phòng.</li>
          <li>Chấm cảm xúc trước/sau, confidence, risk (không chỉ tài chính).</li>
          <li>Đặt ngày review (30-90 ngày), tiêu chí thành công, và log bài học.</li>
        </ol>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className={`p-4 rounded-lg shadow border ${cardBase}`}>
          <h3 className="text-lg font-semibold mb-3">Daily Decision Ops</h3>
          <form onSubmit={addQuickDecision} className="grid grid-cols-1 gap-2 text-sm">
            <input className={`px-3 py-2 rounded ${inputBase}`} placeholder="Quyết định" value={quickDraft.title} onChange={(e) => setQuickDraft({ ...quickDraft, title: e.target.value })} required />
            <input className={`px-3 py-2 rounded ${inputBase}`} placeholder="Đích đến" value={quickDraft.goal} onChange={(e) => setQuickDraft({ ...quickDraft, goal: e.target.value })} />
            <input className={`px-3 py-2 rounded ${inputBase}`} placeholder="Nguyên tắc" value={quickDraft.principles} onChange={(e) => setQuickDraft({ ...quickDraft, principles: e.target.value })} />
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="opacity-70">Cảm xúc:</span>
              {emotionOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`px-2 py-1 rounded border transition ${emotionSwatch[opt.value]} ${quickDraft.emotionBefore === opt.value ? 'ring-2 ring-blue-400 shadow' : 'opacity-80 hover:opacity-100'}`}
                  onClick={() => setQuickDraft({ ...quickDraft, emotionBefore: opt.value })}
                  title={opt.hint}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={quickDraft.isUrgent} onChange={(e) => setQuickDraft({ ...quickDraft, isUrgent: e.target.checked })} />Gấp</label>
              <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={quickDraft.isImportant} onChange={(e) => setQuickDraft({ ...quickDraft, isImportant: e.target.checked })} />Quan trọng</label>
              <select className={`px-3 py-2 rounded ${inputBase}`} value={quickDraft.collaboration} onChange={(e) => setQuickDraft({ ...quickDraft, collaboration: e.target.value as Decision['collaboration'] })}>
                <option value="Solo">Solo</option>
                <option value="Collaborative">Phối hợp</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button type="reset" className="px-3 py-2 rounded border" onClick={() => setQuickDraft({ title: '', goal: '', principles: '', emotionBefore: 5, isUrgent: false, isImportant: true, collaboration: 'Solo' })}>Xóa</button>
              <button type="submit" className="px-3 py-2 rounded bg-blue-600 text-white">Lưu nhanh</button>
            </div>
          </form>
        </div>
        <div className={`p-4 rounded-lg shadow border ${cardBase}`}>
          <h3 className="text-lg font-semibold mb-2">Wins & Outcomes</h3>
          <form onSubmit={addWin} className="space-y-2 text-sm">
            <input className={`px-3 py-2 rounded w-full ${inputBase}`} type="date" value={winDraft.date} onChange={(e) => setWinDraft({ ...winDraft, date: e.target.value })} />
            <input className={`px-3 py-2 rounded w-full ${inputBase}`} placeholder="Thành quả quyết định" value={winDraft.highlight} onChange={(e) => setWinDraft({ ...winDraft, highlight: e.target.value })} />
            <input className={`px-3 py-2 rounded w-full ${inputBase}`} placeholder="Tác động (kết quả/tài chính)" value={winDraft.impact} onChange={(e) => setWinDraft({ ...winDraft, impact: e.target.value })} />
            <button className="px-3 py-2 rounded bg-emerald-600 text-white text-xs" type="submit">Lưu thành quả</button>
          </form>
          <div className="mt-3 space-y-2 text-xs">
            {wins.slice(0, 3).map((win) => (
              <div key={win.id} className={`p-2 rounded border ${darkMode ? 'bg-slate-900/70 border-slate-700 text-slate-100' : 'bg-gray-50 border-gray-200 text-slate-900'}`}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{win.highlight}</span>
                  <span className="opacity-70">{win.date}</span>
                </div>
                <p className="mt-1 opacity-80">{win.impact || '—'}</p>
              </div>
            ))}
          </div>
        </div>
        <div className={`p-4 rounded-lg shadow border ${cardBase}`}>
          <h3 className="text-lg font-semibold mb-2">Tổng quan</h3>
          <ul className={`text-sm space-y-1 ${darkMode ? 'text-slate-200' : 'text-gray-700'}`}>
            <li>Success rate: <strong>{decisionInsights.successRate}%</strong></li>
            <li>High risk: <strong>{decisionInsights.highRisk}</strong></li>
            <li>Overdue review: <strong>{decisionInsights.overdue}</strong></li>
            <li>Total: <strong>{decisionInsights.total}</strong></li>
          </ul>
        </div>
      </section>

      <section className="space-y-3 mb-10">
        {filteredDecisions.map((d) => (
          <div key={d.id} className={`relative p-4 rounded-lg shadow border ${cardBase}`}>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-semibold">{d.title || 'Untitled'}</h3>
                    {renderPill(d.outcome || 'Neutral', outcomeColor[d.outcome] || outcomeColor.Neutral)}
                    {getEmotionDisplay(d.emotionBefore) && renderPill(getEmotionDisplay(d.emotionBefore)!.label, emotionSwatch[d.emotionBefore] || emotionSwatch[5])}
                    {statusBadge(d.followUp)}
                    {d.isUrgent && renderPill('Gấp', 'bg-red-500/15 text-red-600 border border-red-500/30')}
                    {d.isImportant && renderPill('Quan trọng', 'bg-amber-500/15 text-amber-600 border border-amber-500/30')}
                    {d.collaboration === 'Collaborative' && renderPill('Cần phối hợp', 'bg-indigo-500/15 text-indigo-600 border border-indigo-500/30')}
                    {d.tags && renderPill(d.tags, 'bg-slate-500/10 text-slate-600 border border-slate-400/30')}
                  </div>
                  <p className={`text-sm ${darkMode ? 'text-slate-200' : 'text-gray-700'}`}>{d.goal || d.expected}</p>
                  <div className={`text-xs flex flex-wrap gap-2 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                    <span>Nguyên tắc: <strong className={darkMode ? 'text-slate-200' : 'text-gray-800'}>{d.principles || '—'}</strong></span>
                    {d.reviewDue && <span>• Review: {d.reviewDue}</span>}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-1 rounded border">Risk {d.risk}</span>
                    <span className="px-2 py-1 rounded border">Conf {d.confidence}</span>
                    <span className="px-2 py-1 rounded border">Cảm xúc {d.emotionBefore}→{d.emotionAfter}</span>
                    <span className="px-2 py-1 rounded border">Follow-up: {d.followUp || 'Pending'}</span>
                  </div>
                </div>
                <div className="flex gap-2 text-sm">
                  <button className="px-3 py-2 rounded border" onClick={() => setExpandedFormula((prev) => (prev === d.id ? null : d.id))}>
                    Công thức đối trị
                  </button>
                  <button className="px-3 py-2 rounded border" onClick={() => setExpandedResult((prev) => (prev === d.id ? null : d.id))}>
                    Cập nhật kết quả
                  </button>
                  <button className="px-3 py-2 rounded border bg-emerald-50 text-emerald-700" onClick={() => markCompleted(d.id)}>
                    Hoàn thành 🎉
                  </button>
                </div>
              </div>
              {d.context && <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>{d.context}</p>}
            </div>
            {celebrateId === d.id && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-4xl animate-pulse select-none">
                <span>🎉 🎊 🥳</span>
              </div>
            )}
            {expandedFormula === d.id && (
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="md:col-span-2 flex items-center gap-2 flex-wrap text-xs">
                  <span className="opacity-70">Cảm xúc:</span>
                  {emotionOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`px-2 py-1 rounded border transition ${emotionSwatch[opt.value]} ${d.emotionBefore === opt.value ? 'ring-2 ring-blue-400 shadow' : 'opacity-80 hover:opacity-100'}`}
                      onClick={() => updateDecision(d.id, { emotionBefore: opt.value, emotionAfter: opt.value })}
                      title={opt.hint}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <input className={`px-3 py-2 rounded ${inputBase}`} placeholder="Bối cảnh" value={d.context} onChange={(e) => updateDecision(d.id, { context: e.target.value })} />
                <input className={`px-3 py-2 rounded ${inputBase}`} placeholder="Đích đến" value={d.goal} onChange={(e) => updateDecision(d.id, { goal: e.target.value })} />
                <input className={`px-3 py-2 rounded ${inputBase}`} placeholder="Nguyên tắc" value={d.principles} onChange={(e) => updateDecision(d.id, { principles: e.target.value })} />
                <input className={`px-3 py-2 rounded ${inputBase}`} placeholder="Cost / nguồn lực" value={d.cost} onChange={(e) => updateDecision(d.id, { cost: e.target.value })} />
                <input className={`px-3 py-2 rounded ${inputBase}`} placeholder="Upside" value={d.upside} onChange={(e) => updateDecision(d.id, { upside: e.target.value })} />
                <input className={`px-3 py-2 rounded ${inputBase}`} placeholder="Downside" value={d.downside} onChange={(e) => updateDecision(d.id, { downside: e.target.value })} />
                <input className={`px-3 py-2 rounded ${inputBase}`} placeholder="Alternatives" value={d.alternatives} onChange={(e) => updateDecision(d.id, { alternatives: e.target.value })} />
                <select className={`px-3 py-2 rounded ${inputBase}`} value={d.reversibility} onChange={(e) => updateDecision(d.id, { reversibility: e.target.value })}>
                  {['Low', 'Medium', 'High'].map((v) => <option key={v}>{v}</option>)}
                </select>
                <div className="flex items-center gap-2 text-xs">
                  <label className="flex items-center gap-2"><input type="checkbox" checked={!!d.isUrgent} onChange={(e) => updateDecision(d.id, { isUrgent: e.target.checked })} />Gấp</label>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={!!d.isImportant} onChange={(e) => updateDecision(d.id, { isImportant: e.target.checked })} />Quan trọng</label>
                  <select className={`px-3 py-2 rounded ${inputBase}`} value={d.collaboration || 'Solo'} onChange={(e) => updateDecision(d.id, { collaboration: e.target.value as Decision['collaboration'] })}>
                    <option value="Solo">Solo</option>
                    <option value="Collaborative">Phối hợp</option>
                  </select>
                </div>
              </div>
            )}
            {expandedResult === d.id && (
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <select className={`px-3 py-2 rounded ${inputBase}`} value={d.outcome} onChange={(e) => updateDecision(d.id, { outcome: e.target.value as Decision['outcome'] })}>
                  {['Positive', 'Neutral', 'Negative'].map((v) => <option key={v}>{v}</option>)}
                </select>
                <input className={`px-3 py-2 rounded w-full ${inputBase}`} type="number" min="0" max="10" value={d.emotionAfter} onChange={(e) => updateDecision(d.id, { emotionAfter: Number(e.target.value) })} placeholder="Emotion after" />
                <input className={`px-3 py-2 rounded ${inputBase}`} placeholder="Trạng thái / follow-up" value={d.followUp} onChange={(e) => updateDecision(d.id, { followUp: e.target.value })} />
                <input className={`px-3 py-2 rounded w-full ${inputBase}`} type="date" value={d.reviewDue} onChange={(e) => updateDecision(d.id, { reviewDue: e.target.value })} />
                <textarea className={`px-3 py-2 rounded md:col-span-2 ${inputBase}`} placeholder="Bài học / reflect" value={d.learning} onChange={(e) => updateDecision(d.id, { learning: e.target.value })} />
              </div>
            )}
          </div>
        ))}
      </section>

      <section className={`p-4 rounded-lg shadow mb-4 border ${cardBase}`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <h3 className="text-lg font-semibold">Bộ lọc quyết định</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm w-full md:w-auto">
            <select className={`px-3 py-2 rounded ${inputBase}`} value={filters.urgency} onChange={(e) => setFilters({ ...filters, urgency: e.target.value as typeof filters.urgency })}>
              <option value="all">Tất cả (gấp/không)</option>
              <option value="urgent">Gấp</option>
              <option value="not_urgent">Không gấp</option>
            </select>
            <select className={`px-3 py-2 rounded ${inputBase}`} value={filters.importance} onChange={(e) => setFilters({ ...filters, importance: e.target.value as typeof filters.importance })}>
              <option value="all">Quan trọng / bình thường</option>
              <option value="important">Quan trọng</option>
              <option value="normal">Không quan trọng</option>
            </select>
            <select className={`px-3 py-2 rounded ${inputBase}`} value={filters.collaboration} onChange={(e) => setFilters({ ...filters, collaboration: e.target.value as typeof filters.collaboration })}>
              <option value="all">Solo / Phối hợp</option>
              <option value="solo">Tự làm</option>
              <option value="collab">Cần phối hợp</option>
            </select>
            <input
              className={`px-3 py-2 rounded ${inputBase}`}
              placeholder="Lọc theo nguyên tắc"
              value={filters.principle}
              onChange={(e) => setFilters({ ...filters, principle: e.target.value })}
            />
          </div>
        </div>
      </section>

      <div className={`p-4 rounded-lg shadow border ${cardBase}`}>
        <h3 className="text-lg font-semibold mb-2">Hành động ưu tiên</h3>
        <div className={`space-y-2 text-sm ${darkMode ? 'text-slate-200' : 'text-gray-700'}`}>
          <div>
            <p className="font-medium">Quyết định rủi ro cao / confidence chưa cao:</p>
            <ul className="list-disc list-inside space-y-1">
              {riskyDecisions.length === 0 && <li>—</li>}
              {riskyDecisions.map((d) => (
                <li key={d.id}>
                  <span className="font-semibold">{d.title}</span> — Risk {d.risk}, Confidence {d.confidence}
                  <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Gợi ý: thêm phương án B/C, đặt trigger dừng lỗ, xin ý kiến mentor.</p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-medium">Follow-up chưa xong:</p>
            <ul className="list-disc list-inside space-y-1">
              {pendingFollowUps.length === 0 && <li>—</li>}
              {pendingFollowUps.map((d) => (
                <li key={`f-${d.id}`} className="flex justify-between items-center gap-2">
                  <div>
                    <span className="font-semibold">{d.title}</span> — {d.followUp}
                    <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Review due: {d.reviewDue || '—'}</p>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <button className="text-blue-600 underline" onClick={() => markFollowUp(d.id, 'Done')}>Đánh dấu xong</button>
                    <button className="text-amber-600 underline" onClick={() => quickReviewToday(d.id)}>Review hôm nay</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className={`p-4 rounded-lg shadow border ${cardBase}`}>
        <h3 className="text-lg font-semibold mb-2">Monthly Prompts</h3>
        <ul className={`list-disc list-inside text-sm space-y-1 ${darkMode ? 'text-slate-200' : 'text-gray-700'}`}>
          <li>Đếm: {monthlyInsights.positive} tích cực / {monthlyInsights.negative} tiêu cực. Delta cảm xúc trung bình: {monthlyInsights.avgDelta} điểm.</li>
          <li>Quyết định nào fail? Bài học, quy tắc mới là gì?</li>
          <li>Follow-up 30–90 ngày: cập nhật kết quả, tác động (tài chính/quan hệ/năng lượng).</li>
          <li>Trước khi quyết định mới: check nguyên tắc, phối hợp, phương án dự phòng.</li>
        </ul>
      </div>

      <button
        className="fixed left-6 bottom-6 w-12 h-12 rounded-full bg-blue-600 text-white text-2xl shadow-lg flex items-center justify-center"
        onClick={() => setShowAddModal(true)}
      >
        +
      </button>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
          <div className={`w-full max-w-3xl rounded-lg border shadow-lg ${cardBase}`}>
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Thêm quyết định nhanh</h3>
              <button className="text-sm" onClick={() => setShowAddModal(false)}>Đóng</button>
            </div>
            <form onSubmit={addDecision} className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <input className={`px-3 py-2 rounded ${inputBase}`} placeholder="Quyết định" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} required />
              <input className={`px-3 py-2 rounded ${inputBase}`} placeholder="Đích đến / mục tiêu" value={draft.goal} onChange={(e) => setDraft({ ...draft, goal: e.target.value })} />
              <input className={`px-3 py-2 rounded ${inputBase}`} placeholder="Nguyên tắc" value={draft.principles} onChange={(e) => setDraft({ ...draft, principles: e.target.value })} />
              <input className={`px-3 py-2 rounded ${inputBase}`} placeholder="Kỳ vọng" value={draft.expected} onChange={(e) => setDraft({ ...draft, expected: e.target.value })} />
              <select className={`px-3 py-2 rounded ${inputBase}`} value={draft.risk} onChange={(e) => setDraft({ ...draft, risk: e.target.value as Decision['risk'] })}>
                {['Low', 'Medium', 'High'].map((v) => <option key={v}>{v}</option>)}
              </select>
              <select className={`px-3 py-2 rounded ${inputBase}`} value={draft.confidence} onChange={(e) => setDraft({ ...draft, confidence: e.target.value as Decision['confidence'] })}>
                {['Low', 'Medium', 'High'].map((v) => <option key={v}>{v}</option>)}
              </select>
              <div className="md:col-span-2 flex items-center gap-2 flex-wrap text-xs">
                <span className="opacity-70">Cảm xúc:</span>
                {emotionOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`px-2 py-1 rounded border transition ${emotionSwatch[opt.value]} ${draft.emotionBefore === opt.value ? 'ring-2 ring-blue-400 shadow' : 'opacity-80 hover:opacity-100'}`}
                    onClick={() => setDraft({ ...draft, emotionBefore: opt.value, emotionAfter: opt.value })}
                    title={opt.hint}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={draft.isUrgent} onChange={(e) => setDraft({ ...draft, isUrgent: e.target.checked })} />Gấp</label>
                <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={draft.isImportant} onChange={(e) => setDraft({ ...draft, isImportant: e.target.checked })} />Quan trọng</label>
                <select className={`px-3 py-2 rounded ${inputBase}`} value={draft.collaboration} onChange={(e) => setDraft({ ...draft, collaboration: e.target.value as Decision['collaboration'] })}>
                  <option value="Solo">Solo</option>
                  <option value="Collaborative">Phối hợp</option>
                </select>
              </div>
              <input className={`px-3 py-2 rounded ${inputBase}`} type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
              <input className={`px-3 py-2 rounded ${inputBase}`} placeholder="Tags" value={draft.tags} onChange={(e) => setDraft({ ...draft, tags: e.target.value })} />
              <textarea className={`px-3 py-2 rounded md:col-span-2 ${inputBase}`} placeholder="Bối cảnh / ghi chú nhanh" value={draft.context} onChange={(e) => setDraft({ ...draft, context: e.target.value })} />
              <textarea className={`px-3 py-2 rounded md:col-span-2 ${inputBase}`} placeholder="Bài học dự kiến / trigger dừng" value={draft.learning} onChange={(e) => setDraft({ ...draft, learning: e.target.value })} />
              <div className="md:col-span-2 flex justify-end gap-2">
                <button type="button" className="px-4 py-2 rounded border" onClick={() => setShowAddModal(false)}>Hủy</button>
                <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">Lưu quyết định</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default Decisions
