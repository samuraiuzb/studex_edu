/**
 * Student TakeTest — full test-taking experience:
 * - Countdown timer with auto-submit
 * - Per-question feedback with sound
 * - AI Chatbot sidebar
 * - Sound toggle
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import MatchingPairsQuestion from '../../components/MatchingPairsQuestion'
import MathText from '../../components/MathText'
import Whiteboard from '../../components/Whiteboard'
import InteractiveGraph from '../../components/InteractiveGraph'
import FunctionPlot from '../../components/FunctionPlot'
import api from '../../api/client'
import toast from 'react-hot-toast'
import { useSound } from '../../hooks/useSound'

// ── Chatbot component ─────────────────────────────────────────────────────────
function Chatbot({ attemptId, chatbotMode }) {
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [sending, setSending] = useState(false)
    const [open, setOpen] = useState(false)
    const endRef = useRef(null)

    useEffect(() => {
        if (open && endRef.current) endRef.current.scrollIntoView({ behavior: 'smooth' })
    }, [messages, open])

    async function sendMessage(e) {
        e.preventDefault()
        if (!input.trim() || sending) return
        const msg = input.trim()
        setInput('')
        setMessages(m => [...m, { role: 'user', content: msg }])
        setSending(true)
        try {
            const { data } = await api.post(`/chat/${attemptId}/`, { message: msg })
            setMessages(m => [...m, { role: 'assistant', content: data.reply }])
        } catch (err) {
            setMessages(m => [...m, { role: 'assistant', content: err.response?.data?.detail || 'Xato yuz berdi.' }])
        } finally {
            setSending(false)
        }
    }

    if (chatbotMode === 'OFF') return null

    return (
        <>
            {/* Toggle button */}
            <button
                onClick={() => setOpen(o => !o)}
                className="fixed bottom-20 right-5 z-50 w-14 h-14 hero-gradient rounded-full flex items-center justify-center text-2xl text-white shadow-xl hover:scale-110 transition-transform"
                title="AI yordamchi"
            >
                🤖
            </button>

            {/* Chat panel */}
            {open && (
                <div className="fixed bottom-36 right-5 z-50 w-80 h-96 card flex flex-col shadow-2xl animate-bounce-in">
                    <div className="flex items-center justify-between mb-3 flex-shrink-0">
                        <div>
                            <h3 className="font-bold text-sm">🤖 AI Yordamchi</h3>
                            <p className="text-xs text-slate-400">{chatbotMode === 'HINT_ONLY' ? 'Faqat yo\'naltirish' : 'To\'liq tushuntirish'}</p>
                        </div>
                        <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                        {messages.length === 0 && (
                            <p className="text-xs text-slate-400 text-center py-4">
                                Savol haqida yozing, yordam beraman! 🎓
                            </p>
                        )}
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${m.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-br-sm'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-sm'
                                    }`}>
                                    {m.content}
                                </div>
                            </div>
                        ))}
                        {sending && (
                            <div className="flex justify-start">
                                <div className="bg-slate-100 dark:bg-slate-700 px-3 py-2 rounded-xl rounded-bl-sm">
                                    <span className="flex gap-1">
                                        {[0, 1, 2].map(i => (
                                            <span key={i} className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                                        ))}
                                    </span>
                                </div>
                            </div>
                        )}
                        <div ref={endRef} />
                    </div>
                    <form onSubmit={sendMessage} className="flex gap-2 mt-3 flex-shrink-0">
                        <input
                            className="input text-xs py-2"
                            placeholder="Savol yozing..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                        />
                        <button type="submit" disabled={sending} className="btn-primary text-xs px-3 py-2">➤</button>
                    </form>
                </div>
            )}
        </>
    )
}

// ── Timer ─────────────────────────────────────────────────────────────────────
function Timer({ seconds, onExpire }) {
    const [remaining, setRemaining] = useState(seconds)

    useEffect(() => {
        if (seconds === 0) return
        const interval = setInterval(() => {
            setRemaining(prev => {
                if (prev <= 1) { clearInterval(interval); onExpire(); return 0 }
                return prev - 1
            })
        }, 1000)
        return () => clearInterval(interval)
    }, [seconds, onExpire])

    if (seconds === 0) return null

    const mins = Math.floor(remaining / 60)
    const secs = remaining % 60
    const danger = remaining < 60

    return (
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-lg ${danger ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 animate-pulse' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}>
            ⏱ {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </div>
    )
}

// ── Canvas Confetti (correct answers) ─────────────────────────────────────────
function launchConfetti() {
    const canvas = document.createElement('canvas')
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:99999;pointer-events:none;'
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    document.body.appendChild(canvas)
    const ctx = canvas.getContext('2d')

    const COLORS = ['#f59e0b', '#34d399', '#60a5fa', '#f472b6', '#a78bfa', '#fb923c', '#fbbf24', '#6ee7b7', '#ff6b6b', '#fff']
    const SHAPES = ['circle', 'rect', 'triangle']

    const pieces = Array.from({ length: 130 }, () => ({
        x: Math.random() * canvas.width,
        y: -10 - Math.random() * 200,
        r: 4 + Math.random() * 8,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
        vx: (Math.random() - 0.5) * 4,
        vy: 3 + Math.random() * 5,
        rot: Math.random() * Math.PI * 2,
        rotV: (Math.random() - 0.5) * 0.25,
        opacity: 1,
    }))

    let frame
    const start = performance.now()

    function draw(now) {
        const elapsed = now - start
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        let alive = false
        for (const p of pieces) {
            p.x += p.vx
            p.y += p.vy
            p.rot += p.rotV
            p.vy += 0.07  // gravity
            if (elapsed > 1800) p.opacity -= 0.025
            if (p.opacity <= 0 || p.y > canvas.height + 20) continue
            alive = true

            ctx.save()
            ctx.globalAlpha = Math.max(0, p.opacity)
            ctx.fillStyle = p.color
            ctx.translate(p.x, p.y)
            ctx.rotate(p.rot)
            if (p.shape === 'circle') {
                ctx.beginPath(); ctx.arc(0, 0, p.r, 0, Math.PI * 2); ctx.fill()
            } else if (p.shape === 'rect') {
                ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r)
            } else {
                ctx.beginPath(); ctx.moveTo(0, -p.r); ctx.lineTo(p.r, p.r); ctx.lineTo(-p.r, p.r); ctx.closePath(); ctx.fill()
            }
            ctx.restore()
        }

        if (alive && elapsed < 3500) {
            frame = requestAnimationFrame(draw)
        } else {
            canvas.remove()
        }
    }

    frame = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(frame); canvas.remove() }
}

// ── Emoji burst (JS-driven, no CSS vars) ──────────────────────────────────────
function launchEmojiBurst() {
    const EMOJIS = ['🎉', '⭐', '✨', '🌟', '🔥', '🥳', '💫', '🎊']
    const nodes = []
    for (let i = 0; i < 14; i++) {
        const el = document.createElement('div')
        el.textContent = EMOJIS[i % EMOJIS.length]
        const x = window.innerWidth * (0.1 + Math.random() * 0.8)
        const y = window.innerHeight * (0.5 + Math.random() * 0.3)
        el.style.cssText = `
            position:fixed; z-index:100000; pointer-events:none; font-size:${1.8 + Math.random() * 1.2}rem;
            left:${x}px; top:${y}px; transform:translate(-50%,-50%);
            transition: none;
        `
        document.body.appendChild(el)
        nodes.push({ el, x, y, vy: -(4 + Math.random() * 6), vx: (Math.random() - 0.5) * 4, opacity: 1, scale: 0.5 })
    }

    let frame
    const start = performance.now()
    function animate(now) {
        const t = now - start
        let alive = false
        for (const p of nodes) {
            p.y += p.vy
            p.x += p.vx
            p.vy += 0.15
            p.scale = Math.min(1.4, p.scale + 0.08)
            if (t > 600) p.opacity -= 0.03
            p.opacity = Math.max(0, p.opacity)
            p.el.style.left = p.x + 'px'
            p.el.style.top = p.y + 'px'
            p.el.style.opacity = p.opacity
            p.el.style.transform = `translate(-50%,-50%) scale(${p.scale})`
            if (p.opacity > 0) alive = true
        }
        if (alive && t < 1600) { frame = requestAnimationFrame(animate) }
        else { nodes.forEach(p => p.el.remove()) }
    }
    frame = requestAnimationFrame(animate)
    return () => { cancelAnimationFrame(frame); nodes.forEach(p => p.el.remove()) }
}

// ── Popup text ("BARAKALLA!") ─────────────────────────────────────────────────
function showPopupText(text, color) {
    const el = document.createElement('div')
    el.textContent = text
    el.style.cssText = `
        position:fixed; z-index:100001; pointer-events:none;
        top:42%; left:50%; transform:translate(-50%,-50%) scale(0.3);
        font-size:clamp(2rem,8vw,4rem); font-weight:900; color:${color};
        text-shadow: 0 4px 24px rgba(0,0,0,0.25);
        letter-spacing:2px; white-space:nowrap; opacity:0;
        font-family:system-ui,sans-serif;
        transition: all 0.22s cubic-bezier(.36,.07,.19,.97);
    `
    document.body.appendChild(el)
    requestAnimationFrame(() => {
        el.style.transform = 'translate(-50%,-50%) scale(1.1)'
        el.style.opacity = '1'
        setTimeout(() => {
            el.style.transform = 'translate(-50%,-50%) scale(1)'
        }, 220)
        setTimeout(() => {
            el.style.opacity = '0'
            el.style.transform = 'translate(-50%,-80%) scale(0.8)'
            setTimeout(() => el.remove(), 400)
        }, 900)
    })
}

// ── Screen vignette flash ─────────────────────────────────────────────────────
function flashVignette(color, duration = 700) {
    const el = document.createElement('div')
    el.style.cssText = `
        position:fixed; inset:0; z-index:99998; pointer-events:none;
        background: radial-gradient(ellipse at center, transparent 30%, ${color} 100%);
        opacity:0; transition: opacity 0.1s ease;
    `
    document.body.appendChild(el)
    requestAnimationFrame(() => {
        el.style.opacity = '1'
        setTimeout(() => {
            el.style.transition = `opacity ${duration}ms ease`
            el.style.opacity = '0'
            setTimeout(() => el.remove(), duration + 100)
        }, 80)
    })
}

// ── Feedback Overlay ──────────────────────────────────────────────────────────
function FeedbackEffect({ type }) {
    useEffect(() => {
        if (!type) return
        let cleanups = []

        if (type === 'correct') {
            cleanups.push(launchConfetti())
            cleanups.push(launchEmojiBurst())
            flashVignette('rgba(52,211,153,0.45)', 600)
        } else {
            flashVignette('rgba(239,68,68,0.50)', 500)
        }

        return () => cleanups.forEach(fn => fn && fn())
    }, [type])

    return null
}

// ── Main TakeTest ─────────────────────────────────────────────────────────────
export default function TakeTest() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { enabled: soundOn, toggle: toggleSound, playCorrect, playWrong } = useSound()

    const [loading, setLoading] = useState(true)
    const [attemptId, setAttemptId] = useState(null)
    const [questions, setQuestions] = useState([])
    const [currentIdx, setCurrentIdx] = useState(0)
    const [timeLimit, setTimeLimit] = useState(0)  // seconds
    const [chatbotMode, setChatbotMode] = useState('OFF')
    const [answers, setAnswers] = useState({}) // {questionId: {selected, is_correct, explanation, correct_option}}
    const [submitting, setSubmitting] = useState(false)
    const [finishing, setFinishing] = useState(false)
    const [feedbackType, setFeedbackType] = useState(null) // 'correct' | 'wrong' | null
    const [showWhiteboard, setShowWhiteboard] = useState(false)
    const [pendingTextAnswer, setPendingTextAnswer] = useState('')

    useEffect(() => {
        setPendingTextAnswer('')
    }, [currentIdx])

    useEffect(() => {
        api.post(`/student/tests/${id}/start/`)
            .then(({ data }) => {
                setAttemptId(data.attempt_id)
                setQuestions(data.questions)
                setTimeLimit((data.time_limit || 0) * 60)
                setChatbotMode(data.chatbot_mode || 'OFF')
            })
            .catch(err => {
                toast.error(err.response?.data?.detail || 'Test boshlanmadi.')
                navigate('/student')
            })
            .finally(() => setLoading(false))
    }, [id])

    const handleFinish = useCallback(async () => {
        if (finishing) return
        setFinishing(true)
        try {
            await api.post(`/student/attempts/${attemptId}/finish/`)
            navigate(`/student/result/${attemptId}`, { replace: true })
        } catch {
            toast.error('Yakunlashda xato!')
            setFinishing(false)
        }
    }, [attemptId, finishing, navigate])

    async function selectOption(questionId, option) {
        if (submitting || answers[questionId]) return  // Already answered
        setSubmitting(true)
        try {
            const payload = { question_id: questionId }
            if (option && typeof option === 'object') {
                payload.selected_matching = option
            } else if (questions[currentIdx].question_type === 'draw_graph' || questions[currentIdx].question_type === 'find_equation') {
                payload.selected_text = option
            } else {
                payload.selected_option = option
            }

            const { data } = await api.post(`/student/attempts/${attemptId}/answer/`, payload)
            setAnswers(prev => ({ ...prev, [questionId]: { selected: option, ...data } }))

            // Trigger visual feedback
            const fb = data.is_correct ? 'correct' : 'wrong'
            setFeedbackType(fb)
            setTimeout(() => setFeedbackType(null), 1100)

            if (data.is_correct) {
                playCorrect()
            } else {
                playWrong()
            }

            // Auto-advance
            const answeredIdx = currentIdx
            setTimeout(() => {
                setCurrentIdx(prevIdx => {
                    if (prevIdx === answeredIdx && prevIdx < questions.length - 1) {
                        return prevIdx + 1
                    }
                    return prevIdx
                })
            }, 1000)

        } catch (err) {
            const msg = err.response?.data?.detail || err.response?.data?.error || err.message || 'Javob saqlanmadi!'
            toast.error(msg)
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return (
        <div className="min-h-screen">
            <Navbar />
            <div className="flex flex-col items-center justify-center h-64 gap-3">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-400 text-sm">Test yuklanmoqda...</p>
            </div>
        </div>
    )

    const question = questions[currentIdx]
    const answered = question ? answers[question.id] : null
    const answeredCount = Object.keys(answers).length
    const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0

    function optionClass(opt) {
        if (!answered) return 'option-btn'
        if (opt === answered.correct_option) return 'option-btn option-correct'
        if (opt === answered.selected && !answered.is_correct) return 'option-btn option-wrong'
        return 'option-btn opacity-50'
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <FeedbackEffect type={feedbackType} />
            <Navbar />
            <div className="max-w-3xl mx-auto px-4 py-3 animate-fade-in">
                {/* Top bar */}
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                            {currentIdx + 1} / {questions.length}
                        </span>
                        <span className="text-xs text-slate-400">({answeredCount} ta javoblandi)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowWhiteboard(true)}
                            className="text-sm px-3 py-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-200 dark:hover:bg-indigo-900/60 transition shadow-sm"
                            title="Qoralama (Oq doska)"
                        >
                            🖍️ Qoralama
                        </button>
                        <button
                            onClick={toggleSound}
                            className={`text-lg px-2 py-1 rounded-lg transition ${soundOn ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-slate-100 dark:bg-slate-700 opacity-50'}`}
                            title="Ovoz"
                        >
                            {soundOn ? '🔊' : '🔇'}
                        </button>
                        {timeLimit > 0 && <Timer seconds={timeLimit} onExpire={handleFinish} />}
                    </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full mb-3 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }} />
                </div>

                {/* Question card */}
                {question && (
                    <div className="card mb-4">
                        {/* Question number badge */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 hero-gradient rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                {currentIdx + 1}
                            </div>
                            <span className="text-xs badge-blue">{question.difficulty === 'easy' ? 'Oson' : question.difficulty === 'hard' ? 'Qiyin' : "O'rtacha"}</span>
                        </div>

                        <p className="text-base font-medium mb-5 leading-relaxed">
                            <MathText text={question.text} />
                        </p>

                        {/* Multiple Choice Questions */}
                        {question.question_type === 'multiple_choice' && (
                            <div className="space-y-2">
                                {['A', 'B', 'C', 'D'].map(opt => (
                                    <button
                                        key={opt}
                                        disabled={!!answered || submitting}
                                        onClick={() => selectOption(question.id, opt)}
                                        className={`${optionClass(opt)} flex items-center gap-3`}
                                    >
                                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${answered?.correct_option === opt ? 'bg-emerald-500 text-white'
                                            : answered?.selected === opt && !answered?.is_correct ? 'bg-red-500 text-white'
                                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                            }`}>
                                            {opt}
                                        </span>
                                        <span className="text-sm">
                                            <MathText text={question[`option_${opt.toLowerCase()}`]} />
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Matching Pairs Questions */}
                        {question.question_type === 'matching_pairs' && (
                            <MatchingPairsQuestion
                                question={question}
                                onAnswerSubmit={(matchings) => {
                                    // Handle matching pairs answer submission
                                    selectOption(question.id, matchings)
                                }}
                                disabled={!!answered}
                                initialMatchings={answered && typeof answered.selected === 'object' ? answered.selected : null}
                            />
                        )}

                        {/* Interactive Graph Questions */}
                        {question.question_type === 'draw_graph' && (
                            <div className="space-y-3">
                                <div><span className="text-sm font-bold text-slate-500">To'g'ri chiziqni tortish orqali ustma-ust tushiring:</span></div>
                                <InteractiveGraph
                                    readOnly={!!answered || submitting}
                                    initialP1={[-2, -2]}
                                    initialP2={[2, 2]}
                                    onChange={(v) => { if (!answered) setPendingTextAnswer(v) }}
                                />
                                {!answered && (
                                    <button
                                        className="btn-primary w-full"
                                        onClick={() => selectOption(question.id, pendingTextAnswer)}
                                        disabled={!pendingTextAnswer || submitting}
                                    >
                                        {submitting ? 'Tekshirilmoqda...' : 'Javobni tasdiqlash'}
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Find Equation (Graph Render) */}
                        {question.question_type === 'find_equation' && (
                            <div className="space-y-4">
                                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
                                    <FunctionPlot equation={question.option_a} />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Ushbu grafikning funksiyasini yozing (masalan x^2 - 4):</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="... funksiyani kiriting"
                                        value={answered ? answered.selected : pendingTextAnswer}
                                        onChange={(e) => setPendingTextAnswer(e.target.value)}
                                        disabled={!!answered || submitting}
                                    />
                                    {!answered && (
                                        <button
                                            className="btn-primary w-full"
                                            onClick={() => selectOption(question.id, pendingTextAnswer)}
                                            disabled={!pendingTextAnswer || submitting}
                                        >
                                            Javobni tasdiqlash
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Feedback after answer — only for multiple_choice */}
                        {answered && question.question_type !== 'matching_pairs' && (
                            <div className={`mt-4 p-4 rounded-xl animate-bounce-in ${answered.is_correct ? 'flash-correct' : 'flash-wrong'}`}>
                                {answered.is_correct ? (
                                    <p className="text-emerald-700 dark:text-emerald-400 font-semibold">✅ To'g'ri javob!</p>
                                ) : (
                                    <>
                                        <p className="text-red-700 dark:text-red-400 font-semibold mb-1">❌ Noto'g'ri!</p>
                                        {(question.question_type === 'find_equation' || question.question_type === 'draw_graph') && answered.correct_answer_text && (
                                            <p className="text-sm font-bold mt-2 text-indigo-600">✓ To'g'ri javob kodi: {answered.correct_answer_text}</p>
                                        )}
                                        {answered.correct_option && question.question_type === 'multiple_choice' && (
                                            <p className="text-sm font-bold mt-2 text-indigo-600">✓ To'g'ri javob: {answered.correct_option}</p>
                                        )}
                                        {answered.explanation && (
                                            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                                                💡 <MathText text={answered.explanation} />
                                            </p>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between gap-3">
                    <button
                        onClick={() => setCurrentIdx(i => Math.max(0, i - 1))}
                        disabled={currentIdx === 0}
                        className="btn-secondary"
                    >
                        ← Oldingi
                    </button>

                    {/* Question dots */}
                    <div className="flex gap-1 flex-wrap justify-center flex-1">
                        {questions.map((q, i) => (
                            <button
                                key={q.id}
                                onClick={() => setCurrentIdx(i)}
                                className={`w-6 h-6 rounded-md text-xs font-bold transition-all ${i === currentIdx ? 'bg-blue-600 text-white scale-110'
                                    : answers[q.id]?.is_correct ? 'bg-emerald-400 text-white'
                                        : answers[q.id] ? 'bg-red-400 text-white'
                                            : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>

                    {currentIdx < questions.length - 1 ? (
                        <button
                            onClick={() => setCurrentIdx(i => i + 1)}
                            className="btn-primary"
                        >
                            Keyingi →
                        </button>
                    ) : (
                        <button
                            onClick={handleFinish}
                            disabled={finishing}
                            className="btn-success"
                        >
                            {finishing ? '⏳...' : '🏁 Yakunlash'}
                        </button>
                    )}
                </div>

                {/* Finish early button */}
                {answeredCount === questions.length && currentIdx < questions.length - 1 && (
                    <div className="mt-4 text-center">
                        <button onClick={handleFinish} disabled={finishing} className="btn-success btn-lg">
                            🏁 Barcha savollar javoblandi — Yakunlash
                        </button>
                    </div>
                )}
            </div>

            {/* AI Chatbot */}
            {attemptId && <Chatbot attemptId={attemptId} chatbotMode={chatbotMode} />}

            {/* Whiteboard Modal */}
            {showWhiteboard && <Whiteboard onClose={() => setShowWhiteboard(false)} />}
        </div>
    )
}
