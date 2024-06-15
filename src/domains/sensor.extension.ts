import { is, TServiceParams } from "@digital-alchemy/core";
import { ENTITY_STATE, PICK_ENTITY } from "@digital-alchemy/hass";
import { factory, SyntaxKind } from "typescript";
import { isNumeric } from "validator";

export function SensorBuilder({ type_writer }: TServiceParams) {
  type_writer.domain.register<"sensor">({
    async attributes(data) {
      return type_writer.ast.attributes({ data: data.attributes });
    },
    domain: "sensor",
    state(data) {
      const entity = data as ENTITY_STATE<PICK_ENTITY<"sensor">>;
      if (is.number(entity.state) || isNumeric(entity.state)) {
        return factory.createKeywordTypeNode(SyntaxKind.NumberKeyword);
      }
      const attributes = data.attributes as object as { options: string[] };
      if (!is.empty(attributes.options)) {
        return type_writer.ast.union(attributes.options);
      }
      return factory.createKeywordTypeNode(SyntaxKind.StringKeyword);
    },
  });
}
