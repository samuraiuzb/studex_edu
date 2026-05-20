/**
 * Sound hook — plays correct.mp3 or wrong.mp3 only on user interaction.
 * Sound can be toggled on/off, stored in localStorage.
 */
import { useState, useCallback } from 'react'

export function useSound() {
    const [enabled, setEnabled] = useState(
        () => localStorage.getItem('sound') !== 'off'
    )

    const toggle = useCallback(() => {
        setEnabled(prev => {
            const next = !prev
            localStorage.setItem('sound', next ? 'on' : 'off')
            return next
        })
    }, [])

    const play = useCallback((type) => {
        if (!enabled) return
        try {
            const audio = new Audio(`/sounds/${type}.mp3`)
            audio.volume = 0.6
            audio.play().catch(() => { }) // Ignore auto-play policy errors
        } catch (_) { }
    }, [enabled])

    return { enabled, toggle, playCorrect: () => play('correct'), playWrong: () => play('wrong') }
}
