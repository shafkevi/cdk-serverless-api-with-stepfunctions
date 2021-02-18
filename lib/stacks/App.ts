import { join } from "path";
import { HttpMethod } from "@aws-cdk/aws-apigatewayv2";
import { Construct, Stack, StackProps, CfnOutput, Duration } from "@aws-cdk/core";
import Api from "../constructs/Api";
import Databases from "../constructs/Databases";
import Endpoint from "../constructs/Endpoint";
import UserManagement from "../constructs/UserManagement";
import { Code, Function, Runtime } from "@aws-cdk/aws-lambda";
import { Cluster } from "@aws-cdk/aws-ecs";
import {
  IntegrationPattern,
  JsonPath,
  Pass,
  Result,
  Parallel,
  Chain,
  Choice,
  Condition,
  StateMachine,
} from "@aws-cdk/aws-stepfunctions";
import FargateTask from "../constructs/FargateTask";
import LambdaTask from "../constructs/LambdaTask";
import { Vpc } from "@aws-cdk/aws-ec2";
import CalculatorStack from "./CalculatorStack";

export default class AppStack extends Stack {

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const {
      userPool,
      userPoolClient
    } = new UserManagement(this, "UserManagement", {});

    const {
      table
    } = new Databases(this, "Databases", {});

    const { 
      api,
      authorizer,
    } = new Api(this, "Api", {
      userPool,
      userPoolClient,
    });
    
    const calculatorStack = new CalculatorStack(this, "CalculatorStack", {
      table,
    });

  // This should be a separate stack, that just references the Calculator Stack
    const newThing = new Endpoint(this, "newThing", {
      httpApi: api,
      authorizer,
      dynamoTable: table,
      methods: [HttpMethod.POST],
      routePath: "/things",
      assetPath: ["things", "post"], // only what comes after -> /src/lambda/
      environment: {
        "CALCULATOR_ARN": calculatorStack.stateMachine.stateMachineArn,
      }
    });
    calculatorStack.stateMachine.grantStartExecution(newThing.lambda);
    // calculatorStack.stateMachine.grantExecution(newThing.lambda);

    const getThings = new Endpoint(this, "getThings", {
      httpApi: api,
      authorizer,
      dynamoTable: table,
      methods: [HttpMethod.GET],
      routePath: "/things",
      assetPath: ["things", "get"], // only what comes after -> /src/lambda/
    });

    const getThing = new Endpoint(this, "getThing", {
      httpApi: api,
      authorizer,
      dynamoTable: table,
      methods: [HttpMethod.GET],
      routePath: "/things/{id}",
      assetPath: ["things", "get"], // only what comes after -> /src/lambda/
    });

  }
}
