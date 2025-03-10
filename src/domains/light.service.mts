import { is, TServiceParams } from "@digital-alchemy/core";
import { ENTITY_STATE, PICK_ENTITY } from "@digital-alchemy/hass";
import { factory, SyntaxKind } from "typescript";

export function LightBuilder({ type_build }: TServiceParams) {
  type_build.domain.register<"light">({
    async attributes(data) {
      const attributes = data.attributes as object as Record<
        "supported_color_modes" | "effect_list",
        string[]
      >;

      return type_build.ast.attributes({
        data: data.attributes as object,
        override: {
          brightness: factory.createKeywordTypeNode(SyntaxKind.NumberKeyword),
          color_mode: type_build.ast.union(attributes.supported_color_modes ?? []),
          color_temp: factory.createKeywordTypeNode(SyntaxKind.NumberKeyword),
          color_temp_kelvin: factory.createKeywordTypeNode(SyntaxKind.NumberKeyword),
          effect: is.empty(attributes.effect_list)
            ? factory.createKeywordTypeNode(SyntaxKind.StringKeyword)
            : type_build.ast.union(is.unique(attributes.effect_list ?? [])),
          effect_list: is.empty(attributes.effect_list)
            ? factory.createKeywordTypeNode(SyntaxKind.NeverKeyword)
            : type_build.ast.union(is.unique(attributes.effect_list ?? [])),
          hs_color: type_build.ast.tuple([..."hs"]),
          rgb_color: type_build.ast.tuple([..."rgb"]),
          rgbw_color: type_build.ast.tuple([..."rgbw"]),
          rgbww_color: type_build.ast.tuple([..."rgbww"]),
          xy_color: type_build.ast.tuple([..."xy"]),
        },
      });
    },
    domain: "light",
    state(data) {
      const entity = data as ENTITY_STATE<PICK_ENTITY<"light">>;
      if (is.number(Number(entity.state))) {
        return factory.createKeywordTypeNode(SyntaxKind.NumberKeyword);
      }
      const attributes = data.attributes as object as { options: string[] };
      if (!is.empty(attributes.options)) {
        return factory.createUnionTypeNode(
          attributes.options.map(option =>
            factory.createLiteralTypeNode(factory.createStringLiteral(option)),
          ),
        );
      }
      return factory.createKeywordTypeNode(SyntaxKind.StringKeyword);
    },
  });
}
