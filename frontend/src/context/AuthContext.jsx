/**
 * AuthContext — provides user state, login, logout, register actions globally.
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    // On mount: restore user from localStorage token
    useEffect(() => {
        const access = localStorage.getItem('access')
        if (access) {
            api.get('/auth/me/')
                .then(({ data }) => setUser(data))
                .catch(() => { localStorage.removeItem('access'); localStorage.removeItem('refresh') })
                .finally(() => setLoading(false))
        } else {
            setLoading(false)
        }
    }, [])

    const login = useCallback(async (username, password) => {
        const { data } = await api.post('/auth/login/', { username, password })
        localStorage.setItem('access', data.access)
        localStorage.setItem('refresh', data.refresh)
        setUser(data.user)
        return data.user
    }, [])

    const register = useCallback(async (payload) => {
        const { data } = await api.post('/auth/register/', payload)
        localStorage.setItem('access', data.access)
        localStorage.setItem('refresh', data.refresh)
        setUser(data.user)
        return data.user
    }, [])

    const logout = useCallback(() => {
        localStorage.removeItem('access')
        localStorage.removeItem('refresh')
        setUser(null)
    }, [])

    const updateUser = useCallback(async (payload) => {
        const { data } = await api.patch('/auth/me/', payload)
        setUser(data)
        return data
    }, [])

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, register, updateUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
