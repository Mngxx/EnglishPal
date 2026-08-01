import { GroqKeyForm } from "./GroqKeyForm";

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
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
			<div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
				<h2 className="text-lg font-bold mb-1">Groq API Key</h2>
				<p className="text-sm text-gray-500 mb-4">
					Your key stays in your browser and is never sent to our servers except
					as part of your request to Groq.
				</p>
				<GroqKeyForm
					currentKey={currentKey}
					submitLabel="Save"
					onValidated={(validatedKey) => {
						onSave(validatedKey);
						onClose();
					}}
				>
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
				</GroqKeyForm>
			</div>
		</div>
	);
}
