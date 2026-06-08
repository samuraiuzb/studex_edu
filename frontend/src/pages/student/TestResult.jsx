/**
 * Student TestResult — shows score, grade, wrong answers breakdown.
 * With celebration effects for high grades and empathy effects for low grades.
 */
import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import MathText from '../../components/MathText'
import api from '../../api/client'
import toast from 'react-hot-toast'

// ── Shared: JS emoji burst ─────────────────────────────────────────────────────
function launchEmojis(emojis, count, fromBottom = false, speedMul = 1) {
    const nodes = []
    for (let i = 0; i < count; i++) {
        const el = document.createElement('div')
        el.textContent = emojis[i % emojis.length]
        const x = window.innerWidth * (0.05 + Math.random() * 0.9)
        const y = fromBottom
            ? window.innerHeight * (0.5 + Math.random() * 0.4)
            : -40
        el.style.cssText = `position:fixed;z-index:100000;pointer-events:none;font-size:${1.4 + Math.random() * 1.6}rem;left:${x}px;top:${y}px;opacity:0;`
        document.body.appendChild(el)
        const dir = fromBottom ? -(3 + Math.random() * 7) * speedMul : (2 + Math.random() * 4) * speedMul
        nodes.push({ el, x, y, vy: dir, vx: (Math.random() - 0.5) * 3, opacity: 0, scale: 0.2 })
    }
    let raf; const start = performance.now()
    function animate(now) {
        const t = now - start; let alive = false
        for (const p of nodes) {
            p.y += p.vy; p.x += p.vx
            p.vy += fromBottom ? 0.12 : 0.08
            p.scale = Math.min(1.4, p.scale + 0.07)
            if (t < 200) p.opacity = Math.min(1, p.opacity + 0.1)
            else if (t > 900) p.opacity -= 0.02
            p.opacity = Math.max(0, p.opacity)
            p.el.style.left = p.x + 'px'; p.el.style.top = p.y + 'px'
            p.el.style.opacity = p.opacity; p.el.style.transform = `scale(${p.scale})`
            if (p.opacity > 0) alive = true
        }
        if (alive && t < 2500) { raf = requestAnimationFrame(animate) }
        else { nodes.forEach(p => p.el.remove()) }
    }
    raf = requestAnimationFrame(animate)
    return () => { cancelAnimationFrame(raf); nodes.forEach(p => p.el.remove()) }
}

// ── Shared: canvas confetti ────────────────────────────────────────────────────
function launchConfettiCanvas(colors, count = 150, speedMul = 1) {
    const canvas = document.createElement('canvas')
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:99999;pointer-events:none;'
    canvas.width = window.innerWidth; canvas.height = window.innerHeight
    document.body.appendChild(canvas)
    const ctx = canvas.getContext('2d')
    const pieces = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width, y: -15 - Math.random() * 300,
        r: 5 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 5 * speedMul,
        vy: (2 + Math.random() * 6) * speedMul,
        rot: Math.random() * Math.PI * 2, rotV: (Math.random() - 0.5) * 0.3,
        opacity: 1, isCircle: Math.random() > 0.5,
    }))
    let raf; const start = performance.now()
    function draw(now) {
        const elapsed = now - start
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        let alive = false
        for (const p of pieces) {
            p.x += p.vx; p.y += p.vy; p.rot += p.rotV; p.vy += 0.06
            if (elapsed > 2200) p.opacity -= 0.018
            if (p.opacity <= 0 || p.y > canvas.height + 20) continue
            alive = true
            ctx.save(); ctx.globalAlpha = Math.max(0, p.opacity); ctx.fillStyle = p.color
            ctx.translate(p.x, p.y); ctx.rotate(p.rot)
            if (p.isCircle) { ctx.beginPath(); ctx.arc(0, 0, p.r, 0, Math.PI * 2); ctx.fill() }
            else { ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r) }
            ctx.restore()
        }
        if (alive && elapsed < 5000) { raf = requestAnimationFrame(draw) } else { canvas.remove() }
    }
    raf = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(raf); canvas.remove() }
}

