import { join } from "path";
import { Construct, NestedStack, NestedStackProps, CfnOutput, Duration } from "@aws-cdk/core";

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
import { Table } from "@aws-cdk/aws-dynamodb";


export interface CalculatorStackProps extends NestedStackProps {
    table: Table;
  }

export default class CalculatorStack extends NestedStack {
  public readonly stateMachine: StateMachine;

  constructor(scope: Construct, id: string, props: CalculatorStackProps) {
    super(scope, id, props);

    const {
        table 
    } = props;
    
    // Turn this into a separate stack from the API piece.
    const vpc = Vpc.fromLookup(this, "Vpc", { isDefault: true });  

    const fargateCluster = new Cluster(this, "FargateCluster", {
      vpc
    });

    const calculatorContainer = new FargateTask(this, "CalculatorContainer", { 
      cluster: fargateCluster,
      cpu: 256,
      memoryLimitMiB: 512,
      dockerfileLocation: join(__dirname, "../../src/fargate/calculator"),
      repositoryName: "calculator",
      logGroupName: "calculatorLogGroup",
      resultPath: "$.value",
      integrationPattern: IntegrationPattern.WAIT_FOR_TASK_TOKEN,
      environment: [
        {
          name: "data",
          value: JsonPath.stringAt("$.data"),
        },
        {
          name: "taskToken",
          value: JsonPath.taskToken,
        }
      ]
    });

    const resultLogger = new LambdaTask(this, "ResultLogger", {
      codeLocation: join(__dirname, "../../src/lambda/resultLogger"),
      handler: "index.main",
      runtime: Runtime.PYTHON_3_8,
      resultPath: "$",
    });
    table.grantReadWriteData(resultLogger.function);
    resultLogger.function.addEnvironment("TABLE_NAME", table.tableName);


    const calculatorFunction = new LambdaTask(this, "CalculatorFunction", {
      codeLocation: join(__dirname, "../../src/lambda/calculator"),
      handler: "index.main",
      runtime: Runtime.PYTHON_3_8,
      resultPath: "$.value",
    });

    const choice = new Choice(this, "Processing Choice");
    choice.when(Condition.and(Condition.isNotNull("$.processor"),Condition.stringEquals("$.processor", "fargate")), calculatorContainer.task);
    choice.otherwise(calculatorFunction.task);
    
    // Use .afterwards() to join all possible paths back together and continue
    choice.afterwards().next(resultLogger.task);

    this.stateMachine = new StateMachine(this, "StateMachine", {
      definition: choice,
    });

    this.stateMachine.grantTaskResponse(calculatorContainer.taskDefinition.taskRole);

  }
}
