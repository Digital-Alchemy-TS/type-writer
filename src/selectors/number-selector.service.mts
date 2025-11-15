import { is, TServiceParams } from "@digital-alchemy/core";
import { ServiceListFieldDescription, ServiceListSelector } from "@digital-alchemy/hass";
import { factory, SyntaxKind } from "typescript";

export function NumberSelector({ lifecycle, type_build }: TServiceParams) {
  lifecycle.onPreInit(() => {
    type_build.selectors.register({
      matcher: (selector: ServiceListSelector) => !is.undefined(selector?.number),
      generator: () => factory.createKeywordTypeNode(SyntaxKind.NumberKeyword),
    });
  });
}
