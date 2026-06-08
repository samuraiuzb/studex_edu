/**
 * Shared Navbar — avatar click opens a clean profile dropdown
 * showing XP bar, dark-mode toggle, "edit profile" and logout.
 */
import React, { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ProfileEditModal from './ProfileEditModal'
import toast from 'react-hot-toast'

const teacherLinks = [
    { to: '/teacher', icon: '📊', label: 'Bosh sahifa' },
    { to: '/teacher/classrooms', icon: '🏫', label: 'Sinflar' },
    { to: '/teacher/tests', icon: '📝', label: 'Tarqatma materiallar' },
    { to: '/teacher/materials', icon: '📚', label: 'Materiallar' },
]

const studentLinks = [
    { to: '/student', icon: '🏠', label: 'Bosh sahifa' },
    { to: '/student/materials', icon: '📚', label: 'Materiallar' },
    { to: '/student/history', icon: '📈', label: 'Natijalarim' },
    { to: '/student/leaderboard', icon: '🏆', label: 'Reyting' },
]

function getLevelColor(level) {
    if (level >= 10) return '#7C3AED'
    if (level >= 7) return '#D97706'
    if (level >= 4) return '#2563EB'
    return '#10B981'
}

export default function Navbar() {
    const { user, logout } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()
    const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))
    const [profileOpen, setProfileOpen] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const dropdownRef = useRef(null)

    const links = user?.role === 'teacher' ? teacherLinks : (
        user?.role === 'guest' ? studentLinks.filter(l => l.to !== '/student/history') : studentLinks
    )

    // Close dropdown when clicking outside
    useEffect(() => {
        function onOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setProfileOpen(false)
            }
        }
        document.addEventListener('mousedown', onOutside)
        return () => document.removeEventListener('mousedown', onOutside)
    }, [])

    function handleLogout() {
        logout()
        toast.success('Chiqish muvaffaqiyatli!')
        navigate('/login')
        setProfileOpen(false)
    }

    function toggleDark() {
        const next = !dark
        setDark(next)
        document.documentElement.classList.toggle('dark', next)
        localStorage.setItem('theme', next ? 'dark' : 'light')
    }

    const displayName = user?.full_name || user?.username || '?'
    const initials = displayName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    const xpPercent = user ? (user.total_xp % 100) : 0
    const levelColor = getLevelColor(user?.level || 1)

    return (
        <>
            <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center h-16 gap-4">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 mr-4 flex-shrink-0 hover:opacity-90 transition">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#1E3A8A] via-[#2563EB] to-[#2563EB]/80 rounded-[10px] flex items-center justify-center text-white font-black text-2xl shadow-md">
                            S
                        </div>
                        <span className="text-2xl hidden sm:block tracking-tight">
                            <span className="font-extrabold text-[#1F2937] dark:text-white">Stud</span>
                            <span className="font-normal text-[#2563EB]">ex</span>
                        </span>
                    </Link>

                    {/* Nav links */}
                    <div className="flex items-center gap-1 flex-1">
                        {links.map(link => {
                            const active = location.pathname === link.to ||
                                (link.to !== '/teacher' && link.to !== '/student' && location.pathname.startsWith(link.to))
                            return (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${active
                                        ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    <span>{link.icon}</span>
                                    <span className="hidden sm:block">{link.label}</span>
                                </Link>
                            )
                        })}
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-3">



                        {/* Name + role (hidden on mobile) */}
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-tight">{displayName}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {user?.role === 'teacher' ? "👨‍🏫 O'qituvchi" : `🎓 ${user?.class_name || "O'quvchi"}`}
                            </p>
                        </div>

                        {/* Avatar button — opens dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                id="profile-avatar-btn"
                                onClick={() => setProfileOpen(v => !v)}
                                className="w-9 h-9 rounded-full hero-gradient flex items-center justify-center text-white font-bold text-sm flex-shrink-0 hover:scale-105 transition-transform ring-2 ring-offset-2 ring-blue-400 dark:ring-blue-600 focus:outline-none"
                                title="Profil"
                            >
                                {initials}
                            </button>

                            {/* ── Dropdown ── */}
                            {profileOpen && (
                                <div className="absolute right-0 top-12 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden animate-fade-in">

                                    {/* User identity */}
                                    <div className="px-4 pt-4 pb-3 flex items-center gap-3 border-b border-slate-100 dark:border-slate-700">
                                        <div className="w-11 h-11 rounded-full hero-gradient flex items-center justify-center text-white font-bold text-base flex-shrink-0">
                                            {initials}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-slate-800 dark:text-slate-100 truncate text-sm">{displayName}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">@{user?.username}</p>
                                            <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full mt-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                                                {user?.role === 'teacher' ? "👨‍🏫 O'qituvchi" : (user?.role === 'guest' ? "👤 Mehmon" : `🎓 ${user?.class_name || "O'quvchi"}`)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* XP bar (student) */}
                                    {user?.role === 'student' && (
                                        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">⭐ XP / Daraja</span>
                                                <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: levelColor }}>
                                                    Lvl {user?.level || 1}
                                                </span>
                                            </div>
                                            <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mb-1.5">{user?.total_xp || 0} XP</p>
                                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                                <div className="h-2 rounded-full transition-all duration-700"
                                                    style={{ width: `${xpPercent}%`, background: levelColor }} />
                                            </div>
                                            <p className="text-[10px] text-slate-400 mt-1">{xpPercent}/100 — keyingi daraja</p>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="px-3 py-3 space-y-1">
                                        {/* My Profile */}
                                        {(user?.role === 'student' || user?.role === 'guest') && (
                                            <Link
                                                to="/student/profile"
                                                onClick={() => setProfileOpen(false)}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition text-left"
                                            >
                                                <span className="text-base">👤</span> Mening profilim
                                            </Link>
                                        )}

                                        {/* Edit profile */}
                                        <button
                                            onClick={() => { setEditOpen(true); setProfileOpen(false) }}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition text-left"
                                        >
                                            <span className="text-base">✏️</span> Profilni tahrirlash
                                        </button>

                                        {/* Dark mode toggle */}
                                        <button
                                            onClick={toggleDark}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition text-left"
                                        >
                                            <span className="text-base">{dark ? '☀️' : '🌙'}</span>
                                            {dark ? "Kunduzgi rejim" : "Tungi rejim"}
                                        </button>

                                        {/* Logout */}
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition text-left"
                                        >
                                            <span className="text-base">🚪</span> Chiqish
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </nav>

            {/* Profile edit modal */}
            {editOpen && <ProfileEditModal onClose={() => setEditOpen(false)} />}
        </>
    )
}
