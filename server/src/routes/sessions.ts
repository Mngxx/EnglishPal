import { type Request, type Response, Router } from "express";
import {
	addSession,
	deleteSessionById,
	getAllSessions,
	getSessionById,
	updateSessionByID,
} from "../db/dynamodb";
import type { HistoryMessage, Mode } from "../types/index";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
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
		const session = await addSession(date, mode, transcript, feedback);
		res.status(201).json(session);
	} catch (err) {
		res.status(500).json({
			error:
				err instanceof Error ? err.message : "An unexpected error occurred.",
		});
	}
});

router.patch("/:id", async (req: Request<{ id: string }>, res: Response) => {
	const id = req.params.id;
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
		const existing = await getSessionById(id);
		if (!existing) {
			res.status(404).json({ error: "Session not found" });
			return;
		}
		const session = await updateSessionByID(transcript, feedback, id);
		res.status(200).json(session);
	} catch (err) {
		res.status(500).json({
			error:
				err instanceof Error ? err.message : "An unexpected error occurred.",
		});
	}
});

router.delete("/:id", async (req: Request<{ id: string }>, res: Response) => {
	const id = req.params.id;
	if (!id) {
		res.status(400).json({ error: "Missing required session id" });
		return;
	}
	try {
		await deleteSessionById(id);
		res.status(200).json({ message: "Session deleted" });
	} catch (err) {
		res.status(500).json({
			error:
				err instanceof Error ? err.message : "An unexpected error occurred.",
		});
	}
});

router.get("/", async (req: Request, res: Response) => {
	try {
		const sessions = await getAllSessions();
		res.status(200).json(sessions);
	} catch (err) {
		res.status(500).json({
			error:
				err instanceof Error ? err.message : "An unexpected error occurred.",
		});
	}
});

router.get("/:id", async (req: Request<{ id: string }>, res: Response) => {
	const id = req.params.id;
	if (!id) {
		res.status(400).json({ error: "Missing required session id" });
		return;
	}
	try {
		const session = await getSessionById(id);
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
