import { Construct } from "@aws-cdk/core";

export interface TemplateProps { }

export default class Template extends Construct {
  constructor(scope: Construct, id: string, props: TemplateProps) {
    super(scope, id);
    const {  } = props;
  }
}
