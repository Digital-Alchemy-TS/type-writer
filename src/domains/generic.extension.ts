import { is, TServiceParams } from "@digital-alchemy/core";
import { ANY_ENTITY, ENTITY_STATE } from "@digital-alchemy/hass";
import { factory, SyntaxKind } from "typescript";
import { isNumeric } from "validator";

export function GenericDomainBuilder({ type_build }: TServiceParams) {
  type_build.domain.register({
    async attributes(data) {
      return type_build.ast.attributes({
        data: data.attributes,
      });
    },
    // @ts-expect-error because I made it up
    domain: "generic",
    state(data) {
      const entity = data as ENTITY_STATE<ANY_ENTITY>;
      if (is.number(entity.state) || isNumeric(entity.state)) {
        return factory.createKeywordTypeNode(SyntaxKind.NumberKeyword);
      }
      return factory.createKeywordTypeNode(SyntaxKind.StringKeyword);
    },
  });
}
