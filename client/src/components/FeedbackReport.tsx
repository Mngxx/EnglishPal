import ReactMarkdown from "react-markdown";

interface FeedbackReportProps {
	feedback: string;
	onClose: () => void;
	onSave: () => void;
	isSaving: boolean;
}

export function FeedbackReport({
	feedback,
	onClose,
	onSave,
	isSaving,
}: FeedbackReportProps) {
	return (
		<div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
			<div className="bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-xl max-h-[90vh] flex flex-col shadow-2xl">
				{/* Colored top accent */}
				<div className="h-1 w-full rounded-t-3xl sm:rounded-t-2xl bg-gradient-to-r from-blue-400 to-indigo-500" />

				{/* Header */}
				<div className="px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800">
					<div className="flex items-center gap-2 mb-1">
						<span className="text-lg">📋</span>
						<h2 className="text-lg font-bold">Session Feedback</h2>
					</div>
					<p className="text-xs text-gray-400">
						Based on your conversation with the AI
					</p>
				</div>

				{/* Feedback body */}
				<div className="px-6 py-5 overflow-y-auto flex-1">
					<div className="prose prose-sm dark:prose-invert max-w-none">
						<ReactMarkdown>{feedback}</ReactMarkdown>
					</div>
				</div>

				{/* Actions */}
				<div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex gap-3">
					<button
						className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium transition-colors"
						onClick={onClose}
					>
						Discard
					</button>
					<button
						className="flex-1 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium disabled:opacity-50 transition-colors"
						onClick={onSave}
						disabled={isSaving}
					>
						{isSaving ? "Saving..." : "Save Session"}
					</button>
				</div>
			</div>
		</div>
	);
}
