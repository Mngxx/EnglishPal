import type { NextFunction, Request, Response } from "express";
import Groq from "groq-sdk";
import request from "supertest";
import app from "../app";
import { getRecentSessions } from "../db/dynamodb";

jest.mock("groq-sdk");
jest.mock("../db/dynamodb");
jest.mock("../middleware/auth", () => ({
	authMiddleware: (req: Request, _res: Response, next: NextFunction) => {
		req.userId = "test-user-id";
		next();
	},
}));

const mockCreate = jest.fn();
const mockGetRecentSessions = jest.mocked(getRecentSessions);

beforeEach(() => {
	jest.spyOn(console, "error").mockImplementation(() => {});
	mockGetRecentSessions.mockResolvedValue([]);
	mockCreate.mockResolvedValue({
		choices: [{ message: { content: "Hello! How can I help?" } }],
	});
	jest.mocked(Groq).mockImplementation(
		() =>
			({
				chat: { completions: { create: mockCreate } },
			}) as any,
	);
});
afterEach(() => {
	jest.restoreAllMocks();
});
describe("POST /chat", () => {
	it("returns 400 when message is missing", async () => {
		const res = await request(app)
			.post("/chat")
			.set("x-groq-api-key", "gsk_testkey")
			.send({ history: [], mode: "casual" });
		expect(res.status).toBe(400);
	});

	it("returns 200 with reply", async () => {
		const res = await request(app)
			.post("/chat")
			.set("x-groq-api-key", "gsk_testkey")
			.send({
				message: "Hello",
				history: [],
				mode: "casual",
			});
		expect(res.status).toBe(200);
		expect(res.body).toEqual({ reply: "Hello! How can I help?" });
		expect(mockGetRecentSessions).toHaveBeenCalledWith("test-user-id", 3);
	});

	it("returns 500 when Groq throws an error", async () => {
		mockCreate.mockRejectedValueOnce(new Error("Groq API failed"));
		const res = await request(app)
			.post("/chat")
			.set("x-groq-api-key", "gsk_testkey")
			.send({
				message: "Hello",
				history: [],
				mode: "casual",
			});
		expect(res.status).toBe(500);
	});
});
