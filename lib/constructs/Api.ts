import { Construct, Duration, Aws, CfnOutput } from "@aws-cdk/core";
import { 
  HttpApi,
  HttpMethod,
  CfnAuthorizer,
} from "@aws-cdk/aws-apigatewayv2";
import { UserPool, UserPoolClient } from "@aws-cdk/aws-cognito";
import { HttpProxyIntegration } from "@aws-cdk/aws-apigatewayv2-integrations";

export interface ApiProps {
  userPool: UserPool,
  userPoolClient: UserPoolClient
}

export default class Api extends Construct {
  public readonly api: HttpApi;
  public readonly authorizer: CfnAuthorizer;

  constructor(scope: Construct, id: string, props: ApiProps) {
    super(scope, id);

    const { 
      userPool,
      userPoolClient,
    } = props;

    this.api = new HttpApi(this, "Api", {
      apiName: `${id}Api`,
      createDefaultStage: true,
      corsPreflight: {
        maxAge: Duration.days(1),
        allowOrigins: ["https://*", "http://*"],
        allowHeaders: ["Authorization", "Content-Type"],
        allowCredentials: true,
        allowMethods: [
          HttpMethod.GET,
          HttpMethod.PATCH,
          HttpMethod.HEAD,
          HttpMethod.OPTIONS,
          HttpMethod.POST
        ]
      }
    });

    this.authorizer = new CfnAuthorizer(this, "CognitoAuthorizer", {
      apiId: this.api.httpApiId,
      authorizerType: "JWT",
      name: "cognitoAuthorizer",
      identitySource: ["$request.header.Authorization"],
      jwtConfiguration: {
        audience: [userPoolClient.userPoolClientId],
        issuer: `https://cognito-idp.${Aws.REGION}.amazonaws.com/${userPool.userPoolId}`
      }
  });

  new CfnOutput(this, "apiUrl", {
    value: this.api.url ?? "",
    exportName: "apiUrl"
  });

  }
}
