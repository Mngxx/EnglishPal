import { useState } from "react";

const STORAGE_KEY = "groq_api_key";

export function useApiKey() {
	const [apiKey, setApiKeyState] = useState<string>(
		() => localStorage.getItem(STORAGE_KEY) ?? "",
	);

	const saveApiKey = (key: string) => {
		const trimmed = key.trim();
		if (trimmed) {
			localStorage.setItem(STORAGE_KEY, trimmed);
		} else {
			localStorage.removeItem(STORAGE_KEY);
		}
		setApiKeyState(trimmed);
	};

	const clearApiKey = () => saveApiKey("");

	return { apiKey, saveApiKey, clearApiKey };
}
