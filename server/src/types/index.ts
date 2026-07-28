export type Mode = "casual" | "formal";

export type HistoryMessage = {
	role: "user" | "assistant";
	content: string;
};

export interface Session {
	id: string;
	date: string;
	mode: Mode;
	transcript: HistoryMessage[];
	feedback: string;
}
