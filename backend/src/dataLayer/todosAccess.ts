import 'source-map-support/register'
import {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client';

import { TodoItem } from '../models/TodoItem'
import * as AWS from 'aws-sdk';
import {TodoUpdate} from "../models/TodoUpdate";


const groupsTable = process.env.TODOS_TABLE;

export class TodosAccess {


    constructor(
        private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
        private readonly todosTable = groupsTable) {

    }

    async getAllTodos(): Promise<TodoItem[]> {

       const result = await this.docClient.scan({
            TableName: this.todosTable
        }).promise()


        const items = result.Items
        return items as TodoItem[]
    }

    async saveTodo(todo:TodoItem){

        await this.docClient.put({
            TableName: groupsTable,
            Item: todo

        }).promise()
    }

    async deleteTodo(todoId:string, userId:string){
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
        const attributes = result.Attributes
        console.log(`About to call attributes`)
        console.log(`the attributes.createdAt are ${attributes.createdAt}`)

        for (const key in attributes.keys) {
            console.log(`key == ${key}`)
            console.log(`attributes.headers[key] == ${attributes.headers[key]}`)
        }
        return result
    }
}