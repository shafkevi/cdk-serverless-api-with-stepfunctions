import path from "path";
import { Construct } from "@aws-cdk/core";
import { Table } from "@aws-cdk/aws-dynamodb";
import { LambdaProxyIntegration } from "@aws-cdk/aws-apigatewayv2-integrations";
import { 
  Code, 
  Function, 
  FunctionOptions, 
  Runtime 
} from "@aws-cdk/aws-lambda";
import { 
  CfnAuthorizer,
  CfnRoute,
  HttpApi,
  HttpMethod,
  HttpRoute
} from "@aws-cdk/aws-apigatewayv2";

export interface EndpointProps {
    httpApi: HttpApi,
    authorizer: CfnAuthorizer,
    routePath: string,
    assetPath: string[],
    methods: HttpMethod[],
    dynamoTable: Table,
    environment?: FunctionOptions["environment"],
}

export default class Endpoint extends Construct {
  public readonly endpoint: HttpRoute[];
  public readonly lambda: Function;

  constructor(scope: Construct, id: string, props: EndpointProps) {
    super(scope, id);

    const {
      httpApi,
      authorizer,
      routePath,
      assetPath,
      methods,
      dynamoTable,
      environment,
    } = props;


    this.lambda = new Function(this, id, {
      functionName: id,
      code: Code.fromAsset(path.join(__dirname, "..", "..", "src", "lambda", ...assetPath)),
      runtime: Runtime.PYTHON_3_8,
      handler: "index.handler",
      environment: {
        ...{TABLE_NAME: dynamoTable.tableName},
        ...environment,
      },
    });

    dynamoTable.grantReadWriteData(this.lambda);

    this.endpoint = httpApi.addRoutes({
      integration: new LambdaProxyIntegration({handler: this.lambda}),
      methods,
      path: routePath,
    });

    this.endpoint.forEach((it) => {
      const cfnRoute = it.node.defaultChild as CfnRoute;
      cfnRoute.addPropertyOverride("AuthorizationType", "JWT");
      cfnRoute.addPropertyOverride("AuthorizerId", authorizer.ref);
    });

  }
}
