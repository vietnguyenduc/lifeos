import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useAuth } from '../contexts/AuthContext'
import { loadModuleData, saveModuleData } from '../lib/remoteStore'

type VocabularyItem = { term: string; meaning: string; example?: string }

type VocabPayload = { topics: Topic[] }
type DialogueLine = { speaker: string; text: string }

type TopicLog = {
  id: number
  date: string
  context: string
  tags: string[]
  vocab: VocabularyItem[]
  dialogue: DialogueLine[]
  story: string
  takeaway: string
}

type Topic = {
  id: number
  name: string
  description: string
  logs: TopicLog[]
}

type AppSettings = { darkMode?: boolean }

type VocabDraft = { term: string; meaning: string; example: string }

type DialogueDraft = { speaker: string; text: string }

type LogDraft = {
  topicId: number | ''
  date: string
  context: string
  tags: string
  story: string
  takeaway: string
  vocabDraft: VocabDraft
  vocabList: VocabularyItem[]
  dialogueDraft: DialogueDraft
  dialogueList: DialogueLine[]
}

const defaultTopics: Topic[] = [
  {
    id: 1,
    name: 'Đùa giỡn / Humor',
    description: 'Từ vựng và đối đáp trong môi trường vui vẻ.',
    logs: [
      {
        id: 1,
        date: new Date().toISOString().split('T')[0],
        context: 'Câu chơi chữ khi gặp bạn bè',
        tags: ['pun', 'slang'],
        vocab: [
          { term: 'chùa công cháo', meaning: 'Chào công chúa', example: '“Chùa gì?” “Chùa công cháo!”' }
        ],
        dialogue: [
          { speaker: 'A', text: 'Người quen đi chùa.' },
          { speaker: 'B', text: 'Chùa gì?' },
          { speaker: 'A', text: 'Chùa công cháo.' }
        ],
        story: 'Cả nhóm cười vì chơi chữ “chùa công cháo”.',
        takeaway: 'Lưu ý các câu đáp ngắn, nhịp nhanh để tạo punchline.'
      }
    ]
  },
  {
    id: 2,
    name: 'Công việc / Work',
    description: 'Đối đáp cơ bản trong cuộc họp và trao đổi công việc.',
    logs: [
      {
        id: 1,
        date: new Date().toISOString().split('T')[0],
        context: 'Trao đổi tiến độ sprint',
        tags: ['meeting', 'progress'],
        vocab: [
          { term: 'blocker', meaning: 'vướng mắc', example: 'Blocker chính là thiếu dữ liệu.' },
          { term: 'next steps', meaning: 'bước tiếp theo', example: 'Next steps là chốt timeline.' }
        ],
        dialogue: [
          { speaker: 'PM', text: 'Timeline hiện tại có rủi ro gì không?' },
          { speaker: 'Dev', text: 'Có một blocker về dữ liệu, cần support sớm.' },
          { speaker: 'PM', text: 'Ok, next steps là chốt deadline và cập nhật.' }
        ],
        story: 'Cuộc họp sprint tập trung vào rủi ro và giải pháp.',
        takeaway: 'Luôn chuẩn bị câu trả lời cho “rủi ro” + “next steps”.'
      }
    ]
  }
]

