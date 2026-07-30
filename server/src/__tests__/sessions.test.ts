import request from "supertest";
import app from "../app";
import {
	addSession,
	deleteSessionById,
	getAllSessions,
	getSessionById,
	updateSessionByID,
} from "../db/dynamodb";

jest.mock("../db/dynamodb");

const mockAddSession = jest.mocked(addSession);
const mockGetSessionById = jest.mocked(getSessionById);
const mockDeleteSessionById = jest.mocked(deleteSessionById);
const mockUpdateSessionById = jest.mocked(updateSessionByID);
const mockGetAllSessions = jest.mocked(getAllSessions);

const validBody = {
	date: "2025-07-29T00:00:00.000Z",
	mode: "casual",
	transcript: [{ role: "user", content: "hello" }],
	feedback: "Good job.",
};

beforeEach(() => {
	jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
	jest.restoreAllMocks();
});

describe("POST /sessions", () => {
	it("returns 400 when date is missing", async () => {
		const { date: _, ...body } = validBody;
		const res = await request(app).post("/sessions").send(body);
		expect(res.status).toBe(400);
	});

	it("returns 400 when mode is missing", async () => {
		const { mode: _, ...body } = validBody;
		const res = await request(app).post("/sessions").send(body);
		expect(res.status).toBe(400);
	});

	it("returns 400 when feedback is missing", async () => {
		const { feedback: _, ...body } = validBody;
		const res = await request(app).post("/sessions").send(body);
		expect(res.status).toBe(400);
	});
	it("returns 400 when transcript is missing", async () => {
		const { transcript: _, ...body } = validBody;
		const res = await request(app).post("/sessions").send(body);
		expect(res.status).toBe(400);
	});

	it("returns 201 with session data when all fields are valid", async () => {
		const mockSession = { id: "abc-123", ...validBody };
		mockAddSession.mockResolvedValueOnce(mockSession as any);

		const res = await request(app).post("/sessions").send(validBody);
		expect(res.status).toBe(201);
		expect(res.body).toEqual(mockSession);
	});
	it("returns 500 when database throws on POST", async () => {
		mockAddSession.mockRejectedValueOnce(new Error("DynamoDB failed"));
		const res = await request(app).post("/sessions").send(validBody);
		expect(res.status).toBe(500);
	});
});

describe("GET /sessions/:id", () => {
	it("returns 404 when session does not exist", async () => {
		mockGetSessionById.mockResolvedValueOnce(undefined);

		const res = await request(app).get("/sessions/non-existent-id");
		expect(res.status).toBe(404);
	});

	it("returns 200 with session when it exists", async () => {
		const mockSession = { id: "abc-123", ...validBody };
		mockGetSessionById.mockResolvedValueOnce(mockSession as any);

		const res = await request(app).get("/sessions/abc-123");
		expect(res.status).toBe(200);
		expect(res.body).toEqual(mockSession);
	});
	it("returns 500 when database throws on GET by id", async () => {
		mockGetSessionById.mockRejectedValueOnce(new Error("DynamoDB failed"));
		const res = await request(app).get("/sessions/abc-123");
		expect(res.status).toBe(500);
	});
});

describe("DELETE /sessions/:id", () => {
	it("returns 200 when session is deleted", async () => {
		mockDeleteSessionById.mockResolvedValueOnce(undefined as any);

		const res = await request(app).delete("/sessions/abc-123");
		expect(res.status).toBe(200);
		expect(res.body).toEqual({ message: "Session deleted" });
	});
	it("returns 500 when database throws on DELETE", async () => {
		mockDeleteSessionById.mockRejectedValueOnce(new Error("DynamoDB failed"));
		const res = await request(app).delete("/sessions/abc-123");
		expect(res.status).toBe(500);
	});
});

describe("PATCH /sessions/:id", () => {
	it("returns 400 when transcript is missing", async () => {
		const res = await request(app)
			.patch("/sessions/abc-123")
			.send({ feedback: "Good job." });
		expect(res.status).toBe(400);
	});

	it("returns 400 when feedback is missing", async () => {
		const res = await request(app)
			.patch("/sessions/abc-123")
			.send({ transcript: [{ role: "user", content: "hello" }] });
		expect(res.status).toBe(400);
	});
	it("returns 404 when session does not exist", async () => {
		mockGetSessionById.mockResolvedValueOnce(undefined);
		const res = await request(app)
			.patch("/sessions/abc-123")
			.send({ transcript: validBody.transcript, feedback: validBody.feedback });
		expect(res.status).toBe(404);
	});

	it("returns 500 when database throws on PATCH", async () => {
		mockGetSessionById.mockRejectedValueOnce(new Error("DynamoDB failed"));
		const res = await request(app)
			.patch("/sessions/abc-123")
			.send({ transcript: validBody.transcript, feedback: validBody.feedback });
		expect(res.status).toBe(500);
	});

	it("returns 200 with updated session", async () => {
		const mockSession = { id: "abc-123", ...validBody };
		mockGetSessionById.mockResolvedValueOnce(mockSession as any);
		mockUpdateSessionById.mockResolvedValueOnce(mockSession as any);
		const res = await request(app)
			.patch("/sessions/abc-123")
			.send({ transcript: validBody.transcript, feedback: validBody.feedback });
		expect(res.status).toBe(200);
	});
});

describe("GET /health", () => {
	it("returns 200 with status ok", async () => {
		const res = await request(app).get("/health");
		expect(res.status).toBe(200);
		expect(res.body).toEqual({ status: "ok" });
	});
});

describe("GET /sessions", () => {
	it("returns 200 with list of sessions", async () => {
		const mockSessions = [{ id: "abc-123", ...validBody }];
		mockGetAllSessions.mockResolvedValueOnce(mockSessions as any);
		const res = await request(app).get("/sessions");
		expect(res.status).toBe(200);
		expect(res.body).toEqual(mockSessions);
	});
	it("returns 500 when database throws on GET all", async () => {
		mockGetAllSessions.mockRejectedValueOnce(new Error("DynamoDB failed"));
		const res = await request(app).get("/sessions");
		expect(res.status).toBe(500);
	});
});
