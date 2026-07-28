import { useCallback, useState } from "react";
import { API_URL } from "../config";
import { assertOk } from "../lib/api";
import type { HistoryMessage, Mode } from "../types";

type UseChatReturn = {
	sendMessage: (text: string) => Promise<string>;
	history: HistoryMessage[];
	isLoading: boolean;
	error: string | null;
	clearHistory: () => void;
};

export function useChat(
	mode: Mode,
	initialHistory: HistoryMessage[] = [],
): UseChatReturn {
	const [history, setHistory] = useState<HistoryMessage[]>(initialHistory);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const sendMessage = useCallback(
		async (text: string): Promise<string> => {
			setIsLoading(true);
			setError(null);

			const userMessage: HistoryMessage = { role: "user", content: text };

			try {
				const response = await fetch(`${API_URL}/chat`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						message: text,
						history,
						mode,
					}),
				});
				await assertOk(response);
				const data = (await response.json()) as { reply: string };

				const assistantMessage: HistoryMessage = {
					role: "assistant",
					content: data.reply,
				};

				setHistory((prev) => [...prev, userMessage, assistantMessage]);
				return data.reply;
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "An unexpected error occurred.",
				);
				return "";
			} finally {
				setIsLoading(false);
			}
		},
		[history, mode],
	);

	const clearHistory = useCallback(() => setHistory([]), []);

	return { sendMessage, history, isLoading, error, clearHistory };
}
