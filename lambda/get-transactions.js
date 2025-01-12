const { DynamoDB } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const dynamodbClient = new DynamoDB();
const dynamodb = DynamoDBDocumentClient.from(dynamodbClient);

const tableName = process.env.TRANSACTIONS_TABLE_NAME;

module.exports.handler = async (event, context) => {
  try {
    const dbResponse = await dynamodb.send(
      new ScanCommand({ TableName: tableName })
    );
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // Match your CDK CORS config
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS", // Match your API methods
      },
      body: JSON.stringify(dbResponse.Items),
    };
  } catch (err) {
    return { 
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*", // Match your CDK CORS config
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS", // Match your API methods
      },
      body: JSON.stringify(err)
    }
  }
};