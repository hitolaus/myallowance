import {Construct} from "constructs";
import * as cdk from 'aws-cdk-lib';
import {Cors, LambdaIntegration, RestApi} from "aws-cdk-lib/aws-apigateway";
import {Code, Function, Runtime} from "aws-cdk-lib/aws-lambda";
import {AttributeType, BillingMode, Table} from "aws-cdk-lib/aws-dynamodb";
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';

export class ApiStack extends cdk.Stack {

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const transactionsTable = new Table(this, 'Transactions', {
            partitionKey: {name: 'transactionId', type: AttributeType.STRING},
            removalPolicy: cdk.RemovalPolicy.DESTROY, // TODO:
            billingMode: BillingMode.PAY_PER_REQUEST,
        });

        const api = new RestApi(this, 'lommepenge-api', {
            defaultCorsPreflightOptions: {
                allowOrigins: Cors.ALL_ORIGINS,
                allowMethods: Cors.ALL_METHODS,
            }
        });

        const getTransactions = new Function(this, 'lommepenge-get-transactions', {
            runtime: Runtime.NODEJS_LATEST,
            handler: 'get-transactions.handler',
            code: Code.fromAsset('../lambda'),
            environment: {
                TRANSACTIONS_TABLE_NAME: transactionsTable.tableName,
            }
        });

        const addTransaction = new Function(this, 'lommepenge-add-transaction', {
            runtime: Runtime.NODEJS_LATEST,
            handler: 'add-transaction.handler',
            code: Code.fromAsset('../lambda'),
            environment: {
                TRANSACTIONS_TABLE_NAME: transactionsTable.tableName,
            }
        });

        const addAllowance = new Function(this, 'lommepenge-add-allowance', {
            runtime: Runtime.NODEJS_LATEST,
            handler: 'add-allowance.handler',
            code: Code.fromAsset('../lambda'),
            environment: {
                TRANSACTIONS_TABLE_NAME: transactionsTable.tableName,
            }
        });

        transactionsTable.grantReadData(getTransactions);
        transactionsTable.grantWriteData(addTransaction);
        transactionsTable.grantWriteData(addAllowance);

        const getTransactionsIntegration = new LambdaIntegration(getTransactions);
        const addTransactionIntegration = new LambdaIntegration(addTransaction);

        const transactions = api.root.addResource("transactions");
        transactions.addMethod("GET", getTransactionsIntegration);
        transactions.addMethod("POST", addTransactionIntegration);

        // Define the EventBridge rule with a weekly schedule
        const weeklyRule = new Rule(this, 'lommepenge-weekly-rule', {
            schedule: Schedule.expression('cron(0 12 ? * 7 *)'),
        });

        // Add the Lambda function as a target of the rule
        weeklyRule.addTarget(new LambdaFunction(addAllowance));

        // Grant EventBridge permissions to invoke the Lambda function
        addAllowance.grantInvoke(new cdk.aws_iam.ServicePrincipal('events.amazonaws.com'));

    }
}

module.exports = {ApiStack};