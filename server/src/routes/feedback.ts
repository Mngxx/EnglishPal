import { Router, Request, Response } from "express";
import Groq from "groq-sdk";
import { FEEDBACK_PROMPT } from "../prompts/index";
import { HistoryMessage } from "../types/index";
const router = Router();

router.post("/", async (req: Request, res: Response) => {
    const { history } = req.body as { history: HistoryMessage[] };

    if (!history || history.length === 0) {
        res.status(400).json({ error: "history is required" });
        return;
    }

    const formattedTranscript = history
        .map((msg) => `${msg.role === "user" ? "User" : "AI"}: ${msg.content}`)
        .join("\n");

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    try {
        const completion = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                { role: "system", content: FEEDBACK_PROMPT },
                { role: "user", content: formattedTranscript }, // the transcript as text
            ],
        });
        const feedback = completion.choices[0]?.message?.content ?? "";
        res.json({ feedback });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: String(err) });
    }
});

export default router;
