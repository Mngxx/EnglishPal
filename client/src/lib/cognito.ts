import {
	CognitoUserPool,
	type CognitoUserSession,
} from "amazon-cognito-identity-js";
import { COGNITO_CLIENT_ID, COGNITO_USER_POOL_ID } from "../config";

export function getCurrentSession(): Promise<CognitoUserSession | null> {
	const cognitoUser = userPool.getCurrentUser();
	if (!cognitoUser) {
		return Promise.resolve(null);
	}
	return new Promise((resolve, reject) => {
		cognitoUser.getSession(
			(err: Error | null, session: CognitoUserSession | null) => {
				if (err) {
					reject(err);
					return;
				}
				resolve(session);
			},
		);
	});
}

export async function getIdToken(): Promise<string> {
	const session = await getCurrentSession();
	if (!session?.isValid()) {
		throw new Error("No active session");
	}
	return session.getIdToken().getJwtToken();
}

export const userPool = new CognitoUserPool({
	UserPoolId: COGNITO_USER_POOL_ID,
	ClientId: COGNITO_CLIENT_ID,
});
