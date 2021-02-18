import os
import json
import boto3
from boto3.dynamodb.conditions import Key

TABLE_NAME = os.getenv('TABLE_NAME')

def handler(event, context):
    
    print(event)
    dynamodb = boto3.resource("dynamodb")
    table = dynamodb.Table(TABLE_NAME)
    user_id = event["requestContext"]["authorizer"]["jwt"]["claims"]["sub"]
    if "pathParameters" in event:
        thing_id = event.get("pathParameters").get("id")
    else:
        thing_id = None
    try:
        if thing_id:
            response = table.get_item(
                TableName=TABLE_NAME,
                Key={
                "partitionKey": user_id,
                "sortKey": "thing_{}".format(thing_id)
            })
            print(response["Item"])
            return response["Item"]
        else: 
            query = event.get("queryStringParameters", {})
            if query is not None:
                limit = query.get("limit", 60)
            else:
                limit = 60
            sort_key = 'thing'
            response = table.query(
                ScanIndexForward=False,
                Limit=limit,
                KeyConditionExpression=Key('partitionKey').eq(user_id) & Key('sortKey').begins_with(sort_key)
            )
            print(response["Items"])
            return response["Items"]
    except Exception as e:
        print(e)
        return {"message": "error!"}