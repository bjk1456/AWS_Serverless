import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import {getToken} from "../auth/auth0Authorizer";
import {parseUserId} from "../../auth/utils";

const AWS = require('aws-sdk')

const docClient = new AWS.DynamoDB.DocumentClient()
const groupsTable = "TODO"

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  const todoId = event.pathParameters.todoId
  let returnMsg = `${todoId} wasn't deleted`
  const jwt = getToken(event.headers.Authorization)
  const userId = parseUserId(jwt)

  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

  console.log(`updatedTodo.done == ${updatedTodo.done}`)

  const params = {
    TableName: groupsTable,
    Key:{
      "partitionKey": todoId,
      "sortKey": userId
    },
    UpdateExpression: "set #n=:n, dueDate=:dd, #d=:dne",
    ExpressionAttributeNames: {"#n":"name","#d":"done"},
    ExpressionAttributeValues: {
      ":n": updatedTodo.name,
      ":dd": updatedTodo.dueDate,
      ":dne": updatedTodo.done
    },
    ReturnValues:"UPDATED_NEW"
  };

  await docClient.update(params, function(err, data) {
    if (err) {
      returnMsg = "Unable to update item. Error JSON:", JSON.stringify(err, null, 2);
    } else {
      returnMsg = "UpdateItem succeeded:", JSON.stringify(data, null, 2);
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
