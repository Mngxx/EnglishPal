import { useState, useCallback } from "react";

type Mode = "casual" | "formal";

type Message = {
    role: "user" | "assistant";
    content: string;
};

type UseChatReturn = {
    sendMessage: (text: string) => Promise<string>;
    history: Message[];
    isLoading: boolean;
    error: string | null;
    clearHistory: () => void;
};

export function useChat(mode: Mode): UseChatReturn {
    const [history, setHistory] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const sendMessage = useCallback(
        async (text: string): Promise<string> => {
            setIsLoading(true);
            setError(null);

            const userMessage: Message = { role: "user", content: text };

            try {
                const response = await fetch("http://localhost:3000/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        message: text,
                        history,
                        mode,
                    }),
                });

                const data = (await response.json()) as { reply: string };

                const assistantMessage: Message = {
                    role: "assistant",
                    content: data.reply,
                };

                setHistory((prev) => [...prev, userMessage, assistantMessage]);
                return data.reply;
            } catch {
                setError("Failed to reach the server.");
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
