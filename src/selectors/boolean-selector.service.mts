import { is, TServiceParams } from "@digital-alchemy/core";
import { ServiceListFieldDescription, ServiceListSelector } from "@digital-alchemy/hass";
import { factory, SyntaxKind } from "typescript";

export function BooleanSelector({ lifecycle, type_build }: TServiceParams) {
  lifecycle.onPreInit(() => {
    type_build.selectors.register({
      matcher: (selector: ServiceListSelector) => !is.undefined(selector?.boolean),
      generator: () => factory.createKeywordTypeNode(SyntaxKind.BooleanKeyword),
    });
  });
}
