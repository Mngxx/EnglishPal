import { useState, useCallback } from 'react'

interface UseSpeechSynthesisReturn {
  speak: (text: string) => void
  cancel: () => void
  isSpeaking: boolean
}

export function useSpeechSynthesis(): UseSpeechSynthesisReturn {
    const [isSpeaking, setIsSpeaking] = useState(false)

    const speak = useCallback((text: string) => {
        if (!text.trim()) return

        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = 'en-US'
        utterance.rate = 1       // speed (0.5 = slow, 2 = fast)
        utterance.pitch = 1

        utterance.onstart = () => setIsSpeaking(true)
        utterance.onend = () => setIsSpeaking(false)
        utterance.onerror  = () => setIsSpeaking(false)
        window.speechSynthesis.speak(utterance)
    }, [])

    const cancel = useCallback(() => {
        window.speechSynthesis.cancel()
        setIsSpeaking(false)
    }, [])
        
    return { speak, cancel, isSpeaking }
}

