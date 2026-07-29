import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
	DeleteCommand,
	DynamoDBDocumentClient,
	GetCommand,
	PutCommand,
	QueryCommand,
	UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import type { HistoryMessage, Mode, Session } from "../types/index";

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);

const SESSIONS_TABLE = process.env.SESSIONS_TABLE ?? "EnglishPalSessions";
const DEFAULT_USER_ID = "default";

export const addSession = async (
	date: string,
	mode: Mode,
	transcript: HistoryMessage[],
	feedback: string,
): Promise<Session> => {
	const sessionId = randomUUID();
	await ddb.send(
		new PutCommand({
			TableName: SESSIONS_TABLE,
			Item: {
				userId: DEFAULT_USER_ID,
				sessionId,
				date,
				mode,
				transcript,
				feedback,
			},
		}),
	);
	return { id: sessionId, date, mode, transcript, feedback };
};

export const getAllSessions = async (): Promise<Session[]> => {
	const result = await ddb.send(
		new QueryCommand({
			TableName: SESSIONS_TABLE,
			KeyConditionExpression: "userId = :userId",
			ExpressionAttributeValues: { ":userId": DEFAULT_USER_ID },
			ScanIndexForward: false,
		}),
	);
	return (result.Items ?? []).map((item) => ({
		id: item.sessionId as string,
		date: item.date as string,
		mode: item.mode as Mode,
		transcript: item.transcript as HistoryMessage[],
		feedback: item.feedback as string,
	}));
};

export const getRecentSessions = async (limit: number): Promise<Session[]> => {
	const result = await ddb.send(
		new QueryCommand({
			TableName: SESSIONS_TABLE,
			KeyConditionExpression: "userId = :userId",
			ExpressionAttributeValues: { ":userId": DEFAULT_USER_ID },
			ScanIndexForward: false,
			Limit: limit,
		}),
	);
	return (result.Items ?? []).map((item) => ({
		id: item.sessionId as string,
		date: item.date as string,
		mode: item.mode as Mode,
		transcript: item.transcript as HistoryMessage[],
		feedback: item.feedback as string,
	}));
};

export const getSessionById = async (
	id: string,
): Promise<Session | undefined> => {
	const result = await ddb.send(
		new GetCommand({
			TableName: SESSIONS_TABLE,
			Key: { userId: DEFAULT_USER_ID, sessionId: id },
		}),
	);
	if (!result.Item) return undefined;
	return {
		id: result.Item.sessionId as string,
		date: result.Item.date as string,
		mode: result.Item.mode as Mode,
		transcript: result.Item.transcript as HistoryMessage[],
		feedback: result.Item.feedback as string,
	};
};

export const updateSessionByID = async (
	transcript: HistoryMessage[],
	feedback: string,
	id: string,
): Promise<Session> => {
	const result = await ddb.send(
		new UpdateCommand({
			TableName: SESSIONS_TABLE,
			Key: { userId: DEFAULT_USER_ID, sessionId: id },
			UpdateExpression: "SET transcript = :transcript, feedback = :feedback",
			ExpressionAttributeValues: {
				":transcript": transcript,
				":feedback": feedback,
			},
			ReturnValues: "ALL_NEW",
		}),
	);
	const item = result.Attributes!;
	return {
		id: item.sessionId as string,
		date: item.date as string,
		mode: item.mode as Mode,
		transcript: item.transcript as HistoryMessage[],
		feedback: item.feedback as string,
	};
};

export const deleteSessionById = async (id: string): Promise<void> => {
	await ddb.send(
		new DeleteCommand({
			TableName: SESSIONS_TABLE,
			Key: { userId: DEFAULT_USER_ID, sessionId: id },
		}),
	);
};
