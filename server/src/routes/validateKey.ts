import { type Request, type Response, Router } from "express";
import Groq from "groq-sdk";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
	const key = req.headers["x-groq-api-key"] as string | undefined;
	if (!key) {
		res.status(400).json({ valid: false, error: "No key provided" });
		return;
	}
	try {
		const groq = new Groq({ apiKey: key });
		await groq.models.list();
		res.json({ valid: true });
	} catch {
		res.status(401).json({ valid: false, error: "Invalid API key" });
	}
});

export default router;
