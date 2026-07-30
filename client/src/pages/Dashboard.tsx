import { useNavigate } from "react-router-dom";
import {
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { useHistory } from "../hooks";
import { parseClarityScore } from "../utils/parseFeedback";

function CustomTooltip({
	active,
	payload,
	label,
}: {
	active?: boolean;
	payload?: { value: number }[];
	label?: string;
}) {
	if (active && payload?.length) {
		return (
			<div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm shadow">
				<p className="text-gray-500">{label}</p>
				<p className="font-semibold">{`Score: ${payload[0].value}/10`}</p>
			</div>
		);
	}
	return null;
}

export function Dashboard() {
	const { sessions, isLoading, error } = useHistory();
	const navigate = useNavigate();

	if (isLoading)
		return (
			<div className="flex items-center justify-center h-screen">
				<p className="text-gray-500">Loading...</p>
			</div>
		);

	if (error)
		return (
			<div className="flex items-center justify-center h-screen">
				<p className="text-red-500">{error}</p>
			</div>
		);

	if (sessions.length === 0)
		return (
			<div className="flex flex-col items-center justify-center h-screen gap-3">
				<p className="text-gray-500">No sessions yet.</p>
				<button
					type="button"
					className="btn-secondary"
					onClick={() => navigate("/")}
				>
					Start your first session
				</button>
			</div>
		);

	const sorted = [...sessions].sort(
		(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
	);

	const chartData = sorted
		.map((s, i) => ({
			label: `Session ${i + 1}`,
			date: new Date(s.date).toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
			}),
			score: parseClarityScore(s.feedback),
		}))
		.filter((d) => d.score !== null);

	const avgScore =
		chartData.length > 0
			? (
					chartData.reduce((sum, d) => sum + (d.score ?? 0), 0) /
					chartData.length
				).toFixed(1)
			: "—";

	const latestScore =
		chartData.length > 0 ? `${chartData[chartData.length - 1]?.score}/10` : "—";

	const casualCount = sessions.filter((s) => s.mode === "casual").length;
	const formalCount = sessions.filter((s) => s.mode === "formal").length;

	return (
		<div className="max-w-2xl mx-auto px-4 py-10">
			<div className="flex items-center justify-between mb-8">
				<h1 className="text-2xl font-bold">Progress Dashboard</h1>
				<button
					type="button"
					className="btn-secondary"
					onClick={() => navigate("/history")}
				>
					← History
				</button>
			</div>

			<div className="grid grid-cols-2 gap-4 mb-8 sm:grid-cols-5">
				<StatTile label="Total Sessions" value={sessions.length} />
				<StatTile label="Latest Score" value={latestScore} />
				<StatTile label="Avg Clarity" value={avgScore} />
				<StatTile label="Casual" value={casualCount} />
				<StatTile label="Formal" value={formalCount} />
			</div>

			<div className="rounded-xl border border-gray-200 dark:border-gray-700 p-6">
				<h2 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wide">
					Clarity Score Over Time
				</h2>
				{chartData.length < 2 ? (
					<p className="text-center text-gray-400 py-10">
						Complete at least 2 sessions with feedback to see your trend.
					</p>
				) : (
					<ResponsiveContainer width="100%" height={220}>
						<LineChart data={chartData}>
							<CartesianGrid
								strokeDasharray="3 3"
								stroke="currentColor"
								opacity={0.1}
							/>
							<XAxis dataKey="date" tick={{ fontSize: 12 }} />
							<YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
							<Tooltip content={<CustomTooltip />} />
							<Line
								type="monotone"
								dataKey="score"
								stroke="#6366f1"
								strokeWidth={2}
								dot={{ r: 4 }}
								activeDot={{ r: 6 }}
							/>
						</LineChart>
					</ResponsiveContainer>
				)}
			</div>
		</div>
	);
}

function StatTile({ label, value }: { label: string; value: string | number }) {
	return (
		<div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
			<p className="text-2xl font-bold">{value}</p>
			<p className="text-xs text-gray-500 mt-1">{label}</p>
		</div>
	);
}
