import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useAuth } from '../contexts/AuthContext'
import { loadModuleData, saveModuleData } from '../lib/remoteStore'

type CareerPhase = {
  id: number
  phase: 'Current' | 'Short Term' | 'Medium Term' | 'Long Term'
  title: string
  income: number
  skills: string[]
  focus: string
  targetYear: string
}

type SkillGap = {
  id: number
  skill: string
  current: number
  target: number
  plan: string
}

type CareerGoal = {
  vision: string
  northStar: string
  nextMove: string
}

type ProgressLog = {
  id: number
  date: string
  focus: string
  win: string
  blocker: string
  score: number
}

type CareerRitual = {
  id: number
  title: string
  done: boolean
}

type CareerWin = {
  id: number
  date: string
  highlight: string
  impact: string
}

type CareerPayload = {
  phases: CareerPhase[]
  rituals: CareerRitual[]
  wins: CareerWin[]
  skillGaps: SkillGap[]
  careerGoal: CareerGoal
  progressLogs: ProgressLog[]
}

const Career: React.FC = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [darkMode, setDarkMode] = useState(false)
  const [phases, setPhases] = useLocalStorage<CareerPhase[]>('careerPhases', [
      {
        id: 1,
        phase: 'Current',
        title: 'Software Developer',
        income: 60000,
        skills: ['React', 'TypeScript'],
        focus: 'Hoàn thiện frontend nền tảng, học thêm kiến trúc',
        targetYear: '2026'
      },
      {
        id: 2,
        phase: 'Short Term',
        title: 'Senior Developer',
        income: 80000,
        skills: ['Leadership', 'Architecture'],
        focus: 'Dẫn team nhỏ, tăng impact dự án',
        targetYear: '2027'
      },
      {
        id: 4,
        phase: 'Medium Term',
        title: 'Product Engineer',
        income: 90000,
        skills: ['Product Sense', 'UX', 'Stakeholder'],
        focus: 'Gắn kết sản phẩm với business impact',
        targetYear: '2028'
      },
      {
        id: 3,
        phase: 'Long Term',
        title: 'Tech Lead',
        income: 100000,
        skills: ['Management', 'Strategy'],
        focus: 'Chiến lược sản phẩm + mentoring',
        targetYear: '2029'
      }
    ])
  const [rituals, setRituals] = useLocalStorage<CareerRitual[]>('careerRituals', [
      { id: 1, title: 'Chọn 1 việc tăng skill gap', done: false },
      { id: 2, title: 'Log 1 thành quả/đột phá', done: false },
      { id: 3, title: 'Follow-up 1 người hỗ trợ/mentor', done: false }
    ])
  const [wins, setWins] = useLocalStorage<CareerWin[]>('careerWins', [
    { id: 1, date: '2026-02-01', highlight: 'Demo feature cho team', impact: 'Tăng trust + mở cơ hội lead' }
  ])
  const [winDraft, setWinDraft] = useState<Omit<CareerWin, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    highlight: '',
    impact: ''
  })
  const [skillGaps, setSkillGaps] = useLocalStorage<SkillGap[]>('careerSkillGaps', [
      { id: 1, skill: 'Thuyết trình', current: 5, target: 8, plan: 'Demo hàng tuần + video practice' },
      { id: 2, skill: 'Phản biện', current: 4, target: 7, plan: 'Viết phản biện 1 bài/tuần' },
      { id: 3, skill: 'AI workflow', current: 6, target: 9, plan: 'Xây workflow tự động hóa nội bộ' },
      { id: 4, skill: 'Stakeholder', current: 4, target: 7, plan: 'Lập stakeholder map cho 3 dự án' }
    ])
  const [careerGoal, setCareerGoal] = useLocalStorage<CareerGoal>('careerGoal', {
    vision: 'Trở thành người dẫn dắt team sản phẩm có tầm ảnh hưởng',
    northStar: 'Tạo ra sản phẩm có giá trị, tối ưu đội ngũ và thu nhập bền vững',
    nextMove: 'Xây portfolio dự án, nâng năng lực leadership'
  })
  const [progressLogs, setProgressLogs] = useLocalStorage<ProgressLog[]>('careerProgressLogs', [
      {
        id: 1,
        date: '2026-02-01',
        focus: 'Hoàn thiện module Skills',
        win: 'Đẩy xong UI + flow',
        blocker: 'Cần feedback UX',
        score: 7
      },
      {
        id: 2,
        date: '2026-01-25',
        focus: 'Chuẩn hóa tài liệu onboarding',
        win: 'Tạo checklist onboarding',
        blocker: 'Thiếu time review',
        score: 6
      }
    ])
  const [logDraft, setLogDraft] = useState<Omit<ProgressLog, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    focus: '',
    win: '',
    blocker: '',
    score: 6
  })

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
    ? 'bg-slate-900 border-slate-700 text-slate-100'
    : 'bg-white border-slate-100 text-slate-900'
  const cardSoft = darkMode
    ? 'bg-slate-900/70 border-slate-700 text-slate-100'
    : 'bg-gray-50 border-gray-200 text-slate-900'
  const inputBase = darkMode
    ? 'border-slate-700 bg-slate-900 text-slate-100 placeholder:text-slate-500'
    : 'border'

  const incomeData = phases.map(phase => ({
    phase: phase.phase,
    income: phase.income / 1000
  }))

  const avgSkillGap = useMemo(() => {
    if (!skillGaps.length) return 0
    const total = skillGaps.reduce((sum, gap) => sum + (gap.target - gap.current), 0)
    return Math.round(total / skillGaps.length)
  }, [skillGaps])

  const addLog = (e: React.FormEvent) => {
    e.preventDefault()
    setProgressLogs((prev) => [{ id: Date.now(), ...logDraft }, ...prev])
    setLogDraft({ date: new Date().toISOString().split('T')[0], focus: '', win: '', blocker: '', score: 6 })
  }

  const addWin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!winDraft.highlight.trim()) return
    setWins((prev) => [{ id: Date.now(), ...winDraft }, ...prev])
    setWinDraft({ date: new Date().toISOString().split('T')[0], highlight: '', impact: '' })
  }

  // Sync Supabase per-user with fallback localStorage
  useEffect(() => {
    if (!user) return
    let mounted = true
    ;(async () => {
      try {
        const remote = await loadModuleData<CareerPayload>('career', user.id)
        if (remote && mounted) {
          setPhases(remote.phases)
          setRituals(remote.rituals)
          setWins(remote.wins)
          setSkillGaps(remote.skillGaps)
          setCareerGoal(remote.careerGoal)
          setProgressLogs(remote.progressLogs)
        } else if (!remote) {
          await saveModuleData('career', user.id, {
            phases,
            rituals,
            wins,
            skillGaps,
            careerGoal,
            progressLogs
          })
        }
      } catch (err) {
        console.error('Sync career load failed', err)
      }
    })()
    return () => { mounted = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  useEffect(() => {
    if (!user) return
    ;(async () => {
      try {
        await saveModuleData('career', user.id, {
          phases,
          rituals,
          wins,
          skillGaps,
          careerGoal,
          progressLogs
        })
      } catch (err) {
        console.error('Sync career save failed', err)
      }
    })()
  }, [user, phases, rituals, wins, skillGaps, careerGoal, progressLogs])

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">{t('career.title')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className={`p-4 rounded-2xl border ${cardBase}`}>
          <p className="text-xs uppercase tracking-wide opacity-70">North Star</p>
          <h2 className="text-lg font-semibold mt-2">{careerGoal.northStar}</h2>
          <p className={`mt-2 text-sm ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>{careerGoal.vision}</p>
          <div className={`mt-3 text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Next move: {careerGoal.nextMove}</div>
        </div>
        <div className={`p-4 rounded-2xl border ${cardBase}`}>
          <p className="text-xs uppercase tracking-wide opacity-70">Avg skill gap</p>
          <h2 className="text-3xl font-semibold mt-2">{avgSkillGap} điểm</h2>
          <p className={`mt-2 text-sm ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>Khoảng cách trung bình giữa level hiện tại và mục tiêu.</p>
        </div>
        <div className={`p-4 rounded-2xl border ${cardBase}`}>
          <p className="text-xs uppercase tracking-wide opacity-70">Progress score</p>
          <h2 className="text-3xl font-semibold mt-2">{progressLogs.length ? Math.round(progressLogs.reduce((s, l) => s + l.score, 0) / progressLogs.length) : 0}/10</h2>
          <p className={`mt-2 text-sm ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>Điểm tự đánh giá theo log gần đây.</p>
        </div>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className={`p-4 rounded-2xl border ${cardBase}`}>
          <h3 className="text-base font-semibold mb-3">Daily Career Ops</h3>
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
          <p className={`text-sm mb-3 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>Liên kết mục tiêu nghề nghiệp với tài chính + kỹ năng.</p>
          <div className="flex flex-wrap gap-2 text-xs">
            <Link className={`px-3 py-1 rounded-full border ${cardSoft}`} to="/skills">Skills practice</Link>
            <Link className={`px-3 py-1 rounded-full border ${cardSoft}`} to="/finance">Finance target</Link>
            <Link className={`px-3 py-1 rounded-full border ${cardSoft}`} to="/decisions">Decision log</Link>
          </div>
        </div>
        <div className={`p-4 rounded-2xl border ${cardBase}`}>
          <h3 className="text-base font-semibold mb-2">Wins & Outcomes</h3>
          <form onSubmit={addWin} className="space-y-2 text-sm">
            <input className={`px-2 py-1 rounded w-full ${inputBase}`} type="date" value={winDraft.date} onChange={(e) => setWinDraft({ ...winDraft, date: e.target.value })} />
            <input className={`px-2 py-1 rounded w-full ${inputBase}`} placeholder="Thành quả nghề nghiệp" value={winDraft.highlight} onChange={(e) => setWinDraft({ ...winDraft, highlight: e.target.value })} />
            <input className={`px-2 py-1 rounded w-full ${inputBase}`} placeholder="Tác động (impact/thu nhập/cơ hội)" value={winDraft.impact} onChange={(e) => setWinDraft({ ...winDraft, impact: e.target.value })} />
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

      <section className={`p-5 rounded-2xl border mb-6 ${cardBase}`}>
        <h3 className="text-lg font-semibold mb-3">Career Vision & Goal</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <textarea
            className={`px-3 py-2 rounded min-h-[110px] ${inputBase}`}
            value={careerGoal.vision}
            onChange={(e) => setCareerGoal({ ...careerGoal, vision: e.target.value })}
            placeholder="Tầm nhìn nghề nghiệp (3-5 năm)"
          />
          <textarea
            className={`px-3 py-2 rounded min-h-[110px] ${inputBase}`}
            value={careerGoal.northStar}
            onChange={(e) => setCareerGoal({ ...careerGoal, northStar: e.target.value })}
            placeholder="North Star / mục tiêu tối thượng"
          />
          <input
            className={`px-3 py-2 rounded md:col-span-2 ${inputBase}`}
            value={careerGoal.nextMove}
            onChange={(e) => setCareerGoal({ ...careerGoal, nextMove: e.target.value })}
            placeholder="Hành động tiếp theo quan trọng nhất"
          />
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {phases.map((phase) => (
          <div key={phase.id} className={`p-4 rounded-2xl border ${cardBase}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">{phase.phase}</h3>
              <span className={`px-2 py-1 rounded text-xs ${cardSoft}`}>Target {phase.targetYear}</span>
            </div>
            <input
              className={`px-3 py-2 rounded w-full text-sm mb-2 ${inputBase}`}
              value={phase.title}
              onChange={(e) => setPhases((prev) => prev.map((p) => (p.id === phase.id ? { ...p, title: e.target.value } : p)))}
            />
            <input
              className={`px-3 py-2 rounded w-full text-sm mb-2 ${inputBase}`}
              type="number"
              value={phase.income}
              onChange={(e) => setPhases((prev) => prev.map((p) => (p.id === phase.id ? { ...p, income: Number(e.target.value) } : p)))}
            />
            <textarea
              className={`px-3 py-2 rounded w-full text-sm mb-2 ${inputBase}`}
              rows={2}
              value={phase.focus}
              onChange={(e) => setPhases((prev) => prev.map((p) => (p.id === phase.id ? { ...p, focus: e.target.value } : p)))}
              placeholder="Focus"
            />
            <input
              className={`px-3 py-2 rounded w-full text-sm mb-2 ${inputBase}`}
              value={phase.targetYear}
              onChange={(e) => setPhases((prev) => prev.map((p) => (p.id === phase.id ? { ...p, targetYear: e.target.value } : p)))}
              placeholder="Target year"
            />
            <div className="flex flex-wrap gap-1">
              {phase.skills.map((skill, skillIndex) => (
                <span key={`${phase.id}-${skillIndex}`} className={`px-2 py-1 rounded text-xs ${darkMode ? 'bg-blue-900/40 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className={`p-5 rounded-2xl border mb-6 ${cardBase}`}>
        <h3 className="text-lg font-semibold mb-4">Income Projection</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={incomeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="phase" />
            <YAxis label={{ value: 'Income (K)', angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(value) => [`$${value}K`, 'Income']} />
            <Bar dataKey="income" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section className={`p-5 rounded-2xl border mb-6 ${cardBase}`}>
        <h3 className="text-lg font-semibold mb-3">Skill Gap Analysis</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 text-sm">
          {skillGaps.map((gap) => (
            <div key={gap.id} className={`p-3 rounded-xl border ${cardSoft}`}>
              <input
                className={`px-2 py-1 rounded w-full text-sm mb-2 ${inputBase}`}
                value={gap.skill}
                onChange={(e) => setSkillGaps((prev) => prev.map((item) => (item.id === gap.id ? { ...item, skill: e.target.value } : item)))}
              />
              <div className="grid grid-cols-2 gap-2">
                <label className="flex flex-col gap-1 text-xs">
                  Current
                  <input
                    className={`px-2 py-1 rounded ${inputBase}`}
                    type="number"
                    min="0"
                    max="10"
                    value={gap.current}
                    onChange={(e) => setSkillGaps((prev) => prev.map((item) => (item.id === gap.id ? { ...item, current: Number(e.target.value) } : item)))}
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs">
                  Target
                  <input
                    className={`px-2 py-1 rounded ${inputBase}`}
                    type="number"
                    min="0"
                    max="10"
                    value={gap.target}
                    onChange={(e) => setSkillGaps((prev) => prev.map((item) => (item.id === gap.id ? { ...item, target: Number(e.target.value) } : item)))}
                  />
                </label>
              </div>
              <textarea
                className={`px-2 py-1 rounded w-full text-xs mt-2 ${inputBase}`}
                rows={2}
                value={gap.plan}
                onChange={(e) => setSkillGaps((prev) => prev.map((item) => (item.id === gap.id ? { ...item, plan: e.target.value } : item)))}
              />
            </div>
          ))}
        </div>
      </section>

      <section className={`p-5 rounded-2xl border mb-6 ${cardBase}`}>
        <h3 className="text-lg font-semibold mb-3">Weekly Progress Log</h3>
        <form onSubmit={addLog} className="grid grid-cols-1 md:grid-cols-5 gap-3 text-sm mb-4">
          <input className={`px-3 py-2 rounded ${inputBase}`} type="date" value={logDraft.date} onChange={(e) => setLogDraft({ ...logDraft, date: e.target.value })} />
          <input className={`px-3 py-2 rounded md:col-span-2 ${inputBase}`} placeholder="Focus tuần này" value={logDraft.focus} onChange={(e) => setLogDraft({ ...logDraft, focus: e.target.value })} />
          <input className={`px-3 py-2 rounded md:col-span-2 ${inputBase}`} placeholder="Win lớn nhất" value={logDraft.win} onChange={(e) => setLogDraft({ ...logDraft, win: e.target.value })} />
          <input className={`px-3 py-2 rounded md:col-span-3 ${inputBase}`} placeholder="Blocker / cần hỗ trợ" value={logDraft.blocker} onChange={(e) => setLogDraft({ ...logDraft, blocker: e.target.value })} />
          <input className={`px-3 py-2 rounded ${inputBase}`} type="number" min="0" max="10" value={logDraft.score} onChange={(e) => setLogDraft({ ...logDraft, score: Number(e.target.value) })} />
          <button className="px-4 py-2 rounded bg-emerald-600 text-white md:col-span-1" type="submit">Lưu log</button>
        </form>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {progressLogs.slice(0, 6).map((log) => (
            <div key={log.id} className={`p-3 rounded-xl border ${cardSoft}`}>
              <div className="flex items-center justify-between">
                <p className="font-semibold">{log.date}</p>
                <span className="text-xs font-semibold">{log.score}/10</span>
              </div>
              <p className={`mt-1 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>Focus: {log.focus || '—'}</p>
              <p className={`mt-1 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>Win: {log.win || '—'}</p>
              <p className={`mt-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Blocker: {log.blocker || '—'}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

export default Career