const Vocabulary: React.FC = () => {
  const { user } = useAuth()
  const [darkMode, setDarkMode] = useState(false)
  const [topics, setTopics] = useLocalStorage<Topic[]>('vocabularyTopics', defaultTopics)
  const [topicDraft, setTopicDraft] = useState({ name: '', description: '' })
  const [logDraft, setLogDraft] = useState<LogDraft>({
    topicId: '',
    date: new Date().toISOString().split('T')[0],
    context: '',
    tags: '',
    story: '',
    takeaway: '',
    vocabDraft: { term: '', meaning: '', example: '' },
    vocabList: [],
    dialogueDraft: { speaker: '', text: '' },
    dialogueList: []
  })

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
    ? 'bg-slate-900/70 border-slate-700 text-slate-100'
    : 'bg-white border-slate-100 text-slate-900'
  const cardSoft = darkMode
    ? 'bg-slate-900 border-slate-700 text-slate-100'
    : 'bg-gray-50 border-gray-200 text-slate-900'
  const inputBase = darkMode
    ? 'border-slate-700 bg-slate-900 text-slate-100 placeholder:text-slate-500'
    : 'border-gray-300'

  const addTopic = (event: React.FormEvent) => {
    event.preventDefault()
    if (!topicDraft.name.trim()) return
    setTopics((prev) => [
      {
        id: Date.now(),
        name: topicDraft.name.trim(),
        description: topicDraft.description.trim(),
        logs: []
      },
      ...prev
    ])
    setTopicDraft({ name: '', description: '' })
  }

  const addVocab = () => {
    if (!logDraft.vocabDraft.term.trim()) return
    setLogDraft((prev) => ({
      ...prev,
      vocabList: [
        ...prev.vocabList,
        {
          term: prev.vocabDraft.term.trim(),
          meaning: prev.vocabDraft.meaning.trim(),
          example: prev.vocabDraft.example.trim()
        }
      ],
      vocabDraft: { term: '', meaning: '', example: '' }
    }))
  }

  const addDialogue = () => {
    if (!logDraft.dialogueDraft.text.trim()) return
    setLogDraft((prev) => ({
      ...prev,
      dialogueList: [
        ...prev.dialogueList,
        {
          speaker: prev.dialogueDraft.speaker.trim() || 'A',
          text: prev.dialogueDraft.text.trim()
        }
      ],
      dialogueDraft: { speaker: '', text: '' }
    }))
  }

  const addLog = (event: React.FormEvent) => {
    event.preventDefault()
    if (!logDraft.topicId) return
    const tagList = logDraft.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
    const nextLog: TopicLog = {
      id: Date.now(),
      date: logDraft.date,
      context: logDraft.context.trim(),
      tags: tagList,
      vocab: logDraft.vocabList,
      dialogue: logDraft.dialogueList,
      story: logDraft.story.trim(),
      takeaway: logDraft.takeaway.trim()
    }

    setTopics((prev) => prev.map((topic) => (
      topic.id === logDraft.topicId
        ? { ...topic, logs: [nextLog, ...topic.logs] }
        : topic
    )))

    setLogDraft({
      topicId: logDraft.topicId,
      date: new Date().toISOString().split('T')[0],
      context: '',
      tags: '',
      story: '',
      takeaway: '',
      vocabDraft: { term: '', meaning: '', example: '' },
      vocabList: [],
      dialogueDraft: { speaker: '', text: '' },
      dialogueList: []
    })
  }

  const logsByTopic = useMemo(() => {
    return topics.map((topic) => ({
      ...topic,
      logs: [...topic.logs].sort((a, b) => b.date.localeCompare(a.date))
    }))
  }, [topics])

  // Sync Supabase per-user with fallback localStorage
  useEffect(() => {
    if (!user) return
    let mounted = true
    ;(async () => {
      try {
        const remote = await loadModuleData<VocabPayload>('vocabulary', user.id)
        if (remote && mounted) {
          setTopics(remote.topics)
        } else if (!remote) {
          await saveModuleData('vocabulary', user.id, { topics })
        }
      } catch (err) {
        console.error('Sync vocabulary load failed', err)
      }
    })()
    return () => { mounted = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  useEffect(() => {
    if (!user) return
    ;(async () => {
      try {
        await saveModuleData('vocabulary', user.id, { topics })
      } catch (err) {
        console.error('Sync vocabulary save failed', err)
      }
    })()
  }, [topics, user])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Vocabulary & Story Log</h1>
          <p className={darkMode ? 'text-slate-400' : 'text-gray-500'}>
            Ghi chép từ vựng + đối thoại + câu chuyện theo topic hằng ngày.
          </p>
        </div>
        <Link to="/" className="text-sm text-blue-600">← Dashboard</Link>
      </div>

      <section className={`border rounded-xl p-4 ${cardBase}`}>
        <h2 className="text-lg font-semibold mb-3">Tạo topic mới</h2>
        <form className="grid grid-cols-1 md:grid-cols-3 gap-3" onSubmit={addTopic}>
          <input
            className={`px-3 py-2 rounded border ${inputBase}`}
            placeholder="Tên topic (ví dụ: Đùa giỡn / Work)"
            value={topicDraft.name}
            onChange={(event) => setTopicDraft((prev) => ({ ...prev, name: event.target.value }))}
          />
          <input
            className={`px-3 py-2 rounded border ${inputBase}`}
            placeholder="Mô tả ngắn"
            value={topicDraft.description}
            onChange={(event) => setTopicDraft((prev) => ({ ...prev, description: event.target.value }))}
          />
          <button className="px-4 py-2 rounded bg-blue-600 text-white">Thêm topic</button>
        </form>
      </section>

      <section className={`border rounded-xl p-4 ${cardBase}`}>
        <h2 className="text-lg font-semibold mb-3">Log hằng ngày theo topic</h2>
        <form className="space-y-4" onSubmit={addLog}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select
              className={`px-3 py-2 rounded border ${inputBase}`}
              value={logDraft.topicId}
              onChange={(event) => setLogDraft((prev) => ({ ...prev, topicId: Number(event.target.value) }))}
            >
              <option value="">Chọn topic</option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>{topic.name}</option>
              ))}
            </select>
            <input
              type="date"
              className={`px-3 py-2 rounded border ${inputBase}`}
              value={logDraft.date}
              onChange={(event) => setLogDraft((prev) => ({ ...prev, date: event.target.value }))}
            />
            <input
              className={`px-3 py-2 rounded border ${inputBase}`}
              placeholder="Bối cảnh / tình huống"
              value={logDraft.context}
              onChange={(event) => setLogDraft((prev) => ({ ...prev, context: event.target.value }))}
            />
            <input
              className={`px-3 py-2 rounded border ${inputBase}`}
              placeholder="Tag (phân tách bằng dấu phẩy)"
              value={logDraft.tags}
              onChange={(event) => setLogDraft((prev) => ({ ...prev, tags: event.target.value }))}
            />
          </div>

          <div className={`p-3 rounded border ${cardSoft}`}>
            <h3 className="font-semibold mb-2">Từ vựng trong ngày</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <input
                className={`px-3 py-2 rounded border ${inputBase}`}
                placeholder="Từ / cụm từ"
                value={logDraft.vocabDraft.term}
                onChange={(event) => setLogDraft((prev) => ({ ...prev, vocabDraft: { ...prev.vocabDraft, term: event.target.value } }))}
              />
              <input
                className={`px-3 py-2 rounded border ${inputBase}`}
                placeholder="Ý nghĩa"
                value={logDraft.vocabDraft.meaning}
                onChange={(event) => setLogDraft((prev) => ({ ...prev, vocabDraft: { ...prev.vocabDraft, meaning: event.target.value } }))}
              />
              <input
                className={`px-3 py-2 rounded border ${inputBase}`}
                placeholder="Ví dụ ngắn"
                value={logDraft.vocabDraft.example}
                onChange={(event) => setLogDraft((prev) => ({ ...prev, vocabDraft: { ...prev.vocabDraft, example: event.target.value } }))}
              />
              <button type="button" className="px-3 py-2 rounded border" onClick={addVocab}>Thêm</button>
            </div>
            <div className="mt-2 space-y-1 text-sm">
              {logDraft.vocabList.map((item, idx) => (
                <div key={`${item.term}-${idx}`} className="flex items-start gap-2">
                  <span className="font-semibold">• {item.term}</span>
                  <span>{item.meaning || '—'}</span>
                  <span className={darkMode ? 'text-slate-400' : 'text-gray-500'}>{item.example ? `“${item.example}”` : ''}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={`p-3 rounded border ${cardSoft}`}>
            <h3 className="font-semibold mb-2">Đối thoại / kịch bản</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <input
                className={`px-3 py-2 rounded border ${inputBase}`}
                placeholder="Người nói (A/B/PM/...)"
                value={logDraft.dialogueDraft.speaker}
                onChange={(event) => setLogDraft((prev) => ({ ...prev, dialogueDraft: { ...prev.dialogueDraft, speaker: event.target.value } }))}
              />
              <input
                className={`px-3 py-2 rounded border ${inputBase} md:col-span-2`}
                placeholder="Nội dung câu nói"
                value={logDraft.dialogueDraft.text}
                onChange={(event) => setLogDraft((prev) => ({ ...prev, dialogueDraft: { ...prev.dialogueDraft, text: event.target.value } }))}
              />
              <button type="button" className="px-3 py-2 rounded border" onClick={addDialogue}>Thêm</button>
            </div>
            <div className="mt-2 space-y-1 text-sm">
              {logDraft.dialogueList.map((line, idx) => (
                <div key={`${line.text}-${idx}`}>
                  <span className="font-semibold">{line.speaker}:</span> {line.text}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <textarea
              className={`px-3 py-2 rounded border h-24 ${inputBase}`}
              placeholder="Câu chuyện / tình huống cụ thể"
              value={logDraft.story}
              onChange={(event) => setLogDraft((prev) => ({ ...prev, story: event.target.value }))}
            />
            <textarea
              className={`px-3 py-2 rounded border h-24 ${inputBase}`}
              placeholder="Takeaway / ghi chú luyện tập"
              value={logDraft.takeaway}
              onChange={(event) => setLogDraft((prev) => ({ ...prev, takeaway: event.target.value }))}
            />
          </div>

          <button className="px-4 py-2 rounded bg-blue-600 text-white">Lưu log</button>
        </form>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {logsByTopic.map((topic) => (
          <div key={topic.id} className={`border rounded-xl p-4 ${cardBase}`}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-lg font-semibold">{topic.name}</h3>
                <p className={darkMode ? 'text-slate-400 text-sm' : 'text-gray-500 text-sm'}>{topic.description || '—'}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${cardSoft}`}>{topic.logs.length} logs</span>
            </div>
            <div className="mt-3 space-y-3">
              {topic.logs.slice(0, 5).map((log) => (
                <div key={log.id} className={`p-3 rounded-lg border ${cardSoft}`}>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span>{log.date}</span>
                    <span className={darkMode ? 'text-slate-400' : 'text-gray-500'}>{log.context || '—'}</span>
                  </div>
                  <div className="text-sm space-y-1">
                    <div>
                      <span className="font-semibold">Từ vựng:</span>{' '}
                      {log.vocab.map((item) => item.term).join(', ') || '—'}
                    </div>
                    <div>
                      <span className="font-semibold">Tags:</span>{' '}
                      {log.tags.length ? log.tags.join(', ') : '—'}
                    </div>
                    <div>
                      <span className="font-semibold">Đối thoại:</span>{' '}
                      {log.dialogue.map((line) => `${line.speaker}: ${line.text}`).join(' | ') || '—'}
                    </div>
                    <div>
                      <span className="font-semibold">Story:</span>{' '}{log.story || '—'}
                    </div>
                    <div>
                      <span className="font-semibold">Takeaway:</span>{' '}{log.takeaway || '—'}
                    </div>
                  </div>
                </div>
              ))}
              {!topic.logs.length && (
                <p className={darkMode ? 'text-slate-400 text-sm' : 'text-gray-500 text-sm'}>Chưa có log cho topic này.</p>
              )}
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}

export default Vocabulary
