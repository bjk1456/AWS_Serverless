import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import {getToken} from "../auth/auth0Authorizer";
import {parseUserId} from "../../auth/utils";

const AWS = require('aws-sdk')
const docClient = new AWS.DynamoDB.DocumentClient()
const groupsTable = "TODO"

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    const todoId = event.pathParameters.todoId
    let returnMsg = `${todoId} wasn't deleted`
    console.log(`todoId equals ${todoId}`)

    const jwt = getToken(event.headers.Authorization)
    const userId = parseUserId(jwt)

    console.log(`userId is ${userId}`)

    const params = {
        TableName: groupsTable,
        Key:{
            "partitionKey": todoId,
            "sortKey": userId
        }
    };


    await docClient.delete(params, function(err, data) {
        if (err) {
            returnMsg = "Unable to delete item. Error JSON:", JSON.stringify(err, null, 2);
        } else {
            returnMsg = "Delete Item succeeded:", JSON.stringify(data, null, 2);
        }

    }).promise()

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            returnMsg
        })
    }
  }

