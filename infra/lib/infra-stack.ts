import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as nodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as cdk from "aws-cdk-lib/core";
import type { Construct } from "constructs";
import * as path from "path";

export class InfraStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		const sessionsTable = new dynamodb.Table(this, "SessionsTable", {
			tableName: "EnglishPalSessions",
			partitionKey: { name: "userId", type: dynamodb.AttributeType.STRING },
			sortKey: { name: "sessionId", type: dynamodb.AttributeType.STRING },
			billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
			removalPolicy: cdk.RemovalPolicy.RETAIN,
		});

		const usersTable = new dynamodb.Table(this, "UsersTable", {
			tableName: "EnglishPalUsers",
			partitionKey: { name: "userId", type: dynamodb.AttributeType.STRING },
			billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
			removalPolicy: cdk.RemovalPolicy.RETAIN,
		});

		const serverRoot = path.join(process.cwd(), "..", "server");

		const apiLambda = new nodejs.NodejsFunction(this, "ApiFunction", {
			functionName: "EnglishPalApi",
			entry: path.join(serverRoot, "src", "lambda.ts"),
			handler: "handler",
			runtime: lambda.Runtime.NODEJS_20_X,
			timeout: cdk.Duration.seconds(30),
			projectRoot: serverRoot,
			depsLockFilePath: path.join(serverRoot, "package-lock.json"),
			environment: {
				SESSIONS_TABLE: sessionsTable.tableName,
				USERS_TABLE: usersTable.tableName,
				NODE_ENV: "production",
				CORS_ORIGIN: "https://english-pal-one.vercel.app",
				CORS_PREVIEW_PATTERN: "^https://english-pal[^.]*\\.vercel\\.app$",
				GROQ_API_KEY: process.env.GROQ_API_KEY ?? "",
			},
		});

		sessionsTable.grantReadWriteData(apiLambda);
		usersTable.grantReadWriteData(apiLambda);

		const api = new apigateway.LambdaRestApi(this, "RestApi", {
			handler: apiLambda,
			proxy: true,
		});

		new cdk.CfnOutput(this, "ApiUrl", {
			value: api.url,
			description: "API Gateway endpoint — set as VITE_API_URL in client",
		});
	}
}
