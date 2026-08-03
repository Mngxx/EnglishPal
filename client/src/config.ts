export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID;
const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
if (!userPoolId || !clientId) {
	throw new Error("COGNITO_USER_POOL_ID and COGNITO_CLIENT_ID must be set");
}
export const COGNITO_USER_POOL_ID = userPoolId;
export const COGNITO_CLIENT_ID = clientId;
