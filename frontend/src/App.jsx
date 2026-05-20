/**
 * App.jsx — Root router with dark mode, protected routes.
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'

import Login from './pages/Login'
import Register from './pages/Register'
import TeacherDashboard from './pages/teacher/Dashboard'
import TeacherTests from './pages/teacher/Tests'
import TeacherTestDetail from './pages/teacher/TestDetail'
import TeacherMaterials from './pages/teacher/Materials'
import TeacherResults from './pages/teacher/Results'
import TeacherClassrooms from './pages/teacher/Classrooms'
import TeacherClassroomDetail from './pages/teacher/ClassroomDetail'
import StudentDashboard from './pages/student/Dashboard'
import StudentJoinClassroom from './pages/student/JoinClassroom'
import TakeTest from './pages/student/TakeTest'
import TestResult from './pages/student/TestResult'
import StudentHistory from './pages/student/History'
import StudentMaterials from './pages/student/Materials'
import MaterialHandout from './pages/student/MaterialHandout'
import Leaderboard from './pages/student/Leaderboard'

// Protected route wrapper
function Protected({ role, children }) {
    const { user, loading } = useAuth()
    if (loading) return (
        <div className="flex items-center justify-center h-screen">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
    )
    if (!user) return <Navigate to="/login" replace />
    if (role && user.role !== role) return <Navigate to="/" replace />
    return children
}

function AppRoutes() {
    const { user } = useAuth()
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Teacher routes */}
            <Route path="/teacher" element={<Protected role="teacher"><TeacherDashboard /></Protected>} />
            <Route path="/teacher/classrooms" element={<Protected role="teacher"><TeacherClassrooms /></Protected>} />
            <Route path="/teacher/classrooms/:id" element={<Protected role="teacher"><TeacherClassroomDetail /></Protected>} />

            <Route path="/teacher/tests" element={<Protected role="teacher"><TeacherTests /></Protected>} />
            <Route path="/teacher/tests/:id" element={<Protected role="teacher"><TeacherTestDetail /></Protected>} />
            <Route path="/teacher/materials" element={<Protected role="teacher"><TeacherMaterials /></Protected>} />
            <Route path="/teacher/tests/:id/results" element={<Protected role="teacher"><TeacherResults /></Protected>} />

            {/* Student routes */}
            <Route path="/student" element={<Protected role="student"><StudentDashboard /></Protected>} />
            <Route path="/student/join-classroom" element={<Protected role="student"><StudentJoinClassroom /></Protected>} />

            <Route path="/student/materials" element={<Protected role="student"><StudentMaterials /></Protected>} />
            <Route path="/student/materials/:id/handout" element={<Protected role="student"><MaterialHandout /></Protected>} />
            <Route path="/student/test/:id" element={<Protected role="student"><TakeTest /></Protected>} />
            <Route path="/student/result/:id" element={<Protected role="student"><TestResult /></Protected>} />
            <Route path="/student/history" element={<Protected role="student"><StudentHistory /></Protected>} />
            <Route path="/student/leaderboard" element={<Protected role="student"><Leaderboard /></Protected>} />

            {/* Default redirect */}
            <Route path="/" element={
                user?.role === 'teacher' ? <Navigate to="/teacher" replace /> :
                    user?.role === 'student' ? <Navigate to="/student" replace /> :
                        <Navigate to="/login" replace />
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}

export default function App() {
    const [dark, setDark] = useState(() =>
        localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    )

    useEffect(() => {
        document.documentElement.classList.toggle('dark', dark)
        localStorage.setItem('theme', dark ? 'dark' : 'light')
    }, [dark])

    return (
        <AuthProvider>
            <BrowserRouter>
                <div className="min-h-screen">
                    <AppRoutes />
                </div>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        className: 'dark:bg-slate-800 dark:text-slate-100',
                        duration: 3000,
                    }}
                />

            </BrowserRouter>
        </AuthProvider>
    )
}
