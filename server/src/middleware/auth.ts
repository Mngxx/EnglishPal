import { CognitoJwtVerifier } from "aws-jwt-verify";
import type { NextFunction, Request, Response } from "express";

declare global {
	namespace Express {
		interface Request {
			userId: string;
		}
	}
}

const userPoolId = process.env.COGNITO_USER_POOL_ID;
const clientId = process.env.COGNITO_CLIENT_ID;
if (!userPoolId || !clientId) {
	throw new Error("COGNITO_USER_POOL_ID and COGNITO_CLIENT_ID must be set");
}

const verifier = CognitoJwtVerifier.create({
	userPoolId,
	clientId,
	tokenUse: "id",
});

export async function authMiddleware(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	const authHeader = req.headers.authorization;
	const token = authHeader?.replace(/^Bearer\s+/i, "");
	if (!token) {
		res.status(401).json({ error: "Missing authorization token" });
		return;
	}

	try {
		const payload = await verifier.verify(token);
		req.userId = payload.sub;
		next();
	} catch {
		res.status(401).json({ error: "Invalid or expired token" });
	}
}
