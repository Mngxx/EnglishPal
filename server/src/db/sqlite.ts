import Database from "better-sqlite3";
import type { Statement, RunResult } from "better-sqlite3";
import { Mode, HistoryMessage, Session } from "../types/index";

const db = new Database("app.db");

db.pragma("journal_mode = WAL");

db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        mode TEXT NOT NULL,
        transcript TEXT NOT NULL,
        feedback TEXT NOT NULL
    )
`);

// Prepare Statements
const insertSessionStmt = db.prepare(
    "INSERT INTO sessions (date, mode, transcript, feedback) VALUES (@date, @mode, @transcript, @feedback)",
) as Statement<
    { date: string; mode: string; transcript: string; feedback: string },
    RunResult
>;

const getSessionByIdStmt = db.prepare(
    "SELECT * FROM sessions WHERE id = ?",
) as Statement<[number], Session | undefined>;

const getAllSessionsStmt = db.prepare("SELECT * FROM sessions") as Statement<
    [],
    Session[]
>;

// Exposed Functions
export const addSession = (
    date: string,
    mode: Mode,
    transcript: HistoryMessage[],
    feedback: string,
): Session => {
    const result = insertSessionStmt.run({
        date,
        mode,
        transcript: JSON.stringify(transcript),
        feedback,
    });
    const row = getSessionByIdStmt.get(
        Number(result.lastInsertRowid),
    ) as Session & {
        transcript: string;
    };

    return {
        ...row,
        transcript: JSON.parse(row.transcript) as HistoryMessage[],
    };
};

export const getAllSessions = (): Session[] => {
    const rows = getAllSessionsStmt.all() as (Session & {
        transcript: string;
    })[];
    return rows.map((row) => ({
        ...row,
        transcript: JSON.parse(row.transcript) as HistoryMessage[],
    }));
};

export const getSessionById = (id: number): Session | undefined => {
    const row = getSessionByIdStmt.get(id) as
        | (Session & { transcript: string })
        | undefined;
    if (!row) return undefined;
    return {
        ...row,
        transcript: JSON.parse(row.transcript) as HistoryMessage[],
    };
};

process.on("SIGINT", () => {
    db.close();
    process.exit(0);
});
