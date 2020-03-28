import 'source-map-support/register'
import {TodoItem} from '../models/TodoItem'
import {TodosAccess} from '../dataLayer/todosAccess'
import {parseUserId} from "../auth/utils";
import {UpdateTodoRequest} from "../requests/UpdateTodoRequest";
import * as AWS from "aws-sdk";

const uuid = require('uuid')

const todoAccess = new TodosAccess()
const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export async function getAllTodos(token:string): Promise<TodoItem[]> {
    const userId = parseUserId(token)
    return await todoAccess.getAllTodos(userId)
}

export async function saveTodo(item:TodoItem, token:string): Promise<TodoItem>{

    const todoId = uuid.v4()
    const userId = parseUserId(token)
    const createdAt = new Date(Date.now()).toISOString();


    let newTodo = <TodoItem>{
        todoId: todoId,
        userId: userId,
        createdAt: createdAt,
        imageUrl: `https://${bucketName}.s3.amazon.com/${todoId}`,
        ...item
    }

    await todoAccess.saveTodo(newTodo)
    return newTodo
}

export async function deleteTodo(todoId:string, token:string){
    const userId = parseUserId(token)
    await todoAccess.deleteTodo(todoId,userId)
}

export async function updateTodo(todoId:string, token:string, updateItem:UpdateTodoRequest){
    const userId = parseUserId(token)
    const updatedTodo = await todoAccess.updateTodo(todoId,userId,updateItem)
    return updatedTodo
}

export function createUploadUrl(imageId: string){
    const s3 = new AWS.S3({
        signatureVersion: 'v4'
    })

    return s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: imageId,
        Expires: urlExpiration
    })
}