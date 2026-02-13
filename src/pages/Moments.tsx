import React, { useEffect, useMemo, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useAuth } from '../contexts/AuthContext'
import { loadModuleData, saveModuleData } from '../lib/remoteStore'

// Trang lưu ảnh đẹp, khoảnh khắc, tin nhắn, động lực
// Lưu localStorage, hỗ trợ lọc theo loại và tìm kiếm nhanh

type MomentItem = {
  id: number
  title: string
  category: 'Ảnh đẹp' | 'Khoảnh khắc' | 'Tin nhắn' | 'Động lực'
  type: 'image' | 'text' | 'link'
  content: string // mô tả hoặc ghi chú
  url?: string // ảnh hoặc link
  tags: string
  emotion?: number
  createdAt: string
}

const Moments: React.FC = () => {
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
    ? 'bg-slate-900/80 border-slate-800 text-slate-100'
    : 'bg-white border-slate-100 text-slate-900'
  const inputBase = darkMode
    ? 'border-slate-700 bg-slate-900 text-slate-100 placeholder:text-slate-500'
    : 'border'

  const [items, setItems] = useLocalStorage<MomentItem[]>('momentsData', [])
  const [draft, setDraft] = useState<Omit<MomentItem, 'id' | 'createdAt'>>({
    title: '',
    category: 'Khoảnh khắc',
    type: 'image',
    content: '',
    url: '',
    tags: '',
    emotion: undefined
  })
  const [filters, setFilters] = useState({
    category: 'all' as 'all' | MomentItem['category'],
    type: 'all' as 'all' | MomentItem['type'],
    search: ''
  })
  const [uploading, setUploading] = useState(false)

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return
    setUploading(true)
    const reader = new FileReader()
    reader.onload = () => {
      setDraft((prev) => ({ ...prev, url: reader.result as string, type: 'image' }))
      setUploading(false)
    }
    reader.onerror = () => setUploading(false)
    reader.readAsDataURL(file)
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement | HTMLDivElement | HTMLInputElement>) => {
    const items = e.clipboardData.items
    for (let i = 0; i < items.length; i += 1) {
      const it = items[i]
      if (it.kind === 'file') {
        const file = it.getAsFile()
        if (file) handleFile(file)
      }
    }
  }

  const addItem = (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft.title.trim()) return
    setItems((prev) => [{ id: Date.now(), createdAt: new Date().toISOString(), ...draft }, ...prev])
    setDraft({ title: '', category: 'Khoảnh khắc', type: 'image', content: '', url: '', tags: '', emotion: undefined })
  }

  const deleteItem = (id: number) => setItems((prev) => prev.filter((i) => i.id !== id))

  const filtered = useMemo(() => {
    return items.filter((i) => {
      if (filters.category !== 'all' && i.category !== filters.category) return false
      if (filters.type !== 'all' && i.type !== filters.type) return false
      if (filters.search && !(i.title + i.content + i.tags).toLowerCase().includes(filters.search.toLowerCase())) return false
      return true
    })
  }, [items, filters])

  // Sync with Supabase per-user, keep local fallback
  useEffect(() => {
    if (!user) return
    let mounted = true
    ;(async () => {
      try {
        const remote = await loadModuleData<MomentItem[]>('moments', user.id)
        if (remote && mounted) {
          setItems(remote)
        } else if (!remote) {
          await saveModuleData('moments', user.id, items)
        }
      } catch (err) {
        console.error('Sync moments load failed', err)
      }
    })()
    return () => { mounted = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  useEffect(() => {
    if (!user) return
    ;(async () => {
      try {
        await saveModuleData('moments', user.id, items)
      } catch (err) {
        console.error('Sync moments save failed', err)
      }
    })()
  }, [items, user])

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
  const emotionPill = (val?: number) => {
    const opt = emotionOptions.find((o) => o.value === val)
    if (!opt) return null
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${emotionSwatch[val!]}`}>{opt.label}</span>
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Moments</h1>
        <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>Lưu giữ ảnh đẹp, khoảnh khắc, tin nhắn, động lực.</p>
      </header>

      <section className={`p-4 rounded-lg shadow border ${cardBase}`}>
        <h3 className="text-lg font-semibold mb-3">Thêm kỷ niệm</h3>
        <form onSubmit={addItem} className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <input className={`px-3 py-2 rounded ${inputBase}`} placeholder="Tiêu đề" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} required />
          <input className={`px-3 py-2 rounded ${inputBase}`} placeholder="Tags (phân cách bởi dấu phẩy)" value={draft.tags} onChange={(e) => setDraft({ ...draft, tags: e.target.value })} />
          <select className={`px-3 py-2 rounded ${inputBase}`} value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value as MomentItem['category'] })}>
            <option>Khoảnh khắc</option>
            <option>Ảnh đẹp</option>
            <option>Tin nhắn</option>
            <option>Động lực</option>
          </select>
          <select className={`px-3 py-2 rounded ${inputBase}`} value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as MomentItem['type'] })}>
            <option value="image">Ảnh / URL ảnh</option>
            <option value="text">Ghi chú / Quote</option>
            <option value="link">Link / Bài viết</option>
          </select>
          <input
            className={`px-3 py-2 rounded md:col-span-2 ${inputBase}`}
            placeholder="URL ảnh hoặc link (tuỳ chọn)"
            value={draft.url}
            onChange={(e) => setDraft({ ...draft, url: e.target.value })}
          />
          <textarea
            className={`px-3 py-2 rounded md:col-span-2 ${inputBase}`}
            rows={3}
            placeholder="Nội dung / mô tả (có thể dán ảnh trực tiếp vào đây)"
            value={draft.content}
            onChange={(e) => setDraft({ ...draft, content: e.target.value })}
            onPaste={handlePaste}
          />
          <div className="md:col-span-2 flex items-center gap-2 text-xs">
            <input type="file" accept="image/*" onChange={(e) => e.target.files && e.target.files[0] && handleFile(e.target.files[0])} />
            {uploading && <span className="text-blue-500">Đang tải ảnh...</span>}
            {draft.url && draft.type === 'image' && <span className="text-emerald-600">Đã đính kèm ảnh</span>}
          </div>
          <div className="md:col-span-2 flex items-center gap-2 flex-wrap text-xs">
            <span className="opacity-70">Cảm xúc:</span>
            {emotionOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`px-2 py-1 rounded border transition ${emotionSwatch[opt.value]} ${draft.emotion === opt.value ? 'ring-2 ring-blue-400 shadow' : 'opacity-80 hover:opacity-100'}`}
                onClick={() => setDraft({ ...draft, emotion: opt.value })}
                title={opt.hint}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="md:col-span-2 flex justify-end gap-2">
            <button type="button" className="px-3 py-2 rounded border" onClick={() => setDraft({ title: '', category: 'Khoảnh khắc', type: 'image', content: '', url: '', tags: '', emotion: undefined })}>Xoá</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">Lưu</button>
          </div>
        </form>
      </section>

      <section className={`p-4 rounded-lg shadow border ${cardBase}`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
          <h3 className="text-lg font-semibold">Bộ sưu tập</h3>
          <div className="flex flex-wrap gap-2 text-sm">
            <select className={`px-3 py-2 rounded ${inputBase}`} value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value as typeof filters.category })}>
              <option value="all">Tất cả chủ đề</option>
              <option value="Khoảnh khắc">Khoảnh khắc</option>
              <option value="Ảnh đẹp">Ảnh đẹp</option>
              <option value="Tin nhắn">Tin nhắn</option>
              <option value="Động lực">Động lực</option>
            </select>
            <select className={`px-3 py-2 rounded ${inputBase}`} value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value as typeof filters.type })}>
              <option value="all">Tất cả định dạng</option>
              <option value="image">Ảnh</option>
              <option value="text">Text</option>
              <option value="link">Link</option>
            </select>
            <input className={`px-3 py-2 rounded ${inputBase}`} placeholder="Tìm kiếm" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
          </div>
        </div>

        {filtered.length === 0 && (
          <p className={darkMode ? 'text-slate-400' : 'text-gray-600'}>Chưa có mục nào. Thêm kỷ niệm đầu tiên nhé.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((item) => (
            <div key={item.id} className={`p-3 rounded-lg border shadow-sm ${cardBase}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-semibold text-base">{item.title}</h4>
                  <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{new Date(item.createdAt).toLocaleString()}</p>
                </div>
                <button className="text-xs text-red-500" onClick={() => deleteItem(item.id)}>Xoá</button>
              </div>
              <div className="flex flex-wrap gap-2 text-xs mt-2">
                <span className="px-2 py-1 rounded border">{item.category}</span>
                <span className="px-2 py-1 rounded border">{item.type}</span>
                {item.tags && <span className="px-2 py-1 rounded border">{item.tags}</span>}
                {emotionPill(item.emotion)}
              </div>
              {item.type === 'image' && item.url && (
                <div className="mt-2 overflow-hidden rounded-lg border">
                  <img src={item.url} alt={item.title} className="w-full h-48 object-cover" />
                </div>
              )}
              {item.type === 'link' && item.url && (
                <a href={item.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-sm text-blue-500 underline">Mở link</a>
              )}
              <p className={`mt-2 text-sm ${darkMode ? 'text-slate-200' : 'text-gray-700'}`}>{item.content || '—'}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Moments
