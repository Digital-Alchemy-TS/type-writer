import { is, TServiceParams } from "@digital-alchemy/core";
import { factory, SyntaxKind } from "typescript";

export function ClimateBuilder({ type_build }: TServiceParams) {
  // @ts-expect-error ignore
  type_build.domain.register<"climate">({
    async attributes(data) {
      const attributes = data.attributes as object as ClimateAttributes;
      return type_build.ast.attributes({
        data: attributes,
        override: {
          fan: type_build.ast.union(["on", "off"]),
          fan_mode: type_build.ast.union(attributes.fan_modes ?? []),
          preset_mode: type_build.ast.union(attributes.preset_modes ?? []),
        },
      });
    },
    domain: "climate",
    state(data) {
      const attributes = data.attributes as object as ClimateAttributes;
      if (is.empty(attributes.hvac_modes)) {
        return factory.createKeywordTypeNode(SyntaxKind.StringKeyword);
      }
      return type_build.ast.union(attributes.hvac_modes);
    },
  });
}

type ClimateAttributes = {
  hvac_modes: string[];
  fan_modes: string[];
  preset_modes: string[];
};
