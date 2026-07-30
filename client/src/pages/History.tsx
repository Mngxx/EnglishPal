import { useNavigate } from "react-router-dom";
import { ModeBadge } from "../components";
import { useHistory } from "../hooks";

export function History() {
	const { sessions, isLoading, error, deleteSession } = useHistory();
	const navigate = useNavigate();

	if (isLoading)
		return (
			<div className="flex items-center justify-center h-screen">
				<p className="text-gray-500">Loading sessions...</p>
			</div>
		);

	if (error)
		return (
			<div className="flex items-center justify-center h-screen">
				<p className="text-red-500">{error}</p>
			</div>
		);

	return (
		<div className="max-w-2xl mx-auto px-4 py-10">
			<div className="flex items-center justify-between mb-8">
				<h1 className="text-2xl font-bold">Session History</h1>
				<div className="flex gap-2">
					<button
						type="button"
						className="btn-secondary"
						onClick={() => navigate("/dashboard")}
					>
						Dashboard
					</button>
					<button
						type="button"
						className="btn-secondary"
						onClick={() => navigate("/")}
					>
						← New Session
					</button>
				</div>
			</div>

			{sessions.length === 0 ? (
				<p className="text-center text-gray-400 mt-20">
					No sessions saved yet. Complete a conversation to see it here.
				</p>
			) : (
				<div className="flex flex-col gap-4">
					{sessions.map((session) => (
						<div
							key={session.id}
							className="session-card group"
							onClick={() => navigate(`/history/${session.id}`)}
						>
							<div className="flex items-center justify-between mb-2">
								<p className="text-sm text-gray-500">
									{new Date(session.date).toLocaleDateString("en-US", {
										year: "numeric",
										month: "long",
										day: "numeric",
										hour: "2-digit",
										minute: "2-digit",
									})}
								</p>
								<ModeBadge mode={session.mode} />
							</div>
							<p className="text-notes">{session.transcript.length} messages</p>
							<p className="text-history-feedback">
								{session.feedback.slice(0, 120)}...
							</p>
							<div className="session-card-actions">
								<div className="flex justify-end mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
									<button
										type="button"
										className="text-xs font-medium text-red-400 hover:text-red-600 transition-colors"
										onClick={(e) => {
											e.stopPropagation();
											deleteSession(session.id);
										}}
									>
										Delete session
									</button>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
