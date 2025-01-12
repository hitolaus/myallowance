const {DynamoDB} = require('@aws-sdk/client-dynamodb');
const {DynamoDBDocumentClient, PutCommand} = require('@aws-sdk/lib-dynamodb');
const {randomUUID} = require('crypto');

const dynamodbClient = new DynamoDB();
const dynamodb = DynamoDBDocumentClient.from(dynamodbClient);

const tableName = process.env.TRANSACTIONS_TABLE_NAME;

module.exports.handler = async (event, context) => {
    try {
        let body;
        if (event.body) {
            body = JSON.parse(event.body)
        }
        const {note, amount} = body ?? {};
        let date = new Date().toISOString();

        if (!note || !amount) {
            return {
                statusCode: 400,
                headers: {
                    "Access-Control-Allow-Origin": "*", // Match your CDK CORS config
                    "Access-Control-Allow-Methods": "GET, POST, OPTIONS", // Match your API methods
                },
                body: JSON.stringify({message: "Missing 'note' or 'amount'"}),
            };
        }

        await dynamodb.send(
            new PutCommand({
                TableName: tableName,
                Item: {
                    transactionId: randomUUID(),
                    note: note,
                    amount: amount,
                    date: date
                }
            })
        );
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*", // Match your CDK CORS config
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS", // Match your API methods
            },
            body: JSON.stringify({}),
        };
    } catch (err) {
        console.log(err);

        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*", // Match your CDK CORS config
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS", // Match your API methods
            },
            body: JSON.stringify({message: JSON.stringify(err)}),
        }
    }
};