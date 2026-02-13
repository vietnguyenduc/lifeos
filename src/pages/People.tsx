import React, { useEffect, useMemo, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useAuth } from '../contexts/AuthContext'
import { loadModuleData, saveModuleData } from '../lib/remoteStore'
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer
} from 'recharts'

type Intel = { personality: string; values: string; fear: string; need: string; hate: string; talk: string; stress: string; maintain: string }
type ContactLog = { date: string; note: string; mood: string; energy?: number; feeling?: string }
type PromiseOwner = 'me' | 'them'
type PromiseItem = { title: string; dueDate: string; createdAt: string; status: 'pending' | 'done' | 'late'; owner: PromiseOwner; completedAt?: string; notes?: string }
type DecisionItem = { id: number; title: string; date: string; tags?: string; context?: string; outcome?: string; followUp?: string }
type TimeEnergyLog = { date: string; energy_level: string; notes: string }
type UserProfile = { name: string; birthdate: string }
type AppSettings = { darkMode: boolean; childhoodTrauma: string }
type Group = 'A' | 'B' | 'C' | 'D' | 'E'

type PeoplePayload = {
  relationships: Relationship[]
}

type Relationship = {
  id: number
  name: string
  role: string
  group: Group
  impact: number
  lastContact: string
  birthday?: string
  note: string
  promises?: string
  theirPrinciples?: string
  promiseItems?: PromiseItem[]
  faceImage?: string
  faceNote?: string
  scores: number[]
  intel: Intel
  contacts: ContactLog[]
}

type RelationshipForm = Omit<Relationship, 'id' | 'scores'> & { scores?: number[]; myPromiseDraft?: string; theirPromiseDraft?: string }

