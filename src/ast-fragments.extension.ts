import { TServiceParams } from "@digital-alchemy/core";
import { PICK_ENTITY } from "@digital-alchemy/hass";
import { factory } from "typescript";

export function ASTFragmentsExtension({}: TServiceParams) {
  return {
    /**
     * "entity_id": "domain.object_id"
     */
    entity_id: (entity_id: PICK_ENTITY) =>
      factory.createPropertySignature(
        undefined,
        factory.createIdentifier("entity_id"),
        undefined,
        factory.createLiteralTypeNode(factory.createStringLiteral(entity_id)),
      ),
    /**
     * state: "on" | "off"
     */
    on_off: () =>
      factory.createPropertySignature(
        undefined,
        factory.createIdentifier("state"),
        undefined,
        factory.createUnionTypeNode([
          factory.createLiteralTypeNode(factory.createStringLiteral("on")),
          factory.createLiteralTypeNode(factory.createStringLiteral("off")),
        ]),
      ),
  };
}
