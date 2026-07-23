import { Router, Request, Response } from 'express'
import Groq from 'groq-sdk'
import { CASUAL_PROMPT, FORMAL_PROMPT } from '../prompts/index.js'

const router = Router()

type Mode = 'casual' | 'formal'

type HistoryMessage = {
    role: 'user' | 'assistant'
    content: string
}

router.post('/', async (req: Request, res: Response) => {
    const { message, history, mode } = req.body as {
        message: string,
        history: HistoryMessage[],
        mode: Mode
    }

    if (!message) {
        res.status(400).json({ error: 'message is required' })
        return
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
    const systemPrompt = mode === 'formal' ? FORMAL_PROMPT : CASUAL_PROMPT

    try {
        const completion = await groq.chat.completions.create({
            model: 'llama-3.1-8b-instant',
            messages: [
                { role: 'system', content: systemPrompt },
                ...(history ?? []),
                { role: 'user', content: message },
            ],
    })

    const reply = completion.choices[0]?.message?.content ?? ''
    res.json({ reply })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: String(err) })
  }
    
})

export default router