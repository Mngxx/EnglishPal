import { useCallback, useState } from "react";
import { API_URL } from "../config";
import type { HistoryMessage } from "../types/index";

interface useFeedbackReturn {
	feedback: string;
	getFeedback: (history: HistoryMessage[]) => void;
	isLoadingFeedback: boolean;
	clearFeedback: () => void;
	error: string | null;
}

export function useFeedback(): useFeedbackReturn {
	const [feedback, setFeedback] = useState("");
	const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const getFeedback = useCallback(async (history: HistoryMessage[]) => {
		setIsLoadingFeedback(true);
		setError(null);
		try {
			const response = await fetch(`${API_URL}/feedback`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ history }),
			});

			const data = (await response.json()) as { feedback: string };

			setFeedback(data.feedback);
		} catch {
			setError("Failed to reach the server.");
		} finally {
			setIsLoadingFeedback(false);
		}
	}, []);
	const clearFeedback = useCallback(() => {
		setFeedback("");
		setError(null);
	}, []);

	return { feedback, getFeedback, isLoadingFeedback, clearFeedback, error };
}
