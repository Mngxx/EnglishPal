import { type Request, type Response, Router } from "express";
import {
	addSession,
	deleteSessionById,
	getAllSessions,
	getSessionById,
	updateSessionByID,
} from "../db/sqlite";
import type { HistoryMessage, Mode } from "../types/index";

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
		res.status(500).json({
			error:
				err instanceof Error ? err.message : "An unexpected error occurred.",
		});
	}
});

router.patch("/:id", (req: Request, res: Response) => {
	const id = Number(req.params.id);
	if (!id) {
		res.status(400).json({ error: "Missing required session id" });
		return;
	}
	const { transcript, feedback } = req.body as {
		transcript: HistoryMessage[];
		feedback: string;
	};
	if (!transcript || !feedback) {
		res.status(400).json({ error: "Missing required fields" });
		return;
	}
	try {
		const existing = getSessionById(id);
		if (!existing) {
			res.status(404).json({ error: "Session not found" });
			return;
		}
		const session = updateSessionByID(transcript, feedback, id);
		res.status(200).json(session);
	} catch (err) {
		res.status(500).json({
			error:
				err instanceof Error ? err.message : "An unexpected error occurred.",
		});
	}
});

router.delete("/:id", (req: Request, res: Response) => {
	const id = Number(req.params.id);
	if (!id) {
		res.status(400).json({ error: "Missing required session id" });
		return;
	}
	try {
		deleteSessionById(id);
		res.status(200).json({ message: "Session deleted" });
	} catch (err) {
		res.status(500).json({
			error:
				err instanceof Error ? err.message : "An unexpected error occurred.",
		});
	}
});

router.get("/", (req: Request, res: Response) => {
	try {
		const sessions = getAllSessions();
		res.status(200).json(sessions);
	} catch (err) {
		res.status(500).json({
			error:
				err instanceof Error ? err.message : "An unexpected error occurred.",
		});
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
		res.status(500).json({
			error:
				err instanceof Error ? err.message : "An unexpected error occurred.",
		});
	}
});

export default router;
