import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "../hooks/useSpeechSynthesis";
import { useChat } from "../hooks/useChat";

export function TestVoice() {
    const {
        transcript,
        isListening,
        error: micError,
        startListening,
        stopListening,
        transcriptRef,
    } = useSpeechRecognition();
    const { speak, cancel, isSpeaking } = useSpeechSynthesis();
    const {
        sendMessage,
        history,
        isLoading,
        error: chatError,
        clearHistory,
    } = useChat("casual");

    const handleStop = async () => {
        stopListening();
        const text = transcriptRef.current;
        if (!text) return;
        const reply = await sendMessage(text);
        if (reply) speak(reply);
    };

    const status = isListening
        ? "Listening"
        : isLoading
          ? "Thinking..."
          : isSpeaking
            ? "Speaking..."
            : "Idle";

    return (
        <section className="flex flex-col items-center justify-center h-screen gap-8 p-8">
            <p className="text-lg font-semibold">{status}</p>

            <button
                className="bg-blue-500 hover:bg-blue-700 disabled:opacity-50 text-white px-8 py-4 rounded-xl text-lg"
                onClick={isListening ? handleStop : startListening}
                disabled={isLoading || isSpeaking}
            >
                {isListening ? "Stop & Send" : "Start Listening"}
            </button>

            {(micError || chatError) && (
                <p className="text-red-500">{micError ?? chatError}</p>
            )}

            <div className="w-full max-w-xl flex flex-col gap-3">
                {history.map((msg, i) => (
                    <div
                        key={i}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`px-4 py-2 rounded-xl max-w-sm ${msg.role === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"}`}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
