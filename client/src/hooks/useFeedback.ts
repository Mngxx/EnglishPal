import { useCallback, useState } from "react";
import { API_URL } from "../config";
import { assertOk } from "../lib/api";
import type { HistoryMessage } from "../types";

interface useFeedbackReturn {
	feedback: string;
	getFeedback: (history: HistoryMessage[]) => void;
	isLoadingFeedback: boolean;
	clearFeedback: () => void;
	error: string | null;
}

export function useFeedback(apiKey = ""): useFeedbackReturn {
	const [feedback, setFeedback] = useState("");
	const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const getFeedback = useCallback(
		async (history: HistoryMessage[]) => {
			const headers: Record<string, string> = {
				"Content-Type": "application/json",
			};
			if (apiKey) headers["x-groq-api-key"] = apiKey;
			setIsLoadingFeedback(true);
			setError(null);
			try {
				const response = await fetch(`${API_URL}/feedback`, {
					method: "POST",
					headers,
					body: JSON.stringify({ history }),
				});
				await assertOk(response);
				const data = (await response.json()) as { feedback: string };

				setFeedback(data.feedback);
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "An unexpected error occurred.",
				);
			} finally {
				setIsLoadingFeedback(false);
			}
		},
		[apiKey],
	);
	const clearFeedback = useCallback(() => {
		setFeedback("");
		setError(null);
	}, []);

	return { feedback, getFeedback, isLoadingFeedback, clearFeedback, error };
}
