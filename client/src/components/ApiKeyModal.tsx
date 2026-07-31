import { useState } from "react";
import { API_URL } from "../config";

interface ApiKeyModalProps {
	currentKey: string;
	onSave: (key: string) => void;
	onClear: () => void;
	onClose: () => void;
}

export function ApiKeyModal({
	currentKey,
	onSave,
	onClear,
	onClose,
}: ApiKeyModalProps) {
	const [input, setInput] = useState(currentKey);
	const [isValidating, setIsValidating] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSave = async () => {
		const trimmed = input.trim();
		if (!trimmed.startsWith("gsk_")) {
			setError("Groq API keys start with 'gsk_'");
			return;
		}
		setIsValidating(true);
		setError(null);
		try {
			const response = await fetch(`${API_URL}/validate-key`, {
				method: "POST",
				headers: { "x-groq-api-key": trimmed },
			});
			if (!response.ok) {
				setError("Invalid API key. Please check and try again.");
				return;
			}
			onSave(trimmed);
			onClose();
		} catch {
			setError("Could not validate. Check your connection.");
		} finally {
			setIsValidating(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
			<div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
				<h2 className="text-lg font-bold mb-1">Groq API Key</h2>
				<p className="text-sm text-gray-500 mb-4">
					Your key stays in your browser and is never sent to our servers except
					as part of your request to Groq.
				</p>

				<input
					type="password"
					className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm mb-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-400"
					placeholder="gsk_..."
					value={input}
					onChange={(e) => {
						setInput(e.target.value);
						setError(null);
					}}
				/>
				{error && <p className="text-xs text-red-500 mb-3">{error}</p>}
				{!error && <div className="mb-3" />}

				<div className="flex gap-2">
					<button
						type="button"
						className="flex-1 btn-primary disabled:opacity-50"
						onClick={handleSave}
						disabled={isValidating}
					>
						{isValidating ? "Validating..." : "Save"}
					</button>
					{currentKey && (
						<button
							type="button"
							className="btn-outline text-red-400 hover:text-red-600"
							onClick={() => {
								onClear();
								onClose();
							}}
						>
							Clear
						</button>
					)}
					<button type="button" className="btn-secondary" onClick={onClose}>
						Cancel
					</button>
				</div>
			</div>
		</div>
	);
}
