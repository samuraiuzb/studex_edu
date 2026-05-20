/**
 * Teacher Tests page — list, create, delete tests.
 * Features: search/filter, test scheduling, Excel question import.
 */
import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import api from '../../api/client'
import toast from 'react-hot-toast'

const DEFAULT_FORM = {
    name: '', description: '', time_limit: 30, max_attempts: 3,
    access_type: 'class', classroom: '', allowed_class: '', chatbot_mode: 'HINT_ONLY',
    material: '', is_active: true, start_date: '', end_date: ''
}

export default function TeacherTests() {
    const [tests, setTests] = useState([])
    const [materials, setMaterials] = useState([])
    const [classrooms, setClassrooms] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState(DEFAULT_FORM)
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState('')
    const [filterClassroom, setFilterClassroom] = useState('')
    const [importTestId, setImportTestId] = useState(null)
    const [importing, setImporting] = useState(false)
    const fileRef = useRef()
    const navigate = useNavigate()

    useEffect(() => {
        Promise.all([api.get('/teacher/tests/'), api.get('/teacher/materials/'), api.get('/teacher/classrooms/')])
            .then(([t, m, c]) => { setTests(t.data); setMaterials(m.data); setClassrooms(c.data); })
            .catch(() => toast.error('Ma\'lumot yuklanmadi'))
    }, [])

    const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

    async function handleCreate(e) {
        e.preventDefault()
        setLoading(true)
        try {
            const payload = {
                ...form,
                material: form.material || null,
                classroom: form.classroom || null,
                time_limit: Number(form.time_limit),
                max_attempts: Number(form.max_attempts),
                start_date: form.start_date || null,
                end_date: form.end_date || null,
            }
            const { data } = await api.post('/teacher/tests/', payload)
            setTests(t => [data, ...t])
            setShowForm(false)
            setForm(DEFAULT_FORM)
            toast.success('Test yaratildi! Savollar qo\'shing.')
            navigate(`/teacher/tests/${data.id}`)
        } catch {
            toast.error('Test yaratishda xato!')
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete(id) {
        if (!confirm('Testni o\'chirishni tasdiqlaysizmi?')) return
        try {
            await api.delete(`/teacher/tests/${id}/`)
            setTests(t => t.filter(x => x.id !== id))
            toast.success('Test o\'chirildi')
        } catch { toast.error('O\'chirishda xato!') }
    }

    async function handleImport(testId) {
        const file = fileRef.current?.files?.[0]
        if (!file) { toast.error('Excel fayl tanlang!'); return }
        setImporting(true)
        try {
            const fd = new FormData()
            fd.append('file', file)
            const { data } = await api.post(`/teacher/tests/${testId}/import-questions/`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            toast.success(`${data.created} ta savol qo'shildi!`)
            if (data.errors?.length) toast.error(`${data.errors.length} ta xato: ${data.errors[0]}`)
            setImportTestId(null)
            if (fileRef.current) fileRef.current.value = ''
            // Refresh test list
            api.get('/teacher/tests/').then(r => setTests(r.data))
        } catch { toast.error('Import xato!') } finally { setImporting(false) }
    }

    async function downloadTemplate() {
        try {
            const res = await api.get('/teacher/excel-template/', { responseType: 'blob' })
            const url = URL.createObjectURL(res.data)
            const a = document.createElement('a')
            a.href = url; a.download = 'savollar_shablon.xlsx'; a.click()
            URL.revokeObjectURL(url)
        } catch { toast.error('Shablon yuklanmadi') }
    }

    const filtered = tests.filter(t => {
        const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase())
        const matchClass = !filterClassroom || parseInt(t.classroom) === parseInt(filterClassroom)
            || (t.allowed_class && t.allowed_class === filterClassroom);
        return matchSearch && matchClass
    })

    const now = new Date()
    const isOpen = t => {
        const started = !t.start_date || new Date(t.start_date) <= now
        const notEnded = !t.end_date || new Date(t.end_date) >= now
        return started && notEnded
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
                <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
                    <h1 className="text-2xl font-extrabold">📝 Testlar</h1>
                    <div className="flex gap-2">
                        <button onClick={downloadTemplate} className="btn-secondary text-sm">
                            📥 Shablon
                        </button>
                        <button onClick={() => setShowForm(s => !s)} className="btn-primary">
                            {showForm ? '✕ Yopish' : '➕ Yangi test yaratish'}
                        </button>
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="flex gap-3 mb-5 flex-wrap">
                    <input
                        className="input flex-1 min-w-[180px]"
                        placeholder="🔍 Test nomini qidirish..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    {classrooms.length > 0 && (
                        <select className="input w-40" value={filterClassroom} onChange={e => setFilterClassroom(e.target.value)}>
                            <option value="">Barcha sinflar</option>
                            {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    )}
                </div>

                {/* Create form */}
                {showForm && (
                    <div className="card mb-6 animate-fade-in">
                        <h2 className="text-lg font-bold mb-4">Yangi test yaratish</h2>
                        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="input-label">Test nomi *</label>
                                <input className="input" placeholder="Algebra — 7-sinf" value={form.name} onChange={set('name')} required />
                            </div>
                            <div className="md:col-span-2">
                                <label className="input-label">Tavsif</label>
                                <textarea className="input" rows={2} placeholder="Ixtiyoriy..." value={form.description} onChange={set('description')} />
                            </div>
                            <div>
                                <label className="input-label">Vaqt chegarasi (daqiqa, 0=cheksiz)</label>
                                <input className="input" type="number" min="0" value={form.time_limit} onChange={set('time_limit')} />
                            </div>
                            <div>
                                <label className="input-label">Maksimal urinish soni</label>
                                <input className="input" type="number" min="1" value={form.max_attempts} onChange={set('max_attempts')} />
                            </div>
                            <div>
                                <label className="input-label">Kirish turi</label>
                                <select className="input" value={form.access_type} onChange={set('access_type')}>
                                    <option value="class">Faqat sinf</option>
                                    <option value="public">Hammaga ochiq</option>
                                </select>
                            </div>
                            {form.access_type === 'class' && (
                                <div>
                                    <label className="input-label">Sinf</label>
                                    <select className="input" value={form.classroom} onChange={set('classroom')}>
                                        <option value="">— Tanlang —</option>
                                        {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            )}
                            <div>
                                <label className="input-label">AI Chatbot rejimi</label>
                                <select className="input" value={form.chatbot_mode} onChange={set('chatbot_mode')}>
                                    <option value="OFF">O'chirilgan</option>
                                    <option value="HINT_ONLY">Faqat yo'naltirish</option>
                                    <option value="FULL_EXPLAIN">To'liq tushuntirish</option>
                                </select>
                            </div>
                            <div>
                                <label className="input-label">Bog'liq material (ixtiyoriy)</label>
                                <select className="input" value={form.material} onChange={set('material')}>
                                    <option value="">— Tanlanmagan —</option>
                                    {materials.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                                </select>
                            </div>

                            {/* Scheduling */}
                            <div>
                                <label className="input-label">📅 Boshlanish vaqti (ixtiyoriy)</label>
                                <input className="input" type="datetime-local" value={form.start_date} onChange={set('start_date')} />
                            </div>
                            <div>
                                <label className="input-label">⏳ Tugash vaqti (ixtiyoriy)</label>
                                <input className="input" type="datetime-local" value={form.end_date} onChange={set('end_date')} />
                            </div>

                            <div className="md:col-span-2 flex gap-3 pt-2">
                                <button type="submit" disabled={loading} className="btn-primary">
                                    {loading ? '⏳ Yaratilmoqda...' : '✅ Yaratish'}
                                </button>
                                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Bekor</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Tests list */}
                <div className="space-y-3">
                    {filtered.length === 0 && (
                        <div className="card text-center py-14 text-slate-400">
                            <p className="text-4xl mb-3">📭</p>
                            <p>{search ? 'Qidiruv bo\'yicha natija topilmadi' : 'Hali test yaratilmagan'}</p>
                        </div>
                    )}
                    {filtered.map(test => (
                        <div key={test.id}>
                            <div className="card-hover flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                                    📝
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="font-bold text-slate-800 dark:text-slate-200 truncate">{test.name}</h3>
                                        {isOpen(test)
                                            ? <span className="badge-green">Ochiq</span>
                                            : <span className="badge-red">Yopiq</span>}
                                        {!test.is_active && <span className="badge-red">Nofaol</span>}
                                        <span className="badge-blue">{test.questions_count} savol</span>
                                        {(test.classroom_name || test.allowed_class) && <span className="badge-purple">{test.classroom_name || test.allowed_class}</span>}
                                    </div>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        ⏱ {test.time_limit || '∞'} daqiqa | 🔄 {test.max_attempts} urinish
                                        {test.start_date && ` | 📅 ${new Date(test.start_date).toLocaleDateString('uz-UZ')} dan`}
                                        {test.end_date && ` — ${new Date(test.end_date).toLocaleDateString('uz-UZ')} gacha`}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                                    <button
                                        onClick={() => setImportTestId(importTestId === test.id ? null : test.id)}
                                        className="btn-secondary text-xs px-3 py-1.5"
                                        title="Excel dan savollar import qilish"
                                    >
                                        📥 Import
                                    </button>
                                    <Link to={`/teacher/tests/${test.id}/results`} className="btn-secondary text-xs px-3 py-1.5">
                                        📊 Natijalar
                                    </Link>
                                    <Link to={`/teacher/tests/${test.id}`} className="btn-primary text-xs px-3 py-1.5">
                                        ✏️ Tahrirlash
                                    </Link>
                                    <button onClick={() => handleDelete(test.id)} className="btn-danger text-xs px-3 py-1.5">🗑</button>
                                </div>
                            </div>

                            {/* Excel import panel */}
                            {importTestId === test.id && (
                                <div className="mt-1 ml-4 mr-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-200 dark:border-indigo-700 animate-fade-in">
                                    <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 mb-2">
                                        📥 Excel fayldan savollar import qilish
                                    </p>
                                    <p className="text-xs text-slate-500 mb-3">
                                        Fayl ustunlari: <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">Savol | A | B | C | D | To'g'ri | Tushuntirish | Qiyinlik</code>
                                    </p>
                                    <div className="flex gap-2 flex-wrap items-center">
                                        <input
                                            type="file"
                                            accept=".xlsx,.xls"
                                            ref={fileRef}
                                            className="text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                                        />
                                        <button
                                            onClick={() => handleImport(test.id)}
                                            disabled={importing}
                                            className="btn-primary text-sm"
                                        >
                                            {importing ? '⏳ Yuklanmoqda...' : '✅ Import qilish'}
                                        </button>
                                        <button onClick={() => setImportTestId(null)} className="btn-secondary text-sm">Bekor</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
