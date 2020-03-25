import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import {getToken} from "../auth/auth0Authorizer";

import {updateTodo} from "../../businessLogic/todos";




export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  const todoId = event.pathParameters.todoId
  const jwt = getToken(event.headers.Authorization)


  const todoToUpdate: UpdateTodoRequest = JSON.parse(event.body)

  console.log(`updatedTodo.done == ${todoToUpdate.done}`)

  const updatedTodo = await updateTodo(todoId, jwt, todoToUpdate )


  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      updatedTodo
    })
  }
}