// ── Shared: sparkle stars (grade 3) ───────────────────────────────────────────
function launchSparkles() {
    const canvas = document.createElement('canvas')
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:99999;pointer-events:none;'
    canvas.width = window.innerWidth; canvas.height = window.innerHeight
    document.body.appendChild(canvas)
    const ctx = canvas.getContext('2d')
    const stars = Array.from({ length: 55 }, () => ({
        x: Math.random() * canvas.width, y: canvas.height * (0.4 + Math.random() * 0.5),
        size: 6 + Math.random() * 12,
        vy: -(0.8 + Math.random() * 2.5),
        vx: (Math.random() - 0.5) * 1.5,
        opacity: 0, fadeIn: true,
        hue: 40 + Math.random() * 30,  // amber-gold range
        delay: Math.random() * 800,
    }))
    let raf; const start = performance.now()
    function drawStar(cx, cy, spikes, outer, inner) {
        let rot = Math.PI / 2 * 3; const step = Math.PI / spikes
        ctx.beginPath()
        ctx.moveTo(cx, cy - outer)
        for (let i = 0; i < spikes; i++) {
            ctx.lineTo(cx + Math.cos(rot) * outer, cy - Math.sin(rot) * outer); rot += step
            ctx.lineTo(cx + Math.cos(rot) * inner, cy - Math.sin(rot) * inner); rot += step
        }
        ctx.lineTo(cx, cy - outer); ctx.closePath(); ctx.fill()
    }
    function draw(now) {
        const elapsed = now - start
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        let alive = false
        for (const s of stars) {
            if (elapsed < s.delay) { alive = true; continue }
            const t = elapsed - s.delay
            s.y += s.vy; s.x += s.vx
            if (s.fadeIn && s.opacity < 1) s.opacity = Math.min(1, s.opacity + 0.06)
            else { s.fadeIn = false }
            if (t > 1200) s.opacity -= 0.015
            s.opacity = Math.max(0, s.opacity)
            if (s.opacity <= 0 || s.y < -20) continue
            alive = true
            ctx.save(); ctx.globalAlpha = s.opacity
            ctx.fillStyle = `hsl(${s.hue}, 90%, 60%)`
            ctx.shadowColor = `hsl(${s.hue}, 100%, 70%)`; ctx.shadowBlur = 10
            drawStar(s.x, s.y, 5, s.size, s.size * 0.45)
            ctx.restore()
        }
        if (alive && elapsed < 3500) { raf = requestAnimationFrame(draw) } else { canvas.remove() }
    }
    raf = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(raf); canvas.remove() }
}

// ── Grade 2: soft red vignette pulse ──────────────────────────────────────────
function launchEncouragement() {
    // pulsing red border vignette
    const vignette = document.createElement('div')
    vignette.style.cssText = `
        position:fixed;inset:0;z-index:99998;pointer-events:none;
        border:0px solid rgba(239,68,68,0);
        background: radial-gradient(ellipse at center, transparent 55%, rgba(239,68,68,0.18) 100%);
        transition: opacity 0.6s ease;
    `
    document.body.appendChild(vignette)
    setTimeout(() => { vignette.style.opacity = '0'; setTimeout(() => vignette.remove(), 700) }, 1800)
    return launchEmojis(['💪', '🔥', '📚', '💡', '🎯'], 10, false, 0.7)
}

