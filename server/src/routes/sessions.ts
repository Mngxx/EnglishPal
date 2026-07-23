import { Router, Request, Response } from "express";
import { Mode, HistoryMessage } from "../types/index";
import { addSession, getAllSessions, getSessionById } from "../db/sqlite";

const router = Router();

router.post("/", (req: Request, res: Response) => {
    const { date, mode, transcript, feedback } = req.body as {
        date: string;
        mode: Mode;
        transcript: HistoryMessage[];
        feedback: string;
    };
    if (!date || !mode || !transcript || !feedback) {
        res.status(400).json({ error: "Missing required fields" });
        return;
    }
    try {
        const session = addSession(date, mode, transcript, feedback);
        res.status(201).json(session);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to save session" });
    }
});

router.get("/", (req: Request, res: Response) => {
    try {
        const sessions = getAllSessions();
        res.status(200).json(sessions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to get all sessions" });
    }
});

router.get("/:id", (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!id) {
        res.status(400).json({ error: "Missing required session id" });
        return;
    }
    try {
        const session = getSessionById(id);
        if (!session) {
            res.status(404).json({ error: "Session not found" });
            return;
        }
        res.status(200).json(session);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to get the specific session" });
    }
});

export default router;
