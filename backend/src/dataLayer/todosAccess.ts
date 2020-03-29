import 'source-map-support/register'
import {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client';

import { TodoItem } from '../models/TodoItem'
import {TodoUpdate} from "../models/TodoUpdate";
const logger = createLogger("todoAccess");

import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import {createLogger} from "../utils/logger";


const groupsTable = process.env.TODOS_TABLE;

export class TodosAccess {

    constructor(
        // @ts-ignore
        private readonly XAWS = AWSXRay.captureAWS(AWS),
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = groupsTable) {

    }

    async getAllTodos(userId:string): Promise<TodoItem[]> {
       logger.info("Fetching all todos")
       const result = await this.docClient.query({
           TableName: this.todosTable,
           KeyConditionExpression: "userId = :userId",
           ExpressionAttributeValues: {
               ":userId": userId
           }
        }).promise()


        const items = result.Items
        return items as TodoItem[]
    }

    async saveTodo(todo:TodoItem){
        logger.info(`Saving ${todo}`)
        await this.docClient.put({
            TableName: groupsTable,
            Item: todo

        }).promise()
    }

    async deleteTodo(todoId:string, userId:string){
        logger.info(`Deleting todo with id of ${todoId}`)
        const params = {
            TableName: groupsTable,
            Key:{
                "todoId": todoId,
                "userId": userId
            }
        };

        await this.docClient.delete(params).promise()
    }

    async updateTodo(todoId:string, userId:string, updatedTodo:TodoUpdate){
        logger.info(`Updating todo with id of ${todoId}`)
        const params = {
            TableName: groupsTable,
            Key:{
                "todoId": todoId,
                "userId": userId
            },
            UpdateExpression: "set #n=:n, dueDate=:dd, #d=:dne",
            ExpressionAttributeNames: {"#n":"name","#d":"done"},
            ExpressionAttributeValues: {
                ":n": updatedTodo.name,
                ":dd": updatedTodo.dueDate,
                ":dne": updatedTodo.done
            },
            ReturnValues:"ALL_NEW"
        };
        const result = await this.docClient.update(params).promise()

        return result
    }

    async getTodosByIdUserId(todoId:string, userId:string){
        const params = {
            TableName: groupsTable,
            Key:{
                "todoId": todoId,
                "userId": userId
            }
        }
        const result = await this.docClient.get(params).promise()
        console.log(`Inside getTodosByIdUserId ... result.Item== ${!!result.Item}`)
        return !!result.Item
    }
}