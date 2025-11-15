import { is, TServiceParams } from "@digital-alchemy/core";
import { ServiceListFieldDescription, ServiceListSelector } from "@digital-alchemy/hass";
import { factory, SyntaxKind, TypeNode } from "typescript";

export function SelectSelector({ lifecycle, type_build }: TServiceParams) {
  lifecycle.onPreInit(() => {
    type_build.selectors.register({
      matcher: (selector: ServiceListSelector) => !is.undefined(selector?.select),
      generator: (selector: ServiceListSelector) => {
        let node: TypeNode = is.empty(selector?.select.options)
          ? factory.createKeywordTypeNode(SyntaxKind.StringKeyword)
          : factory.createUnionTypeNode(
              selector?.select.options.map((i: string | Record<"label" | "value", string>) =>
                factory.createLiteralTypeNode(
                  factory.createStringLiteral(is.string(i) ? i : i.value),
                ),
              ),
            );
        if (selector?.select?.custom_value && !is.empty(selector?.select.options)) {
          node = factory.createTypeReferenceNode(factory.createIdentifier("LiteralUnion"), [
            node,
            factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
          ]);
        }
        if (selector?.select?.multiple) {
          node = factory.createArrayTypeNode(node);
        }
        return node;
      },
    });
  });
}
