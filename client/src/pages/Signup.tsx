import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks";

export function Signup() {
	const { signUp, confirmSignUp } = useAuth();
	const [step, setStep] = useState(0);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [code, setCode] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const navigate = useNavigate();

	const handleSignUp = async (e: FormEvent) => {
		e.preventDefault();
		setError(null);
		setIsSubmitting(true);
		try {
			await signUp(email, password);
			setStep(1);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to sign up.");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleConfirm = async (e: FormEvent) => {
		e.preventDefault();
		setError(null);
		setIsSubmitting(true);
		try {
			await confirmSignUp(email, code);
			navigate("/login", { replace: true });
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to confirm your account.",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="flex items-center justify-center min-h-screen px-4">
			<div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 w-full max-w-sm">
				{step === 0 ? (
					<form onSubmit={handleSignUp}>
						<h1 className="text-lg font-bold mb-1">Create your account</h1>
						<p className="text-sm text-gray-500 mb-4">
							Sign up to start practicing with EnglishPal.
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

						<label
							className="text-xs font-medium text-gray-500"
							htmlFor="password"
						>
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
							{isSubmitting ? "Creating account..." : "Sign Up"}
						</button>

						<p className="text-xs text-gray-500 text-center mt-4">
							Already have an account?{" "}
							<Link to="/login" className="text-indigo-500 underline">
								Log in
							</Link>
						</p>
					</form>
				) : (
					<form onSubmit={handleConfirm}>
						<h1 className="text-lg font-bold mb-1">Check your email</h1>
						<p className="text-sm text-gray-500 mb-4">
							We sent a confirmation code to {email}. Enter it below to finish
							creating your account.
						</p>

						<label className="text-xs font-medium text-gray-500" htmlFor="code">
							Confirmation code
						</label>
						<input
							id="code"
							type="text"
							inputMode="numeric"
							className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm mb-2 mt-1 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-400"
							value={code}
							onChange={(e) => setCode(e.target.value)}
							required
						/>

						{error && <p className="text-xs text-red-500 mb-3">{error}</p>}
						{!error && <div className="mb-3" />}

						<button
							type="submit"
							className="w-full btn-primary disabled:opacity-50 py-3"
							disabled={isSubmitting}
						>
							{isSubmitting ? "Confirming..." : "Confirm Account"}
						</button>
					</form>
				)}
			</div>
		</div>
	);
}
