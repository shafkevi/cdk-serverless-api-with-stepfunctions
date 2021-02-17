import { Construct, Stack, StackProps } from "@aws-cdk/core";
import TemplateConstruct from "../constructs/TemplateConstruct";

export default class Template extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    new TemplateConstruct(this, "Construct", { });
  }
}
