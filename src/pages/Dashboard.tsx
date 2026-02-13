import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLocalStorage, useLocalStorageString } from '../hooks/useLocalStorage'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const Dashboard: React.FC = () => {
  const { t } = useTranslation()
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
  const cardSoft = darkMode
    ? 'bg-slate-900 border-slate-700 text-slate-100'
    : 'bg-gray-50 border-gray-200 text-slate-900'
  const inputBase = darkMode
    ? 'border-slate-700 bg-slate-900 text-slate-100 placeholder:text-slate-500'
    : 'border'

  const [dailyFocus, setDailyFocus] = useLocalStorageString('dashboardDailyFocus', '')
  const [dailyReflection, setDailyReflection] = useLocalStorage('dashboardDailyReflection', {
    win: '',
    blocker: '',
    energy: '6',
    gratitude: ''
  })
  const [priorities, setPriorities] = useLocalStorage<string[]>(
    'dashboardPriorities',
    ['Việc quan trọng nhất', 'Follow-up quyết định', 'Review năng lượng']
  )

  const metrics = useMemo(() => {
    const decisions = JSON.parse(localStorage.getItem('decisionsData') || '[]')
    const people = JSON.parse(localStorage.getItem('peopleRelationships') || '[]')
    const skills = JSON.parse(localStorage.getItem('skillsData') || '[]')
    const timeEnergy = JSON.parse(localStorage.getItem('timeEnergyData') || '[]')
    return [
      { label: 'Decisions logged', value: decisions.length },
      { label: 'People active', value: people.length },
      { label: 'Skills tracked', value: skills.length },
      { label: 'Energy logs', value: timeEnergy.length },
    ]
  }, [])

  const insights = useMemo(() => {
    const decisions = JSON.parse(localStorage.getItem('decisionsData') || '[]')
    const skills = JSON.parse(localStorage.getItem('skillsData') || '[]')
    const timeEnergy = JSON.parse(localStorage.getItem('timeEnergyData') || '[]')
    const avgEnergy = timeEnergy.length
      ? Math.round(timeEnergy.reduce((s: number, l: { energy_level?: string }) => s + Number(l.energy_level || 0), 0) / timeEnergy.length)
      : 0
    const pendingReviews = decisions.filter((d: { reviewDue?: string }) => d.reviewDue).length
    const topSkill = skills.length
      ? skills.sort((a: { target: number; level: number }, b: { target: number; level: number }) => (b.target - b.level) - (a.target - a.level))[0]
      : null
    return {
      avgEnergy,
      pendingReviews,
      topGap: topSkill ? `${topSkill.name} (+${Math.max(0, topSkill.target - topSkill.level)})` : '—'
    }
  }, [])

  const chartData = [
    { name: 'Oct', health: 62, transactions: 6 },
    { name: 'Nov', health: 68, transactions: 9 },
    { name: 'Dec', health: 72, transactions: 11 },
    { name: 'Jan', health: 65, transactions: 8 },
    { name: 'Feb', health: 70, transactions: 10 },
    { name: 'Mar', health: 75, transactions: 12 },
  ]

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">{t('dashboard.title')}</h1>
      
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className={`p-4 rounded-2xl border ${cardBase}`}>
          <p className="text-xs uppercase tracking-wide opacity-70">Daily Focus</p>
          <textarea
            className={`mt-2 w-full rounded px-3 py-2 text-sm min-h-[110px] ${inputBase}`}
            placeholder="Một việc quan trọng nhất hôm nay"
            value={dailyFocus}
            onChange={(e) => setDailyFocus(e.target.value)}
          />
        </div>
        <div className={`p-4 rounded-2xl border ${cardBase}`}>
          <p className="text-xs uppercase tracking-wide opacity-70">Priority checklist</p>
          <div className="mt-3 space-y-2 text-sm">
            {priorities.map((item, index) => (
              <input
                key={index}
                className={`w-full rounded px-2 py-1 ${inputBase}`}
                value={item}
                onChange={(e) => setPriorities((prev) => prev.map((p, i) => (i === index ? e.target.value : p)))}
              />
            ))}
            <button
              className="text-xs text-blue-600 underline"
              onClick={() => setPriorities((prev) => [...prev, ''])}
            >
              + Thêm ưu tiên
            </button>
          </div>
        </div>
        <div className={`p-4 rounded-2xl border ${cardBase}`}>
          <p className="text-xs uppercase tracking-wide opacity-70">Quick links</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <Link className={`px-3 py-1 rounded-full border ${cardSoft}`} to="/decisions">Decision log</Link>
            <Link className={`px-3 py-1 rounded-full border ${cardSoft}`} to="/time-energy">Time & Energy</Link>
            <Link className={`px-3 py-1 rounded-full border ${cardSoft}`} to="/skills">Skills practice</Link>
            <Link className={`px-3 py-1 rounded-full border ${cardSoft}`} to="/finance">Finance</Link>
          </div>
        </div>
      </section>

      <section className={`p-4 rounded-2xl border mb-6 ${cardBase}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Daily Reflection</h2>
          <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Ghi nhanh 2-3 phút</span>
        </div>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
          <input
            className={`px-3 py-2 rounded ${inputBase}`}
            placeholder="Win hôm nay"
            value={dailyReflection.win}
            onChange={(e) => setDailyReflection({ ...dailyReflection, win: e.target.value })}
          />
          <input
            className={`px-3 py-2 rounded ${inputBase}`}
            placeholder="Blocker chính"
            value={dailyReflection.blocker}
            onChange={(e) => setDailyReflection({ ...dailyReflection, blocker: e.target.value })}
          />
          <select
            className={`px-3 py-2 rounded ${inputBase}`}
            value={dailyReflection.energy}
            onChange={(e) => setDailyReflection({ ...dailyReflection, energy: e.target.value })}
          >
            {[1,2,3,4,5,6,7,8,9,10].map((n) => (
              <option key={n} value={n.toString()}>Energy {n}/10</option>
            ))}
          </select>
          <input
            className={`px-3 py-2 rounded ${inputBase}`}
            placeholder="Biết ơn điều gì"
            value={dailyReflection.gratitude}
            onChange={(e) => setDailyReflection({ ...dailyReflection, gratitude: e.target.value })}
          />
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {metrics.map((metric, index) => (
          <div key={index} className={`p-4 rounded-lg shadow border ${cardBase}`}>
            <h3 className="text-sm font-semibold uppercase tracking-wide opacity-70">{metric.label}</h3>
            <p className="text-3xl font-bold mt-2 text-emerald-500">{metric.value}</p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className={`p-4 rounded-2xl border ${cardBase}`}>
          <p className="text-xs uppercase tracking-wide opacity-70">Avg energy</p>
          <p className="text-2xl font-semibold mt-2">{insights.avgEnergy}/10</p>
          <p className={`text-xs mt-2 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>Trung bình theo log gần đây.</p>
        </div>
        <div className={`p-4 rounded-2xl border ${cardBase}`}>
          <p className="text-xs uppercase tracking-wide opacity-70">Pending reviews</p>
          <p className="text-2xl font-semibold mt-2">{insights.pendingReviews}</p>
          <p className={`text-xs mt-2 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>Quyết định cần review.</p>
        </div>
        <div className={`p-4 rounded-2xl border ${cardBase}`}>
          <p className="text-xs uppercase tracking-wide opacity-70">Top skill gap</p>
          <p className="text-2xl font-semibold mt-2">{insights.topGap}</p>
          <p className={`text-xs mt-2 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>Ưu tiên luyện tập tuần này.</p>
        </div>
      </section>

      <div className={`p-4 rounded-lg shadow border ${cardBase}`}>
        <h3 className="text-lg font-semibold mb-4">Life Health Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="health" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  )
}

export default Dashboard
