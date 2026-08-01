import { useState } from "react";

const STORAGE_KEY = "onboarding_complete";

export function useOnboarding() {
	const [showOnboarding, setShowOnboarding] = useState(
		() => localStorage.getItem(STORAGE_KEY) !== "true",
	);
	const completeOnboarding = () => {
		localStorage.setItem(STORAGE_KEY, "true");
	};

	return {
		showOnboarding,
		setShowOnboarding,
		completeOnboarding,
	};
}
