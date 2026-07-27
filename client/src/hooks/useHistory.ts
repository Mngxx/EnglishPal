import { useCallback, useEffect, useState } from "react";
import { API_URL } from "../config";
import type { Session } from "../types/index";

interface useHistoryReturn {
	sessions: Session[];
	isLoading: boolean;
	error: string | null;
	deleteSession: (id: number) => void;
}

export function useHistory(): useHistoryReturn {
	const [sessions, setSessions] = useState<Session[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	useEffect(() => {
		const fetchSessions = async () => {
			try {
				const response = await fetch(`${API_URL}/sessions`);
				const data = (await response.json()) as Session[];
				setSessions(data);
			} catch {
				setError("Failed to reach the server.");
			} finally {
				setIsLoading(false);
			}
		};
		fetchSessions();
	}, []);

	const deleteSession = useCallback(async (id: number) => {
		await fetch(`${API_URL}/sessions/${id}`, { method: "DELETE" });
		setSessions((prev) => prev.filter((s) => s.id !== id));
	}, []);

	return { sessions, isLoading, error, deleteSession };
}