// ── Popup text ─────────────────────────────────────────────────────────────────
function showGradePopup(text, color, shadow) {
    const el = document.createElement('div')
    el.textContent = text
    el.style.cssText = `
        position:fixed;z-index:100001;pointer-events:none;
        top:38%;left:50%;transform:translate(-50%,-50%) scale(0.2);
        font-size:clamp(1.8rem,7vw,3.5rem);font-weight:900;color:${color};
        text-shadow:0 4px 30px ${shadow};letter-spacing:2px;white-space:nowrap;opacity:0;
        font-family:system-ui,sans-serif;transition:all 0.25s cubic-bezier(.36,.07,.19,.97);
    `
    document.body.appendChild(el)
    requestAnimationFrame(() => {
        el.style.transform = 'translate(-50%,-50%) scale(1.08)'; el.style.opacity = '1'
        setTimeout(() => { el.style.transform = 'translate(-50%,-50%) scale(1)' }, 250)
        setTimeout(() => {
            el.style.opacity = '0'; el.style.transform = 'translate(-50%,-85%) scale(0.8)'
            setTimeout(() => el.remove(), 450)
        }, 1100)
    })
}

// ── Grade animation dispatcher ─────────────────────────────────────────────────
function useGradeAnimation(grade) {
    useEffect(() => {
        if (!grade) return
        const cleanups = []

        if (grade === 5) {
            // 🏆 Big rainbow confetti + trophy emojis + gold popup
            cleanups.push(launchConfettiCanvas(
                ['#f59e0b', '#fbbf24', '#34d399', '#60a5fa', '#f472b6', '#a78bfa', '#6ee7b7', '#fff', '#ff6b6b'],
                200, 1.1
            ))
            cleanups.push(launchEmojis(['🏆', '🎉', '⭐', '🌟', '✨', '🥳', '🎊', '💫', '🔥'], 20, true))
        }
        else if (grade === 4) {
            // 🥳 Blue-green confetti + star emojis + blue popup
            cleanups.push(launchConfettiCanvas(
                ['#34d399', '#60a5fa', '#a78bfa', '#6ee7b7', '#fbbf24', '#fff'],
                110, 0.9
            ))
            cleanups.push(launchEmojis(['🥳', '✨', '⭐', '🌟', '🎊', '👏'], 14, true))
        }
        else if (grade === 3) {
            // ✨ Gold sparkle stars rise up + mild emoji + warm popup
            cleanups.push(launchSparkles())
            cleanups.push(launchEmojis(['👍', '✨', '🌟', '💛'], 8, true, 0.6))
        }
        else {
            // 💪 Encouraging falling emojis from top + soft vignette
            cleanups.push(launchEncouragement())
        }

        return () => cleanups.forEach(fn => fn && fn())
    }, [grade])
}


// ── Animated counter ───────────────────────────────────────────────────────────
function AnimatedNumber({ target, duration = 1200 }) {
    const [val, setVal] = useState(0)
    const raf = useRef(null)
    useEffect(() => {
        const start = Date.now()
        const tick = () => {
            const elapsed = Date.now() - start
            const progress = Math.min(elapsed / duration, 1)
            // Ease out
            const eased = 1 - Math.pow(1 - progress, 3)
            setVal(Math.round(eased * target))
            if (progress < 1) raf.current = requestAnimationFrame(tick)
        }
        raf.current = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(raf.current)
    }, [target, duration])
    return val
}

