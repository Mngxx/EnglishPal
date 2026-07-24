interface ModeBadgeProps {
	mode: string;
}

export function ModeBadge({ mode }: ModeBadgeProps) {
	const isFormal = mode === "formal";
	return (
		<span
			className={`${
				isFormal ? "label-ai-formal-mode" : "label-ai-casual-mode"
			}`}
		>
			{isFormal ? "Formal" : "Casual"}
		</span>
	);
}
