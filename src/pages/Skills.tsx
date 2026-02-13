import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLocalStorage, useLocalStorageString } from '../hooks/useLocalStorage'
import { useAuth } from '../contexts/AuthContext'
import { loadModuleData, saveModuleData } from '../lib/remoteStore'

type SkillLog = {
  date: string
  time: string
  note: string
  rating: number
  sourceType?: 'Course' | 'Meeting' | 'Practice' | 'Reading' | 'Other'
  sourceName?: string
  takeaways?: string
  duration?: string
}

type SkillSchedule = {
  id: number
  date: string
  timeBlock: string
  skillId: number
  focus: string
  note: string
}

type Skill = {
  id: number
  name: string
  category: string
  level: number
  target: number
  focus: string
  notes: string
  milestone?: string
  nextAction?: string
  lastPractice?: string
  logs: SkillLog[]
}

type AppSettings = { darkMode?: boolean }

type SkillRitual = {
  id: number
  title: string
  done: boolean
}

type SkillWin = {
  id: number
  date: string
  highlight: string
  impact: string
}

type SkillDraft = Omit<Skill, 'id' | 'logs'> & { logs?: SkillLog[] }

type SkillsPayload = {
  skills: Skill[]
  rituals: SkillRitual[]
  wins: SkillWin[]
  schedule: SkillSchedule[]
  focusSprint: string
}

const defaultSkills: Skill[] = [
  {
    id: 1,
    name: 'Giao tiếp',
    category: 'Core',
    level: 6,
    target: 9,
    focus: 'Lắng nghe chủ động, tóm tắt rõ ràng',
    notes: 'Tập ghi lại key takeaways sau mỗi cuộc họp',
    milestone: 'Nhận feedback tích cực từ 3 người trong tháng',
    nextAction: 'Tóm tắt lại 3 cuộc họp tuần này',
    lastPractice: '2026-02-01',
    logs: [{ date: '2026-02-01', time: '09:00', note: '1:1 với team, phản hồi tích cực', rating: 7 }]
  },
  {
    id: 2,
    name: 'Thuyết trình',
    category: 'Core',
    level: 5,
    target: 8,
    focus: 'Hook 30s + storytelling',
    notes: 'Chuẩn bị demo story + key slide',
    milestone: 'Demo 2 lần/tuần trong 1 tháng',
    nextAction: 'Lên outline hook 30s',
    lastPractice: '2026-01-28',
    logs: [{ date: '2026-01-28', time: '15:00', note: 'Demo sprint, còn thiếu nhấn nhá', rating: 6 }]
  },
  {
    id: 3,
    name: 'AI',
    category: 'Tech',
    level: 6,
    target: 9,
    focus: 'Ứng dụng LLM vào workflow',
    notes: 'Thiết kế prompt + check output',
    milestone: 'Xây 1 workflow tự động hóa hoàn chỉnh',
    nextAction: 'Thử nghiệm pipeline cho nội dung',
    lastPractice: '2026-01-30',
    logs: [{ date: '2026-01-30', time: '10:30', note: 'Xây pipeline draft content', rating: 7 }]
  },
  {
    id: 4,
    name: 'Tư duy hệ thống',
    category: 'Core',
    level: 5,
    target: 8,
    focus: 'Khung hệ thống hóa vấn đề phức tạp',
    notes: 'Mỗi tuần viết 1 bản đồ vấn đề',
    milestone: 'Hoàn thiện 4 bản đồ trong tháng',
    nextAction: 'Vẽ mindmap dự án tuần này',
    lastPractice: '2026-02-02',
    logs: [{ date: '2026-02-02', time: '18:30', note: 'Vẽ mindmap module People', rating: 7 }]
  }
]

const blankDraft: SkillDraft = {
  name: '',
  category: 'Core',
  level: 5,
  target: 8,
  focus: '',
  notes: '',
  milestone: '',
  nextAction: '',
  lastPractice: '',
  logs: []
}

