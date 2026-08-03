import type { NextFunction, Request, Response } from "express";

const mockVerify = jest.fn();

jest.mock("aws-jwt-verify", () => ({
	CognitoJwtVerifier: {
		create: jest.fn().mockReturnValue({ verify: mockVerify }),
	},
}));

process.env.COGNITO_USER_POOL_ID = "test-pool-id";
process.env.COGNITO_CLIENT_ID = "test-client-id";

const { authMiddleware } = require("../middleware/auth") as {
	authMiddleware: (
		req: Request,
		res: Response,
		next: NextFunction,
	) => Promise<void>;
};

describe("authMiddleware", () => {
	const next = jest.fn();
	let statusMock: jest.Mock;
	let jsonMock: jest.Mock;
	let res: Response;

	beforeEach(() => {
		jest.clearAllMocks();
		jsonMock = jest.fn();
		statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		res = { status: statusMock } as unknown as Response;
	});

	it("returns 401 when no authorization header is present", async () => {
		const req = { headers: {} } as Request;
		await authMiddleware(req, res, next);
		expect(statusMock).toHaveBeenCalledWith(401);
		expect(jsonMock).toHaveBeenCalledWith({
			error: "Missing authorization token",
		});
		expect(next).not.toHaveBeenCalled();
	});

	it("returns 401 when the token fails verification", async () => {
		mockVerify.mockRejectedValueOnce(new Error("invalid"));
		const req = { headers: { authorization: "Bearer bad-token" } } as Request;
		await authMiddleware(req, res, next);
		expect(statusMock).toHaveBeenCalledWith(401);
		expect(jsonMock).toHaveBeenCalledWith({
			error: "Invalid or expired token",
		});
		expect(next).not.toHaveBeenCalled();
	});

	it("attaches userId to the request and calls next when the token is valid", async () => {
		mockVerify.mockResolvedValueOnce({ sub: "user-123" });
		const req = {
			headers: { authorization: "Bearer good-token" },
		} as Request;
		await authMiddleware(req, res, next);
		expect(req.userId).toBe("user-123");
		expect(next).toHaveBeenCalled();
	});
});
