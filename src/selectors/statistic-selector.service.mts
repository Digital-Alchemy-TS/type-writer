import { is, TServiceParams } from "@digital-alchemy/core";
import { ServiceListSelector } from "@digital-alchemy/hass";
import { factory, SyntaxKind, TypeNode } from "typescript";

export function StatisticSelector({ lifecycle, type_build }: TServiceParams) {
  lifecycle.onPreInit(() => {
    type_build.selectors.register({
      generator: (selector: ServiceListSelector) => {
        let node: TypeNode = factory.createKeywordTypeNode(SyntaxKind.StringKeyword);
        if (selector.statistic?.multiple) {
          node = factory.createArrayTypeNode(node);
        }
        return node;
      },
      matcher: (selector: ServiceListSelector) => !is.undefined(selector?.statistic),
    });
  });
}
