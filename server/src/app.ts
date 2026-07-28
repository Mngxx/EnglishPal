import cors from "cors";
import express from "express";
import chatRouter from "./routes/chat";
import feedbackRouter from "./routes/feedback";
import sessionRouter from "./routes/sessions";

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN ?? "http://localhost:5173" }));
app.use(express.json());

app.use("/chat", chatRouter);
app.use("/feedback", feedbackRouter);
app.use("/sessions", sessionRouter);

app.get("/health", (_req, res) => {
	res.json({ status: "ok" });
});

export default app;
