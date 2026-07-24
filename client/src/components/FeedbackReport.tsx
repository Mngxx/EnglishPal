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
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
			<div className="bg-white dark:bg-gray-800 rounded-2xl max-w-xl w-full max-h-[80vh] flex flex-col">
				<div className="p-6 border-b border-gray-200 dark:border-gray-700">
					<h2 className="text-xl font-semibold">Session Feedback</h2>
					<p className="text-sm text-gray-500 mt-1">
						Based on your conversation
					</p>
				</div>
				<div className="p-6 overflow-y-auto flex-1">
					<p className="whitespace-pre-wrap text-sm leading-relaxed">
						{feedback}
					</p>
				</div>
				<div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
					<button
						className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-100 text-sm"
						onClick={onClose}
					>
						Discard
					</button>
					<button
						className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-700 text-white text-sm disabled:opacity-50"
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
