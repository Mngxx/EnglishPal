import { API_URL } from "../config";
export async function assertOk(response: Response): Promise<void> {
	if (!response.ok) {
		const body = await response.json().catch(() => ({}));
		throw new Error(
			(body as { error?: string }).error ?? `Server error (${response.status})`,
		);
	}
}

export async function validateGroqKey(key: string): Promise<void> {
	let response: Response;
	try {
		response = await fetch(`${API_URL}/validate-key`, {
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
