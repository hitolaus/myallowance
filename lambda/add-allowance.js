const {DynamoDB} = require('@aws-sdk/client-dynamodb');
const {DynamoDBDocumentClient, PutCommand} = require('@aws-sdk/lib-dynamodb');
const {randomUUID} = require('crypto');

const dynamodbClient = new DynamoDB();
const dynamodb = DynamoDBDocumentClient.from(dynamodbClient);

const tableName = process.env.TRANSACTIONS_TABLE_NAME;

module.exports.handler = async (event, context) => {
    try {
        const note = "Lommepenge (auto)";
        const amount = 20;
        let date = new Date().toISOString();

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
            body: JSON.stringify({}),
        };
    } catch (err) {
        console.log(err);

        return {
            statusCode: 500,
            body: JSON.stringify({message: JSON.stringify(err)}),
        }
    }
};