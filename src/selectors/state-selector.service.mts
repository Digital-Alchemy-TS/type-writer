import { is, TServiceParams } from "@digital-alchemy/core";
import { ServiceListSelector } from "@digital-alchemy/hass";
import { factory, SyntaxKind, TypeNode } from "typescript";

export function StateSelector({ lifecycle, type_build }: TServiceParams) {
  lifecycle.onPreInit(() => {
    type_build.selectors.register({
      generator: (selector: ServiceListSelector) => {
        let node: TypeNode = factory.createKeywordTypeNode(SyntaxKind.StringKeyword);
        if (selector.state?.multiple) {
          node = factory.createArrayTypeNode(node);
        }
        return node;
      },
      matcher: (selector: ServiceListSelector) => !is.undefined(selector?.state),
    });
  });
}
