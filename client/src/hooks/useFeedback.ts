import { useState, useCallback } from "react";

type Message = {
    role: "user" | "assistant";
    content: string;
};

interface useFeedbackReturn {
    feedback: string;
    getFeedback: (history: Message[]) => void;
    isLoadingFeedback: boolean;
    clearFeedback: () => void;
}

export function useFeedback(): useFeedbackReturn {
    const [feedback, setFeedback] = useState("");
    const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);

    const getFeedback = useCallback(async (history: Message[]) => {
        setIsLoadingFeedback(true);
        try {
            const response = await fetch("http://localhost:3000/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ history }),
            });

            const data = (await response.json()) as { feedback: string };

            setFeedback(data.feedback);
        } catch {
            return "";
        } finally {
            setIsLoadingFeedback(false);
        }
    }, []);
    const clearFeedback = useCallback(() => {
        setFeedback("");
    }, []);

    return { feedback, getFeedback, isLoadingFeedback, clearFeedback };
}
