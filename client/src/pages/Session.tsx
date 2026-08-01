import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
	ApiKeyModal,
	FeedbackReport,
	ModeBadge,
	OnboardingWizard,
} from "../components";
import { API_URL } from "../config";
import {
	useApiKey,
	useChat,
	useFeedback,
	useOnboarding,
	useSpeechRecognition,
	useSpeechSynthesis,
} from "../hooks";
import { assertOk } from "../lib/api";
import type { HistoryMessage, Mode } from "../types/index";

export function Session() {
	const { apiKey, saveApiKey, clearApiKey } = useApiKey();
	const { showOnboarding, setShowOnboarding, completeOnboarding } =
		useOnboarding();
	const [showApiKeyModal, setShowApiKeyModal] = useState(false);
	const location = useLocation();
	const locationState = location.state as {
		history?: HistoryMessage[];
		mode?: Mode;
		id?: number;
	} | null;
	const [mode, setMode] = useState<Mode>(locationState?.mode ?? "casual");
	const [saveError, setSaveError] = useState<string | null>(null);
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
	} = useChat(mode, locationState?.history ?? [], apiKey);
	const {
		feedback,
		getFeedback,
		isLoadingFeedback,
		clearFeedback,
		error: feedbackError,
	} = useFeedback(apiKey);

	const [isSaving, setIsSaving] = useState(false);
	const navigate = useNavigate();
	const handleStartListening = () => {
		if (!apiKey) {
			setShowApiKeyModal(true);
			return;
		}
		startListening();
	};
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
			const sessionId = locationState?.id;
			if (sessionId) {
				const response = await fetch(`${API_URL}/sessions/${sessionId}`, {
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ transcript: history, feedback }),
				});
				await assertOk(response);
			} else {
				const response = await fetch(`${API_URL}/sessions`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						date: new Date().toISOString(),
						mode,
						transcript: history,
						feedback,
					}),
				});
				await assertOk(response);
			}
			clearHistory();
			clearFeedback();
			clearTranscript();
			navigate("/", { replace: true, state: null });
		} catch (err) {
			setSaveError(
				err instanceof Error ? err.message : "Failed to save session.",
			);
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
				{history.length === 0 ? (
					<div className="flex rounded-full border border-gray-200 dark:border-gray-700 overflow-hidden text-xs font-medium">
						<button
							type="button"
							className={`px-3 py-1 transition-colors ${
								mode === "casual"
									? "bg-green-100 text-green-700"
									: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
							}`}
							onClick={() => setMode("casual")}
						>
							Casual
						</button>
						<button
							type="button"
							className={`px-3 py-1 transition-colors ${
								mode === "formal"
									? "bg-purple-100 text-purple-700"
									: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
							}`}
							onClick={() => setMode("formal")}
						>
							Formal
						</button>
					</div>
				) : (
					<ModeBadge mode={mode} />
				)}
				<div className="flex gap-2">
					<button
						type="button"
						className="btn-secondary"
						onClick={() => navigate("/dashboard")}
					>
						Dashboard
					</button>
					<div className="flex gap-2">
						<button
							type="button"
							className="btn-secondary"
							onClick={() => setShowOnboarding(true)}
						>
							❓ How it works
						</button>
						<button
							type="button"
							className="btn-secondary"
							onClick={() => setShowApiKeyModal(true)}
						>
							{apiKey ? "🔑 Key set" : "⚙️ API Key"}
						</button>
						<button
							type="button"
							className="btn-secondary"
							onClick={() => navigate("/history")}
						>
							History →
						</button>
					</div>
				</div>
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
									type="button"
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

			{(micError || chatError || feedbackError || saveError) && (
				<p className="text-error">
					{micError ?? chatError ?? feedbackError ?? saveError}
				</p>
			)}

			{/* Controls */}
			<div className="border-t border-gray-200 dark:border-gray-700 px-6 py-5">
				<div className="max-w-xl mx-auto flex flex-col items-center gap-4">
					<p className={`text-sm font-medium ${statusColor}`}>{status}</p>
					<div className="flex gap-4 w-full">
						<button
							type="button"
							className="flex-1 btn-primary disabled:opacity-50 py-3 transition-colors"
							onClick={isListening ? handleStop : handleStartListening}
							disabled={isLoading || isSpeaking}
						>
							{isListening ? "Stop & Send" : "Start Listening"}
						</button>
						<button
							type="button"
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
			{showApiKeyModal && (
				<ApiKeyModal
					currentKey={apiKey}
					onSave={saveApiKey}
					onClear={clearApiKey}
					onClose={() => setShowApiKeyModal(false)}
				/>
			)}
			{showOnboarding && (
				<OnboardingWizard
					apiKey={apiKey}
					saveApiKey={saveApiKey}
					onFinish={() => {
						completeOnboarding();
						setShowOnboarding(false);
					}}
				/>
			)}
		</div>
	);
}
