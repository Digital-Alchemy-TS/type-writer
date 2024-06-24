import { is, TServiceParams } from "@digital-alchemy/core";
import { ENTITY_STATE, PICK_ENTITY } from "@digital-alchemy/hass";
import { factory, SyntaxKind } from "typescript";
import { isNumeric } from "validator";

export function SensorBuilder({ type_build }: TServiceParams) {
  type_build.domain.register<"sensor">({
    async attributes(data) {
      return type_build.ast.attributes({ data: data.attributes });
    },
    domain: "sensor",
    state(data) {
      const entity = data as ENTITY_STATE<PICK_ENTITY<"sensor">>;
      if (is.number(entity.state) || isNumeric(entity.state)) {
        return factory.createKeywordTypeNode(SyntaxKind.NumberKeyword);
      }
      const attributes = data.attributes as object as { options: string[] };
      if (!is.empty(attributes.options)) {
        return type_build.ast.union(attributes.options);
      }
      return factory.createKeywordTypeNode(SyntaxKind.StringKeyword);
    },
  });
}
