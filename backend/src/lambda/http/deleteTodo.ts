import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import {getToken} from "../auth/auth0Authorizer";
import {deleteTodo} from "../../businessLogic/todos";


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    const todoId = event.pathParameters.todoId
    const jwt = getToken(event.headers.Authorization)
    console.log(`inside of deleteTodo todoId == ${todoId}`)
    await deleteTodo(todoId,jwt)

    return {
        statusCode: 202,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({})}
  }

