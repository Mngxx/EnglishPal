import { API_URL } from "../config";
import { getIdToken } from "./cognito";
export async function assertOk(response: Response): Promise<void> {
	if (!response.ok) {
		const body = await response.json().catch(() => ({}));
		throw new Error(
			(body as { error?: string }).error ?? `Server error (${response.status})`,
		);
	}
}

export async function authorizedFetch(
	url: string,
	options: RequestInit = {},
): Promise<Response> {
	const token = await getIdToken();
	return fetch(url, {
		...options,
		headers: { ...options.headers, Authorization: `Bearer ${token}` },
	});
}

export async function validateGroqKey(key: string): Promise<void> {
	let response: Response;
	try {
		response = await authorizedFetch(`${API_URL}/validate-key`, {
			method: "POST",
			headers: { "x-groq-api-key": key },
		});
	} catch {
		throw new Error("Could not validate. Check your connection.");
	}

	try {
		await assertOk(response);
	} catch {
		throw new Error("Invalid API key. Please check and try again.");
	}
}
