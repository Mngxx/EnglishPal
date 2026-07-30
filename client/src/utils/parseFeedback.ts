export function parseClarityScore(feedback: string): number | null {
	const match = feedback.match(/clarity score[^\d]*(\d{1,2})/i);
	return match ? parseInt(match[1], 10) : null;
}
