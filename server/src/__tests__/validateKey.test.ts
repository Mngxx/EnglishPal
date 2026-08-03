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

const mockModelsList = jest.fn();

beforeEach(() => {
	jest.spyOn(console, "error").mockImplementation(() => {});
	jest.mocked(Groq).mockImplementation(
		() =>
			({
				models: { list: mockModelsList },
			}) as unknown as Groq,
	);
	mockModelsList.mockReset();
});

afterEach(() => {
	jest.restoreAllMocks();
});

describe("POST /validate-key", () => {
	it("returns 400 when no API key header is provided", async () => {
		const res = await request(app).post("/validate-key");

		expect(res.status).toBe(400);
		expect(res.body).toEqual({ valid: false, error: "No key provided" });
	});

	it("returns 200 with valid: true when Groq accepts the key", async () => {
		mockModelsList.mockResolvedValueOnce({ data: [] });

		const res = await request(app)
			.post("/validate-key")
			.set("x-groq-api-key", "gsk_validkey123");

		expect(res.status).toBe(200);
		expect(res.body).toEqual({ valid: true });
	});

	it("returns 401 with valid: false when Groq rejects the key", async () => {
		mockModelsList.mockRejectedValueOnce(new Error("Invalid API key"));

		const res = await request(app)
			.post("/validate-key")
			.set("x-groq-api-key", "gsk_wrongkey999");

		expect(res.status).toBe(401);
		expect(res.body).toEqual({ valid: false, error: "Invalid API key" });
	});
});
