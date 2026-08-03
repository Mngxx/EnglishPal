import { useCallback, useEffect, useState } from "react";
import { API_URL } from "../config";
import { assertOk, authorizedFetch } from "../lib/api";
import type { Session } from "../types";

interface useHistoryReturn {
	sessions: Session[];
	isLoading: boolean;
	error: string | null;
	deleteSession: (id: string) => void;
}

export function useHistory(): useHistoryReturn {
	const [sessions, setSessions] = useState<Session[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	useEffect(() => {
		const fetchSessions = async () => {
			try {
				const response = await authorizedFetch(`${API_URL}/sessions`);
				await assertOk(response);
				const data = (await response.json()) as Session[];
				setSessions(data);
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "An unexpected error occurred.",
				);
			} finally {
				setIsLoading(false);
			}
		};
		fetchSessions();
	}, []);

	const deleteSession = useCallback(async (id: string) => {
		try {
			const response = await authorizedFetch(`${API_URL}/sessions/${id}`, {
				method: "DELETE",
			});
			await assertOk(response);
			setSessions((prev) => prev.filter((s) => s.id !== id));
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to delete session.",
			);
		}
	}, []);

	return { sessions, isLoading, error, deleteSession };
}
