import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLocalStorage } from '../hooks/useLocalStorage'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { useAuth } from '../contexts/AuthContext'
import { loadModuleData, saveModuleData } from '../lib/remoteStore'

type TimeEnergyLog = {
  date: string
  sleep_hours: string
  work_hours: string
  learning_hours: string
  family_hours: string
  finance_hours: string
  leisure_hours: string
  energy_level: string
  notes: string
}

type TimeEnergyRitual = {
  id: number
  title: string
  done: boolean
}

type TimeEnergyWeekly = {
  id: number
  weekOf: string
  win: string
  blocker: string
  focus: string
}

type IntradayEnergyLog = {
  id: number
  date: string
  time: string
  energy: string
  activity: string
  source: 'Skill' | 'People' | 'Work' | 'Rest' | 'Exercise' | 'Other'
  effect: 'Boost' | 'Drain' | 'Neutral'
  note: string
}

type TimeEnergyPayload = {
  formData: TimeEnergyLog
  rituals: TimeEnergyRitual[]
  weeklyLogs: TimeEnergyWeekly[]
  intradayLogs: IntradayEnergyLog[]
  logs: TimeEnergyLog[]
}

const TimeEnergy: React.FC = () => {
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
    : 'border-gray-300'

  const [formData, setFormData] = useState<TimeEnergyLog>({
    date: new Date().toISOString().split('T')[0],
    sleep_hours: '',
    work_hours: '',
    learning_hours: '',
    family_hours: '',
    finance_hours: '',
    leisure_hours: '',
    energy_level: '5',
    notes: ''
  })
  const [rituals, setRituals] = useLocalStorage<TimeEnergyRitual[]>('timeEnergyRituals', [
    { id: 1, title: 'Chọn 1 việc giữ năng lượng cao', done: false },
    { id: 2, title: 'Ghi lại 1 mốc năng lượng trong ngày', done: false },
    { id: 3, title: 'Điều chỉnh lịch làm việc/nghỉ', done: false }
  ])
  const [weeklyLogs, setWeeklyLogs] = useLocalStorage<TimeEnergyWeekly[]>('timeEnergyWeekly', [
    { id: 1, weekOf: new Date().toISOString().split('T')[0], win: 'Giữ được 3 ngày ngủ > 7h', blocker: 'Thiếu tập trung buổi chiều', focus: 'Tối ưu lịch học & làm' }
  ])
  const [weeklyDraft, setWeeklyDraft] = useState<Omit<TimeEnergyWeekly, 'id'>>({
    weekOf: new Date().toISOString().split('T')[0],
    win: '',
    blocker: '',
    focus: ''
  })

  const [intradayLogs, setIntradayLogs] = useLocalStorage<IntradayEnergyLog[]>('timeEnergyIntraday', [
    { id: 1, date: new Date().toISOString().split('T')[0], time: '09:30', energy: '7', activity: 'Deep work: plan tuần', source: 'Work', effect: 'Boost', note: 'Tập trung cao khi tắt thông báo.' },
    { id: 2, date: new Date().toISOString().split('T')[0], time: '14:00', energy: '4', activity: 'Meeting dài', source: 'People', effect: 'Drain', note: 'Thiếu break, bị mệt.' }
  ])
  const [intradayDraft, setIntradayDraft] = useState<Omit<IntradayEnergyLog, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    energy: '6',
    activity: '',
    source: 'Work',
    effect: 'Neutral',
    note: ''
  })
  const [intradayFilters, setIntradayFilters] = useState<{ source: 'All' | IntradayEnergyLog['source']; effect: 'All' | IntradayEnergyLog['effect'] }>({
    source: 'All',
    effect: 'All'
  })

  const [logs, setLogs] = useLocalStorage<TimeEnergyLog[]>('timeEnergyData', [
    { date: new Date().toISOString().split('T')[0], sleep_hours: '7', work_hours: '6', learning_hours: '2', family_hours: '1', finance_hours: '0.5', leisure_hours: '1', energy_level: '6', notes: 'Giữ nhịp ổn, cần ngủ sớm hơn.' }
  ])

  // Sync Supabase per-user with fallback localStorage
  useEffect(() => {
    if (!user) return
    let mounted = true
    ;(async () => {
      try {
        const remote = await loadModuleData<TimeEnergyPayload>('time_energy', user.id)
        if (remote && mounted) {
          setFormData(remote.formData)
          setRituals(remote.rituals)
          setWeeklyLogs(remote.weeklyLogs)
          setIntradayLogs(remote.intradayLogs)
          setLogs(remote.logs)
        } else if (!remote) {
          await saveModuleData('time_energy', user.id, {
            formData,
            rituals,
            weeklyLogs,
            intradayLogs,
            logs
          })
        }
      } catch (err) {
        console.error('Sync time-energy load failed', err)
      }
    })()
    return () => { mounted = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  useEffect(() => {
    if (!user) return
    ;(async () => {
      try {
        await saveModuleData('time_energy', user.id, {
          formData,
          rituals,
          weeklyLogs,
          intradayLogs,
          logs
        })
      } catch (err) {
        console.error('Sync time-energy save failed', err)
      }
    })()
  }, [user, formData, rituals, weeklyLogs, intradayLogs, logs])

  const filteredIntradayLogs = intradayLogs.filter((log) => {
    const sourceMatch = intradayFilters.source === 'All' || log.source === intradayFilters.source
    const effectMatch = intradayFilters.effect === 'All' || log.effect === intradayFilters.effect
    return sourceMatch && effectMatch
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLogs((prev) => {
      const existingIndex = prev.findIndex((l) => l.date === formData.date)
      if (existingIndex === -1) return [...prev, formData]
      const next = [...prev]
      next[existingIndex] = formData
      return next
    })
    alert('Time and energy logged successfully!')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const addWeekly = (e: React.FormEvent) => {
    e.preventDefault()
    if (!weeklyDraft.win.trim() && !weeklyDraft.focus.trim()) return
    setWeeklyLogs((prev) => [{ id: Date.now(), ...weeklyDraft }, ...prev])
    setWeeklyDraft({ weekOf: new Date().toISOString().split('T')[0], win: '', blocker: '', focus: '' })
  }

  const addIntraday = (e: React.FormEvent) => {
    e.preventDefault()
    if (!intradayDraft.activity.trim()) return
    setIntradayLogs((prev) => [{ id: Date.now(), ...intradayDraft }, ...prev])
    setIntradayDraft({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      energy: '6',
      activity: '',
      source: 'Work',
      effect: 'Neutral',
      note: ''
    })
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">{t('timeEnergy.title', 'Time & Energy')}</h1>
      
      {/* Daily Log Form */}
      <div className={`p-6 rounded-lg shadow border ${cardBase}`}>
        <h3 className="text-lg font-semibold mb-4">Daily Time & Energy Log</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Date"
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            labelClassName={darkMode ? 'text-slate-200' : ''}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Sleep Hours"
              type="number"
              step="0.5"
              min="0"
              max="24"
              name="sleep_hours"
              value={formData.sleep_hours}
              onChange={handleChange}
              placeholder="8.5"
              labelClassName={darkMode ? 'text-slate-200' : ''}
            />
            
            <Input
              label="Work Hours"
              type="number"
              step="0.5"
              min="0"
              max="24"
              name="work_hours"
              value={formData.work_hours}
              onChange={handleChange}
              placeholder="8"
              labelClassName={darkMode ? 'text-slate-200' : ''}
            />
            
            <Input
              label="Learning Hours"
              type="number"
              step="0.5"
              min="0"
              max="24"
              name="learning_hours"
              value={formData.learning_hours}
              onChange={handleChange}
              placeholder="2"
              labelClassName={darkMode ? 'text-slate-200' : ''}
            />
            
            <Input
              label="Family Hours"
              type="number"
              step="0.5"
              min="0"
              max="24"
              name="family_hours"
              value={formData.family_hours}
              onChange={handleChange}
              placeholder="3"
              labelClassName={darkMode ? 'text-slate-200' : ''}
            />
            
            <Input
              label="Finance Hours"
              type="number"
              step="0.5"
              min="0"
              max="24"
              name="finance_hours"
              value={formData.finance_hours}
              onChange={handleChange}
              placeholder="1"
              labelClassName={darkMode ? 'text-slate-200' : ''}
            />
            
            <Input
              label="Leisure Hours"
              type="number"
              step="0.5"
              min="0"
              max="24"
              name="leisure_hours"
              value={formData.leisure_hours}
              onChange={handleChange}
              placeholder="1.5"
              labelClassName={darkMode ? 'text-slate-200' : ''}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-200' : 'text-gray-700'}`}>
              Energy Level (1-10)
            </label>
            <select
              name="energy_level"
              value={formData.energy_level}
              onChange={handleChange}
              className={`w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${inputBase}`}
            >
              {[1,2,3,4,5,6,7,8,9,10].map(num => (
                <option key={num} value={num.toString()}>{num}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-200' : 'text-gray-700'}`}>
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className={`w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${inputBase}`}
              placeholder="Any additional notes about your day..."
            />
          </div>
          
          <Button type="submit" className="w-full">
            Log Daily Time & Energy
          </Button>
        </form>
      </div>

      <section className={`p-6 rounded-lg shadow border mt-6 ${cardBase}`}>
        <h3 className="text-lg font-semibold mb-4">Intraday Energy Log (nhiều lần/ngày)</h3>
        <div className="mb-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <select
            className={`px-3 py-2 rounded ${inputBase}`}
            value={intradayFilters.source}
            onChange={(e) => setIntradayFilters((prev) => ({ ...prev, source: e.target.value as typeof intradayFilters.source }))}
          >
            {['All', 'Skill', 'People', 'Work', 'Rest', 'Exercise', 'Other'].map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
          <select
            className={`px-3 py-2 rounded ${inputBase}`}
            value={intradayFilters.effect}
            onChange={(e) => setIntradayFilters((prev) => ({ ...prev, effect: e.target.value as typeof intradayFilters.effect }))}
          >
            {['All', 'Boost', 'Drain', 'Neutral'].map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
          <div className={`px-3 py-2 rounded border text-xs ${darkMode ? 'border-slate-700 text-slate-300' : 'border-gray-200 text-gray-600'}`}>
            Showing {filteredIntradayLogs.length} entries
          </div>
        </div>
        <form onSubmit={addIntraday} className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
          <input
            className={`px-3 py-2 rounded ${inputBase}`}
            type="date"
            value={intradayDraft.date}
            onChange={(e) => setIntradayDraft((prev) => ({ ...prev, date: e.target.value }))}
          />
          <input
            className={`px-3 py-2 rounded ${inputBase}`}
            type="time"
            value={intradayDraft.time}
            onChange={(e) => setIntradayDraft((prev) => ({ ...prev, time: e.target.value }))}
          />
          <select
            className={`px-3 py-2 rounded ${inputBase}`}
            value={intradayDraft.energy}
            onChange={(e) => setIntradayDraft((prev) => ({ ...prev, energy: e.target.value }))}
          >
            {[1,2,3,4,5,6,7,8,9,10].map((num) => (
              <option key={num} value={num.toString()}>{num}</option>
            ))}
          </select>
          <select
            className={`px-3 py-2 rounded ${inputBase}`}
            value={intradayDraft.source}
            onChange={(e) => setIntradayDraft((prev) => ({ ...prev, source: e.target.value as IntradayEnergyLog['source'] }))}
          >
            {['Skill', 'People', 'Work', 'Rest', 'Exercise', 'Other'].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <select
            className={`px-3 py-2 rounded ${inputBase}`}
            value={intradayDraft.effect}
            onChange={(e) => setIntradayDraft((prev) => ({ ...prev, effect: e.target.value as IntradayEnergyLog['effect'] }))}
          >
            {['Boost', 'Drain', 'Neutral'].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <input
            className={`px-3 py-2 rounded md:col-span-2 ${inputBase}`}
            placeholder="Hoạt động / bối cảnh"
            value={intradayDraft.activity}
            onChange={(e) => setIntradayDraft((prev) => ({ ...prev, activity: e.target.value }))}
          />
          <input
            className={`px-3 py-2 rounded md:col-span-2 ${inputBase}`}
            placeholder="Ghi chú yếu tố hút/bổ sung năng lượng"
            value={intradayDraft.note}
            onChange={(e) => setIntradayDraft((prev) => ({ ...prev, note: e.target.value }))}
          />
          <Button type="submit" className="md:col-span-1">Thêm log</Button>
        </form>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {filteredIntradayLogs.slice(0, 6).map((log) => (
            <div key={log.id} className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-900/70 border-slate-700 text-slate-100' : 'bg-gray-50 border-gray-200 text-slate-900'}`}>
              <div className="flex items-center justify-between text-xs opacity-70">
                <span>{log.date} {log.time}</span>
                <span>Energy {log.energy}/10</span>
              </div>
              <p className="mt-1 font-semibold">{log.activity}</p>
              <p className="text-xs mt-1">{log.source} • {log.effect}</p>
              <p className="text-xs mt-1 opacity-80">{log.note || '—'}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <div className={`p-4 rounded-2xl border ${cardBase}`}>
          <h3 className="text-base font-semibold mb-3">Daily Energy Ops</h3>
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
          <p className={`text-sm mb-3 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>Liên kết năng lượng với quyết định, tài chính và nghề nghiệp.</p>
          <div className="flex flex-wrap gap-2 text-xs">
            <Link className={`px-3 py-1 rounded-full border ${darkMode ? 'bg-slate-900/70 border-slate-700 text-slate-100' : 'bg-gray-50 border-gray-200 text-slate-900'}`} to="/career">Career focus</Link>
            <Link className={`px-3 py-1 rounded-full border ${darkMode ? 'bg-slate-900/70 border-slate-700 text-slate-100' : 'bg-gray-50 border-gray-200 text-slate-900'}`} to="/finance">Finance review</Link>
            <Link className={`px-3 py-1 rounded-full border ${darkMode ? 'bg-slate-900/70 border-slate-700 text-slate-100' : 'bg-gray-50 border-gray-200 text-slate-900'}`} to="/decisions">Decision log</Link>
          </div>
        </div>
        <div className={`p-4 rounded-2xl border ${cardBase}`}>
          <h3 className="text-base font-semibold mb-2">Weekly Review</h3>
          <form onSubmit={addWeekly} className="space-y-2 text-sm">
            <input
              className={`px-2 py-1 rounded w-full ${inputBase}`}
              type="date"
              value={weeklyDraft.weekOf}
              onChange={(e) => setWeeklyDraft({ ...weeklyDraft, weekOf: e.target.value })}
            />
            <input
              className={`px-2 py-1 rounded w-full ${inputBase}`}
              placeholder="Win về năng lượng"
              value={weeklyDraft.win}
              onChange={(e) => setWeeklyDraft({ ...weeklyDraft, win: e.target.value })}
            />
            <input
              className={`px-2 py-1 rounded w-full ${inputBase}`}
              placeholder="Blocker chính"
              value={weeklyDraft.blocker}
              onChange={(e) => setWeeklyDraft({ ...weeklyDraft, blocker: e.target.value })}
            />
            <input
              className={`px-2 py-1 rounded w-full ${inputBase}`}
              placeholder="Focus tuần tới"
              value={weeklyDraft.focus}
              onChange={(e) => setWeeklyDraft({ ...weeklyDraft, focus: e.target.value })}
            />
            <button className="px-3 py-1.5 rounded bg-emerald-600 text-white text-xs" type="submit">Lưu tổng kết</button>
          </form>
          <div className="mt-3 space-y-2 text-xs">
            {weeklyLogs.slice(0, 3).map((log) => (
              <div key={log.id} className={`p-2 rounded border ${darkMode ? 'bg-slate-900/70 border-slate-700 text-slate-100' : 'bg-gray-50 border-gray-200 text-slate-900'}`}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{log.win || '—'}</span>
                  <span className="opacity-70">{log.weekOf}</span>
                </div>
                <p className="mt-1 opacity-80">Blocker: {log.blocker || '—'}</p>
                <p className="mt-1 opacity-80">Focus: {log.focus || '—'}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`p-4 rounded-2xl border mt-6 ${cardBase}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold">History</h3>
          <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{logs.length} entries</span>
        </div>
        {logs.length === 0 ? (
          <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>Chưa có log. Hãy ghi lại ngày hôm nay để bắt đầu.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {logs
              .slice()
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 6)
              .map((log) => (
                <div key={log.date} className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-900/70 border-slate-700 text-slate-100' : 'bg-gray-50 border-gray-200 text-slate-900'}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{log.date}</span>
                    <span className="text-xs opacity-80">Energy {log.energy_level}/10</span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    <span>Sleep: {log.sleep_hours || '—'}h</span>
                    <span>Work: {log.work_hours || '—'}h</span>
                    <span>Learning: {log.learning_hours || '—'}h</span>
                    <span>Leisure: {log.leisure_hours || '—'}h</span>
                  </div>
                  <p className={`mt-2 text-xs ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>{log.notes || '—'}</p>
                </div>
              ))}
          </div>
        )}
      </section>
    </>
  )
}

export default TimeEnergy
