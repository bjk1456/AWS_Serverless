import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import {saveTodo} from '../../businessLogic/todos'

import {CreateTodoRequest} from "../../requests/CreateTodoRequest";
import {getToken} from "../auth/auth0Authorizer";
import {TodoItem} from "../../models/TodoItem";



export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)

  let newTodoItem = <TodoItem>newTodo
  const token = getToken(event.headers.Authorization)
  const resp = await saveTodo(newTodoItem, token)

  return {
    statusCode: 201,
    headers: {
    'Access-Control-Allow-Origin': '*'
  },
    body: JSON.stringify({
      resp
    })
  }
}