const People: React.FC = () => {

  const { user } = useAuth()
  // Mock data
  const [relationships, setRelationships] = useLocalStorage<Relationship[]>('peopleRelationships', (() => {
    const saved = localStorage.getItem('peopleRelationships')
      || localStorage.getItem('peopleData')
      || localStorage.getItem('relationshipsData')
      || localStorage.getItem('peopleRelationshipsBackup')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length) {
          return parsed.map((r: any) => ({
            ...r,
            scores: r.scores ?? [0, 0, 0, 0, 0],
            intel: r.intel ?? blankIntel,
            contacts: r.contacts ?? [],
            birthday: r.birthday || '',
            promises: r.promises || '',
            theirPrinciples: r.theirPrinciples || ''
          })) as Relationship[]
        }
      } catch (err) {
        console.error('Failed to parse saved relationships', err)
      }
    }
    return [
    {
      id: 1,
      name: 'John Doe',
      role: 'Mentor',
      group: 'A',
      impact: 8,
      lastContact: '2026-01-28',
      birthday: '1990-03-12',
      note: 'Giữ liên hệ 2w',
      promises: 'Hỗ trợ feedback CV',
      theirPrinciples: 'Thẳng thắn, tôn trọng giờ giấc',
      promiseItems: [
        { title: 'Feedback CV bản mới', dueDate: '2026-02-05', createdAt: '2026-01-25', status: 'pending', owner: 'me' },
        { title: 'Gửi template cover letter', dueDate: '2026-01-10', createdAt: '2025-12-28', status: 'done', owner: 'me', completedAt: '2026-01-09', notes: 'Đã gửi qua email' }
      ],
      scores: [8, 8, 9, 9, 8],
      intel: { personality: 'Logic, thẳng', values: 'Minh bạch', fear: 'Lãng phí thời gian', need: 'Chuẩn bị trước', hate: 'Trễ giờ', talk: 'Ngắn gọn, có agenda', stress: 'Im lặng, cần thời gian', maintain: 'Gửi update ngắn hàng tuần' },
      contacts: [
        { date: '2026-01-28', note: 'Call 30p feedback CV', mood: 'Tập trung', energy: 2, feeling: 'Rõ ràng hơn' },
        { date: '2026-01-21', note: 'Gửi draft CV', mood: 'Ổn', energy: 1, feeling: 'Tự tin hơn' }
      ]
    },
    {
      id: 2,
      name: 'Jane Smith',
      role: 'Colleague',
      group: 'B',
      impact: 6,
      lastContact: '2026-01-25',
      birthday: '1992-08-05',
      note: 'Cafe sprint',
      promises: 'Gửi tài liệu sprint',
      theirPrinciples: 'Minh bạch, ghét trễ deadline',
      promiseItems: [
        { title: 'Gửi tài liệu sprint', dueDate: '2026-01-27', createdAt: '2026-01-20', status: 'late', owner: 'me', completedAt: '2026-01-29', notes: 'Trễ 2 ngày' },
        { title: 'Review backlog tháng', dueDate: '2026-02-08', createdAt: '2026-01-31', status: 'pending', owner: 'them' }
      ],
      scores: [7, 7, 6, 7, 7],
      intel: { personality: 'Thực dụng', values: 'Đúng hẹn', fear: 'Tắc tiến độ', need: 'Thông tin rõ', hate: 'Im lặng', talk: 'Trực tiếp, checklist', stress: 'Cáu nếu trễ', maintain: 'Update ngắn 2w' },
      contacts: [
        { date: '2026-01-25', note: 'Cafe bàn sprint', mood: 'Vội', energy: -1, feeling: 'Khá áp lực' },
        { date: '2026-01-19', note: 'Họp sprint plan', mood: 'Bình thường', energy: 0, feeling: 'Ổn' }
      ]
    },
    {
      id: 3,
      name: 'Bob Johnson',
      role: 'Friend',
      group: 'B',
      impact: 7,
      lastContact: '2026-01-27',
      birthday: '1989-11-20',
      note: 'Nhắn hỏi thăm',
      promises: 'Đi leo núi cuối tháng',
      theirPrinciples: 'Không thích bị thúc, cần nhẹ nhàng',
      promiseItems: [
        { title: 'Chốt lịch leo núi', dueDate: '2026-02-02', createdAt: '2026-01-15', status: 'pending', owner: 'me' }
      ],
      scores: [6, 7, 7, 6, 7],
      intel: { personality: 'Hướng ngoại', values: 'Tự do', fear: 'Bị ép', need: 'Không gian riêng', hate: 'Nhắc nhiều', talk: 'Thân thiện, kể chuyện', stress: 'Tránh nói công việc', maintain: 'Rủ hoạt động nhẹ' },
      contacts: [
        { date: '2026-01-27', note: 'Chat về chuyến leo núi', mood: 'Vui', energy: 1, feeling: 'Hứng khởi' },
        { date: '2026-01-20', note: 'Nhắn hỏi sức khoẻ', mood: 'Tốt', energy: 1, feeling: 'Gần gũi' }
      ]
    },
    {
      id: 4,
      name: 'Alice Brown',
      role: 'Family',
      group: 'A',
      impact: 9,
      lastContact: '2026-01-26',
      birthday: '1995-02-01',
      note: 'Gọi video cuối tuần',
      promises: 'Sinh nhật tặng quà',
      theirPrinciples: 'Ưu tiên gia đình, thích sự quan tâm',
      promiseItems: [
        { title: 'Chuẩn bị quà sinh nhật', dueDate: '2026-02-01', createdAt: '2026-01-20', status: 'pending', owner: 'me' }
      ],
      scores: [9, 9, 8, 9, 9],
      intel: { personality: 'Ấm áp', values: 'Gia đình', fear: 'Bị bỏ rơi', need: 'Quan tâm chủ động', hate: 'Quên dịp quan trọng', talk: 'Ân cần, hỏi thăm', stress: 'Nói nhẹ nhàng', maintain: 'Gọi video cuối tuần' },
      contacts: [
        { date: '2026-01-26', note: 'Video call 30p', mood: 'Vui', energy: 2, feeling: 'Ấm áp' },
        { date: '2026-01-18', note: 'Nhắn chúc ngủ ngon', mood: 'Tốt', energy: 1, feeling: 'Gắn kết' }
      ]
    },
    {
      id: 5,
      name: 'Minh Tran',
      role: 'Co-founder',
      group: 'A',
      impact: 9,
      lastContact: '2025-12-20',
      birthday: '1991-06-14',
      note: 'Review OKR quý',
      promises: 'Chốt roadmap Q2',
      theirPrinciples: 'Rõ ràng, nhanh gọn',
      promiseItems: [
        { title: 'Chốt roadmap Q2', dueDate: '2026-01-12', createdAt: '2025-12-15', status: 'late', owner: 'me', completedAt: '2026-01-20', notes: 'Trễ do thiếu dữ liệu' }
      ],
      scores: [9, 8, 9, 8, 9],
      intel: { personality: 'Quyết đoán', values: 'Tốc độ', fear: 'Chậm tiến độ', need: 'Quyết định nhanh', hate: 'Vòng vo', talk: 'Đi thẳng vấn đề', stress: 'Cần dữ liệu', maintain: 'Check-in tuần' },
      contacts: [
        { date: '2025-12-20', note: 'Review OKR', mood: 'Tập trung', energy: 1, feeling: 'Rõ ràng' },
        { date: '2025-12-05', note: 'Sync roadmap', mood: 'Bình tĩnh', energy: 0, feeling: 'Ổn' }
      ]
    },
    {
      id: 6,
      name: 'Linh Pham',
      role: 'Client',
      group: 'B',
      impact: 6,
      lastContact: '2025-11-30',
      birthday: '1993-09-09',
      note: 'Đợi feedback proposal',
      promises: 'Gửi bản sửa proposal',
      theirPrinciples: 'Đúng deadline',
      promiseItems: [
        { title: 'Gửi bản sửa proposal', dueDate: '2025-12-05', createdAt: '2025-11-20', status: 'late', owner: 'me', completedAt: '2025-12-12', notes: 'Khách phản hồi chậm' }
      ],
      scores: [6, 6, 7, 6, 6],
      intel: { personality: 'Thực tế', values: 'Hiệu quả', fear: 'Trễ tiến độ', need: 'Thông tin rõ', hate: 'Im lặng lâu', talk: 'Cập nhật ngắn', stress: 'Căng nếu trễ', maintain: 'Email định kỳ' },
      contacts: [
        { date: '2025-11-30', note: 'Gửi proposal', mood: 'Bình thường', energy: 0, feeling: 'Ổn' }
      ]
    },
    {
      id: 7,
      name: 'Quang Nguyen',
      role: 'Friend',
      group: 'C',
      impact: 4,
      lastContact: '',
      birthday: '1994-01-17',
      note: 'Bạn đại học',
      promises: '',
      theirPrinciples: 'Thích gặp trực tiếp',
      scores: [5, 5, 5, 6, 6],
      intel: { personality: 'Dễ gần', values: 'Tình bạn', fear: 'Bị quên', need: 'Hỏi thăm', hate: 'Bị hủy kèo', talk: 'Nhẹ nhàng', stress: 'Im lặng', maintain: 'Nhắn tin tháng' },
      contacts: []
    },
    {
      id: 8,
      name: 'Hana Lee',
      role: 'Mentor',
      group: 'A',
      impact: 8,
      lastContact: '2025-12-28',
      birthday: '1987-04-23',
      note: 'Cần hỏi feedback',
      promises: 'Gửi case study',
      theirPrinciples: 'Tôn trọng thời gian',
      scores: [8, 9, 8, 9, 8],
      intel: { personality: 'Tinh tế', values: 'Học hỏi', fear: 'Mất thời gian', need: 'Agenda rõ', hate: 'Mơ hồ', talk: 'Có cấu trúc', stress: 'Cần nghỉ', maintain: 'Báo trước lịch' },
      contacts: [
        { date: '2025-12-28', note: 'Mentor session', mood: 'Hào hứng', energy: 2, feeling: 'Sáng rõ' }
      ]
    },
    {
      id: 9,
      name: 'Vy Hoang',
      role: 'Neighbor',
      group: 'D',
      impact: 2,
      lastContact: '2025-08-12',
      birthday: '1990-10-10',
      note: 'Gặp xã giao',
      promises: '',
      theirPrinciples: 'Giữ khoảng cách',
      scores: [3, 4, 3, 4, 3],
      intel: { personality: 'Khép kín', values: 'Riêng tư', fear: 'Bị làm phiền', need: 'Không gian', hate: 'Hỏi nhiều', talk: 'Ngắn gọn', stress: 'Tránh giao tiếp', maintain: 'Chào hỏi nhẹ' },
      contacts: [
        { date: '2025-08-12', note: 'Chào hỏi hành lang', mood: 'Trung lập', energy: -1, feeling: 'Mệt' }
      ]
    },
    {
      id: 10,
      name: 'Duc Le',
      role: 'Ex-partner',
      group: 'E',
      impact: -2,
      lastContact: '2024-12-15',
      birthday: '1988-07-07',
      note: 'Giữ khoảng cách',
      promises: '',
      theirPrinciples: 'Không liên hệ lại',
      scores: [2, 2, 1, 2, 1],
      intel: { personality: 'Khó đoán', values: 'Cảm xúc', fear: 'Bị bỏ rơi', need: 'Kiểm soát', hate: 'Im lặng', talk: 'Không rõ ràng', stress: 'Bốc đồng', maintain: 'Tránh' },
      contacts: [
        { date: '2024-12-15', note: 'Tin nhắn cuối', mood: 'Tiêu cực', energy: -2, feeling: 'Căng thẳng' }
      ]
    },
    {
      id: 11,
      name: 'Mai Nguyen',
      role: 'Advisor',
      group: 'A',
      impact: 8,
      lastContact: '2026-01-30',
      birthday: '1986-09-21',
      note: 'Mentor strategic review',
      promises: 'Gửi tài liệu growth loop',
      theirPrinciples: 'Logic, có roadmap rõ',
      promiseItems: [
        { title: 'Gửi tài liệu growth loop', dueDate: '2026-02-10', createdAt: '2026-01-30', status: 'pending', owner: 'them' }
      ],
      scores: [8, 8, 9, 8, 9],
      intel: { personality: 'Rõ ràng', values: 'Chiến lược', fear: 'Lãng phí', need: 'Tập trung', hate: 'Mơ hồ', talk: 'Có cấu trúc', stress: 'Cần thời gian', maintain: 'Update định kỳ' },
      contacts: [
        { date: '2026-01-30', note: 'Review chiến lược 90 ngày', mood: 'Tích cực', energy: 2, feeling: 'Sáng rõ' }
      ]
    },
    {
      id: 12,
      name: 'Khanh Le',
      role: 'Peer',
      group: 'B',
      impact: 6,
      lastContact: '2026-01-22',
      birthday: '1993-05-11',
      note: 'Check-in dự án chung',
      promises: 'Gửi draft proposal',
      theirPrinciples: 'Nhanh gọn',
      promiseItems: [
        { title: 'Gửi draft proposal', dueDate: '2026-02-03', createdAt: '2026-01-25', status: 'pending', owner: 'me' }
      ],
      scores: [6, 7, 6, 7, 6],
      intel: { personality: 'Thực tế', values: 'Hiệu quả', fear: 'Chậm tiến độ', need: 'Checklist', hate: 'Chậm phản hồi', talk: 'Ngắn gọn', stress: 'Dễ cáu', maintain: 'Chốt deadline rõ' },
      contacts: [
        { date: '2026-01-22', note: 'Sync proposal', mood: 'Trung lập', energy: 0, feeling: 'Ổn' }
      ]
    },
    {
      id: 13,
      name: 'Huong Tran',
      role: 'Family',
      group: 'A',
      impact: 9,
      lastContact: '2026-02-02',
      birthday: '1997-12-02',
      note: 'Gọi thăm sức khỏe',
      promises: 'Sắp xếp đi ăn cuối tuần',
      theirPrinciples: 'Quan tâm',
      promiseItems: [
        { title: 'Đặt lịch ăn tối', dueDate: '2026-02-04', createdAt: '2026-02-02', status: 'pending', owner: 'me' }
      ],
      scores: [9, 9, 8, 9, 9],
      intel: { personality: 'Ấm áp', values: 'Gia đình', fear: 'Xa cách', need: 'Kết nối', hate: 'Vô tâm', talk: 'Quan tâm', stress: 'Dễ lo', maintain: 'Gọi cuối tuần' },
      contacts: [
        { date: '2026-02-02', note: 'Gọi hỏi thăm', mood: 'Tích cực', energy: 2, feeling: 'Ấm áp' }
      ]
    },
    {
      id: 14,
      name: 'Son Pham',
      role: 'Client',
      group: 'C',
      impact: 5,
      lastContact: '2026-01-12',
      birthday: '1989-02-17',
      note: 'Follow-up hợp đồng',
      promises: 'Gửi update sản phẩm',
      theirPrinciples: 'Rõ ràng',
      promiseItems: [
        { title: 'Gửi update sản phẩm', dueDate: '2026-01-20', createdAt: '2026-01-10', status: 'late', owner: 'me', completedAt: '2026-01-22' }
      ],
      scores: [5, 5, 6, 5, 6],
      intel: { personality: 'Điềm tĩnh', values: 'Ổn định', fear: 'Rủi ro', need: 'Thông tin', hate: 'Chậm phản hồi', talk: 'Lịch sự', stress: 'Im lặng', maintain: 'Update hàng tháng' },
      contacts: [
        { date: '2026-01-12', note: 'Call update', mood: 'Trung lập', energy: 0, feeling: 'Ổn' }
      ]
    }
    ]
  })())

  const getZodiacDetails = (date?: string) => {
    const sign = getZodiac(date)
    const map: Record<string, { element: string; tone: string; focus: string }> = {
      'Bạch Dương': { element: 'Lửa', tone: 'Nhanh – quyết đoán', focus: 'Khởi động, tiên phong' },
      'Kim Ngưu': { element: 'Đất', tone: 'Bền – ổn định', focus: 'Giá trị, an toàn' },
      'Song Tử': { element: 'Khí', tone: 'Linh hoạt', focus: 'Giao tiếp, kết nối' },
      'Cự Giải': { element: 'Nước', tone: 'Nhạy cảm', focus: 'Gia đình, cảm xúc' },
      'Sư Tử': { element: 'Lửa', tone: 'Tự tin', focus: 'Sáng tạo, lãnh đạo' },
      'Xử Nữ': { element: 'Đất', tone: 'Tỉ mỉ', focus: 'Chi tiết, hệ thống' },
      'Thiên Bình': { element: 'Khí', tone: 'Cân bằng', focus: 'Hài hòa, hợp tác' },
      'Bọ Cạp': { element: 'Nước', tone: 'Sâu sắc', focus: 'Biến đổi, quyết tâm' },
      'Nhân Mã': { element: 'Lửa', tone: 'Lạc quan', focus: 'Tự do, khám phá' },
      'Ma Kết': { element: 'Đất', tone: 'Kỷ luật', focus: 'Mục tiêu, trách nhiệm' },
      'Bảo Bình': { element: 'Khí', tone: 'Độc lập', focus: 'Ý tưởng, cộng đồng' },
      'Song Ngư': { element: 'Nước', tone: 'Trực giác', focus: 'Chữa lành, cảm thông' }
    }
    return { sign, ...(map[sign] ?? { element: '—', tone: '—', focus: '—' }) }
  }

  const getNumerologyDetails = (date?: string) => {
    const lifePath = getLifePath(date)
    const map: Record<string, { theme: string; strength: string; caution: string }> = {
      '1': { theme: 'Tự chủ', strength: 'Quyết đoán, dẫn dắt', caution: 'Dễ cứng nhắc' },
      '2': { theme: 'Kết nối', strength: 'Tinh tế, hợp tác', caution: 'Dễ phụ thuộc' },
      '3': { theme: 'Sáng tạo', strength: 'Biểu đạt tốt', caution: 'Dễ phân tán' },
      '4': { theme: 'Kỷ luật', strength: 'Ổn định, thực tế', caution: 'Dễ bảo thủ' },
      '5': { theme: 'Tự do', strength: 'Thích nghi nhanh', caution: 'Dễ bốc đồng' },
      '6': { theme: 'Chăm sóc', strength: 'Trách nhiệm', caution: 'Dễ ôm đồm' },
      '7': { theme: 'Chiêm nghiệm', strength: 'Tư duy sâu', caution: 'Dễ khép kín' },
      '8': { theme: 'Thành tựu', strength: 'Tập trung mục tiêu', caution: 'Dễ áp lực' },
      '9': { theme: 'Nhân ái', strength: 'Vị tha', caution: 'Dễ hy sinh quá mức' },
      '11': { theme: 'Trực giác', strength: 'Cảm hứng mạnh', caution: 'Dễ dao động' },
      '22': { theme: 'Kiến tạo', strength: 'Tầm nhìn lớn', caution: 'Dễ quá tải' },
      '33': { theme: 'Chữa lành', strength: 'Từ bi', caution: 'Dễ kiệt sức' }
    }
    return { lifePath, ...(map[lifePath] ?? { theme: '—', strength: '—', caution: '—' }) }
  }

  const blankIntel = { personality: '', values: '', fear: '', need: '', hate: '', talk: '', stress: '', maintain: '' }
  const [newRel, setNewRel] = useState<RelationshipForm>({
    name: '',
    role: '',
    group: 'C' as Group,
    impact: 5,
    lastContact: '',
    birthday: '',
    note: '',
    promises: '',
    theirPrinciples: '',
    intel: blankIntel,
    contacts: [],
    faceImage: '',
    faceNote: '',
    myPromiseDraft: '',
    theirPromiseDraft: ''
  })
  const todayIso = () => new Date().toISOString().split('T')[0]
  const addDays = (days: number) => {
    const base = new Date()
    base.setDate(base.getDate() + days)
    return base.toISOString().split('T')[0]
  }

  const [evalForm, setEvalForm] = useState<{ id: number | '', scores: number[] }>({ id: '', scores: [0, 0, 0, 0, 0] })
  // removed filterGroup/priorityOnly UI to keep page compact
  const [detailId, setDetailId] = useState<number | null>(null)
  const [contactDraft, setContactDraft] = useState<{ date: string; note: string; mood: string; energy: number; feeling: string }>({ date: '', note: '', mood: '', energy: 0, feeling: '' })
  const moodOptions = ['Rất tích cực', 'Tích cực', 'Trung lập', 'Tiêu cực', 'Rất tiêu cực']
  const feelingOptions = ['Thư giãn', 'Ổn', 'Hào hứng', 'Mệt', 'Căng thẳng', 'Khó chịu']
  const [aiAnalysis, setAiAnalysis] = useState<string[]>([])
  const [darkMode, setDarkMode] = useState(false)
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month')
  const [freeSlot, setFreeSlot] = useState<{ start: string; end: string }>({ start: '19:00', end: '21:00' })
  const [selectedDate, setSelectedDate] = useState<string>(todayIso())
  const [showAddModal, setShowAddModal] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Record<Group, boolean>>({ A: false, B: false, C: false, D: false, E: false })
  const [reportRange, setReportRange] = useState<'week' | 'month' | 'quarter' | 'year'>('week')
  const [peopleView, setPeopleView] = useState<'grid' | 'list'>('grid')
  const [bulkMode, setBulkMode] = useState(false)
  const [quickEdit, setQuickEdit] = useState(false)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'impact' | 'score' | 'group' | 'name'>('impact')
  const [onlyPendingPromises, setOnlyPendingPromises] = useState(false)
  const [insightTab, setInsightTab] = useState<'tips' | 'zodiac' | 'numerology' | 'lunar' | 'face' | 'ai'>('tips')
  const [decisionsData, setDecisionsData] = useState<DecisionItem[]>([])
  const [timeEnergyData, setTimeEnergyData] = useState<TimeEnergyLog[]>([])
  const [userProfile, setUserProfile] = useState<UserProfile>({ name: '', birthdate: '' })

  const cardBase = darkMode
    ? 'bg-slate-900 border-slate-700 text-slate-100'
    : 'bg-white border-slate-100 text-slate-900'
  const cardSoft = darkMode
    ? 'bg-slate-800/70 border-slate-700 text-slate-100'
    : 'bg-gray-50'
  const cardInner = darkMode
    ? 'bg-slate-900 border-slate-700 text-slate-100'
    : 'bg-white'
  const inputBase = darkMode
    ? 'border-slate-700 bg-slate-900 text-slate-100 placeholder:text-slate-500'
    : 'border'

  const reportRangeLabel: Record<typeof reportRange, string> = {
    week: '7 ngày',
    month: '30 ngày',
    quarter: '90 ngày',
    year: '1 năm'
  }

  const filteredRelationships = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    const groupOrder: Record<Group, number> = { A: 1, B: 2, C: 3, D: 4, E: 5 }
    let data = [...relationships]
    if (term) {
      data = data.filter((r) => [r.name, r.role, r.note].some((v) => (v || '').toLowerCase().includes(term)))
    }
    if (onlyPendingPromises) {
      data = data.filter((r) => (r.promiseItems ?? []).some((p) => p.status === 'pending' || p.status === 'late'))
    }
    data.sort((a, b) => {
      if (sortBy === 'impact') return b.impact - a.impact
      if (sortBy === 'score') return totalScore(b.scores) - totalScore(a.scores)
      if (sortBy === 'group') return groupOrder[a.group] - groupOrder[b.group]
      return a.name.localeCompare(b.name)
    })
    return data
  }, [relationships, searchTerm, sortBy, onlyPendingPromises])

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredRelationships.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredRelationships.map((rel) => rel.id))
    }
  }

  const bulkDelete = () => {
    if (!selectedIds.length) return
    if (!window.confirm(`Xóa ${selectedIds.length} mối quan hệ đã chọn?`)) return
    setRelationships((prev) => prev.filter((rel) => !selectedIds.includes(rel.id)))
    setSelectedIds([])
  }

  const updateRelationshipField = (id: number, updates: Partial<Relationship>) => {
    setRelationships((prev) => prev.map((rel) => (rel.id === id ? { ...rel, ...updates } : rel)))
  }

  // Sync Supabase per-user with fallback localStorage
  useEffect(() => {
    if (!user) return
    let mounted = true
    ;(async () => {
      try {
        const remote = await loadModuleData<PeoplePayload>('people', user.id)
        if (remote && mounted) {
          setRelationships(remote.relationships)
        } else if (!remote) {
          await saveModuleData('people', user.id, { relationships })
        }
      } catch (err) {
        console.error('Sync people load failed', err)
      }
    })()
    return () => { mounted = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  useEffect(() => {
    if (!user) return
    ;(async () => {
      try {
        await saveModuleData('people', user.id, { relationships })
      } catch (err) {
        console.error('Sync people save failed', err)
      }
    })()
  }, [relationships, user])

  const radarData = ['A', 'B', 'C', 'D', 'E'].map((g) => {
    const items = relationships.filter((r) => r.group === g)
    const impact = items.length ? items.reduce((s, r) => s + r.impact, 0) / items.length : 0
    return { group: g, impact }
  })

  const topValueGivers = [...relationships]
    .sort((a, b) => b.impact - a.impact)
    .slice(0, 5)

  const topValueDrainers = [...relationships]
    .sort((a, b) => a.impact - b.impact)
    .slice(0, 5)

  const cadenceDays: Record<string, number> = { A: 7, B: 21, C: 75, D: 180, E: 9999 }

  const careTracker = relationships.map((r) => {
    const last = r.lastContact ? new Date(r.lastContact) : null
    const diffDays = last ? Math.floor((Date.now() - last.getTime()) / (1000 * 60 * 60 * 24)) : Number.MAX_SAFE_INTEGER
    const threshold = cadenceDays[r.group] ?? 30
    let need = 'Đúng hạn'
    if (!r.lastContact) need = 'Chưa có liên hệ'
    else if (diffDays > threshold) need = 'Quá hạn'
    else if (diffDays > threshold * 0.8) need = 'Sắp đến hạn'
    const daysTo = !r.lastContact ? '—' : Math.max(0, threshold - diffDays)
    return { ...r, need, daysTo }
  })

  const actionSuggestions = useMemo(() => {
    const priorityOrder: Record<string, number> = { A: 1, B: 2, C: 3, D: 4, E: 5 }
    const urgent = careTracker
      .filter((c) => c.need === 'Quá hạn' || c.need === 'Sắp đến hạn')
      .sort((a, b) => (priorityOrder[a.group] ?? 99) - (priorityOrder[b.group] ?? 99) || (a.daysTo as number) - (b.daysTo as number))

    const noContact = careTracker.filter((c) => !c.lastContact).slice(0, 3)

    const prompt = (group: string) => {
      switch (group) {
        case 'A': return 'Gợi ý: hỏi thăm ngắn + lời cảm ơn cụ thể, chốt lịch gặp'
        case 'B': return 'Gợi ý: cập nhật dự án / bài học mới, rủ cafe tuần này'
        case 'C': return 'Gợi ý: tin nhắn 3 dòng: hỏi thăm, nhắc kỷ niệm, chúc điều nhỏ'
        case 'D': return 'Gợi ý: tin nhắn nhẹ nhàng, giữ lịch sử quan hệ nhưng hạn chế đầu tư thêm'
        default: return 'Gợi ý: nếu gây hao năng lượng, cân nhắc dừng chủ động liên hệ'
      }
    }

    return { urgent, noContact, prompt }
  }, [careTracker])

  const buildTips = (r: Relationship) => {
    const tips: string[] = []
    if (r.intel.talk) tips.push(`Cách nói chuyện hợp: ${r.intel.talk}`)
    if (r.intel.maintain) tips.push(`Giữ quan hệ: ${r.intel.maintain}`)
    if (r.intel.hate) tips.push(`Tránh: ${r.intel.hate}`)
    if (r.theirPrinciples) tips.push(`Nguyên tắc của họ: ${r.theirPrinciples}`)
    if (r.promises) tips.push(`Bạn đã hứa: ${r.promises}`)
    if (daysUntilBirthday(r.birthday) !== null) tips.push(`Sinh nhật còn ${daysUntilBirthday(r.birthday)} ngày`)
    return tips
  }

  const getLunarAnimal = (birthday?: string) => {
    if (!birthday) return '—'
    const year = Number(birthday.split('-')[0])
    if (!year) return '—'
    const animals = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi']
    return animals[year % 12]
  }

  const getNguHanh = (birthday?: string) => {
    if (!birthday) return '—'
    const year = Number(birthday.split('-')[0])
    if (!year) return '—'
    const elements = ['Kim', 'Thủy', 'Mộc', 'Hỏa', 'Thổ']
    return elements[year % 5]
  }

  const buildAiAnalysis = (r: Relationship) => {
    const energyVals = (r.contacts ?? []).map((c) => c.energy ?? 0)
    const energyAvg = energyVals.length ? energyVals.reduce((s, v) => s + v, 0) / energyVals.length : 0
    const myPromises = (r.promiseItems ?? []).filter((p) => p.owner === 'me')
    const theirPromises = (r.promiseItems ?? []).filter((p) => p.owner === 'them')
    const pendingMy = myPromises.filter((p) => p.status !== 'done')
    const pendingTheir = theirPromises.filter((p) => p.status !== 'done')
    const latestContacts = [...(r.contacts ?? [])].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 2)
    const recentDecisions = relatedDecisions.slice(0, 2)
    const recentEnergyNotes = relatedTimeEnergy.slice(0, 2)
    const userZodiac = userProfile.birthdate ? getZodiacDetails(userProfile.birthdate).sign : '—'
    const userLifePath = userProfile.birthdate ? getNumerologyDetails(userProfile.birthdate).lifePath : '—'
    const notes: string[] = []
    notes.push(`Tổng quan: ${r.name} (${r.role}) thuộc nhóm ${r.group}, năng lượng TB ${energyAvg.toFixed(2)} (${energyVals.length} log) → ${energyAvg >= 0 ? 'giữ nhịp' : 'cần hạ nhịp'}.`)
    notes.push(`Bản thân tôi: ${userProfile.name || '—'} · ${userProfile.birthdate || '—'} · Zodiac ${userZodiac} · Life Path ${userLifePath}.`)
    notes.push(`Tháng này: năng lượng với ${r.name} ${personMonthEnergy.avg !== null ? personMonthEnergy.avg.toFixed(2) : '—'} (${personMonthEnergy.count} log) · năng lượng tổng của tôi ${userMonthEnergy.avg !== null ? userMonthEnergy.avg.toFixed(2) : '—'} (${userMonthEnergy.count} log).`)
    if (r.group === 'A' || r.group === 'B') notes.push('Nhóm A/B: ưu tiên 50%/30% năng lượng, giữ cadence')
    if (r.group === 'D' || r.group === 'E') notes.push('Nhóm D/E: hạn chế đầu tư, chỉ liên hệ khi cần')
    if (r.birthday) notes.push(`Zodiac: ${getZodiac(r.birthday)} (gợi ý: chọn khung giờ họ thoải mái)`) 
    notes.push(`Life Path: ${getLifePath(r.birthday)} · Tuổi (12 con giáp): ${getLunarAnimal(r.birthday)} · Ngũ hành: ${getNguHanh(r.birthday)}`)
    notes.push(`Lời hứa: bạn hứa (${pendingMy.length} việc chờ) · họ hứa (${pendingTheir.length} việc chờ)`) 
    notes.push(`Sự kiện gần đây: ${latestContacts.map((c) => `${c.date} (${c.mood || '—'} · NL ${c.energy ?? 0})`).join(' · ') || '—'}`)
    notes.push(`Quyết định liên quan: ${recentDecisions.map((d) => d.title).join(' · ') || '—'}`)
    notes.push(`Time & Energy liên quan: ${relatedEnergyAvg !== null ? relatedEnergyAvg.toFixed(1) : '—'} (${relatedTimeEnergy.length} log) · ${recentEnergyNotes.map((l) => `${l.date}: ${l.energy_level}`).join(' · ') || '—'}`)
    notes.push('Nếu cần: tải API horoscope/numerology để trả về chi tiết ngày tốt/xấu, tương hợp/ngũ hành.')
    return notes
  }

  const energyStats = useMemo(() => {
    const withEnergy = relationships.map((r) => {
      const energies = (r.contacts ?? []).map((c) => c.energy ?? 0)
      const avg = energies.length ? energies.reduce((s, v) => s + v, 0) / energies.length : 0
      return { id: r.id, name: r.name, group: r.group, avg, count: energies.length }
    })
    const strongest = [...withEnergy].filter((x) => x.count > 0).sort((a, b) => b.avg - a.avg).slice(0, 3)
    const weakest = [...withEnergy].filter((x) => x.count > 0).sort((a, b) => a.avg - b.avg).slice(0, 3)
    return { strongest, weakest }
  }, [relationships])

  const lowEnergyAlerts = useMemo(() => {
    return relationships
      .map((r) => {
        const lastThree = [...(r.contacts ?? [])].slice(-3)
        const energies = lastThree.map((c) => c.energy ?? 0)
        const avg = energies.length ? energies.reduce((s, v) => s + v, 0) / energies.length : 0
        const negativeStreak = energies.length === 3 && energies.every((v) => v < 0)
        return { id: r.id, name: r.name, group: r.group, avg, negativeStreak, lastContact: r.lastContact }
      })
      .filter((x) => x.negativeStreak || x.avg < 0)
  }, [relationships])

  const weeklySummary = useMemo(() => {
    const now = new Date()
    const rangeStart = new Date(now)
    if (reportRange === 'week') rangeStart.setDate(now.getDate() - 7)
    if (reportRange === 'month') rangeStart.setMonth(now.getMonth() - 1)
    if (reportRange === 'quarter') rangeStart.setMonth(now.getMonth() - 3)
    if (reportRange === 'year') rangeStart.setFullYear(now.getFullYear() - 1)
    const groupAgg: Record<Group, { count: number; energySum: number; energyCount: number }> = {
      A: { count: 0, energySum: 0, energyCount: 0 },
      B: { count: 0, energySum: 0, energyCount: 0 },
      C: { count: 0, energySum: 0, energyCount: 0 },
      D: { count: 0, energySum: 0, energyCount: 0 },
      E: { count: 0, energySum: 0, energyCount: 0 }
    }
    const personAgg: { name: string; group: Group; count: number; energyAvg: number }[] = []

    relationships.forEach((r) => {
      const logs = (r.contacts ?? []).filter((c) => {
        const d = new Date(c.date)
        return !Number.isNaN(d.getTime()) && d >= rangeStart && d <= now
      })
      logs.forEach((c) => {
        groupAgg[r.group].count += 1
        if (typeof c.energy === 'number') {
          groupAgg[r.group].energySum += c.energy
          groupAgg[r.group].energyCount += 1
        }
      })
      const energyVals = logs.map((c) => c.energy ?? 0)
      const energyAvg = energyVals.length ? energyVals.reduce((s, v) => s + v, 0) / energyVals.length : 0
      personAgg.push({ name: r.name, group: r.group, count: logs.length, energyAvg })
    })

    const topActive = personAgg.filter((p) => p.count > 0).sort((a, b) => b.count - a.count).slice(0, 3)

    return { groupAgg, personAgg, topActive }
  }, [relationships, reportRange])

  type CalendarEvent = { label: string; date: string; relId: number; type: 'birthday' | 'promise' | 'cadence' }

  const calendarData = useMemo(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const events: CalendarEvent[] = relationships.flatMap((r) => {
      const list: CalendarEvent[] = []
      if (r.birthday) {
        const [, bm, bd] = r.birthday.split('-').map(Number)
        if (bm - 1 === month) {
          list.push({ label: `Sinh nhật ${r.name}`, date: new Date(year, month, bd).toISOString().split('T')[0], relId: r.id, type: 'birthday' })
        }
      }
      if (r.promises) {
        list.push({ label: `Lời hứa với ${r.name}`, date: now.toISOString().split('T')[0], relId: r.id, type: 'promise' })
      }
      const cadenceDay = cadenceDays[r.group]
      if (cadenceDay) {
        const base = r.lastContact ? new Date(r.lastContact) : new Date()
        base.setDate(base.getDate() + cadenceDay)
        if (base.getMonth() === month) {
          list.push({ label: `Cadence ${r.name}`, date: base.toISOString().split('T')[0], relId: r.id, type: 'cadence' })
        }
      }
      return list
    })

    const days: { day: number | null; dateStr: string | null; events: CalendarEvent[] }[] = Array.from({ length: firstDay + daysInMonth }, (_, idx) => {
      const dayNum = idx - firstDay + 1
      if (dayNum < 1 || dayNum > daysInMonth) return { day: null, dateStr: null, events: [] }
      const dateStr = new Date(year, month, dayNum).toISOString().split('T')[0]
      return { day: dayNum, dateStr, events: events.filter((e) => e.date === dateStr) }
    })

    const monthLabel = now.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })
    return { days, monthLabel, events }
  }, [relationships])

  const getZodiac = (birthday?: string) => {
    if (!birthday) return '—'
    const [y, m, d] = birthday.split('-').map(Number)
    if (!y || !m || !d) return '—'
    const md = m * 100 + d
    if (md >= 321 && md <= 419) return 'Bạch Dương'
    if (md >= 420 && md <= 520) return 'Kim Ngưu'
    if (md >= 521 && md <= 620) return 'Song Tử'
    if (md >= 621 && md <= 722) return 'Cự Giải'
    if (md >= 723 && md <= 822) return 'Sư Tử'
    if (md >= 823 && md <= 922) return 'Xử Nữ'
    if (md >= 923 && md <= 1022) return 'Thiên Bình'
    if (md >= 1023 && md <= 1121) return 'Bọ Cạp'
    if (md >= 1122 && md <= 1221) return 'Nhân Mã'
    if (md >= 1222 || md <= 119) return 'Ma Kết'
    if (md >= 120 && md <= 218) return 'Bảo Bình'
    return 'Song Ngư'
  }

  const getLifePath = (birthday?: string) => {
    if (!birthday) return '—'
    const nums = birthday.replace(/-/g, '').split('').map(Number).filter((n) => !Number.isNaN(n))
    if (!nums.length) return '—'
    const reduceOnce = (n: number): number => {
      if (n === 11 || n === 22 || n === 33) return n
      const s = n.toString().split('').reduce((acc, v) => acc + Number(v), 0)
      return s >= 10 && s !== 11 && s !== 22 && s !== 33 ? reduceOnce(s) : s
    }
    const total = nums.reduce((s, v) => s + v, 0)
    return String(reduceOnce(total))
  }

  const evaluationCriteria = [
    { key: 'feeling', label: 'Cảm xúc sau khi gặp', hint: 'Cảm giác + / - sau cuộc gặp' },
    { key: 'boundary', label: 'Tôn trọng ranh giới', hint: 'Họ có tôn trọng thởi gian / không ép buộc' },
    { key: 'growth', label: 'Giúp phát triển', hint: 'Mang lại cơ hội / kiến thức / thúc đẩy' },
    { key: 'honesty', label: 'Thật lòng', hint: 'Chân thành, không thao túng' },
    { key: 'authentic', label: 'Là chính mình', hint: 'Bạn có phải gồng / giả vờ không' }
  ]

  const groupKeys = ['A', 'B', 'C', 'D', 'E'] as const
  const desiredDistribution: Record<Group, number> = { A: 50, B: 30, C: 15, D: 5, E: 0 }
  const actualDistribution = relationships.reduce<Record<Group, number>>((acc, r) => {
    const key = r.group
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, { A: 0, B: 0, C: 0, D: 0, E: 0 })

  const totalScore = (scores?: number[]) => scores?.reduce((s, v) => s + (v || 0), 0) ?? 0

  const behaviorScore = (r: Relationship) => {
    const intelFilled = Object.values(r.intel ?? {}).filter((v) => (v || '').trim()).length
    const intelScore = Math.min(40, intelFilled * 5)
    const contactCount = (r.contacts ?? []).length
    const contactScore = Math.min(30, contactCount * 3)
    const energyVals = (r.contacts ?? []).map((c) => c.energy ?? 0)
    const energyAvg = energyVals.length ? energyVals.reduce((s, v) => s + v, 0) / energyVals.length : 0
    const energyScore = Math.round(((energyAvg + 2) / 4) * 20)
    const cadence = cadenceDays[r.group] ?? 30
    const last = r.lastContact ? new Date(r.lastContact) : null
    const diffDays = last ? Math.floor((Date.now() - last.getTime()) / (1000 * 60 * 60 * 24)) : Number.MAX_SAFE_INTEGER
    const cadenceScore = diffDays <= cadence ? 10 : diffDays <= cadence * 1.5 ? 5 : 0
    const total = intelScore + contactScore + energyScore + cadenceScore
    return { total: Math.min(100, Math.max(0, total)), breakdown: { intelScore, contactScore, energyScore, cadenceScore }, energyAvg, contactCount }
  }

  const daysUntil = (dateStr?: string) => {
    if (!dateStr) return null
    const d = new Date(dateStr)
    if (Number.isNaN(d.getTime())) return null
    const diff = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return diff
  }

  const daysUntilBirthday = (date?: string) => {
    if (!date) return null
    const today = new Date()
    const thisYear = new Date(`${today.getFullYear()}-${date.slice(5)}`)
    const nextBirthday = thisYear < today ? new Date(`${today.getFullYear() + 1}-${date.slice(5)}`) : thisYear
    const diff = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  useEffect(() => {
    const saved = localStorage.getItem('userProfile')
    if (saved) {
      try {
        setUserProfile(JSON.parse(saved))
      } catch (err) {
        console.error('Failed to parse user profile', err)
      }
    }
    const savedSettings = localStorage.getItem('appSettings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings) as AppSettings
        setDarkMode(parsed.darkMode)
      } catch (err) {
        console.error('Failed to parse app settings', err)
      }
    }

    const handleSettings = (event: Event) => {
      const detail = (event as CustomEvent<AppSettings>).detail
      if (!detail) return
      setDarkMode(detail.darkMode)
    }

    window.addEventListener('app-settings-changed', handleSettings)
    return () => window.removeEventListener('app-settings-changed', handleSettings)
  }, [])

  useEffect(() => {
    const previous = localStorage.getItem('peopleRelationships')
    if (previous) {
      localStorage.setItem('peopleRelationshipsBackup', previous)
    }
  }, [relationships])

  useEffect(() => {
    const saved = localStorage.getItem('decisionsData')
    if (!saved) return
    try {
      setDecisionsData(JSON.parse(saved))
    } catch (err) {
      console.error('Failed to parse decisions data', err)
    }
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('timeEnergyData')
    if (!saved) return
    try {
      setTimeEnergyData(JSON.parse(saved))
    } catch (err) {
      console.error('Failed to parse time energy data', err)
    }
  }, [])

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    const promiseItems: PromiseItem[] = []
    if (newRel.myPromiseDraft?.trim()) {
      promiseItems.push({
        title: newRel.myPromiseDraft.trim(),
        dueDate: addDays(14),
        createdAt: todayIso(),
        status: 'pending',
        owner: 'me'
      })
    }
    if (newRel.theirPromiseDraft?.trim()) {
      promiseItems.push({
        title: newRel.theirPromiseDraft.trim(),
        dueDate: addDays(14),
        createdAt: todayIso(),
        status: 'pending',
        owner: 'them'
      })
    }
    const next = {
      id: Date.now(),
      ...newRel,
      group: newRel.group as Group,
      impact: Number(newRel.impact) || 0,
      promiseItems: promiseItems.length ? promiseItems : newRel.promiseItems,
      scores: [0, 0, 0, 0, 0]
    }
    setRelationships((prev) => [...prev, next])
    setNewRel({
      name: '',
      role: '',
      group: 'C' as Group,
      impact: 5,
      lastContact: '',
      birthday: '',
      note: '',
      promises: '',
      theirPrinciples: '',
      intel: blankIntel,
      contacts: [],
      faceImage: '',
      faceNote: '',
      myPromiseDraft: '',
      theirPromiseDraft: ''
    })
  }

  const handleFaceUpload = (file?: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setNewRel((prev) => ({ ...prev, faceImage: String(reader.result || '') }))
    }
    reader.readAsDataURL(file)
  }

  const handleDetailFaceUpload = (relId: number, file?: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const image = String(reader.result || '')
      setRelationships((prev) => prev.map((r) => (r.id === relId ? { ...r, faceImage: image } : r)))
    }
    reader.readAsDataURL(file)
  }

  const selectedRel = useMemo(() => relationships.find((r) => r.id === detailId) ?? null, [detailId, relationships])

  const relatedDecisions = useMemo(() => {
    if (!selectedRel) return [] as DecisionItem[]
    const key = selectedRel.name.toLowerCase()
    return decisionsData.filter((d) => {
      const hay = `${d.title} ${d.tags ?? ''} ${d.context ?? ''}`.toLowerCase()
      return hay.includes(key)
    })
  }, [decisionsData, selectedRel])

  const relatedTimeEnergy = useMemo(() => {
    if (!selectedRel) return [] as TimeEnergyLog[]
    const key = selectedRel.name.toLowerCase()
    return timeEnergyData.filter((l) => (l.notes ?? '').toLowerCase().includes(key))
  }, [selectedRel, timeEnergyData])

  const relatedEnergyAvg = useMemo(() => {
    if (!relatedTimeEnergy.length) return null
    const values = relatedTimeEnergy.map((l) => Number(l.energy_level) || 0)
    const avg = values.reduce((s, v) => s + v, 0) / values.length
    return avg
  }, [relatedTimeEnergy])

  const monthKey = (dateStr: string) => dateStr.slice(0, 7)

  const personMonthEnergy = useMemo(() => {
    if (!selectedRel) return { avg: null as number | null, count: 0 }
    const nowKey = monthKey(todayIso())
    const logs = (selectedRel.contacts ?? []).filter((c) => c.date && monthKey(c.date) === nowKey)
    if (!logs.length) return { avg: null as number | null, count: 0 }
    const values = logs.map((c) => Number(c.energy ?? 0))
    const avg = values.reduce((s, v) => s + v, 0) / values.length
    return { avg, count: logs.length }
  }, [selectedRel])

  const userMonthEnergy = useMemo(() => {
    const nowKey = monthKey(todayIso())
    const logs = timeEnergyData.filter((l) => l.date && monthKey(l.date) === nowKey)
    if (!logs.length) return { avg: null as number | null, count: 0 }
    const values = logs.map((l) => Number(l.energy_level) || 0)
    const avg = values.reduce((s, v) => s + v, 0) / values.length
    return { avg, count: logs.length }
  }, [timeEnergyData])

  useEffect(() => {
    if (selectedRel) {
      setAiAnalysis(buildAiAnalysis(selectedRel))
    }
  }, [selectedRel])

  const addContactLog = (e: React.FormEvent) => {
    e.preventDefault()
    if (!detailId) return
    const dateVal = contactDraft.date || todayIso()
    setRelationships((prev) => prev.map((r) => (r.id === detailId ? {
      ...r,
      lastContact: dateVal,
      contacts: [...(r.contacts ?? []), { date: dateVal, note: contactDraft.note, mood: contactDraft.mood, energy: Number(contactDraft.energy) || 0, feeling: contactDraft.feeling }]
    } : r)))
    setContactDraft({ date: '', note: '', mood: '', energy: 0, feeling: '' })
  }

  const getGroupColor = (group: string) => {
    switch (group) {
      case 'A': return 'bg-green-100 text-green-800'
      case 'B': return 'bg-blue-100 text-blue-800'
      case 'C': return 'bg-yellow-100 text-yellow-800'
      case 'D': return 'bg-orange-100 text-orange-800'
      case 'E': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const renderEnergyBar = (avg: number) => {
    const percent = Math.max(0, Math.min(100, ((avg + 2) / 4) * 100))
    return (
      <div className="w-full h-1.5 bg-gray-200 rounded-full">
        <div className={`h-full rounded-full ${avg >= 0 ? 'bg-green-500' : 'bg-amber-500'}`} style={{ width: `${percent}%` }} />
      </div>
    )
  }

  const rescheduleCadence = (relId: number, newDate: string) => {
    const rel = relationships.find((r) => r.id === relId)
    if (!rel) return
    const days = cadenceDays[rel.group]
    if (!days) return
    const base = new Date(newDate)
    base.setDate(base.getDate() - days)
    const newLast = base.toISOString().split('T')[0]
    setRelationships((prev) => prev.map((r) => (r.id === relId ? { ...r, lastContact: newLast } : r)))
  }

  const eventsForView = useMemo(() => {
    const events = calendarData.events
    if (viewMode === 'month') return events
    if (viewMode === 'day') return events.filter((e) => e.date === selectedDate)
    // week view: selectedDate +/- 3 days
    const base = new Date(selectedDate)
    const start = new Date(base)
    start.setDate(start.getDate() - base.getDay() + 1) // Monday start
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    return events.filter((e) => {
      const d = new Date(e.date)
      return d >= start && d <= end
    })
  }, [calendarData.events, selectedDate, viewMode])

  const smartSlot = () => {
    return `${freeSlot.start} - ${freeSlot.end}`
  }

  return (
    <div className={`${darkMode ? 'bg-slate-900 text-slate-100' : 'bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900'} min-h-screen`}>
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <label className={`flex items-center gap-2 text-sm ${darkMode ? 'text-slate-200' : 'text-gray-700'}`}>
          View:
          <select className={`px-2 py-1 rounded ${inputBase}`} value={viewMode} onChange={(e) => setViewMode(e.target.value as 'month' | 'week' | 'day')}>
            <option value="month">Month</option>
            <option value="week">Week</option>
            <option value="day">Day</option>
          </select>
        </label>
        <label className={`flex items-center gap-2 text-sm ${darkMode ? 'text-slate-200' : 'text-gray-700'}`}>
          Ngày chọn:
          <input className={`px-2 py-1 rounded ${inputBase}`} type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
        </label>
        <label className={`flex items-center gap-2 text-sm ${darkMode ? 'text-slate-200' : 'text-gray-700'}`}>
          Giờ rảnh (bắt đầu):
          <input className={`px-2 py-1 rounded w-24 ${inputBase}`} type="time" value={freeSlot.start} onChange={(e) => setFreeSlot({ ...freeSlot, start: e.target.value })} />
        </label>
        <label className={`flex items-center gap-2 text-sm ${darkMode ? 'text-slate-200' : 'text-gray-700'}`}>
          Giờ rảnh (kết thúc):
          <input className={`px-2 py-1 rounded w-24 ${inputBase}`} type="time" value={freeSlot.end} onChange={(e) => setFreeSlot({ ...freeSlot, end: e.target.value })} />
        </label>
      </div>

      {/* Calendar-like upcoming events */}
      <div className={`p-4 rounded-lg shadow mb-6 border ${cardBase}`}>
        <h3 className="text-lg font-semibold mb-3">Lịch sắp tới (sinh nhật / lời hứa / cadence)</h3>
        <ul className={`list-disc list-inside text-sm space-y-1 ${darkMode ? 'text-slate-200' : 'text-gray-700'}`}>
          {eventsForView.sort((a, b) => a.date.localeCompare(b.date)).slice(0, 8).map((ev, idx) => {
            return (
              <li key={`${ev.label}-${idx}`} className="flex flex-col md:flex-row md:items-center md:justify-between gap-1">
                <span>
                  <span className="font-medium">{ev.label}</span> — {ev.date}
                  {ev.type === 'cadence' && <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}> (cadence)</span>}
                </span>
                <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Gợi ý giờ: {smartSlot()}</span>
                {ev.type === 'cadence' && (
                  <label className={`flex items-center gap-1 text-xs ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                    Dời sang:
                    <input type="date" className={`px-1 py-0.5 rounded ${inputBase}`} onChange={(e) => rescheduleCadence(ev.relId, e.target.value)} />
                  </label>
                )}
                <button className="text-xs text-blue-600 underline" onClick={() => setDetailId(ev.relId)}>Xem/đổi lịch</button>
              </li>
            )
          })}
          {relationships.length === 0 && <li>—</li>}
        </ul>
      </div>

      {/* Month calendar grid */}
      <div className={`p-4 rounded-lg shadow mb-6 border ${cardBase}`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Tháng này: {calendarData.monthLabel}</h3>
          <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Click sự kiện để mở chi tiết</span>
        </div>
        <div className={`grid grid-cols-7 text-xs font-semibold mb-2 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
          {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d) => <div key={d} className="text-center">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1 text-xs">
          {calendarData.days.map((cell, idx) => (
            <div key={idx} className={`min-h-[80px] border rounded p-1 ${cell.day ? (darkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-gray-50') : 'bg-transparent'} ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
              {cell.day && <div className={`text-right text-[11px] font-semibold ${darkMode ? 'text-slate-200' : 'text-gray-700'}`}>{cell.day}</div>}
              <div className="space-y-1">
                {cell.events.slice(0,3).map((ev, i) => (
                  <button key={i} className={`w-full text-left text-[11px] truncate ${darkMode ? 'text-blue-300' : 'text-blue-700'}`} onClick={() => setDetailId(ev.relId)}>
                    • {ev.label}
                  </button>
                ))}
                {cell.events.length > 3 && <div className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>+{cell.events.length - 3} more</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
      <h1 className="text-2xl font-bold mb-6">People</h1>

      <details className={`text-sm p-4 rounded-lg mb-4 border ${darkMode ? 'bg-blue-900/20 border-blue-800 text-blue-100' : 'bg-blue-50 border-blue-100 text-blue-900'}`}>
        <summary className="font-semibold cursor-pointer">Flow đề xuất (customer-centric)</summary>
        <ol className="list-decimal list-inside space-y-1 mt-2">
          <li>Chọn nhóm A–E theo năng lượng (A 50%, B 30%, C 15%, D 5%, E 0).</li>
          <li>Điền “Thấu triệt” tối thiểu 3 ý (tính cách / cần gì / ghét gì).</li>
          <li>Đặt Last contact → bảng Care tracker sẽ đếm ngược & nhắc.</li>
          <li>Log liên hệ ngay sau khi nhắn/gọi → trạng thái về “Đúng hạn”.</li>
          <li>Chấm 5 tiêu chí 0–10 → nếu &lt;25: hạ ưu tiên.</li>
        </ol>
      </details>

      {/* Alerts: năng lượng thấp, lời hứa, sinh nhật */}
      <div className={`border text-sm p-4 rounded-lg mb-6 ${darkMode ? 'bg-amber-900/20 border-amber-700 text-amber-100' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
        <h3 className="text-lg font-semibold mb-2">Cảnh báo & nhắc nhở</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Nhóm năng lượng thấp: {lowEnergyAlerts.length ? lowEnergyAlerts.map((a) => `${a.name} (avg ${a.avg.toFixed(2)})`).join(', ') : '—'}</li>
          <li>Lời hứa/hẹn sắp tới: {relationships.filter(r => r.promises).map(r => r.name).join(', ') || '—'}</li>
          <li>Sinh nhật ≤14 ngày: {relationships.filter(r => daysUntilBirthday(r.birthday) !== null && (daysUntilBirthday(r.birthday) as number) <= 14).map(r => `${r.name} (${r.birthday})`).join(', ') || '—'}</li>
        </ul>
        <p className="text-xs text-amber-800 mt-1">Gợi ý: ưu tiên liên hệ A/B có cảnh báo năng lượng thấp, hoàn thành lời hứa, chuẩn bị sinh nhật.</p>
      </div>


      {/* Dashboard report */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className={`rounded-xl p-4 lg:col-span-2 ${cardBase}`}>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h3 className="text-lg font-semibold">Báo cáo nhanh</h3>
            <div className="flex items-center gap-2 text-xs">
              <span className={darkMode ? 'text-slate-400' : 'text-gray-500'}>Sức khỏe mối quan hệ · {reportRangeLabel[reportRange]}</span>
              <div className={`flex items-center gap-1 rounded-full p-1 ${darkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
                {(['week', 'month', 'quarter', 'year'] as const).map((range) => (
                  <button
                    key={range}
                    type="button"
                    className={`px-2 py-1 rounded-full ${reportRange === range ? (darkMode ? 'bg-slate-900 text-blue-300 shadow' : 'bg-white shadow text-blue-600') : (darkMode ? 'text-slate-400' : 'text-gray-500')}`}
                    onClick={() => setReportRange(range)}
                  >
                    {range === 'week' && 'Tuần'}
                    {range === 'month' && 'Tháng'}
                    {range === 'quarter' && 'Quý'}
                    {range === 'year' && 'Năm'}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-800">
            <div className={`rounded-lg border p-3 ${cardSoft}`}>
              <p className="font-medium mb-2">Vòng tròn A–E (thực tế / mục tiêu)</p>
              <div className="space-y-2">
                {groupKeys.map((g) => {
                  const members = relationships.filter((r) => r.group === g)
                  const isOpen = expandedGroups[g]
                  const actual = actualDistribution[g]
                  const target = desiredDistribution[g]
                  const widthActual = Math.min(100, (actual / Math.max(1, relationships.length)) * 100)
                  const expected = Math.max(1, Math.round((target / 100) * relationships.length))
                  return (
                    <div key={g} className={`rounded-md border px-3 py-2 text-xs ${cardInner}`}>
                      <button
                        type="button"
                        className="w-full text-left"
                        onClick={() => setExpandedGroups((prev) => ({ ...prev, [g]: !prev[g] }))}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">Nhóm {g}</span>
                          <span className="text-[11px] text-blue-600">{isOpen ? 'Ẩn' : 'Xem'}</span>
                        </div>
                        <div className={`flex items-center justify-between text-[11px] mt-1 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                          <span>Thực tế: {actual}</span>
                          <span>Mục tiêu: {target}%</span>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500" style={{ width: `${widthActual}%` }} />
                          </div>
                          <span className="text-[11px] text-amber-600">{actual < expected ? 'Thiếu' : 'Đủ/Thừa'}</span>
                        </div>
                      </button>
                      {isOpen && (
                        <div className="mt-2 border-t pt-2 space-y-1">
                          {members.length ? members.map((m) => (
                            <button
                              key={m.id}
                              className={`w-full text-left text-[11px] ${darkMode ? 'text-slate-200 hover:text-blue-300' : 'text-gray-700 hover:text-blue-600'}`}
                              onClick={() => setDetailId(m.id)}
                            >
                              • {m.name} ({m.role || '—'})
                            </button>
                          )) : (
                            <p className={`text-[11px] ${darkMode ? 'text-slate-500' : 'text-gray-500'}`}>—</p>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
            <div className={`rounded-lg border p-3 ${cardSoft}`}>
              <p className="font-medium mb-2">Năng lượng</p>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-green-700 font-semibold mb-1">Mạnh lên</p>
                  <div className="space-y-2">
                    {energyStats.strongest.length ? energyStats.strongest.map((e) => (
                      <div key={e.id} className={`rounded-md border px-2 py-2 text-xs ${cardInner}`}>
                        <div className={`flex justify-between text-[11px] ${darkMode ? 'text-slate-200' : 'text-gray-700'}`}>
                          <span>{e.name}</span>
                          <span>{e.avg.toFixed(2)} · {e.count} log</span>
                        </div>
                        {renderEnergyBar(e.avg)}
                      </div>
                    )) : <div className={`text-xs ${darkMode ? 'text-slate-500' : 'text-gray-500'}`}>—</div>}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-amber-700 font-semibold mb-1">Mệt mỏi</p>
                  <div className="space-y-2">
                    {energyStats.weakest.length ? energyStats.weakest.map((e) => (
                      <div key={e.id} className={`rounded-md border px-2 py-2 text-xs ${cardInner}`}>
                        <div className={`flex justify-between text-[11px] ${darkMode ? 'text-slate-200' : 'text-gray-700'}`}>
                          <span>{e.name}</span>
                          <span>{e.avg.toFixed(2)} · {e.count} log</span>
                        </div>
                        {renderEnergyBar(e.avg)}
                      </div>
                    )) : <div className="text-xs text-gray-500">—</div>}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 text-sm ${darkMode ? 'text-slate-100' : 'text-gray-800'} mt-3`}>
            <div className={`rounded-lg border p-3 ${cardSoft}`}>
              <p className="font-medium" title={`Số log và năng lượng trung bình ${reportRangeLabel[reportRange]} theo nhóm`}>
                Tổng kết {reportRangeLabel[reportRange]}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {groupKeys.map((g) => {
                  const data = weeklySummary.groupAgg[g]
                  const avg = data.energyCount ? (data.energySum / data.energyCount) : 0
                  return (
                    <div key={g} className={`rounded-md border px-2 py-2 text-xs ${cardInner}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Nhóm {g}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[11px] ${avg >= 0 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {avg >= 0 ? 'Ổn' : 'Cảnh báo'}
                        </span>
                      </div>
                      <div className={`mt-1 text-[11px] ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Log: {data.count}</div>
                      <div className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Năng lượng: {avg.toFixed(2)}</div>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className={`rounded-lg border p-3 ${cardSoft}`}>
              <p className="font-medium" title={`Người bạn tương tác nhiều nhất ${reportRangeLabel[reportRange]}`}>Top tương tác {reportRangeLabel[reportRange]}</p>
              <div className="mt-2 space-y-2">
                {weeklySummary.topActive.length ? weeklySummary.topActive.map((p) => (
                  <div key={p.name} className={`flex items-center justify-between rounded-md border px-3 py-2 text-xs ${cardInner}`}>
                    <div>
                      <p className="font-semibold">{p.name}</p>
                      <p className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Nhóm {p.group}</p>
                    </div>
                    <div className={`text-right text-[11px] ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                      <div>{p.count} log</div>
                      <div>NL {p.energyAvg.toFixed(2)}</div>
                    </div>
                  </div>
                )) : <div className="text-xs text-gray-500">—</div>}
              </div>
            </div>
          </div>
        </div>
        <div className={`rounded-lg p-3 border ${cardBase}`}>
          <h4 className="font-semibold mb-2">Hành động ưu tiên</h4>
          <div className="space-y-2">
            <div>
              <p className="font-medium">Quá hạn / Sắp đến hạn (ưu tiên A/B):</p>
              <ul className={`list-disc list-inside space-y-1 ${darkMode ? 'text-slate-200' : 'text-gray-700'}`}>
                {careTracker.filter((c) => c.need === 'Quá hạn' || c.need === 'Sắp đến hạn').map((c) => (
                  <li key={`${c.name}-due`} className="flex justify-between"><span>{c.name}</span><span className="text-amber-500 text-xs">{c.need}</span></li>
                )) || <li>—</li>}
                {!careTracker.some((c) => c.need === 'Quá hạn' || c.need === 'Sắp đến hạn') && <li>—</li>}
              </ul>
            </div>
            <div>
              <p className="font-medium">Chưa từng liên hệ:</p>
              <ul className={`list-disc list-inside space-y-1 ${darkMode ? 'text-slate-200' : 'text-gray-700'}`}>
                {actionSuggestions.noContact.length ? actionSuggestions.noContact.map((c) => (
                  <li key={`${c.id}-nocontact`} className="flex justify-between"><span>{c.name}</span><span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Nhóm {c.group}</span></li>
                )) : <li>—</li>}
              </ul>
            </div>
          </div>
        </div>
        <div className={`rounded-lg p-3 border ${cardBase}`}>
          <h4 className="font-semibold mb-2">Relationship Radar (A-E)</h4>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="group" />
                <PolarRadiusAxis angle={30} domain={[0, 10]} />
                <Radar name="Impact" dataKey="impact" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className={`rounded-lg p-3 border ${cardBase}`}>
          <h4 className="font-semibold mb-2">Top 5 Sinh Vận</h4>
          <ul className="space-y-2 text-xs">
            {topValueGivers.map((r) => (
              <li key={r.id} className={`flex items-center justify-between rounded-md px-2 py-1 ${cardSoft}`}>
                <div>
                  <p className="font-semibold">{r.name}</p>
                  <p className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Nhóm {r.group} · Impact {r.impact}</p>
                </div>
                <span className="text-green-600 font-semibold">+{r.impact}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className={`rounded-lg p-3 border ${cardBase}`}>
          <h4 className="font-semibold mb-2">Top 5 Hút Vận</h4>
          <ul className="space-y-2 text-xs">
            {topValueDrainers.map((r) => (
              <li key={r.id} className={`flex items-center justify-between rounded-md px-2 py-1 ${cardSoft}`}>
                <div>
                  <p className="font-semibold">{r.name}</p>
                  <p className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Nhóm {r.group} · Impact {r.impact}</p>
                </div>
                <span className="text-orange-600 font-semibold">{r.impact}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>


      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className={`rounded-2xl shadow-xl w-full max-w-4xl p-6 ${cardBase}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Thêm mối quan hệ</h3>
              <button className={`${darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-gray-500 hover:text-gray-800'}`} onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <form onSubmit={(e) => {
              handleAdd(e)
              setShowAddModal(false)
            }} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 text-sm">
              <input className={`px-3 py-2 rounded ${inputBase}`} placeholder="Tên" value={newRel.name} onChange={(e) => setNewRel({ ...newRel, name: e.target.value })} required />
              <input className={`px-3 py-2 rounded ${inputBase}`} placeholder="Vai trò" value={newRel.role} onChange={(e) => setNewRel({ ...newRel, role: e.target.value })} />
              <select className={`px-3 py-2 rounded ${inputBase}`} value={newRel.group} onChange={(e) => setNewRel({ ...newRel, group: e.target.value as Group })}>
                {groupKeys.map((g) => <option key={g} value={g}>Nhóm {g}</option>)}
              </select>
              <input className={`px-3 py-2 rounded ${inputBase}`} type="number" min="0" max="10" step="0.5" placeholder="Impact 0-10" value={newRel.impact} onChange={(e) => setNewRel({ ...newRel, impact: Number(e.target.value) })} />
              <div className="flex flex-col gap-1">
                <label className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Lần liên hệ gần nhất</label>
                <input className={`px-3 py-2 rounded ${inputBase}`} type="date" value={newRel.lastContact} onChange={(e) => setNewRel({ ...newRel, lastContact: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1">
                <label className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Sinh nhật</label>
                <input className={`px-3 py-2 rounded ${inputBase}`} type="date" value={newRel.birthday} onChange={(e) => setNewRel({ ...newRel, birthday: e.target.value })} />
              </div>
              <input className={`px-3 py-2 rounded md:col-span-3 lg:col-span-5 ${inputBase}`} placeholder="Ghi chú" value={newRel.note} onChange={(e) => setNewRel({ ...newRel, note: e.target.value })} />
              <div className="md:col-span-3 lg:col-span-5 grid grid-cols-1 md:grid-cols-2 gap-2">
                <input className={`px-3 py-2 rounded ${inputBase}`} placeholder="Lời hứa: mình hứa họ" value={newRel.myPromiseDraft} onChange={(e) => setNewRel({ ...newRel, myPromiseDraft: e.target.value })} />
                <input className={`px-3 py-2 rounded ${inputBase}`} placeholder="Lời hứa: họ hứa mình" value={newRel.theirPromiseDraft} onChange={(e) => setNewRel({ ...newRel, theirPromiseDraft: e.target.value })} />
              </div>
              <input className={`px-3 py-2 rounded md:col-span-3 lg:col-span-5 ${inputBase}`} placeholder="Nguyên tắc / ranh giới của họ" value={newRel.theirPrinciples} onChange={(e) => setNewRel({ ...newRel, theirPrinciples: e.target.value })} />
              <div className="md:col-span-3 lg:col-span-5 grid grid-cols-1 md:grid-cols-2 gap-2">
                <label className={`flex flex-col gap-1 text-xs ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                  Ảnh nhân tướng học
                  <input
                    className={`px-3 py-2 rounded text-sm ${inputBase}`}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFaceUpload(e.target.files?.[0])}
                  />
                </label>
                <textarea
                  className={`px-3 py-2 rounded ${inputBase}`}
                  placeholder="Ghi chú nhanh về nhân tướng (trán, mắt, mũi...)"
                  value={newRel.faceNote}
                  onChange={(e) => setNewRel({ ...newRel, faceNote: e.target.value })}
                />
              </div>
              <div className="md:col-span-3 lg:col-span-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                <input className={`px-3 py-2 rounded ${inputBase}`} placeholder="Tính cách" value={newRel.intel.personality} onChange={(e) => setNewRel({ ...newRel, intel: { ...newRel.intel, personality: e.target.value } })} />
                <input className={`px-3 py-2 rounded ${inputBase}`} placeholder="Giá trị sống" value={newRel.intel.values} onChange={(e) => setNewRel({ ...newRel, intel: { ...newRel.intel, values: e.target.value } })} />
                <input className={`px-3 py-2 rounded ${inputBase}`} placeholder="Sợ điều gì" value={newRel.intel.fear} onChange={(e) => setNewRel({ ...newRel, intel: { ...newRel.intel, fear: e.target.value } })} />
                <input className={`px-3 py-2 rounded ${inputBase}`} placeholder="Điều họ cần" value={newRel.intel.need} onChange={(e) => setNewRel({ ...newRel, intel: { ...newRel.intel, need: e.target.value } })} />
                <input className={`px-3 py-2 rounded ${inputBase}`} placeholder="Điều họ ghét" value={newRel.intel.hate} onChange={(e) => setNewRel({ ...newRel, intel: { ...newRel.intel, hate: e.target.value } })} />
                <input className={`px-3 py-2 rounded ${inputBase}`} placeholder="Cách nói chuyện hợp" value={newRel.intel.talk} onChange={(e) => setNewRel({ ...newRel, intel: { ...newRel.intel, talk: e.target.value } })} />
                <input className={`px-3 py-2 rounded ${inputBase}`} placeholder="Khi họ căng thẳng" value={newRel.intel.stress} onChange={(e) => setNewRel({ ...newRel, intel: { ...newRel.intel, stress: e.target.value } })} />
                <input className={`px-3 py-2 rounded ${inputBase}`} placeholder="Cách giữ quan hệ" value={newRel.intel.maintain} onChange={(e) => setNewRel({ ...newRel, intel: { ...newRel.intel, maintain: e.target.value } })} />
              </div>
              <div className="md:col-span-3 lg:col-span-5 flex items-center justify-end gap-2">
                <button type="button" className={`px-4 py-2 rounded border ${darkMode ? 'border-slate-600 text-slate-200' : 'border-gray-300'}`} onClick={() => setShowAddModal(false)}>Hủy</button>
                <button className="bg-blue-600 text-white rounded px-4 py-2" type="submit">Thêm (mock)</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <button
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-blue-600 text-white px-4 py-3 shadow-lg hover:bg-blue-700"
        onClick={() => setShowAddModal(true)}
      >
        <span className="text-lg">＋</span>
        <span className="text-sm font-medium">Mối quan hệ</span>
      </button>

      {/* Relationships list controls */}
      <div className={`border rounded-lg p-3 mb-4 flex flex-wrap items-center gap-3 text-sm ${cardBase}`}>
        <input
          className={`px-3 py-2 rounded w-full md:w-64 ${inputBase}`}
          placeholder="Tìm theo tên / vai trò / ghi chú"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select className={`px-3 py-2 rounded ${inputBase}`} value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}>
          <option value="impact">Sort: Impact</option>
          <option value="score">Sort: Tổng điểm</option>
          <option value="group">Sort: Nhóm</option>
          <option value="name">Sort: Tên</option>
        </select>
        <label className={`flex items-center gap-2 text-xs ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
          <input type="checkbox" checked={onlyPendingPromises} onChange={(e) => setOnlyPendingPromises(e.target.checked)} />
          Có lời hứa chưa xong
        </label>
        <div className={`ml-auto flex items-center gap-1 rounded-full p-1 text-xs ${darkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
          <button type="button" className={`px-2 py-1 rounded-full ${peopleView === 'grid' ? (darkMode ? 'bg-slate-900 text-blue-300 shadow' : 'bg-white shadow text-blue-600') : (darkMode ? 'text-slate-400' : 'text-gray-500')}`} onClick={() => setPeopleView('grid')}>Grid</button>
          <button type="button" className={`px-2 py-1 rounded-full ${peopleView === 'list' ? (darkMode ? 'bg-slate-900 text-blue-300 shadow' : 'bg-white shadow text-blue-600') : (darkMode ? 'text-slate-400' : 'text-gray-500')}`} onClick={() => setPeopleView('list')}>List</button>
        </div>
      </div>

      <div className={`mt-3 flex flex-wrap items-center gap-2 rounded-xl border p-2 text-xs ${darkMode ? 'border-slate-800 bg-slate-900/70 text-slate-200' : 'border-gray-200 bg-gray-50 text-gray-700'}`}>
        <button
          type="button"
          className={`px-2 py-1 rounded ${bulkMode ? (darkMode ? 'bg-slate-800 text-blue-200' : 'bg-white text-blue-600 shadow') : (darkMode ? 'text-slate-300' : 'text-gray-600')}`}
          onClick={() => {
            setBulkMode((prev) => !prev)
            setSelectedIds([])
          }}
        >
          {bulkMode ? 'Tắt chọn hàng loạt' : 'Chọn hàng loạt'}
        </button>
        <button
          type="button"
          className={`px-2 py-1 rounded ${quickEdit ? (darkMode ? 'bg-slate-800 text-amber-200' : 'bg-white text-amber-600 shadow') : (darkMode ? 'text-slate-300' : 'text-gray-600')}`}
          onClick={() => setQuickEdit((prev) => !prev)}
        >
          {quickEdit ? 'Tắt chỉnh nhanh' : 'Chỉnh nhanh'}
        </button>
        {bulkMode && (
          <>
            <button type="button" className={`px-2 py-1 rounded ${darkMode ? 'text-slate-200 hover:bg-slate-800' : 'text-gray-700 hover:bg-gray-100'}`} onClick={toggleSelectAll}>
              {selectedIds.length === filteredRelationships.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
            </button>
            <button
              type="button"
              className={`px-2 py-1 rounded ${selectedIds.length ? (darkMode ? 'bg-red-900/40 text-red-200' : 'bg-red-50 text-red-600') : (darkMode ? 'text-slate-500' : 'text-gray-400')}`}
              onClick={bulkDelete}
              disabled={!selectedIds.length}
            >
              Xóa ({selectedIds.length})
            </button>
          </>
        )}
      </div>

      {/* Relationships Grid/List */}
      {peopleView === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRelationships.map((relationship) => (
            <div key={relationship.id} className={`p-4 rounded-lg shadow border ${cardBase}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {bulkMode && (
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(relationship.id)}
                      onChange={() => toggleSelect(relationship.id)}
                      className="h-4 w-4"
                    />
                  )}
                  {quickEdit ? (
                    <input
                      className={`px-2 py-1 rounded ${inputBase}`}
                      value={relationship.name}
                      onChange={(e) => updateRelationshipField(relationship.id, { name: e.target.value })}
                    />
                  ) : (
                    <h3 className="text-lg font-semibold">{relationship.name}</h3>
                  )}
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getGroupColor(relationship.group)}`}>
                  Group {relationship.group}
                </span>
              </div>
              {quickEdit ? (
                <div className="grid grid-cols-1 gap-2 mb-2 text-xs">
                  <input
                    className={`px-2 py-1 rounded ${inputBase}`}
                    value={relationship.role}
                    placeholder="Vai trò"
                    onChange={(e) => updateRelationshipField(relationship.id, { role: e.target.value })}
                  />
                  <div className="flex items-center gap-2">
                    <input
                      className={`px-2 py-1 rounded w-24 ${inputBase}`}
                      type="number"
                      min="0"
                      max="10"
                      step="0.5"
                      value={relationship.impact}
                      onChange={(e) => updateRelationshipField(relationship.id, { impact: Number(e.target.value) })}
                    />
                    <input
                      className={`px-2 py-1 rounded ${inputBase}`}
                      type="date"
                      value={relationship.lastContact || ''}
                      onChange={(e) => updateRelationshipField(relationship.id, { lastContact: e.target.value })}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <p className={`${darkMode ? 'text-slate-300' : 'text-gray-600'} mb-1`}>{relationship.role}</p>
                  <p className={`${darkMode ? 'text-slate-400' : 'text-gray-500'} text-sm mb-1`}>Impact: {relationship.impact}/10</p>
                </>
              )}
              <p className={`${darkMode ? 'text-slate-400' : 'text-gray-500'} text-xs mb-1`}>Ghi chú: {relationship.note || '—'}</p>
              <div className={`flex items-center justify-between text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                <span>Last: {relationship.lastContact || '—'}</span>
                <span>{relationship.group === 'D' || relationship.group === 'E' ? '⚠️ Xem xét tránh' : ''}</span>
              </div>
              <div className="mt-2 text-sm">
                <p className="font-medium">Tổng điểm: {totalScore(relationship.scores)} / 50</p>
                <p className={`text-xs ${totalScore(relationship.scores) < 25 ? 'text-red-600' : 'text-green-600'}`}>
                  {totalScore(relationship.scores) < 25 ? 'Hạ ưu tiên' : 'Ổn định'}
                </p>
                <p className="text-xs text-gray-600">Độ hành xử: {behaviorScore(relationship).total}/100</p>
              </div>
              <button
                className="mt-3 text-sm text-blue-600 underline"
                onClick={() => setDetailId(relationship.id)}
              >
                Xem chi tiết / nhật ký
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredRelationships.map((relationship) => (
            <div key={relationship.id} className={`p-3 rounded-lg shadow border flex flex-wrap items-center gap-3 text-sm ${cardBase}`}>
              <div className="min-w-[180px] flex items-center gap-2">
                {bulkMode && (
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(relationship.id)}
                    onChange={() => toggleSelect(relationship.id)}
                    className="h-4 w-4"
                  />
                )}
                <div>
                  {quickEdit ? (
                    <input
                      className={`px-2 py-1 rounded ${inputBase}`}
                      value={relationship.name}
                      onChange={(e) => updateRelationshipField(relationship.id, { name: e.target.value })}
                    />
                  ) : (
                    <p className="font-semibold">{relationship.name}</p>
                  )}
                  {quickEdit ? (
                    <input
                      className={`mt-1 px-2 py-1 rounded ${inputBase}`}
                      value={relationship.role}
                      placeholder="Vai trò"
                      onChange={(e) => updateRelationshipField(relationship.id, { role: e.target.value })}
                    />
                  ) : (
                    <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{relationship.role || '—'}</p>
                  )}
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getGroupColor(relationship.group)}`}>
                Group {relationship.group}
              </span>
              {quickEdit ? (
                <input
                  className={`px-2 py-1 rounded w-20 ${inputBase}`}
                  type="number"
                  min="0"
                  max="10"
                  step="0.5"
                  value={relationship.impact}
                  onChange={(e) => updateRelationshipField(relationship.id, { impact: Number(e.target.value) })}
                />
              ) : (
                <span className={`text-xs ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>Impact {relationship.impact}/10</span>
              )}
              <span className="text-xs text-gray-600">Điểm {totalScore(relationship.scores)}/50</span>
              <span className="text-xs text-gray-600">Hành xử {behaviorScore(relationship).total}/100</span>
              {quickEdit ? (
                <input
                  className={`px-2 py-1 rounded ${inputBase}`}
                  type="date"
                  value={relationship.lastContact || ''}
                  onChange={(e) => updateRelationshipField(relationship.id, { lastContact: e.target.value })}
                />
              ) : (
                <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Last: {relationship.lastContact || '—'}</span>
              )}
              {(relationship.promiseItems ?? []).some((p) => p.status === 'pending' || p.status === 'late') && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Có lời hứa</span>
              )}
              <button className="ml-auto text-xs text-blue-600 underline" onClick={() => setDetailId(relationship.id)}>
                Xem chi tiết
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selectedRel && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-start justify-center z-50 overflow-y-auto p-4" onClick={() => setDetailId(null)}>
          <div className="bg-white max-w-4xl w-full rounded-2xl shadow-lg p-6 relative text-sm" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-3 right-3 text-gray-500" onClick={() => setDetailId(null)}>✕</button>
            <div className="flex flex-wrap items-start gap-3 mb-4">
              <div>
                <h2 className="text-xl font-semibold">{selectedRel.name}</h2>
                <p className="text-gray-600">{selectedRel.role}</p>
                <p className="text-sm text-gray-500">Nhóm {selectedRel.group} · Impact {selectedRel.impact}/10</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getGroupColor(selectedRel.group)}`}>Group {selectedRel.group}</span>
              <div className="text-sm text-gray-500">Last contact: {selectedRel.lastContact || '—'}</div>
              <div className="text-sm text-gray-500">Tổng điểm: {totalScore(selectedRel.scores)} / 50</div>
              <div className="text-sm text-gray-500">Độ hành xử: {behaviorScore(selectedRel).total} / 100</div>
              {selectedRel.birthday && <div className="text-sm text-gray-500">Sinh nhật: {selectedRel.birthday} (còn {daysUntilBirthday(selectedRel.birthday)} ngày)</div>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
              <details className="border rounded-xl p-3 bg-gray-50" open={false}>
                <summary className="font-semibold cursor-pointer">Thấu triệt (mở để xem chi tiết)</summary>
                <ul className="space-y-1 text-gray-700 mt-2">
                  <li><span className="font-semibold">Tính cách:</span> {selectedRel.intel.personality || '—'}</li>
                  <li><span className="font-semibold">Giá trị:</span> {selectedRel.intel.values || '—'}</li>
                  <li><span className="font-semibold">Sợ điều gì:</span> {selectedRel.intel.fear || '—'}</li>
                  <li><span className="font-semibold">Cần gì:</span> {selectedRel.intel.need || '—'}</li>
                  <li><span className="font-semibold">Ghét gì:</span> {selectedRel.intel.hate || '—'}</li>
                  <li><span className="font-semibold">Cách nói chuyện hợp:</span> {selectedRel.intel.talk || '—'}</li>
                  <li><span className="font-semibold">Khi căng thẳng:</span> {selectedRel.intel.stress || '—'}</li>
                  <li><span className="font-semibold">Giữ quan hệ:</span> {selectedRel.intel.maintain || '—'}</li>
                  <li><span className="font-semibold">Lời hứa/hẹn:</span> {selectedRel.promises || '—'}</li>
                  <li><span className="font-semibold">Nguyên tắc của họ:</span> {selectedRel.theirPrinciples || '—'}</li>
                </ul>
              </details>
              <div className="border rounded-xl p-3 bg-gray-50">
                <p className="font-semibold mb-2">Phân tích nhanh</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Trạng thái: {totalScore(selectedRel.scores) < 25 ? 'Hạ ưu tiên / xem lại ranh giới' : 'Ổn định'}</li>
                  <li>Đề xuất: {selectedRel.group === 'A' || selectedRel.group === 'B' ? 'Ưu tiên duy trì cadence, log sau mỗi tương tác' : 'Giữ khoảng cách nếu hao năng lượng'}</li>
                  <li>Ghi chú: {selectedRel.note || '—'}</li>
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-xl p-3">
                <p className="font-semibold mb-2">Nhật ký liên hệ</p>
                <form onSubmit={addContactLog} className="space-y-2 text-sm">
                  <label className="flex flex-col gap-1">
                    <span className="text-xs text-gray-600">Ngày liên hệ</span>
                    <input className="border rounded px-2 py-1 w-full" type="date" value={contactDraft.date} onChange={(e) => setContactDraft({ ...contactDraft, date: e.target.value })} />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs text-gray-600">Tâm trạng / mood</span>
                    <select className="border rounded px-2 py-1 w-full" value={contactDraft.mood} onChange={(e) => setContactDraft({ ...contactDraft, mood: e.target.value })}>
                      <option value="">Chọn</option>
                      {moodOptions.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs text-gray-600">Nội dung liên hệ / hành động</span>
                    <textarea className="border rounded px-2 py-1 w-full" value={contactDraft.note} onChange={(e) => setContactDraft({ ...contactDraft, note: e.target.value })} />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs text-gray-600">Điểm năng lượng (-2..+2)</span>
                    <input className="border rounded px-2 py-1 w-full" type="number" min="-2" max="2" step="1" value={contactDraft.energy} onChange={(e) => setContactDraft({ ...contactDraft, energy: Number(e.target.value) })} />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs text-gray-600">Cảm xúc sau gặp</span>
                    <select className="border rounded px-2 py-1 w-full" value={contactDraft.feeling} onChange={(e) => setContactDraft({ ...contactDraft, feeling: e.target.value })}>
                      <option value="">Chọn</option>
                      {feelingOptions.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </label>
                  <button type="submit" className="bg-blue-600 text-white rounded px-3 py-1">Lưu log</button>
                </form>
                <div className="mt-3 space-y-2 text-sm">
                  {(selectedRel.contacts ?? []).slice().reverse().map((c, idx) => (
                    <div key={`${c.date}-${idx}`} className="border rounded px-2 py-1 bg-gray-50">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>{c.date}</span>
                        <span>{c.mood || ''}</span>
                      </div>
                      <p className="text-gray-800 text-sm">{c.note || '—'}</p>
                      <p className="text-xs text-gray-500">Năng lượng: {typeof c.energy === 'number' ? c.energy : '—'} | Cảm xúc: {c.feeling || '—'}</p>
                    </div>
                  ))}
                  {(!selectedRel.contacts || selectedRel.contacts.length === 0) && <p className="text-xs text-gray-500">Chưa có log.</p>}
                </div>
              </div>
              <div className="border rounded-xl p-3 space-y-3">
                <div className="mb-3">
                  <p className="font-semibold mb-2">Lời hứa & cam kết</p>
                  {(() => {
                    const items = [...(selectedRel.promiseItems ?? [])].sort((a, b) => a.dueDate.localeCompare(b.dueDate))
                    const mine = items.filter((p) => p.owner === 'me')
                    const theirs = items.filter((p) => p.owner === 'them')
                    const renderBlock = (label: string, list: PromiseItem[]) => {
                      const pending = list.filter((p) => p.status === 'pending' || p.status === 'late')
                      const history = list.filter((p) => p.status === 'done')
                      return (
                        <div className="space-y-2">
                          <p className="font-semibold">{label}</p>
                          <div className="space-y-2">
                            <div>
                              <p className="text-[11px] text-gray-500">Sắp tới / Trễ</p>
                              {pending.length ? (
                                <ul className="space-y-1">
                                  {pending.map((p, idx) => {
                                    const days = daysUntil(p.dueDate)
                                    const statusLabel = p.status === 'late' ? 'Trễ' : 'Còn'
                                    return (
                                      <li key={`${label}-${p.title}-${idx}`} className="flex justify-between">
                                        <span>{p.title}</span>
                                        <span className={p.status === 'late' ? 'text-red-600' : 'text-amber-600'}>
                                          {statusLabel} {days !== null ? `${Math.abs(days)} ngày` : '—'}
                                        </span>
                                      </li>
                                    )
                                  })}
                                </ul>
                              ) : (
                                <p className="text-gray-500">—</p>
                              )}
                            </div>
                            <div>
                              <p className="text-[11px] text-gray-500">Lịch sử đã hứa</p>
                              {history.length ? (
                                <ul className="space-y-1">
                                  {history.map((p, idx) => (
                                    <li key={`${label}-done-${idx}`}>
                                      {p.title} · {p.createdAt} → {p.completedAt || '—'} {p.notes ? `(${p.notes})` : ''}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-gray-500">—</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    }
                    return (
                      <div className="grid grid-cols-1 gap-3 text-xs text-gray-700">
                        {renderBlock('Mình hứa họ', mine)}
                        {renderBlock('Họ hứa mình', theirs)}
                      </div>
                    )
                  })()}
                </div>
                <p className="font-semibold mb-2">Điểm & Intel</p>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  <li>Tổng điểm: {totalScore(selectedRel.scores)} / 50</li>
                  <li>Impact: {selectedRel.impact}/10</li>
                  <li>Độ hành xử: {behaviorScore(selectedRel).total} / 100</li>
                  <li>Cadence: nhóm {selectedRel.group} ({cadenceDays[selectedRel.group as (typeof groupKeys)[number]]} ngày)</li>
                  <li>Lần liên hệ gần nhất: {selectedRel.lastContact || '—'}</li>
                  {selectedRel.birthday && <li>Sinh nhật: {selectedRel.birthday} (còn {daysUntilBirthday(selectedRel.birthday)} ngày)</li>}
                  {selectedRel.promises && <li>Lời hứa/hẹn: {selectedRel.promises}</li>}
                  {selectedRel.theirPrinciples && <li>Nguyên tắc của họ: {selectedRel.theirPrinciples}</li>}
                </ul>
                <div className="mt-2">
                  <div className="flex flex-wrap items-center gap-2 rounded-full bg-gray-100 p-1 text-xs">
                    <button type="button" className={`px-3 py-1 rounded-full ${insightTab === 'tips' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`} onClick={() => setInsightTab('tips')}>Gợi ý</button>
                    <button type="button" className={`px-3 py-1 rounded-full ${insightTab === 'zodiac' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`} onClick={() => setInsightTab('zodiac')}>Zodiac</button>
                    <button type="button" className={`px-3 py-1 rounded-full ${insightTab === 'numerology' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`} onClick={() => setInsightTab('numerology')}>Numerology</button>
                    <button type="button" className={`px-3 py-1 rounded-full ${insightTab === 'lunar' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`} onClick={() => setInsightTab('lunar')}>12 con giáp</button>
                    <button type="button" className={`px-3 py-1 rounded-full ${insightTab === 'face' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`} onClick={() => setInsightTab('face')}>Nhân tướng</button>
                    <button type="button" className={`px-3 py-1 rounded-full ${insightTab === 'ai' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`} onClick={() => setInsightTab('ai')}>AI</button>
                  </div>
                  {insightTab === 'tips' && (
                    <div className="mt-3">
                      <p className="font-semibold">Gợi ý ứng xử</p>
                      <ul className="list-disc list-inside text-xs text-gray-700 space-y-1">
                        {buildTips(selectedRel).map((t, idx) => <li key={idx}>{t}</li>) || <li>—</li>}
                      </ul>
                    </div>
                  )}
                  {insightTab === 'zodiac' && (
                    <div className="mt-3">
                      {(() => {
                        const zodiac = getZodiacDetails(selectedRel.birthday)
                        return (
                          <div className="rounded-lg bg-gray-50 p-2 space-y-1">
                            <p className="font-semibold">Zodiac: {zodiac.sign}</p>
                            <p>Nguyên tố: {zodiac.element} · Nhịp: {zodiac.tone}</p>
                            <p>Trọng tâm: {zodiac.focus}</p>
                          </div>
                        )
                      })()}
                    </div>
                  )}
                  {insightTab === 'numerology' && (
                    <div className="mt-3">
                      {(() => {
                        const num = getNumerologyDetails(selectedRel.birthday)
                        return (
                          <div className="rounded-lg bg-gray-50 p-2 space-y-1">
                            <p className="font-semibold">Life Path: {num.lifePath}</p>
                            <p>Chủ đề: {num.theme}</p>
                            <p>Thế mạnh: {num.strength}</p>
                            <p>Lưu ý: {num.caution}</p>
                          </div>
                        )
                      })()}
                    </div>
                  )}
                  {insightTab === 'lunar' && (
                    <div className="mt-3">
                      <div className="rounded-lg bg-gray-50 p-2 space-y-1">
                        <p className="font-semibold">Tuổi (12 con giáp): {getLunarAnimal(selectedRel.birthday)}</p>
                        <p>Ngũ hành: {getNguHanh(selectedRel.birthday)}</p>
                        <p>Gợi ý: giữ lời hứa [{selectedRel.promises || '—'}], tôn trọng nguyên tắc [{selectedRel.theirPrinciples || '—'}], liên hệ lại trước sinh nhật.</p>
                      </div>
                    </div>
                  )}
                  {insightTab === 'face' && (
                    <div className="mt-3">
                      <div className="rounded-lg bg-gray-50 p-2 space-y-2">
                        <p className="font-semibold">Nhân tướng học</p>
                        <label className="flex flex-col gap-1 text-xs text-gray-600">
                          Upload ảnh (phân tích nhân tướng)
                          <input
                            className="border px-2 py-1 rounded text-xs"
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleDetailFaceUpload(selectedRel.id, e.target.files?.[0])}
                          />
                        </label>
                        {selectedRel.faceImage ? (
                          <img src={selectedRel.faceImage} alt="Face" className="w-full max-h-48 object-cover rounded" />
                        ) : (
                          <p className="text-xs text-gray-500">Chưa có ảnh.</p>
                        )}
                        <p className="text-xs text-gray-600">Ghi chú: {selectedRel.faceNote || '—'}</p>
                        <p className="text-[11px] text-gray-500">(Demo) Có thể tích hợp API nhân tướng học để phân tích trán/mắt/mũi/miệng.</p>
                      </div>
                    </div>
                  )}
                  {insightTab === 'ai' && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">Phân tích AI (rule-based)</p>
                        <button
                          type="button"
                          className="text-xs text-blue-600 underline"
                          onClick={() => selectedRel && setAiAnalysis(buildAiAnalysis(selectedRel))}
                        >
                          Phân tích lại
                        </button>
                      </div>
                      <ul className="list-disc list-inside text-xs text-gray-700 space-y-1">
                        {aiAnalysis.map((t, idx) => <li key={idx}>{t}</li>) || <li>—</li>}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="mt-3">
                  <p className="font-semibold text-sm mb-1">Chấm điểm (0–10)</p>
                  <form
                    className="grid grid-cols-1 gap-2 text-xs"
                    onSubmit={(e) => {
                      e.preventDefault()
                      setRelationships((prev) => prev.map((r) => r.id === selectedRel.id ? { ...r, scores: [...evalForm.scores] } : r))
                    }}
                  >
                    {evaluationCriteria.map((c, idx) => (
                      <div key={c.key} className="flex items-center gap-2">
                        <span className="w-44 text-gray-700">{c.label}</span>
                        <input
                          className="border rounded px-2 py-1 w-20"
                          type="number"
                          min="0"
                          max="10"
                          step="1"
                          value={evalForm.scores[idx]}
                          onChange={(e) => {
                            const next = [...evalForm.scores]
                            next[idx] = Number(e.target.value)
                            setEvalForm({ ...evalForm, id: selectedRel.id, scores: next })
                          }}
                        />
                        <span className="text-gray-500 text-[11px]">{c.hint}</span>
                      </div>
                    ))}
                    <button type="submit" className="mt-1 bg-blue-600 text-white rounded px-3 py-1 text-xs">Lưu điểm</button>
                    <p className="text-[11px] text-gray-500">Gợi ý: Tổng &lt; 25 điểm → hạ ưu tiên.</p>
                  </form>
                </div>
                <div className="border-t pt-3 space-y-3">
                  <div>
                    <p className="font-semibold mb-2">Quyết định liên quan</p>
                    {relatedDecisions.length ? (
                      <ul className="space-y-2 text-xs text-gray-700">
                        {relatedDecisions.map((d) => (
                          <li key={d.id} className="rounded-lg border bg-gray-50 px-2 py-2">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold">{d.title}</span>
                              <span className="text-[11px] text-gray-500">{d.date || '—'}</span>
                            </div>
                            <p className="text-[11px] text-gray-600">{d.tags || '—'}</p>
                            <p className="text-[11px] text-gray-500">{d.context || '—'}</p>
                            <p className="text-[11px] text-gray-500">Kết quả: {d.outcome || '—'} · Follow-up: {d.followUp || '—'}</p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-gray-500">Chưa có quyết định liên quan.</p>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold mb-2">Time & Energy (liên quan)</p>
                    <div className="text-xs text-gray-600 mb-1">
                      Trung bình năng lượng: {relatedEnergyAvg !== null ? relatedEnergyAvg.toFixed(1) : '—'} · Số log: {relatedTimeEnergy.length}
                    </div>
                    {relatedTimeEnergy.length ? (
                      <ul className="space-y-2 text-xs text-gray-700">
                        {relatedTimeEnergy.slice(0, 6).map((l, idx) => (
                          <li key={`${l.date}-${idx}`} className="rounded-lg border bg-gray-50 px-2 py-2">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold">{l.date}</span>
                              <span className="text-[11px] text-gray-500">Energy {l.energy_level}</span>
                            </div>
                            <p className="text-[11px] text-gray-500">{l.notes || '—'}</p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-gray-500">Chưa có log time & energy liên quan.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

export default People
