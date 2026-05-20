/**
 * Teacher Test Detail — edit test info + manage questions (add/delete).
 */
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import api from '../../api/client'
import toast from 'react-hot-toast'
import MathEditor from '../../components/MathEditor'
import MathText from '../../components/MathText'
import InteractiveGraph from '../../components/InteractiveGraph'
import FunctionPlot from '../../components/FunctionPlot'

const EMPTY_Q = { text: '', question_type: 'multiple_choice', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A', correct_answer_text: '', explanation: '', difficulty: 'medium', order: 0 }

export default function TeacherTestDetail() {
    const { id } = useParams()
    const [test, setTest] = useState(null)
    const [questions, setQuestions] = useState([])
    const [showQForm, setShowQForm] = useState(false)
    const [qForm, setQForm] = useState(EMPTY_Q)
    const [loading, setLoading] = useState(false)
    const [editingQId, setEditingQId] = useState(null)
    const [pairForm, setPairForm] = useState({ left_item: '', right_item: '' })
    const [pairLoading, setPairLoading] = useState(false)

    useEffect(() => {
        Promise.all([api.get(`/teacher/tests/${id}/`), api.get(`/teacher/tests/${id}/questions/`)])
            .then(([t, q]) => { setTest(t.data); setQuestions(q.data) })
            .catch(() => toast.error('Ma\'lumot yuklanmadi'))
    }, [id])

    const setQ = k => e => setQForm(f => ({ ...f, [k]: e.target.value }))

    async function handleAddQuestion(e) {
        e.preventDefault()
        setLoading(true)
        try {
            const { data } = await api.post(`/teacher/tests/${id}/questions/`, { ...qForm, test: Number(id), order: questions.length + 1 })
            setQuestions(q => [...q, data])
            setQForm(EMPTY_Q)
            setShowQForm(false)
            toast.success('Savol qo\'shildi!')
        } catch {
            toast.error('Savol qo\'shishda xato!')
        } finally {
            setLoading(false)
        }
    }

    async function handleDeleteQ(qId) {
        if (!confirm('Savolni o\'chirishni tasdiqlaysizmi?')) return
        try {
            await api.delete(`/teacher/questions/${qId}/`)
            setQuestions(q => q.filter(x => x.id !== qId))
            toast.success('Savol o\'chirildi')
        } catch {
            toast.error('O\'chirishda xato!')
        }
    }

    async function handleAddPair(questionId) {
        if (!pairForm.left_item || !pairForm.right_item) {
            toast.error('Ikkala maydonni to\'ldiring')
            return
        }
        setPairLoading(true)
        try {
            const { data } = await api.post(`/teacher/questions/${questionId}/matching-pairs/`, {
                question: questionId,
                left_item: pairForm.left_item,
                right_item: pairForm.right_item,
                order: 0
            })
            setQuestions(qs => qs.map(q =>
                q.id === questionId
                    ? { ...q, matching_pairs: [...(q.matching_pairs || []), data] }
                    : q
            ))
            setPairForm({ left_item: '', right_item: '' })
            toast.success('Juft qo\'shildi!')
        } catch (err) {
            console.error(err)
            toast.error('Juft qo\'shishda xato!')
        } finally {
            setPairLoading(false)
        }
    }

    async function handleDeletePair(questionId, pairId) {
        if (!confirm('Juftni o\'chirishni tasdiqlaysizmi?')) return
        try {
            await api.delete(`/teacher/matching-pairs/${pairId}/`)
            setQuestions(qs => qs.map(q =>
                q.id === questionId
                    ? { ...q, matching_pairs: (q.matching_pairs || []).filter(p => p.id !== pairId) }
                    : q
            ))
            toast.success('Juft o\'chirildi')
        } catch (err) {
            console.error(err)
            toast.error('O\'chirishda xato!')
        }
    }

    async function toggleActive() {
        try {
            const { data } = await api.patch(`/teacher/tests/${id}/`, { is_active: !test.is_active })
            setTest(data)
            toast.success(data.is_active ? 'Test faollashtirildi' : 'Test o\'chirildi')
        } catch { toast.error('Xato!') }
    }

    const diffBadge = d => d === 'easy' ? 'badge-green' : d === 'hard' ? 'badge-red' : 'badge-orange'
    const diffLabel = d => d === 'easy' ? 'Oson' : d === 'hard' ? 'Qiyin' : "O'rtacha"

    if (!test) return <div className="min-h-screen"><Navbar /><div className="flex justify-center items-center h-64"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div></div>

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
                {/* Test info header */}
                <div className="card mb-6">
                    <div className="flex items-start justify-between flex-wrap gap-3">
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-2xl font-extrabold">{test.name}</h1>
                                {test.is_active ? <span className="badge-green">Faol</span> : <span className="badge-red">Nofaol</span>}
                            </div>
                            <p className="text-slate-500 text-sm mt-1">{test.description}</p>
                            <div className="flex gap-3 mt-2 flex-wrap text-xs text-slate-500">
                                <span>⏱ {test.time_limit || '∞'} daqiqa</span>
                                <span>🔄 {test.max_attempts} urinish</span>
                                <span>🤖 {test.chatbot_mode}</span>
                                {test.allowed_class && <span>📍 {test.allowed_class}-sinf</span>}
                            </div>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            <Link to={`/teacher/tests/${id}/results`} className="btn-secondary text-sm">📊 Natijalar</Link>
                            <button onClick={toggleActive} className={test.is_active ? 'btn-danger text-sm' : 'btn-success text-sm'}>
                                {test.is_active ? '⛔ Nofaol' : '✅ Faollashtirish'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Questions */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold">📋 Savollar ({questions.length})</h2>
                    <button
                        onClick={() => {
                            if (!showQForm) {
                                const type = questions.length > 0 ? questions[0].question_type : 'multiple_choice'
                                setQForm({ ...EMPTY_Q, question_type: type })
                            }
                            setShowQForm(s => !s)
                        }}
                        className="btn-primary text-sm"
                    >
                        {showQForm ? '✕ Yopish' : '➕ Savol qo\'shish'}
                    </button>
                </div>

                {/* Question form */}
                {showQForm && (
                    <div className="card mb-5 animate-fade-in">
                        <h3 className="font-bold mb-4">Yangi savol</h3>

                        {/* Question type selector */}
                        <div className="mb-5">
                            <label className="input-label mb-2">Savol turi *</label>
                            {questions.length > 0 ? (
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-200 dark:border-blue-800 text-sm text-blue-800 dark:text-blue-300">
                                    ℹ️ Bu testda allaqachon <strong>{questions[0].question_type === 'multiple_choice' ? "Ko'p variantli" : "Juftlash"}</strong> savollar mavjud.
                                    Test turini aralashtirish mumkin emas.
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setQForm(f => ({ ...f, question_type: 'multiple_choice' }))}
                                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 text-left ${qForm.question_type === 'multiple_choice'
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-md'
                                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-300 hover:bg-blue-50/50'
                                            }`}
                                    >
                                        <span className="text-3xl">🔵</span>
                                        <span className="font-semibold text-sm text-center leading-tight">Ko'p variantli savol</span>
                                        <span className="text-xs text-slate-400 text-center">A, B, C, D variantlar</span>
                                        {qForm.question_type === 'multiple_choice' && (
                                            <span className="text-xs text-blue-600 font-bold">✓ Tanlandi</span>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setQForm(f => ({ ...f, question_type: 'matching_pairs' }))}
                                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 text-left ${qForm.question_type === 'matching_pairs'
                                            ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/30 shadow-md'
                                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-violet-300 hover:bg-violet-50/50'
                                            }`}
                                    >
                                        <span className="text-3xl">🔗</span>
                                        <span className="font-semibold text-sm text-center leading-tight">Juftlash savoli</span>
                                        <span className="text-xs text-slate-400 text-center">Matching pairs</span>
                                        {qForm.question_type === 'matching_pairs' && (
                                            <span className="text-xs text-violet-600 font-bold">✓ Tanlandi</span>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setQForm(f => ({ ...f, question_type: 'draw_graph' }))}
                                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 text-left ${qForm.question_type === 'draw_graph'
                                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 shadow-md'
                                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-emerald-300 hover:bg-emerald-50/50'
                                            }`}
                                    >
                                        <span className="text-3xl">📈</span>
                                        <span className="font-semibold text-sm text-center leading-tight">Grafik chizish</span>
                                        <span className="text-xs text-slate-400 text-center">Interaktiv grafik</span>
                                        {qForm.question_type === 'draw_graph' && (
                                            <span className="text-xs text-emerald-600 font-bold">✓ Tanlandi</span>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setQForm(f => ({ ...f, question_type: 'find_equation' }))}
                                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 text-left ${qForm.question_type === 'find_equation'
                                            ? 'border-fuchsia-500 bg-fuchsia-50 dark:bg-fuchsia-900/30 shadow-md'
                                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-fuchsia-300 hover:bg-fuchsia-50/50'
                                            }`}
                                    >
                                        <span className="text-3xl">🧮</span>
                                        <span className="font-semibold text-sm text-center leading-tight">Funksiya grafigi</span>
                                        <span className="text-xs text-slate-400 text-center">Chizib beriladi</span>
                                        {qForm.question_type === 'find_equation' && (
                                            <span className="text-xs text-fuchsia-600 font-bold">✓ Tanlandi</span>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleAddQuestion} className="space-y-3">
                            <div>
                                <label className="input-label">Savol matni * <span style={{ fontSize: '11px', color: '#6366f1', fontWeight: 600 }}>($LaTeX$ qo'llab-quvvatlaydi)</span></label>
                                <MathEditor
                                    name="text"
                                    value={qForm.text}
                                    onChange={e => setQForm(f => ({ ...f, text: e.target.value }))}
                                    placeholder="Savol... Masalan: $x^2 + y^2 = ?$"
                                    rows={3}
                                    required
                                />
                            </div>

                            {qForm.question_type === 'multiple_choice' && (
                                <>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['a', 'b', 'c', 'd'].map(opt => (
                                            <div key={opt}>
                                                <label className="input-label">Variant {opt.toUpperCase()}</label>
                                                <MathEditor
                                                    name={`option_${opt}`}
                                                    value={qForm[`option_${opt}`]}
                                                    onChange={e => setQForm(f => ({ ...f, [`option_${opt}`]: e.target.value }))}
                                                    placeholder={`Javob ${opt.toUpperCase()}`}
                                                    rows={2}
                                                    required
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="input-label">To'g'ri javob</label>
                                            <select className="input" value={qForm.correct_option} onChange={setQ('correct_option')}>
                                                {['A', 'B', 'C', 'D'].map(o => <option key={o} value={o}>{o}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="input-label">Qiyinlik</label>
                                            <select className="input" value={qForm.difficulty} onChange={setQ('difficulty')}>
                                                <option value="easy">Oson</option>
                                                <option value="medium">O'rtacha</option>
                                                <option value="hard">Qiyin</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="input-label">Tushuntirish (noto'g'ri javobda ko'rinadi)</label>
                                        <MathEditor
                                            name="explanation"
                                            value={qForm.explanation}
                                            onChange={e => setQForm(f => ({ ...f, explanation: e.target.value }))}
                                            placeholder="Nima uchun bu javob to'g'ri emas..."
                                            rows={2}
                                        />
                                    </div>
                                </>
                            )}

                            {qForm.question_type === 'matching_pairs' && (
                                <div className="bg-violet-50 dark:bg-violet-900/20 border-l-4 border-violet-500 p-3 rounded-xl text-sm text-slate-700 dark:text-slate-300">
                                    ℹ️ Juftlash savoli yaratilgandan so'ng, "Juftlar qo'shish" tugmasini bosib juftlarni qo'shishingiz mumkin.
                                </div>
                            )}

                            {qForm.question_type === 'draw_graph' && (
                                <div className="p-4 border rounded-xl space-y-3">
                                    <div className="font-semibold text-sm text-slate-700 dark:text-slate-200">
                                        Javob liniyasini torting (Bu to'g'ri javob kodi sifatida saqlanadi):
                                    </div>
                                    <InteractiveGraph
                                        onChange={(val) => setQForm(f => ({ ...f, correct_answer_text: val }))}
                                        initialP1={[-2, -2]} initialP2={[2, 2]}
                                    />
                                    <p className="text-xs text-slate-500">Javob kodi (backend uchun): <b>{qForm.correct_answer_text}</b></p>
                                </div>
                            )}

                            {qForm.question_type === 'find_equation' && (
                                <div className="p-4 border rounded-xl space-y-4">
                                    <div>
                                        <label className="input-label">Tizim chizib berishi kerak bo'lgan funksiya (masalan: <b>x^2 - 4</b>)</label>
                                        <input
                                            type="text"
                                            className="input"
                                            value={qForm.option_a || ''}
                                            onChange={e => setQForm(f => ({ ...f, option_a: e.target.value }))}
                                            placeholder="Masalan: x^2 - 4"
                                            required
                                        />
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                                        <p className="text-xs font-semibold mb-2">Oldindan ko'rish:</p>
                                        {qForm.option_a && <FunctionPlot equation={qForm.option_a} />}
                                    </div>
                                    <div>
                                        <label className="input-label text-emerald-600 dark:text-emerald-400">
                                            O'quvchidan kutayotgan javobingiz *
                                        </label>
                                        <input
                                            type="text"
                                            className="input"
                                            value={qForm.correct_answer_text || ''}
                                            onChange={e => setQForm(f => ({ ...f, correct_answer_text: e.target.value }))}
                                            placeholder="Masalan: x^2 - 4"
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button type="submit" disabled={loading} className="btn-primary">{loading ? '⏳...' : '✅ Qo\'shish'}</button>
                                <button type="button" onClick={() => setShowQForm(false)} className="btn-secondary">Bekor</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Questions list */}
                <div className="space-y-3">
                    {questions.length === 0 && <div className="card text-center py-10 text-slate-400"><p className="text-3xl mb-2">📭</p><p>Hali savol qo'shilmagan</p></div>}
                    {questions.map((q, i) => (
                        <div key={q.id} className="space-y-2">
                            <div className="card-hover">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center text-sm font-bold text-blue-700 dark:text-blue-300 flex-shrink-0">
                                        {i + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                            <p className="font-medium text-sm"><MathText text={q.text} /></p>
                                            <span className={diffBadge(q.difficulty)}>{diffLabel(q.difficulty)}</span>
                                            {q.question_type === 'matching_pairs' && (
                                                <span className="badge-green">🔗 Juftlash ({q.matching_pairs?.length || 0} juft)</span>
                                            )}
                                            {q.question_type === 'multiple_choice' && (
                                                <span className="badge-blue">✓ {q.correct_option}</span>
                                            )}
                                        </div>
                                        {q.question_type === 'multiple_choice' && (
                                            <div className="grid grid-cols-2 gap-1 text-xs text-slate-500">
                                                <span>A: {q.option_a}</span><span>B: {q.option_b}</span>
                                                <span>C: {q.option_c}</span><span>D: {q.option_d}</span>
                                            </div>
                                        )}
                                        {q.question_type === 'matching_pairs' && q.matching_pairs && (
                                            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                                                {q.matching_pairs.slice(0, 3).map((pair, idx) => (
                                                    <div key={idx}>
                                                        {idx + 1}. <strong>{pair.left_item}</strong> → {pair.right_item}
                                                    </div>
                                                ))}
                                                {q.matching_pairs.length > 3 && (
                                                    <div className="text-slate-400 italic">... yana {q.matching_pairs.length - 3} ta juft</div>
                                                )}
                                            </div>
                                        )}
                                        {q.explanation && <p className="text-xs text-slate-400 mt-1.5 italic">💡 {q.explanation}</p>}
                                    </div>
                                    <div className="flex gap-2 flex-wrap flex-shrink-0">
                                        {q.question_type === 'matching_pairs' && (
                                            <button onClick={() => setEditingQId(editingQId === q.id ? null : q.id)} className="btn-secondary text-xs px-2 py-1">
                                                {editingQId === q.id ? '✕ Yopish' : '🔗 Juftlar'}
                                            </button>
                                        )}
                                        <button onClick={() => handleDeleteQ(q.id)} className="btn-danger text-xs px-2 py-1">🗑</button>
                                    </div>
                                </div>
                            </div>

                            {/* Matching pairs editor */}
                            {editingQId === q.id && q.question_type === 'matching_pairs' && (
                                <div className="card bg-blue-50 dark:bg-blue-900/20 ml-12">
                                    <h4 className="font-semibold text-sm mb-3">Juflarni tahrirlash</h4>
                                    <div className="space-y-2 mb-4">
                                        {q.matching_pairs && q.matching_pairs.length > 0 ? (
                                            q.matching_pairs.map((pair, idx) => (
                                                <div key={pair.id} className="flex items-center justify-between bg-white dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700">
                                                    <div className="text-sm flex-1">
                                                        <span className="font-medium text-slate-700 dark:text-slate-300">{pair.left_item}</span>
                                                        <span className="text-slate-400 mx-2">→</span>
                                                        <span className="text-slate-600 dark:text-slate-400">{pair.right_item}</span>
                                                    </div>
                                                    <button onClick={() => handleDeletePair(q.id, pair.id)} className="btn-danger text-xs px-2 py-0.5">🗑</button>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-xs text-slate-500 italic">Hali juft yo'q</p>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mb-3">
                                        <input
                                            type="text"
                                            className="input text-sm"
                                            placeholder="Chap..."
                                            value={pairForm.left_item}
                                            onChange={e => setPairForm(f => ({ ...f, left_item: e.target.value }))}
                                        />
                                        <input
                                            type="text"
                                            className="input text-sm"
                                            placeholder="O'ng..."
                                            value={pairForm.right_item}
                                            onChange={e => setPairForm(f => ({ ...f, right_item: e.target.value }))}
                                        />
                                    </div>
                                    <button onClick={() => handleAddPair(q.id)} disabled={pairLoading} className="btn-primary text-sm w-full">
                                        {pairLoading ? '⏳...' : '➕ Juft qo\'shish'}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
