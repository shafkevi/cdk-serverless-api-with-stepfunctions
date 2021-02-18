import { Construct, RemovalPolicy, CfnOutput } from "@aws-cdk/core";
import { Table, AttributeType, BillingMode } from "@aws-cdk/aws-dynamodb";

export interface DatabasesProps {}

export default class Databases extends Construct {
    
  public readonly table: Table;

  constructor(scope: Construct, id: string, props: DatabasesProps) {
    super(scope, id);

    const { } = props;

    this.table = new Table(this, `${id}Table`, {
        tableName: `${id}Table`,
        billingMode: BillingMode.PAY_PER_REQUEST,
        removalPolicy: RemovalPolicy.DESTROY,
        partitionKey: {
          name: "partitionKey",
          type: AttributeType.STRING
        },
        sortKey: {
          name: "sortKey",
          type: AttributeType.STRING
        }
      });


    new CfnOutput(this, "tableName", {
      value: this.table.tableName,
      exportName: "tableName"
    });
  
  }
}
