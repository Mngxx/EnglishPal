import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useNavigate, useParams } from "react-router-dom";
import { ModeBadge } from "../components/ModeBadge";
import { API_URL } from "../config";
import type { Session } from "../types/index";

export function SessionDetail() {
	const { id } = useParams();
	const navigate = useNavigate();
	const [session, setSession] = useState<Session | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchSession = async () => {
			try {
				const response = await fetch(`${API_URL}/sessions/${id}`);
				const data = (await response.json()) as Session;
				setSession(data);
			} catch (_err) {
				setError("Failed to load session.");
			} finally {
				setIsLoading(false);
			}
		};
		fetchSession();
	}, [id]);

	const handleDelete = async () => {
		await fetch(`${API_URL}/sessions/${id}`, { method: "DELETE" });
		navigate("/history");
	};

	if (isLoading)
		return (
			<div className="flex items-center justify-center h-screen">
				<p className="text-gray-500">Loading session...</p>
			</div>
		);
	if (error || !session)
		return (
			<div className="flex items-center justify-center h-screen">
				<p className="text-red-500">{error ?? "Session not found."}</p>
			</div>
		);
	return (
		<div className="max-w-2xl mx-auto px-4 py-10">
			<div className="flex items-center justify-between mb-8">
				<button className="btn-secondary" onClick={() => navigate("/history")}>
					← Back to History
				</button>
				<button
					className="btn-primary px-4 py-2"
					onClick={() =>
						navigate("/", {
							state: {
								history: session.transcript,
								mode: session.mode,
								id: session.id,
							},
						})
					}
				>
					Continue Session
				</button>
				<ModeBadge mode={session.mode} />
			</div>

			<p className="text-sm text-gray-500 mb-8">
				{new Date(session.date).toLocaleDateString("en-US", {
					year: "numeric",
					month: "long",
					day: "numeric",
					hour: "2-digit",
					minute: "2-digit",
				})}
			</p>

			<h2 className="text-lg font-semibold mb-4">Conversation</h2>
			<div className="flex flex-col gap-3 mb-10">
				{session.transcript.map((msg, i) => (
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
			</div>

			{/* Feedback */}
			<div className="mb-10">
				<div className="flex items-center gap-2 mb-4">
					<span className="text-base">📋</span>
					<h2 className="text-lg font-semibold">Feedback</h2>
				</div>
				<div className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
					<div className="h-1 bg-gradient-to-r from-blue-400 to-indigo-500" />
					<div className="p-6">
						<div className="prose prose-sm dark:prose-invert max-w-none">
							<ReactMarkdown>{session.feedback}</ReactMarkdown>
						</div>
					</div>
				</div>
			</div>
			<div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-2 flex justify-end">
				<button
					className="px-4 py-2 rounded-xl border border-red-300 dark:border-red-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 text-sm font-medium transition-colors"
					onClick={handleDelete}
				>
					Delete session
				</button>
			</div>
		</div>
	);
}
