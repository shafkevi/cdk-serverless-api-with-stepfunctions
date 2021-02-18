#!/usr/bin/python
import os
import json
import math
import boto3

def calculate():
    import random
    results = str(random.random())
    return results

def main():
    print(os.environ)
    task_token = os.getenv("taskToken")
    try:
        results = calculate()
        print("results {} ".format(results))
    except Exception as e:
        print(e)
        print("Something went wrong...")
        results = "error"
    
    # TODO: Clean this up to actually send the success/failure accordingly.
    sfn = boto3.client('stepfunctions')
    sfn.send_task_success(
        taskToken=task_token,
        output=json.dumps(results)
    )

if __name__ == "__main__":
    main()
