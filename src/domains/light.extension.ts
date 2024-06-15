import { is, TServiceParams } from "@digital-alchemy/core";
import { ENTITY_STATE, PICK_ENTITY } from "@digital-alchemy/hass";
import { factory, SyntaxKind } from "typescript";
import { isNumeric } from "validator";

export function LightBuilder({ type_writer }: TServiceParams) {
  type_writer.domain.register<"light">({
    async attributes(data) {
      const attributes = data.attributes as object as Record<
        "supported_color_modes" | "effect_list",
        string[]
      >;

      return type_writer.ast.attributes({
        data: data.attributes,
        override: {
          brightness: factory.createKeywordTypeNode(SyntaxKind.NumberKeyword),
          color_mode: type_writer.ast.union(attributes.supported_color_modes ?? []),
          color_temp: factory.createKeywordTypeNode(SyntaxKind.NumberKeyword),
          color_temp_kelvin: factory.createKeywordTypeNode(SyntaxKind.NumberKeyword),
          effect: type_writer.ast.union(attributes.effect_list ?? []),
          hs_color: type_writer.ast.tuple([..."hs"]),
          rgb_color: type_writer.ast.tuple([..."rgb"]),
          rgbw_color: type_writer.ast.tuple([..."rgbw"]),
          rgbww_color: type_writer.ast.tuple([..."rgbww"]),
          xy_color: type_writer.ast.tuple([..."xy"]),
        },
      });
    },
    domain: "light",
    state(data) {
      const entity = data as ENTITY_STATE<PICK_ENTITY<"light">>;
      if (is.number(entity.state) || isNumeric(entity.state)) {
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
