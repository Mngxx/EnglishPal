import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FeedbackReport } from "../components/FeedbackReport";
import { ModeBadge } from "../components/ModeBadge";
import { API_URL } from "../config";
import { useChat } from "../hooks/useChat";
import { useFeedback } from "../hooks/useFeedback";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "../hooks/useSpeechSynthesis";
import type { HistoryMessage, Mode } from "../types/index";

export function Session() {
	const location = useLocation();
	const locationState = location.state as {
		history?: HistoryMessage[];
		mode?: Mode;
	} | null;
	const mode = locationState?.mode ?? "casual";
	const {
		isListening,
		transcript,
		error: micError,
		startListening,
		stopListening,
		transcriptRef,
		clearTranscript,
		interimTranscript,
	} = useSpeechRecognition();
	const { speak, isSpeaking } = useSpeechSynthesis();
	const {
		sendMessage,
		history,
		isLoading,
		error: chatError,
		clearHistory,
	} = useChat(mode, locationState?.history ?? []);
	const {
		feedback,
		getFeedback,
		isLoadingFeedback,
		clearFeedback,
		error: feedbackError,
	} = useFeedback();

	const [isSaving, setIsSaving] = useState(false);
	const navigate = useNavigate();

	const handleStop = async () => {
		await stopListening();
		const text = transcriptRef.current;
		if (!text) return;
		const reply = await sendMessage(text);
		if (reply) speak(reply);
	};

	const handleSaveSession = async () => {
		setIsSaving(true);
		try {
			await fetch(`${API_URL}/sessions`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					date: new Date().toISOString(),
					mode: mode,
					transcript: history,
					feedback,
				}),
			});
			clearHistory();
			clearFeedback();
		} catch (err) {
			console.error(err);
		} finally {
			setIsSaving(false);
		}
	};

	const status = isListening
		? "Listening..."
		: isLoading
			? "Thinking..."
			: isSpeaking
				? "Speaking..."
				: "Idle";

	const statusColor = isListening
		? "text-green-500"
		: isLoading
			? "text-yellow-500"
			: isSpeaking
				? "text-blue-500"
				: "text-gray-400";

	return (
		<div className="flex flex-col h-screen">
			{/* Header */}
			<header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
				<h1 className="text-lg font-bold">EnglishPal</h1>
				<ModeBadge mode={mode} />
				<button className="btn-secondary" onClick={() => navigate("/history")}>
					History →
				</button>
			</header>

			{/* Chat area */}
			<div className="flex-1 overflow-y-auto px-4 py-6">
				{history.length === 0 && !transcript && !interimTranscript ? (
					<div className="flex flex-col items-center justify-center h-full text-center gap-3">
						<p className="text-header">Ready to practice?</p>
						<p className="text-notes max-w-xs">
							Press Start Listening, speak freely, then press Stop & Send. The
							AI will respond and you can keep the conversation going.
						</p>
					</div>
				) : (
					<div className="max-w-xl mx-auto flex flex-col gap-3">
						{history.map((msg, i) => (
							<div
								key={i}
								className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
							>
								<div
									className={`${
										msg.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"
									}`}
								>
									{msg.content}
								</div>
							</div>
						))}
						{isListening && (transcript || interimTranscript) && (
							<div className="flex flex-col items-end gap-1">
								<div className="px-4 py-2 rounded-xl max-w-sm text-sm bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200 italic opacity-70">
									{transcript}
									{interimTranscript ? ` ${interimTranscript}` : ""}
								</div>
								<button
									className="text-xs text-gray-400 hover:text-red-400 transition-colors"
									onClick={clearTranscript}
								>
									Clear transcript
								</button>
							</div>
						)}
					</div>
				)}
			</div>

			{/* Errors */}
			{(micError || chatError || feedbackError) && (
				<p className="text-error">{micError ?? chatError ?? feedbackError}</p>
			)}

			{/* Controls */}
			<div className="border-t border-gray-200 dark:border-gray-700 px-6 py-5">
				<div className="max-w-xl mx-auto flex flex-col items-center gap-4">
					<p className={`text-sm font-medium ${statusColor}`}>{status}</p>
					<div className="flex gap-4 w-full">
						<button
							className="flex-1 btn-primary disabled:opacity-50 py-3 transition-colors"
							onClick={isListening ? handleStop : startListening}
							disabled={isLoading || isSpeaking}
						>
							{isListening ? "Stop & Send" : "Start Listening"}
						</button>
						<button
							className="flex-1 btn-outline"
							onClick={() => getFeedback(history)}
							disabled={isLoadingFeedback || history.length === 0}
						>
							{isLoadingFeedback ? "Generating..." : "End Session"}
						</button>
					</div>
				</div>
			</div>
			{feedback && (
				<FeedbackReport
					feedback={feedback}
					onClose={clearFeedback}
					onSave={handleSaveSession}
					isSaving={isSaving}
				/>
			)}
		</div>
	);
}
