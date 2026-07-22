import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { useSpeechSynthesis} from '../hooks/useSpeechSynthesis'

export function TestVoice() {

    const { transcript, isListening, error, startListening, stopListening } = useSpeechRecognition()
    const { speak, cancel, isSpeaking } = useSpeechSynthesis()

    return (
        <section className="flex flex-col place-content-center items-center h-[100vh] space-y-[5em]">
            <div >
                <button className="bg-blue-500 hover:bg-blue-700 text-white p-[1.5em] rounded-xl" onClick={isListening ? stopListening : startListening}>
                    {isListening ? 'Stop' : 'Start Listening'}
                </button>
            </div>
            <div>
                <p>Status: {isListening ? 'Listening...' : 'Idle'}</p>
            </div>
            <div>
                <p>Transcript: {transcript}</p>
                {error && <p style={{ color: 'red' }}>Error: {error}</p>}
            </div>
            <div>
                <button className="bg-blue-500 hover:bg-blue-700 text-white p-[1.5em] rounded-xl" onClick={() => speak(transcript)} disabled={!transcript || isSpeaking}>
                    {isSpeaking ? 'Speaking...' : 'Play Back'}
                </button>
            </div>
            
        </section>
        
    )
}