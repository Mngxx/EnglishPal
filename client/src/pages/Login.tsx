import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks";

export function Login() {
	const { signIn } = useAuth();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const navigate = useNavigate();

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setError(null);
		setIsSubmitting(true);
		try {
			await signIn(email, password);
			navigate("/", { replace: true });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to sign in.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="flex items-center justify-center min-h-screen px-4">
			<form
				onSubmit={handleSubmit}
				className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 w-full max-w-sm"
			>
				<h1 className="text-lg font-bold mb-1">Welcome back</h1>
				<p className="text-sm text-gray-500 mb-4">
					Log in to continue practicing with EnglishPal.
				</p>

				<label className="text-xs font-medium text-gray-500" htmlFor="email">
					Email
				</label>
				<input
					id="email"
					type="email"
					className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm mb-3 mt-1 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-400"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
				/>

				<label className="text-xs font-medium text-gray-500" htmlFor="password">
					Password
				</label>
				<input
					id="password"
					type="password"
					className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm mb-2 mt-1 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-400"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
				/>

				{error && <p className="text-xs text-red-500 mb-3">{error}</p>}
				{!error && <div className="mb-3" />}

				<button
					type="submit"
					className="w-full btn-primary disabled:opacity-50 py-3"
					disabled={isSubmitting}
				>
					{isSubmitting ? "Signing in..." : "Log In"}
				</button>

				<p className="text-xs text-gray-500 text-center mt-4">
					Don't have an account?{" "}
					<Link to="/signup" className="text-indigo-500 underline">
						Sign up
					</Link>
				</p>
			</form>
		</div>
	);
}
