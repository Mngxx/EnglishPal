export async function assertOk(response: Response): Promise<void> {
	if (!response.ok) {
		const body = await response.json().catch(() => ({}));
		throw new Error(
			(body as { error?: string }).error ?? `Server error (${response.status})`,
		);
	}
}
