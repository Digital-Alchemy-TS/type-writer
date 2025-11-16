import { is, TServiceParams } from "@digital-alchemy/core";
import { ServiceListSelector } from "@digital-alchemy/hass";
import { factory, SyntaxKind } from "typescript";

export function ActionSelector({ lifecycle, type_build }: TServiceParams) {
  lifecycle.onPreInit(() => {
    type_build.selectors.register({
      generator: () => factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
      matcher: (selector: ServiceListSelector) => !is.undefined(selector?.action),
    });
  });
}
