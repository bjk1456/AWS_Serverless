import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // @ts-ignore
  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  // @ts-ignore
  const name = newTodo.name
  // @ts-ignore
  const dueDate = newTodo.dueDate

  console.log("The name is ${name} the dueDate is ${dueDate}")

  // TODO: Implement creating a new TODO item
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Hello world',
      input: event,
    })
  }
}
