import { useState, useRef, useCallback } from 'react'

declare global {
  interface Window {
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}

interface UseSpeechRecognitionReturn {
  transcript: string
  isListening: boolean
  error: string | null
  startListening: () => void
  stopListening: () => void
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [transcript, setTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const startListening = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser. Use Chrome.')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = false  // only give final results, not guesses mid-speech
    recognition.continuous = false      // stop after one sentence (simpler to start)

    recognition.onstart = () => {
      setIsListening(true)
      setError(null)
    }

    recognition.onresult = (event) => {
      const text = event.results[0]?.[0]?.transcript ?? ''
      setTranscript(text)
    }

    recognition.onerror = (event) => {
      setError(event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()


  }, [])
  
  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  return { transcript, isListening, error, startListening, stopListening }
}


