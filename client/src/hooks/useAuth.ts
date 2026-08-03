import {
	AuthenticationDetails,
	CognitoUser,
	type CognitoUserSession,
} from "amazon-cognito-identity-js";
import { useCallback, useEffect, useState } from "react";
import { userPool } from "../lib/cognito";

interface UseAuthReturn {
	isAuthenticated: boolean;
	isLoading: boolean;
	signUp: (email: string, password: string) => Promise<void>;
	confirmSignUp: (email: string, code: string) => Promise<void>;
	signIn: (email: string, password: string) => Promise<void>;
	signOut: () => Promise<void>;
	getIdToken: () => Promise<string>;
}

function getCurrentSession(): Promise<CognitoUserSession | null> {
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

export function useAuth(): UseAuthReturn {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		getCurrentSession()
			.then((session) => setIsAuthenticated(!!session?.isValid()))
			.catch(() => setIsAuthenticated(false))
			.finally(() => setIsLoading(false));
	}, []);

	const signUp = useCallback(
		async (email: string, password: string): Promise<void> => {
			return new Promise((resolve, reject) => {
				userPool.signUp(email, password, [], [], (err) => {
					if (err) {
						reject(err);
						return;
					}
					resolve();
				});
			});
		},
		[],
	);

	const confirmSignUp = useCallback(
		async (email: string, code: string): Promise<void> => {
			const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });
			return new Promise((resolve, reject) => {
				cognitoUser.confirmRegistration(code, true, (err) => {
					if (err) {
						reject(err);
						return;
					}
					resolve();
				});
			});
		},
		[],
	);

	const signIn = useCallback(
		async (email: string, password: string): Promise<void> => {
			const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });
			const authDetails = new AuthenticationDetails({
				Username: email,
				Password: password,
			});
			return new Promise((resolve, reject) => {
				cognitoUser.authenticateUser(authDetails, {
					onSuccess: () => {
						setIsAuthenticated(true);
						resolve();
					},
					onFailure: (err) => {
						reject(err);
					},
				});
			});
		},
		[],
	);

	const signOut = useCallback(async (): Promise<void> => {
		userPool.getCurrentUser()?.signOut();
		setIsAuthenticated(false);
	}, []);

	const getIdToken = useCallback(async (): Promise<string> => {
		const session = await getCurrentSession();
		if (!session?.isValid()) {
			throw new Error("No active session");
		}
		return session.getIdToken().getJwtToken();
	}, []);

	return {
		isAuthenticated,
		isLoading,
		signUp,
		confirmSignUp,
		signIn,
		signOut,
		getIdToken,
	};
}
