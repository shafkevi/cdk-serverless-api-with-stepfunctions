import os
import json
import uuid
import boto3
from datetime import datetime
from boto3.dynamodb.conditions import Key

TABLE_NAME = os.getenv("TABLE_NAME")
CALCULATOR_ARN = os.getenv("CALCULATOR_ARN")

def main(event, context):
    
    print(event)
    dynamodb = boto3.resource("dynamodb")
    table = dynamodb.Table(TABLE_NAME)
    user_id = event["requestContext"]["authorizer"]["jwt"]["claims"]["sub"]
    thing_id = str(uuid.uuid4())
    try:
        dynamodb = boto3.resource("dynamodb")
        table = dynamodb.Table(TABLE_NAME)
        body = json.loads(event.get("body"))
        thing_name = body.get("thingName")
        processor = body.get("processor")
        now = datetime.now().isoformat()
        thing = {
            "partitionKey": user_id,
            "sortKey": "thing_{}".format(thing_id),
            "thingId": thing_id,
            "userId": user_id,
            "thingName": thing_name,
            "processor": processor,
            "dateCreated": now,
            "dateModified": now,
        }
        put_item_response = table.put_item(Item=thing)

        stepfunctions = boto3.client("stepfunctions")

        # Kickoff a background Step Function.
        sfn_invoke_response = stepfunctions.start_execution(
            stateMachineArn=CALCULATOR_ARN,
            name=thing_id,
            input=json.dumps({"data": thing_id, "thingId": thing_id, "userId": user_id, "processor": processor})
        )

        print(sfn_invoke_response)
        return {"thingId": thing_id}
    except Exception as e:
        print(e)
        return {"message": "error!"}