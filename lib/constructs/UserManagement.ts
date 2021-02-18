import { Construct, CfnOutput } from "@aws-cdk/core";

import {
  UserPool, 
  UserPoolClient,
//   UserPoolIdentityProviderFacebook,
//   UserPoolIdentityProviderGoogle,
} from "@aws-cdk/aws-cognito";

  

export interface UserManagementProps {
}

export default class UserManagement extends Construct {
  public readonly userPool: UserPool;
  public readonly userPoolClient: UserPoolClient;
  constructor(scope: Construct, id: string, props: UserManagementProps) {
    super(scope, id);

    const { 
    } = props;

    this.userPool = new UserPool(this, "UserPool", {
        autoVerify: { email: true },
        selfSignUpEnabled: true,
        signInCaseSensitive: false,
    });

    this.userPoolClient = this.userPool.addClient("WebApp", {
        authFlows: {
            custom: true,
            userSrp: true,
        },
    });

    // Commented out to add back in as needed.
    // const facebookIdentity = new UserPoolIdentityProviderFacebook(this, "FacebookIdentity", {
    //     clientId: "",
    //     clientSecret: "",
    //     userPool: this.userPool,
    // });
    // const googleIdentity = new UserPoolIdentityProviderGoogle(this, "GoogleIdentity", {
    //     clientId: "",
    //     clientSecret: "",
    //     userPool: this.userPool,
    // });


  new CfnOutput(this, "userPoolId", {
    value: this.userPool.userPoolId,
    exportName: "userPoolId"
  });

  new CfnOutput(this, "userPoolClientId", {
    value: this.userPoolClient.userPoolClientId,
    exportName: "userPoolClientId"
  });

  }
}
