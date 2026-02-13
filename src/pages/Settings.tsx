import React, { useEffect, useState } from 'react'
import { restoreBackup } from '../utils/storage'
import { useAuth } from '../contexts/AuthContext'
import { loadModuleData, saveModuleData } from '../lib/remoteStore'

type UserProfile = { name: string; birthdate: string }
type AppSettings = { darkMode: boolean; childhoodTrauma: string; reviewCadence: string; focusBlock: string }

type SettingsPayload = {
  userProfile: UserProfile
  appSettings: AppSettings
}

const Settings: React.FC = () => {
  const { user } = useAuth()
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const savedProfile = localStorage.getItem('userProfile')
    if (savedProfile) {
      try {
        return JSON.parse(savedProfile)
      } catch (err) {
        console.error('Failed to parse user profile', err)
      }
    }
    return { name: '', birthdate: '' }
  })
  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    const savedSettings = localStorage.getItem('appSettings')
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings)
      } catch (err) {
        console.error('Failed to parse app settings', err)
      }
    }
    return { darkMode: false, childhoodTrauma: '', reviewCadence: 'weekly', focusBlock: '60' }
  })
  const [isHydrated, setIsHydrated] = useState(false)
  const [resetConfirm, setResetConfirm] = useState('')
  const [resetConfirmModule, setResetConfirmModule] = useState('')

  const cardBase = appSettings.darkMode
    ? 'bg-slate-900/70 border-slate-700 text-slate-100'
    : 'bg-white border-slate-100 text-slate-900'
  const inputBase = appSettings.darkMode
    ? 'border-slate-700 bg-slate-900 text-slate-100 placeholder:text-slate-500'
    : 'border'

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    localStorage.setItem('userProfile', JSON.stringify(userProfile))
  }, [userProfile])

  useEffect(() => {
    if (!isHydrated) return
    localStorage.setItem('appSettings', JSON.stringify(appSettings))
    window.dispatchEvent(new CustomEvent('app-settings-changed', { detail: appSettings }))
  }, [appSettings, isHydrated])

  // Sync Supabase per-user with fallback localStorage
  useEffect(() => {
    if (!user) return
    let mounted = true
    ;(async () => {
      try {
        const remote = await loadModuleData<SettingsPayload>('settings', user.id)
        if (remote && mounted) {
          setUserProfile(remote.userProfile)
          setAppSettings(remote.appSettings)
        } else if (!remote) {
          await saveModuleData('settings', user.id, { userProfile, appSettings })
        }
      } catch (err) {
        console.error('Sync settings load failed', err)
      }
    })()
    return () => { mounted = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  useEffect(() => {
    if (!user) return
    ;(async () => {
      try {
        await saveModuleData('settings', user.id, { userProfile, appSettings })
      } catch (err) {
        console.error('Sync settings save failed', err)
      }
    })()
  }, [user, userProfile, appSettings])

  const restoreModule = (key: string) => {
    const restored = restoreBackup(key)
    if (!restored) {
      window.alert('Không có bản backup để khôi phục.')
      return
    }
    window.alert('Đã khôi phục dữ liệu. Hãy refresh trang module tương ứng.')
  }

  const resetAllData = () => {
    if (resetConfirm.trim().toUpperCase() !== 'CONFIRM') {
      window.alert('Vui lòng nhập CONFIRM để reset dữ liệu.')
      return
    }

    const keysToClear = [
      'userProfile',
      'appSettings',
      'relationshipsData',
      'peopleRelationships',
      'decisionsData',
      'decisionData',
      'decisionLogs',
      'decisionRituals',
      'decisionWins',
      'skillsData',
      'skillRituals',
      'skillWins',
      'financeTactics',
      'financeLoanPlans',
      'financeNewsWatch',
      'financeMarketMetrics',
      'financeRituals',
      'financeWins',
      'careerPhases',
      'careerSkillGaps',
      'careerGoal',
      'careerProgressLogs',
      'careerRituals',
      'careerWins',
      'timeEnergyData',
      'timeEnergyRituals',
      'timeEnergyWeekly',
      'timeEnergyIntraday',
      'vocabularyTopics'
    ]

    keysToClear.forEach((key) => localStorage.removeItem(key))
    setResetConfirm('')
    window.alert('Đã reset dữ liệu. Vui lòng refresh trang để khởi tạo lại.')
  }

  const resetModule = (keys: string[], label: string) => {
    if (resetConfirmModule.trim().toUpperCase() !== 'CONFIRM') {
      window.alert('Vui lòng nhập CONFIRM trước khi reset module.')
      return
    }
    keys.forEach((key) => localStorage.removeItem(key))
    setResetConfirmModule('')
    window.alert(`Đã reset dữ liệu cho ${label}. Hãy refresh trang module.`)
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-4">Cài đặt</h1>
      <div className="space-y-6">
        <section className={`border rounded-xl p-4 ${cardBase}`}>
          <h2 className="text-lg font-semibold mb-3">Nhịp vận hành</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <label className="flex flex-col gap-1">
              Chu kỳ review
              <select
                className={`px-3 py-2 rounded ${inputBase}`}
                value={appSettings.reviewCadence}
                onChange={(e) => setAppSettings({ ...appSettings, reviewCadence: e.target.value })}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </label>
            <label className="flex flex-col gap-1">
              Focus block (phút)
              <input
                className={`px-3 py-2 rounded ${inputBase}`}
                type="number"
                min="15"
                max="240"
                value={appSettings.focusBlock}
                onChange={(e) => setAppSettings({ ...appSettings, focusBlock: e.target.value })}
              />
            </label>
          </div>
          <p className={`text-xs mt-2 ${appSettings.darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
            Dùng để nhắc nhịp review trong Dashboard/Decisions/Time & Energy.
          </p>
        </section>
        <section className={`border rounded-xl p-4 ${cardBase}`}>
          <h2 className="text-lg font-semibold mb-3">Giao diện</h2>
          <label className={`flex items-center gap-2 text-sm ${appSettings.darkMode ? 'text-slate-200' : 'text-gray-700'}`}>
            <input
              type="checkbox"
              checked={appSettings.darkMode}
              onChange={(e) => setAppSettings({ ...appSettings, darkMode: e.target.checked })}
            />
            Bật dark mode cho toàn bộ hệ thống
          </label>
        </section>

        <section className={`border rounded-xl p-4 ${cardBase}`}>
          <h2 className="text-lg font-semibold mb-3">Hồ sơ cá nhân</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <input
              className={`px-3 py-2 rounded ${inputBase}`}
              placeholder="Họ và tên"
              value={userProfile.name}
              onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
            />
            <input
              className={`px-3 py-2 rounded ${inputBase}`}
              type="date"
              value={userProfile.birthdate}
              onChange={(e) => setUserProfile({ ...userProfile, birthdate: e.target.value })}
            />
          </div>
        </section>

        <section className={`border rounded-xl p-4 ${cardBase}`}>
          <h2 className="text-lg font-semibold mb-2">Childhood Trauma (cơ sở liên kết)</h2>
          <p className={`text-xs mb-2 ${appSettings.darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Dùng cho các phân tích liên kết giữa các module sau này.</p>
          <textarea
            className={`px-3 py-2 rounded w-full min-h-[120px] text-sm ${inputBase}`}
            placeholder="Ví dụ: trải nghiệm tuổi thơ, vết thương cảm xúc, sự kiện ảnh hưởng lâu dài..."
            value={appSettings.childhoodTrauma}
            onChange={(e) => setAppSettings({ ...appSettings, childhoodTrauma: e.target.value })}
          />
        </section>

        <section className={`border rounded-xl p-4 ${cardBase}`}>
          <h2 className="text-lg font-semibold mb-2">Quick links</h2>
          <div className="flex flex-wrap gap-2 text-xs">
            <a className={`px-3 py-1 rounded-full border ${appSettings.darkMode ? 'bg-slate-900/70 border-slate-700 text-slate-100' : 'bg-gray-50 border-gray-200 text-slate-900'}`} href="/dashboard">Dashboard</a>
            <a className={`px-3 py-1 rounded-full border ${appSettings.darkMode ? 'bg-slate-900/70 border-slate-700 text-slate-100' : 'bg-gray-50 border-gray-200 text-slate-900'}`} href="/decisions">Decisions</a>
            <a className={`px-3 py-1 rounded-full border ${appSettings.darkMode ? 'bg-slate-900/70 border-slate-700 text-slate-100' : 'bg-gray-50 border-gray-200 text-slate-900'}`} href="/time-energy">Time & Energy</a>
            <a className={`px-3 py-1 rounded-full border ${appSettings.darkMode ? 'bg-slate-900/70 border-slate-700 text-slate-100' : 'bg-gray-50 border-gray-200 text-slate-900'}`} href="/skills">Skills</a>
          </div>
        </section>

        <section className={`border rounded-xl p-4 ${cardBase}`}>
          <h2 className="text-lg font-semibold mb-2">Khôi phục dữ liệu (Backup)</h2>
          <p className={`text-xs mb-3 ${appSettings.darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
            Khôi phục từ bản lưu gần nhất. Sau khi restore, refresh trang module để tải lại dữ liệu.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            <button className="px-3 py-2 rounded border" onClick={() => restoreModule('peopleRelationships')}>Restore People</button>
            <button className="px-3 py-2 rounded border" onClick={() => restoreModule('decisionsData')}>Restore Decisions</button>
            <button className="px-3 py-2 rounded border" onClick={() => restoreModule('skillsData')}>Restore Skills</button>
            <button className="px-3 py-2 rounded border" onClick={() => restoreModule('timeEnergyData')}>Restore Time & Energy</button>
            <button className="px-3 py-2 rounded border" onClick={() => restoreModule('financeTactics')}>Restore Finance</button>
            <button className="px-3 py-2 rounded border" onClick={() => restoreModule('careerPhases')}>Restore Career</button>
          </div>
        </section>

        <section className={`border rounded-xl p-4 ${cardBase}`}>
          <h2 className="text-lg font-semibold mb-2">Reset dữ liệu</h2>
          <p className={`text-xs mb-3 ${appSettings.darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
            Nhập <strong>CONFIRM</strong> để reset toàn bộ dữ liệu trong trình duyệt.
          </p>
          <div className="flex flex-col gap-2 text-sm">
            <input
              className={`px-3 py-2 rounded ${inputBase}`}
              placeholder="Gõ CONFIRM để xác nhận"
              value={resetConfirm}
              onChange={(e) => setResetConfirm(e.target.value)}
            />
            <button
              className="px-3 py-2 rounded border text-sm"
              onClick={resetAllData}
            >
              Reset toàn bộ dữ liệu
            </button>
          </div>
        </section>

        <section className={`border rounded-xl p-4 ${cardBase}`}>
          <h2 className="text-lg font-semibold mb-2">Reset từng module</h2>
          <p className={`text-xs mb-3 ${appSettings.darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
            Nhập <strong>CONFIRM</strong> rồi chọn module cần xoá dữ liệu. Sau khi reset, refresh trang module.
          </p>
          <div className="flex flex-col gap-2 text-sm mb-3">
            <input
              className={`px-3 py-2 rounded ${inputBase}`}
              placeholder="Gõ CONFIRM để xác nhận"
              value={resetConfirmModule}
              onChange={(e) => setResetConfirmModule(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            <button className="px-3 py-2 rounded border" onClick={() => resetModule(['peopleRelationships', 'relationshipsData'], 'People')}>Reset People</button>
            <button className="px-3 py-2 rounded border" onClick={() => resetModule(['decisionsData', 'decisionData', 'decisionLogs', 'decisionRituals', 'decisionWins'], 'Decisions')}>Reset Decisions</button>
            <button className="px-3 py-2 rounded border" onClick={() => resetModule(['skillsData', 'skillRituals', 'skillWins'], 'Skills')}>Reset Skills</button>
            <button className="px-3 py-2 rounded border" onClick={() => resetModule(['timeEnergyData', 'timeEnergyRituals', 'timeEnergyWeekly', 'timeEnergyIntraday'], 'Time & Energy')}>Reset Time & Energy</button>
            <button className="px-3 py-2 rounded border" onClick={() => resetModule(['financeTactics', 'financeLoanPlans', 'financeNewsWatch', 'financeMarketMetrics', 'financeRituals', 'financeWins'], 'Finance')}>Reset Finance</button>
            <button className="px-3 py-2 rounded border" onClick={() => resetModule(['careerPhases', 'careerSkillGaps', 'careerGoal', 'careerProgressLogs', 'careerRituals', 'careerWins'], 'Career')}>Reset Career</button>
            <button className="px-3 py-2 rounded border" onClick={() => resetModule(['vocabularyTopics'], 'Vocabulary')}>Reset Vocabulary</button>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Settings
