import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as nodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as cdk from "aws-cdk-lib/core";
import type { Construct } from "constructs";
import * as path from "path";

export class InfraStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		const userPool = new cognito.UserPool(this, "EnglishPalUserPool", {
			userPoolName: "english-pal-user-pool",
			selfSignUpEnabled: true,
			signInAliases: {
				email: true,
			},
			autoVerify: {
				email: true,
			},
			removalPolicy: cdk.RemovalPolicy.RETAIN,
		});

		const userPoolClient = userPool.addClient("EnglishPalClient", {
			userPoolClientName: "english-pal-client",
			authFlows: {
				userSrp: true,
			},
			generateSecret: false,
		});

		const sessionsTable = new dynamodb.Table(this, "SessionsTable", {
			tableName: "EnglishPalSessions",
			partitionKey: { name: "userId", type: dynamodb.AttributeType.STRING },
			sortKey: { name: "sessionId", type: dynamodb.AttributeType.STRING },
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
				NODE_ENV: "production",
				CORS_ORIGIN: "https://english-pal-one.vercel.app",
				CORS_PREVIEW_PATTERN: "^https://english-pal[^.]*\\.vercel\\.app$",
			},
		});

		sessionsTable.grantReadWriteData(apiLambda);

		const authorizer = new apigateway.CognitoUserPoolsAuthorizer(
			this,
			"EnglishPalAuthorizer",
			{
				cognitoUserPools: [userPool],
			},
		);

		const api = new apigateway.LambdaRestApi(this, "RestApi", {
			handler: apiLambda,
			proxy: true,
			defaultMethodOptions: {
				authorizationType: apigateway.AuthorizationType.COGNITO,
				authorizer: authorizer,
			},
			defaultCorsPreflightOptions: {
				allowOrigins: apigateway.Cors.ALL_ORIGINS,
				allowMethods: apigateway.Cors.ALL_METHODS,
				allowHeaders: [...apigateway.Cors.DEFAULT_HEADERS, "x-groq-api-key"],
			},
		});

		new cdk.CfnOutput(this, "ApiUrl", {
			value: api.url,
			description: "API Gateway endpoint — set as VITE_API_URL in client",
		});

		new cdk.CfnOutput(this, "UserPoolIdOutput", {
			value: userPool.userPoolId,
			description: "The ID of the Cognito User Pool",
			exportName: `${this.stackName}-UserPoolId`,
		});

		new cdk.CfnOutput(this, "UserPoolClientIdOutput", {
			value: userPoolClient.userPoolClientId,
			description: "The ID of the Cognito User Pool Client",
			exportName: `${this.stackName}-UserPoolClientId`,
		});
	}
}
