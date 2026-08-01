import { type ReactNode, useState } from "react";
import { validateGroqKey } from "../lib/api";

interface GroqKeyFormProps {
	currentKey: string;
	submitLabel: string;
	onValidated: (key: string) => void;
	children?: ReactNode;
}

export function GroqKeyForm({
	currentKey,
	submitLabel,
	onValidated,
	children,
}: GroqKeyFormProps) {
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
			await validateGroqKey(trimmed);
			onValidated(trimmed);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Something went wrong.");
		} finally {
			setIsValidating(false);
		}
	};

	return (
		<div>
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
					{isValidating ? "Validating..." : submitLabel}
				</button>
				{children}
			</div>
		</div>
	);
}