const Skills: React.FC = () => {
  const { user } = useAuth()
  const [skills, setSkills] = useLocalStorage<Skill[]>('skillsData', defaultSkills)
  const [rituals, setRituals] = useLocalStorage<SkillRitual[]>('skillRituals', [
    { id: 1, title: 'Chọn 1 kỹ năng focus hôm nay', done: false },
    { id: 2, title: 'Log 1 buổi luyện tập', done: false },
    { id: 3, title: 'Review gap lớn nhất', done: false }
  ])
  const [wins, setWins] = useLocalStorage<SkillWin[]>('skillWins', [
    { id: 1, date: '2026-02-01', highlight: 'Thuyết trình trôi chảy hơn', impact: 'Tăng tự tin khi demo' }
  ])
  const [winDraft, setWinDraft] = useState<Omit<SkillWin, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    highlight: '',
    impact: ''
  })
  const [focusSprint, setFocusSprint] = useLocalStorageString('skillFocusSprint', '')
  const [draft, setDraft] = useState<SkillDraft>(blankDraft)
  const [logDraft, setLogDraft] = useState<{ skillId: number | ''; date: string; time: string; rating: number; note: string; sourceType: SkillLog['sourceType']; sourceName: string; takeaways: string; duration: string }>({
    skillId: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    rating: 6,
    note: '',
    sourceType: 'Practice',
    sourceName: '',
    takeaways: '',
    duration: ''
  })
  const [schedule, setSchedule] = useLocalStorage<SkillSchedule[]>('skillCalendar', [])
  const [scheduleDraft, setScheduleDraft] = useState<Omit<SkillSchedule, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    timeBlock: '07:00-08:00',
    skillId: 0,
    focus: '',
    note: ''
  })
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings) as AppSettings
        setDarkMode(Boolean(parsed.darkMode))
      } catch (err) {
        console.error('Failed to parse app settings', err)
      }
    }

    const handleSettings = (event: Event) => {
      const detail = (event as CustomEvent<AppSettings>).detail
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

  const summary = useMemo(() => {
    const avg = skills.length ? Math.round(skills.reduce((s, item) => s + item.level, 0) / skills.length) : 0
    const avgTarget = skills.length ? Math.round(skills.reduce((s, item) => s + item.target, 0) / skills.length) : 0
    const focused = skills.filter((item) => (item.focus || '').trim()).length
    return { avg, avgTarget, focused }
  }, [skills])

  const scheduleByDate = useMemo(() => {
    const grouped = schedule.reduce<Record<string, SkillSchedule[]>>((acc, item) => {
      acc[item.date] = acc[item.date] ? [...acc[item.date], item] : [item]
      return acc
    }, {})
    return Object.entries(grouped)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, items]) => ({
        date,
        items: items.slice().sort((a, b) => a.timeBlock.localeCompare(b.timeBlock))
      }))
  }, [schedule])

  const topGaps = useMemo(() => {
    return [...skills]
      .sort((a, b) => (b.target - b.level) - (a.target - a.level))
      .slice(0, 3)
  }, [skills])

  const skillInsights = useMemo(() => {
    const allLogs = skills.flatMap((skill) => skill.logs || [])
    const avgRating = allLogs.length
      ? Math.round(allLogs.reduce((s, l) => s + l.rating, 0) / allLogs.length)
      : 0
    const staleSkills = skills.filter((skill) => {
      if (!skill.lastPractice) return true
      const days = (new Date().getTime() - new Date(skill.lastPractice).getTime()) / (1000 * 60 * 60 * 24)
      return days >= 14
    })
    const mostPracticed = skills
      .map((skill) => ({ name: skill.name, count: skill.logs?.length || 0 }))
      .sort((a, b) => b.count - a.count)[0]
    return {
      avgRating,
      staleCount: staleSkills.length,
      mostPracticed: mostPracticed?.name || '—'
    }
  }, [skills])

  const addSkill = (e: React.FormEvent) => {
    e.preventDefault()
    const next: Skill = {
      id: Date.now(),
      ...draft,
      level: Number(draft.level),
      target: Number(draft.target),
      logs: draft.logs ?? []
    }
    setSkills((prev) => [next, ...prev])
    setDraft(blankDraft)
  }

  const addLog = (e: React.FormEvent) => {
    e.preventDefault()
    if (!logDraft.skillId) return
    setSkills((prev) => prev.map((item) => {
      if (item.id !== logDraft.skillId) return item
      const nextLog: SkillLog = {
        date: logDraft.date,
        time: logDraft.time,
        note: logDraft.note,
        rating: Number(logDraft.rating),
        sourceType: logDraft.sourceType,
        sourceName: logDraft.sourceName,
        takeaways: logDraft.takeaways,
        duration: logDraft.duration
      }
      return {
        ...item,
        lastPractice: logDraft.date,
        logs: [nextLog, ...item.logs]
      }
    }))
    setLogDraft({
      skillId: '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      rating: 6,
      note: '',
      sourceType: 'Practice',
      sourceName: '',
      takeaways: '',
      duration: ''
    })
  }

  const addSchedule = (e: React.FormEvent) => {
    e.preventDefault()
    if (!scheduleDraft.skillId || !scheduleDraft.focus.trim()) return
    setSchedule((prev) => [{ id: Date.now(), ...scheduleDraft }, ...prev])
    setScheduleDraft({ date: new Date().toISOString().split('T')[0], timeBlock: '07:00-08:00', skillId: 0, focus: '', note: '' })
  }

  const addWin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!winDraft.highlight.trim()) return
    setWins((prev) => [{ id: Date.now(), ...winDraft }, ...prev])
    setWinDraft({ date: new Date().toISOString().split('T')[0], highlight: '', impact: '' })
  }

  const updateSkill = (id: number, updates: Partial<Skill>) => {
    setSkills((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)))
  }

  // Sync Supabase per-user with fallback localStorage
  useEffect(() => {
    if (!user) return
    let mounted = true
    ;(async () => {
      try {
        const remote = await loadModuleData<SkillsPayload>('skills', user.id)
        if (remote && mounted) {
          setSkills(remote.skills)
          setRituals(remote.rituals)
          setWins(remote.wins)
          setSchedule(remote.schedule)
          setFocusSprint(remote.focusSprint)
        } else if (!remote) {
          await saveModuleData('skills', user.id, {
            skills,
            rituals,
            wins,
            schedule,
            focusSprint
          })
        }
      } catch (err) {
        console.error('Sync skills load failed', err)
      }
    })()
    return () => { mounted = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  useEffect(() => {
    if (!user) return
    ;(async () => {
      try {
        await saveModuleData('skills', user.id, {
          skills,
          rituals,
          wins,
          schedule,
          focusSprint
        })
      } catch (err) {
        console.error('Sync skills save failed', err)
      }
    })()
  }, [user, skills, rituals, wins, schedule, focusSprint])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Skills Tracker</h1>
          <p className={darkMode ? 'text-slate-400 text-sm' : 'text-gray-500 text-sm'}>Theo dõi kỹ năng, mức độ hiện tại, mục tiêu và log luyện tập.</p>
        </div>
        <div className={`flex items-center gap-4 rounded-xl border px-4 py-2 text-sm ${cardSoft}`}>
          <div>
            <p className="text-xs uppercase tracking-wide opacity-70">Avg level</p>
            <p className="text-lg font-semibold">{summary.avg}/10</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide opacity-70">Avg target</p>
            <p className="text-lg font-semibold">{summary.avgTarget}/10</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide opacity-70">Focus items</p>
            <p className="text-lg font-semibold">{summary.focused}</p>
          </div>
        </div>
      </div>

      <section className={`border rounded-2xl p-5 ${cardBase}`}>
        <h2 className="text-lg font-semibold mb-3">Thêm kỹ năng mới</h2>
        <form onSubmit={addSkill} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 text-sm">
          <input className={`px-3 py-2 rounded ${inputBase}`} placeholder="Tên kỹ năng" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} required />
          <input className={`px-3 py-2 rounded ${inputBase}`} placeholder="Nhóm (Core/Tech/Leadership)" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} />
          <input className={`px-3 py-2 rounded ${inputBase}`} type="number" min="0" max="10" step="1" value={draft.level} onChange={(e) => setDraft({ ...draft, level: Number(e.target.value) })} placeholder="Level" />
          <input className={`px-3 py-2 rounded ${inputBase}`} type="number" min="0" max="10" step="1" value={draft.target} onChange={(e) => setDraft({ ...draft, target: Number(e.target.value) })} placeholder="Target" />
          <input className={`px-3 py-2 rounded md:col-span-2 lg:col-span-2 ${inputBase}`} placeholder="Focus (đang ưu tiên rèn)" value={draft.focus} onChange={(e) => setDraft({ ...draft, focus: e.target.value })} />
          <input className={`px-3 py-2 rounded md:col-span-2 lg:col-span-3 ${inputBase}`} placeholder="Ghi chú nhanh" value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
          <input className={`px-3 py-2 rounded md:col-span-2 lg:col-span-3 ${inputBase}`} placeholder="Milestone" value={draft.milestone} onChange={(e) => setDraft({ ...draft, milestone: e.target.value })} />
          <input className={`px-3 py-2 rounded md:col-span-2 lg:col-span-3 ${inputBase}`} placeholder="Next action" value={draft.nextAction} onChange={(e) => setDraft({ ...draft, nextAction: e.target.value })} />
          <input className={`px-3 py-2 rounded ${inputBase}`} type="date" value={draft.lastPractice || ''} onChange={(e) => setDraft({ ...draft, lastPractice: e.target.value })} />
          <button className="px-4 py-2 rounded bg-emerald-600 text-white" type="submit">Lưu kỹ năng</button>
        </form>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`border rounded-2xl p-4 ${cardBase}`}>
          <p className="text-xs uppercase tracking-wide opacity-70">Avg practice rating</p>
          <p className="text-2xl font-semibold mt-2">{skillInsights.avgRating}/10</p>
          <p className={`text-xs mt-2 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>Trung bình log luyện tập.</p>
        </div>
        <div className={`border rounded-2xl p-4 ${cardBase}`}>
          <p className="text-xs uppercase tracking-wide opacity-70">Stale skills</p>
          <p className="text-2xl font-semibold mt-2">{skillInsights.staleCount}</p>
          <p className={`text-xs mt-2 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>Chưa luyện ≥ 14 ngày.</p>
        </div>
        <div className={`border rounded-2xl p-4 ${cardBase}`}>
          <p className="text-xs uppercase tracking-wide opacity-70">Most practiced</p>
          <p className="text-2xl font-semibold mt-2">{skillInsights.mostPracticed}</p>
          <p className={`text-xs mt-2 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>Kỹ năng luyện nhiều nhất.</p>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className={`border rounded-2xl p-4 ${cardBase}`}>
          <h2 className="text-base font-semibold mb-3">Daily Skill Ops</h2>
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
        <div className={`border rounded-2xl p-4 ${cardBase}`}>
          <h2 className="text-base font-semibold mb-2">Focus Sprint</h2>
          <textarea
            className={`w-full rounded px-3 py-2 text-sm min-h-[120px] ${inputBase}`}
            placeholder="Mục tiêu luyện tập 7-14 ngày tới"
            value={focusSprint}
            onChange={(e) => setFocusSprint(e.target.value)}
          />
          <div className="mt-3 text-xs">
            <p className={`mb-1 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>Top skill gaps:</p>
            <div className="flex flex-wrap gap-2">
              {topGaps.map((skill) => (
                <span key={skill.id} className={`px-2 py-1 rounded-full border ${cardSoft}`}>
                  {skill.name}: +{Math.max(0, skill.target - skill.level)}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className={`border rounded-2xl p-4 ${cardBase}`}>
          <h2 className="text-base font-semibold mb-2">Cross-module actions</h2>
          <p className={`text-sm mb-3 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>Kết nối luyện tập với career + decision + energy.</p>
          <div className="flex flex-wrap gap-2 text-xs">
            <Link className={`px-3 py-1 rounded-full border ${cardSoft}`} to="/career">Career goals</Link>
            <Link className={`px-3 py-1 rounded-full border ${cardSoft}`} to="/decisions">Decision log</Link>
            <Link className={`px-3 py-1 rounded-full border ${cardSoft}`} to="/time-energy">Energy check</Link>
          </div>
        </div>
      </section>

      <section className={`border rounded-2xl p-5 ${cardBase}`}>
        <h2 className="text-lg font-semibold mb-3">Wins & Outcomes</h2>
        <form onSubmit={addWin} className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
          <input className={`px-3 py-2 rounded ${inputBase}`} type="date" value={winDraft.date} onChange={(e) => setWinDraft({ ...winDraft, date: e.target.value })} />
          <input className={`px-3 py-2 rounded md:col-span-2 ${inputBase}`} placeholder="Thành quả luyện tập" value={winDraft.highlight} onChange={(e) => setWinDraft({ ...winDraft, highlight: e.target.value })} />
          <input className={`px-3 py-2 rounded md:col-span-2 ${inputBase}`} placeholder="Tác động (tự tin/hiệu suất)" value={winDraft.impact} onChange={(e) => setWinDraft({ ...winDraft, impact: e.target.value })} />
          <button className="px-4 py-2 rounded bg-emerald-600 text-white" type="submit">Lưu thành quả</button>
        </form>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {wins.slice(0, 4).map((win) => (
            <div key={win.id} className={`p-3 rounded-xl border ${cardSoft}`}>
              <div className="flex items-center justify-between">
                <span className="font-semibold">{win.highlight}</span>
                <span className="opacity-70 text-xs">{win.date}</span>
              </div>
              <p className="mt-1 text-xs opacity-80">{win.impact || '—'}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={`border rounded-2xl p-5 ${cardBase}`}>
        <h2 className="text-lg font-semibold mb-3">Log luyện tập</h2>
        <div className={`mb-3 text-xs rounded-lg border px-3 py-2 ${cardSoft}`}>
          <p className="font-semibold">Ví dụ log nhanh</p>
          <p>📚 Khóa học: “Design Thinking” → Takeaway: “Luôn test giả định trước khi build”.</p>
          <p>🤝 Cuộc gặp: 1:1 với mentor → Takeaway: “Chuẩn hóa storytelling khi demo”.</p>
        </div>
        <form onSubmit={addLog} className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
          <select className={`px-3 py-2 rounded ${inputBase}`} value={logDraft.skillId} onChange={(e) => setLogDraft({ ...logDraft, skillId: Number(e.target.value) || '' })}>
            <option value="">Chọn kỹ năng</option>
            {skills.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
          <input className={`px-3 py-2 rounded ${inputBase}`} type="date" value={logDraft.date} onChange={(e) => setLogDraft({ ...logDraft, date: e.target.value })} />
          <input className={`px-3 py-2 rounded ${inputBase}`} type="time" value={logDraft.time} onChange={(e) => setLogDraft({ ...logDraft, time: e.target.value })} />
          <select className={`px-3 py-2 rounded ${inputBase}`} value={logDraft.sourceType} onChange={(e) => setLogDraft({ ...logDraft, sourceType: e.target.value as SkillLog['sourceType'] })}>
            {['Course', 'Meeting', 'Practice', 'Reading', 'Other'].map((type) => <option key={type}>{type}</option>)}
          </select>
          <input className={`px-3 py-2 rounded md:col-span-2 ${inputBase}`} placeholder="Nguồn học (tên khóa học/cuộc gặp)" value={logDraft.sourceName} onChange={(e) => setLogDraft({ ...logDraft, sourceName: e.target.value })} />
          <input className={`px-3 py-2 rounded ${inputBase}`} type="number" min="0" max="10" step="1" value={logDraft.rating} onChange={(e) => setLogDraft({ ...logDraft, rating: Number(e.target.value) })} placeholder="Đánh giá" />
          <input className={`px-3 py-2 rounded ${inputBase}`} placeholder="Thời lượng (vd 45m)" value={logDraft.duration} onChange={(e) => setLogDraft({ ...logDraft, duration: e.target.value })} />
          <input className={`px-3 py-2 rounded md:col-span-2 ${inputBase}`} placeholder="Takeaway / điều học được" value={logDraft.takeaways} onChange={(e) => setLogDraft({ ...logDraft, takeaways: e.target.value })} />
          <input className={`px-3 py-2 rounded md:col-span-2 ${inputBase}`} placeholder="Ghi chú buổi luyện" value={logDraft.note} onChange={(e) => setLogDraft({ ...logDraft, note: e.target.value })} />
          <button className="px-4 py-2 rounded bg-blue-600 text-white md:col-span-1" type="submit">Thêm log</button>
        </form>
      </section>

      <section className={`border rounded-2xl p-5 ${cardBase}`}>
        <h2 className="text-lg font-semibold mb-3">Skill Calendar (phân bổ lịch học)</h2>
        <form onSubmit={addSchedule} className="grid grid-cols-1 md:grid-cols-5 gap-3 text-sm">
          <input className={`px-3 py-2 rounded ${inputBase}`} type="date" value={scheduleDraft.date} onChange={(e) => setScheduleDraft({ ...scheduleDraft, date: e.target.value })} />
          <input className={`px-3 py-2 rounded ${inputBase}`} placeholder="07:00-08:00" value={scheduleDraft.timeBlock} onChange={(e) => setScheduleDraft({ ...scheduleDraft, timeBlock: e.target.value })} />
          <select className={`px-3 py-2 rounded ${inputBase}`} value={scheduleDraft.skillId} onChange={(e) => setScheduleDraft({ ...scheduleDraft, skillId: Number(e.target.value) })}>
            <option value={0}>Chọn kỹ năng</option>
            {skills.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
          <input className={`px-3 py-2 rounded ${inputBase}`} placeholder="Mục tiêu buổi học" value={scheduleDraft.focus} onChange={(e) => setScheduleDraft({ ...scheduleDraft, focus: e.target.value })} />
          <input className={`px-3 py-2 rounded md:col-span-2 ${inputBase}`} placeholder="Ghi chú" value={scheduleDraft.note} onChange={(e) => setScheduleDraft({ ...scheduleDraft, note: e.target.value })} />
          <button className="px-4 py-2 rounded bg-emerald-600 text-white md:col-span-1" type="submit">Thêm lịch</button>
        </form>
        <div className="mt-4 grid grid-cols-1 gap-4 text-sm">
          {scheduleByDate.length === 0 ? (
            <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Chưa có lịch học. Thêm khung giờ để bắt đầu.</div>
          ) : (
            scheduleByDate.slice(0, 5).map((group) => (
              <div key={group.date} className={`p-3 rounded-xl border ${cardSoft}`}>
                <div className="flex items-center justify-between text-xs uppercase tracking-wide opacity-70">
                  <span>{group.date}</span>
                  <span>{group.items.length} blocks</span>
                </div>
                <div className="mt-2 space-y-2">
                  {group.items.map((item) => (
                    <div key={item.id} className={`p-2 rounded-lg border ${darkMode ? 'bg-slate-900/70 border-slate-700' : 'bg-white border-gray-200'}`}>
                      <div className="flex items-center justify-between text-xs opacity-70">
                        <span>{item.timeBlock}</span>
                        <span>{skills.find((s) => s.id === item.skillId)?.name || 'Skill'}</span>
                      </div>
                      <p className="text-sm font-semibold mt-1">{item.focus}</p>
                      <p className="text-xs opacity-70 mt-1">{item.note || '—'}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {skills.map((skill) => (
          <div key={skill.id} className={`border rounded-2xl p-4 ${cardBase}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">{skill.name}</h3>
                <p className={darkMode ? 'text-slate-400 text-sm' : 'text-gray-500 text-sm'}>{skill.category}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-semibold ${darkMode ? 'bg-slate-800 text-slate-200' : 'bg-gray-100 text-gray-700'}`}>
                {skill.level}/10 → {skill.target}/10
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
              <label className="text-xs font-semibold uppercase tracking-wide opacity-70">Focus</label>
              <textarea className={`px-3 py-2 rounded ${inputBase}`} value={skill.focus} onChange={(e) => updateSkill(skill.id, { focus: e.target.value })} rows={2} />
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
              <label className="text-xs font-semibold uppercase tracking-wide opacity-70">Milestone</label>
              <textarea className={`px-3 py-2 rounded ${inputBase}`} value={skill.milestone || ''} onChange={(e) => updateSkill(skill.id, { milestone: e.target.value })} rows={2} />
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
              <label className="text-xs font-semibold uppercase tracking-wide opacity-70">Next action</label>
              <textarea className={`px-3 py-2 rounded ${inputBase}`} value={skill.nextAction || ''} onChange={(e) => updateSkill(skill.id, { nextAction: e.target.value })} rows={2} />
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
              <label className="text-xs font-semibold uppercase tracking-wide opacity-70">Notes</label>
              <textarea className={`px-3 py-2 rounded ${inputBase}`} value={skill.notes} onChange={(e) => updateSkill(skill.id, { notes: e.target.value })} rows={2} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <label className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wide opacity-70">Level</span>
                <input className={`px-2 py-1 rounded ${inputBase}`} type="number" min="0" max="10" step="1" value={skill.level} onChange={(e) => updateSkill(skill.id, { level: Number(e.target.value) })} />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wide opacity-70">Target</span>
                <input className={`px-2 py-1 rounded ${inputBase}`} type="number" min="0" max="10" step="1" value={skill.target} onChange={(e) => updateSkill(skill.id, { target: Number(e.target.value) })} />
              </label>
              <label className="flex flex-col gap-1 col-span-2">
                <span className="text-xs uppercase tracking-wide opacity-70">Last practice</span>
                <input className={`px-2 py-1 rounded ${inputBase}`} type="date" value={skill.lastPractice || ''} onChange={(e) => updateSkill(skill.id, { lastPractice: e.target.value })} />
              </label>
            </div>

            <div className="mt-4">
              <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>Recent logs</p>
              <div className={`space-y-2 text-xs ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                {(skill.logs || []).slice(0, 3).map((log, index) => (
                  <div key={`${skill.id}-${index}`} className={`p-2 rounded-lg border ${cardSoft}`}>
                    <div className="flex items-center justify-between">
                      <span>{log.date} {log.time || ''}</span>
                      <span className="font-semibold">{log.rating}/10</span>
                    </div>
                    <p className="mt-1">{log.takeaways || log.note || '—'}</p>
                    <p className="mt-1 text-[11px] opacity-70">{log.sourceType ? `${log.sourceType}: ${log.sourceName || '—'}` : '—'}</p>
                  </div>
                ))}
                {skill.logs.length === 0 && <div className={darkMode ? 'text-slate-500' : 'text-gray-400'}>Chưa có log.</div>}
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}

export default Skills
