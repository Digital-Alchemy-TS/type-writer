import { is, TServiceParams } from "@digital-alchemy/core";
import { ServiceListSelector } from "@digital-alchemy/hass";
import { factory, SyntaxKind } from "typescript";

export function ConstantSelector({ lifecycle, type_build }: TServiceParams) {
  lifecycle.onPreInit(() => {
    type_build.selectors.register({
      generator: (selector: ServiceListSelector) => {
        const value = selector.constant?.value;
        if (is.string(value)) {
          return factory.createLiteralTypeNode(factory.createStringLiteral(value));
        }
        if (is.number(value)) {
          return factory.createLiteralTypeNode(factory.createNumericLiteral(value.toString()));
        }
        if (is.boolean(value)) {
          return factory.createLiteralTypeNode(
            value ? factory.createTrue() : factory.createFalse(),
          );
        }
        return factory.createKeywordTypeNode(SyntaxKind.UnknownKeyword);
      },
      matcher: (selector: ServiceListSelector) => !is.undefined(selector?.constant),
    });
  });
}
