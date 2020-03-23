import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'

import {parseUserId} from "../../auth/utils";

import {getToken} from "../auth/auth0Authorizer";


// @ts-ignore
import * as events from "events";
// @ts-ignore
import {Jwt} from "../../auth/Jwt";
// @ts-ignore
import {decode} from "jsonwebtoken";

const AWS = require('aws-sdk')
const uuid = require('uuid')

const docClient = new AWS.DynamoDB.DocumentClient()
//const groupsTable = process.env.GROUPS_TABLE
const groupsTable = "TODO"

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const itemId = uuid.v4()

  const newTodo: CreateTodoRequest = JSON.parse(event.body)

  console.log(`event.headers.Authorization == ${event.headers.Authorization}`)

  const jwt = getToken(event.headers.Authorization)

  const userId = parseUserId(jwt)

  console.log(`userId is ${userId}`)

  console.log(`jwt is ${jwt}`)

  for (const key in event.headers) {
    console.log(`key == ${key}`)
    console.log(`event.headers[key] == ${event.headers[key]}`)
  }

  let createdAt = new Date();
  console.log(`createdAt == ${createdAt}`)


  const newItem = {
    partitionKey: itemId,
    sortKey: userId,
    createdAt,
    ...newTodo
  }

  await docClient.put({
    TableName: groupsTable,
    Item: newItem
  }).promise()

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
