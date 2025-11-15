import { is, TServiceParams } from "@digital-alchemy/core";
import { ServiceListSelector } from "@digital-alchemy/hass";
import { factory, TypeNode } from "typescript";

export function LabelSelector({ lifecycle, type_build }: TServiceParams) {
  lifecycle.onPreInit(() => {
    type_build.selectors.register({
      generator: (selector: ServiceListSelector) => {
        let node: TypeNode = factory.createTypeReferenceNode(
          factory.createIdentifier("TLabelId"),
          undefined,
        );
        if (selector.label?.multiple) {
          node = factory.createArrayTypeNode(node);
        }
        return node;
      },
      matcher: (selector: ServiceListSelector) => !is.undefined(selector?.label),
    });
  });
}