export default function TestResult() {
    const { id } = useParams()   // attempt_id
    const navigate = useNavigate()
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(true)
    const [showDetails, setShowDetails] = useState(false)

    const isGood = result && result.grade >= 4
    useGradeAnimation(result ? result.grade : null)

    useEffect(() => {
        // Finish the attempt (idempotent if already finished)
        api.post(`/student/attempts/${id}/finish/`)
            .then(r => setResult(r.data))
            .catch(() => {
                api.get('/student/history/')
                    .then(r => {
                        const found = r.data.find(a => String(a.attempt_id) === String(id))
                        if (found) setResult({ score: found.score, total: found.total, percentage: found.percentage, grade: found.grade, wrong_details: [] })
                        else { toast.error('Natija topilmadi'); navigate('/student') }
                    })
            })
            .finally(() => setLoading(false))
    }, [id])

    useEffect(() => {
        if (result) setTimeout(() => setShowDetails(true), 800)
    }, [result])

    if (loading) return (
        <div className="min-h-screen">
            <Navbar />
            <div className="flex justify-center items-center h-64">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        </div>
    )

    if (!result) return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Navbar />
            <div className="max-w-2xl mx-auto px-4 py-20 text-center">
                <p className="text-lg font-medium mb-4">Natija topilmadi yoki server bilan bog'lanishda muammo yuz berdi.</p>
                <div className="flex justify-center gap-3">
                    <Link to="/student" className="btn-primary btn-lg">🏠 Bosh sahifaga</Link>
                    <Link to="/student/history" className="btn-secondary btn-lg">📈 Natijalarim</Link>
                </div>
            </div>
        </div>
    )

    const gradeConfig = {
        5: {
            gradient: 'from-emerald-400 via-teal-400 to-emerald-600',
            shadow: 'shadow-emerald-400/40',
            label: "A'lo! 🏆",
            emoji: '🏆',
            stars: 3,
            message: 'Zo\'rsan! Barcha savollarni muvaffaqiyatli bajardingiz!',
        },
        4: {
            gradient: 'from-blue-400 via-indigo-400 to-blue-600',
            shadow: 'shadow-blue-400/40',
            label: 'Yaxshi! 🥳',
            emoji: '🥳',
            stars: 2,
            message: 'Juda yaxshi natija! Davom eting!',
        },
        3: {
            gradient: 'from-orange-400 via-amber-400 to-orange-600',
            shadow: 'shadow-orange-400/40',
            label: 'Qoniqarli 👍',
            emoji: '👍',
            stars: 1,
            message: 'Qoniqarli natija. Ko\'proq mashq qiling!',
        },
    }

    const cfg = gradeConfig[result.grade] ?? {
        gradient: 'from-red-400 via-rose-400 to-red-600',
        shadow: 'shadow-red-400/40',
        label: "Qayta urinib ko'ring 💪",
        emoji: '💪',
        stars: 0,
        message: 'Xafa bo\'lmang! Har qanday muvaffaqiyat harakat bilan boshlanadi.',
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Navbar />
            <div className="max-w-2xl mx-auto px-4 py-10 animate-fade-in space-y-6">

                {/* ── Result hero card ── */}
                <div className={`bg-gradient-to-br ${cfg.gradient} rounded-3xl p-8 text-white text-center shadow-2xl ${cfg.shadow} relative overflow-hidden`}>
                    {/* Background shimmer */}
                    <div className="absolute inset-0 bg-white/10 rounded-3xl" style={{ backgroundImage: 'radial-gradient(circle at 70% 20%, rgba(255,255,255,0.25) 0%, transparent 60%)' }} />

                    {/* Stars */}
                    {cfg.stars > 0 && (
                        <div className="flex justify-center gap-3 mb-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <span
                                    key={i}
                                    className="text-4xl star-pop"
                                    style={{
                                        animationDelay: `${i * 0.18}s`,
                                        filter: i < cfg.stars ? 'drop-shadow(0 0 8px #fff)' : 'none',
                                        opacity: i < cfg.stars ? 1 : 0.25,
                                    }}
                                >⭐</span>
                            ))}
                        </div>
                    )}

                    {/* Grade display */}
                    <div className="text-8xl font-extrabold mb-2 score-glow animate-bounce-in relative z-10">
                        {result.grade}
                    </div>
                    <p className="text-2xl font-bold relative z-10">{cfg.label}</p>
                    <p className="text-sm opacity-80 mt-1 relative z-10">{cfg.message}</p>

                    {/* Score & Percentage */}
                    <div className="flex justify-center gap-8 mt-6 text-lg relative z-10">
                        <div>
                            <p className="opacity-70 text-xs uppercase tracking-wide">Ball</p>
                            <p className="font-extrabold text-2xl">
                                <AnimatedNumber target={result.score} />/
                                <span className="opacity-70">{result.total}</span>
                            </p>
                        </div>
                        <div className="w-px bg-white/30" />
                        <div>
                            <p className="opacity-70 text-xs uppercase tracking-wide">Foiz</p>
                            <p className="font-extrabold text-2xl">
                                <AnimatedNumber target={result.percentage} />%
                            </p>
                        </div>
                    </div>

                    {/* Circular progress ring */}
                    <div className="mt-5 flex justify-center relative z-10">
                        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 80 80">
                            <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
                            <circle
                                cx="40" cy="40" r="34"
                                fill="none" stroke="white" strokeWidth="8"
                                strokeDasharray={`${2 * Math.PI * 34}`}
                                strokeDashoffset={`${2 * Math.PI * 34 * (1 - result.percentage / 100)}`}
                                strokeLinecap="round"
                                style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-2xl">
                            {cfg.emoji}
                        </div>
                    </div>
                </div>

                {/* ── AI Xulosa & Tavsiyalar ── */}
                {showDetails && result.ai_feedback && (
                    <div className="card bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 dark:from-slate-800 dark:via-slate-800 dark:to-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 p-6 rounded-3xl shadow-sm animate-fade-in relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-24 h-24 bg-indigo-200/40 rounded-full blur-2xl dark:bg-indigo-900/30" />
                        <div className="flex items-center gap-3 mb-3 relative z-10">
                            <span className="text-3xl animate-pulse">🤖</span>
                            <div>
                                <h3 className="font-extrabold text-indigo-950 dark:text-indigo-200 text-base">AI Xulosa & Tavsiyalar</h3>
                                <p className="text-[11px] text-slate-400 dark:text-slate-400">Natijalaringiz asosida yaratilgan shaxsiy tavsiya</p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium relative z-10 whitespace-pre-line">
                            {result.ai_feedback}
                        </p>
                    </div>
                )}

                {/* ── Wrong answers breakdown ── */}
                {showDetails && result.wrong_details?.length > 0 && (
                    <div className="card animate-fade-in">
                        <h2 className="text-lg font-bold mb-4">❌ Xatolar tahlili ({result.wrong_details.length} ta)</h2>
                        <div className="space-y-4">
                            {result.wrong_details.map((w, i) => (
                                <div key={i} className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 animate-slide-in" style={{ animationDelay: `${i * 0.08}s` }}>
                                    <div className="font-medium text-sm mb-2 flex items-start gap-1">
                                        <span className="flex-shrink-0">{i + 1}.</span>
                                        <MathText text={w.question} />
                                    </div>
                                    <div className="flex gap-3 text-xs flex-wrap items-center">
                                        <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                                            ❌ Sizning javob: <strong>{typeof w.your_answer === 'object' ? JSON.stringify(w.your_answer) : <MathText text={String(w.your_answer || '')} />}</strong>
                                        </span>
                                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                            ✅ To'g'ri javob: <strong>{typeof w.correct_answer === 'object' ? JSON.stringify(w.correct_answer) : <MathText text={String(w.correct_answer || '')} />}</strong>
                                        </span>
                                    </div>
                                    {w.explanation && (
                                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 italic flex items-start gap-1">
                                            <span className="flex-shrink-0">💡</span>
                                            <MathText text={w.explanation} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {showDetails && result.wrong_details?.length === 0 && result.score === result.total && (
                    <div className="card text-center py-6 animate-bounce-in">
                        <div className="text-4xl mb-2">🎯</div>
                        <p className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">Barcha savollar to'g'ri!</p>
                        <p className="text-sm text-slate-500 mt-1">Mukammal natija 🌟</p>
                    </div>
                )}

                {/* ── Actions ── */}
                {showDetails && (
                    <div className="flex gap-3 flex-wrap justify-center animate-fade-in">
                        <Link to="/student" className="btn-primary btn-lg">🏠 Bosh sahifaga</Link>
                        <Link to="/student/history" className="btn-secondary btn-lg">📈 Natijalarim</Link>
                    </div>
                )}
            </div>
        </div>
    )
}
