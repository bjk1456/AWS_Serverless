import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'

const AWS = require('aws-sdk')
const uuid = require('uuid')

const docClient = new AWS.DynamoDB.DocumentClient()
//const groupsTable = process.env.GROUPS_TABLE
const groupsTable = "TODO"

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const itemId = uuid.v4()

  const newTodo: CreateTodoRequest = JSON.parse(event.body)

  const newItem = {
    partitionKey: itemId,
    sortKey: newTodo.name,
    ...newTodo
  }

  await docClient.put({
    TableName: groupsTable,
    Item: newItem
  }).promise()

  console.log("The name is ${name} the dueDate is ${dueDate}")
  console.log("The groupsTable is ${groupsTable}")

  return {
    statusCode: 201,
    headers: {
    'Access-Control-Allow-Origin': '*'
  },
    body: JSON.stringify({
      newItem
    })
  }
}
