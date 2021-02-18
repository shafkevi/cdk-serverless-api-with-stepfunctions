import os
import json
import uuid
import boto3
from datetime import datetime
from boto3.dynamodb.conditions import Key

TABLE_NAME = os.getenv("TABLE_NAME")

def main(event, context):
    
    print(event)
    dynamodb = boto3.resource("dynamodb")
    table = dynamodb.Table(TABLE_NAME)
    user_id = event.get("userId")
    thing_id = event.get("thingId")
    results = event.get("value")
    now = datetime.now().isoformat()
    try:
        table.update_item(
            Key={
                "partitionKey": user_id,
                "sortKey": "thing_{}".format(thing_id),
            },
            UpdateExpression="set results = :results, dateModified = :now",
            ExpressionAttributeValues={
                ":results": results,
                ":now": now,
            }
        )
        return {"thingId": thing_id}
    except Exception as e:
        print(e)
        return {"message": "error!"}