import cors from "cors";
import express from "express";
import {
	chatRouter,
	feedbackRouter,
	sessionRouter,
	validateKeyRouter,
} from "./routes";

const app = express();

const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:5173";
const previewPattern = process.env.CORS_PREVIEW_PATTERN
	? new RegExp(process.env.CORS_PREVIEW_PATTERN)
	: null;

app.use(
	cors({
		origin: (origin, callback) => {
			if (!origin || origin === corsOrigin || previewPattern?.test(origin)) {
				callback(null, true);
			} else {
				callback(new Error("Not allowed by CORS"));
			}
		},
		allowedHeaders: ["Content-Type", "x-groq-api-key"],
	}),
);

app.use(express.json());

app.use("/chat", chatRouter);
app.use("/feedback", feedbackRouter);
app.use("/sessions", sessionRouter);
app.use("/validate-key", validateKeyRouter);

app.get("/health", (_req, res) => {
	res.json({ status: "ok" });
});

export default app;
