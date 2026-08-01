import { useState } from "react";
import { GroqKeyForm } from "./GroqKeyForm";

interface OnboardingWizardProps {
	apiKey: string;
	saveApiKey: (key: string) => void;
	onFinish: () => void;
}

const TOTAL_STEPS = 3;

export function OnboardingWizard({
	apiKey,
	saveApiKey,
	onFinish,
}: OnboardingWizardProps) {
	const [step, setStep] = useState(0);

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
			<div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
				<div className="flex justify-center gap-2 mb-4">
					{Array.from({ length: TOTAL_STEPS }).map((_, i) => (
						<div
							key={i}
							className={`h-1.5 w-1.5 rounded-full ${
								i === step ? "bg-indigo-500" : "bg-gray-300 dark:bg-gray-700"
							}`}
						/>
					))}
				</div>

				{step === 0 && (
					<div>
						<h2 className="text-lg font-bold mb-1">Welcome to EnglishPal</h2>
						<p className="text-sm text-gray-500 mb-4">
							Practice English speaking through real conversations in Casual or
							Formal mode, then get a structured feedback report after every
							session — grammar, vocabulary, filler words, and a clarity score.
						</p>
						<button
							type="button"
							className="w-full btn-primary"
							onClick={() => setStep(1)}
						>
							Next
						</button>
					</div>
				)}

				{step === 1 && (
					<div>
						<h2 className="text-lg font-bold mb-1">Get your Groq key</h2>
						<p className="text-sm text-gray-500 mb-4">
							EnglishPal uses Groq to power conversations and feedback. Get a
							free key at{" "}
							<a
								href="https://console.groq.com/keys"
								target="_blank"
								rel="noreferrer"
								className="text-indigo-500 underline"
							>
								console.groq.com/keys
							</a>{" "}
							and paste it below.
						</p>
						<GroqKeyForm
							currentKey={apiKey}
							submitLabel="Continue"
							onValidated={(key) => {
								saveApiKey(key);
								setStep(2);
							}}
						>
							<button
								type="button"
								className="btn-secondary"
								onClick={() => setStep(2)}
							>
								Skip for now
							</button>
						</GroqKeyForm>
					</div>
				)}

				{step === 2 && (
					<div>
						<h2 className="text-lg font-bold mb-1">You're all set</h2>
						<p className="text-sm text-gray-500 mb-4">
							Press Start Listening, speak freely, then Stop &amp; Send. End the
							session anytime to get your feedback report.
						</p>
						<button
							type="button"
							className="w-full btn-primary"
							onClick={onFinish}
						>
							Start practicing
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
