import type { NextFunction, Request, Response } from "express";
import Groq from "groq-sdk";
import request from "supertest";
import app from "../app";

jest.mock("groq-sdk");
jest.mock("../middleware/auth", () => ({
	authMiddleware: (req: Request, _res: Response, next: NextFunction) => {
		req.userId = "test-user-id";
		next();
	},
}));

const mockGroq = jest.mocked(Groq);

const validHistory = [
	{ role: "user", content: "Hello there." },
	{ role: "assistant", content: "Hi! How are you?" },
	{ role: "user", content: "I am doing well." },
];
beforeEach(() => {
	jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
	jest.restoreAllMocks();
});
describe("POST /feedback", () => {
	beforeEach(() => {
		mockGroq.mockImplementation(
			() =>
				({
					chat: {
						completions: {
							create: jest.fn().mockResolvedValue({
								choices: [{ message: { content: "Great feedback here." } }],
							}),
						},
					},
				}) as any,
		);
	});

	it("returns 400 when history is missing", async () => {
		const res = await request(app).post("/feedback").send({});
		expect(res.status).toBe(400);
	});

	it("returns 400 when history is empty", async () => {
		const res = await request(app).post("/feedback").send({ history: [] });
		expect(res.status).toBe(400);
	});

	it("returns 200 with feedback when history is valid", async () => {
		const res = await request(app)
			.post("/feedback")
			.set("x-groq-api-key", "gsk_testkey")
			.send({ history: validHistory });
		expect(res.status).toBe(200);
		expect(res.body).toEqual({ feedback: "Great feedback here." });
	});
	it("returns 500 when Groq throws", async () => {
		mockGroq.mockImplementation(
			() =>
				({
					chat: {
						completions: {
							create: jest.fn().mockRejectedValueOnce(new Error("Groq failed")),
						},
					},
				}) as any,
		);
		const res = await request(app)
			.post("/feedback")
			.set("x-groq-api-key", "gsk_testkey")
			.send({ history: validHistory });
		expect(res.status).toBe(500);
	});
});
