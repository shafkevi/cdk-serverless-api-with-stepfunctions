import os
import json
import uuid

def calculate():
    import random
    results = str(random.random())
    return results

def main(event, context):
    print(event)
    try:
        results = calculate()
        print("results {} ".format(results))
        return results
    except Exception as e:
        print(e)
        return {"message": "error!"}