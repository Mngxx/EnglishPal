import { buildMemoryContext } from "../prompts/";
import type { Session } from "../types/";

const makeSession = (overrides: Partial<Session> = {}): Session => ({
	id: "1",
	date: "2025-07-29T00:00:00.000Z",
	mode: "casual",
	transcript: [],
	feedback: "Good job overall.",
	...overrides,
});

describe("buildMemoryContext", () => {
	it("returns empty string when sessions array is empty", () => {
		expect(buildMemoryContext([])).toBe("");
	});

	it("returns empty string when no sessions have feedback", () => {
		const sessions = [makeSession({ feedback: "" })];
		expect(buildMemoryContext(sessions)).toBe("");
	});

	it("includes feedback content in output", () => {
		const sessions = [makeSession({ feedback: "Work on your grammar." })];
		expect(buildMemoryContext(sessions)).toContain("Work on your grammar.");
	});

	it("labels the first session as Most recent session", () => {
		const sessions = [makeSession()];
		expect(buildMemoryContext(sessions)).toContain("Most recent session");
	});

	it("labels subsequent sessions with a number", () => {
		const sessions = [
			makeSession(),
			makeSession({ id: "2", feedback: "Keep practicing." }),
		];
		expect(buildMemoryContext(sessions)).toContain("Session 2");
	});

	it("includes the LEARNER HISTORY header", () => {
		const sessions = [makeSession()];
		expect(buildMemoryContext(sessions)).toContain("LEARNER HISTORY");
	});

	it("skips sessions without feedback and still processes the rest", () => {
		const sessions = [
			makeSession({ feedback: "" }),
			makeSession({ id: "2", feedback: "Nice work." }),
		];
		const result = buildMemoryContext(sessions);
		expect(result).toContain("Nice work.");
		expect(result).toContain("Most recent session");
	});
});
