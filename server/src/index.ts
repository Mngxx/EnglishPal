import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import chatRouter from './routes/chat.ts'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors({ origin: 'http://localhost:5173'}))
app.use(express.json())

app.use('/chat', chatRouter)

app.get('/health', (req, res) =>{
    res.json({ status: 'ok' })
})

app.listen(PORT, ()=>{
    console.log(`Server running on http://localhost:${PORT}`)
})