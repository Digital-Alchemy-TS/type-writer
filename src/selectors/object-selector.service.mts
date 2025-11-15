import { is, TServiceParams } from "@digital-alchemy/core";
import { ServiceListFieldDescription, ServiceListSelector } from "@digital-alchemy/hass";
import { factory, SyntaxKind, TypeNode } from "typescript";

export function ObjectSelector({ lifecycle, type_build }: TServiceParams) {
  lifecycle.onPreInit(() => {
    type_build.selectors.register({
      generator: (
        _selector: ServiceListSelector,
        details: ServiceListFieldDescription,
        context: { parameterName: string; serviceDomain: string; serviceName: string },
      ) => {
        // using the default value to infer a type
        if (!is.undefined(details.default)) {
          // example: [ 'grafana', 'Configurator', 'core_mariadb' ]
          if (is.array(details.default)) {
            const isStringArray = details.default.every(i => is.string(i));
            return isStringArray
              ? factory.createArrayTypeNode(factory.createKeywordTypeNode(SyntaxKind.StringKeyword))
              : factory.createArrayTypeNode(
                  factory.createKeywordTypeNode(SyntaxKind.UnknownKeyword),
                );
          }

          // example: { addons: [ 'MariaDB' ], folders: [ 'Local add-ons', 'share' ] }
          if (is.object(details.default)) {
            return factory.createTypeLiteralNode(
              Object.entries(details.default).map(([key, value]) => {
                let type: TypeNode;
                if (is.array(value)) {
                  const isStringArray = value.every(i => is.string(i));
                  type = isStringArray
                    ? factory.createArrayTypeNode(
                        factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
                      )
                    : factory.createArrayTypeNode(
                        factory.createKeywordTypeNode(SyntaxKind.UnknownKeyword),
                      );
                } else if (is.string(value)) {
                  type = factory.createKeywordTypeNode(SyntaxKind.StringKeyword);
                } else if (is.number(value)) {
                  type = factory.createKeywordTypeNode(SyntaxKind.NumberKeyword);
                } else if (is.boolean(value)) {
                  type = factory.createKeywordTypeNode(SyntaxKind.BooleanKeyword);
                } else {
                  type = factory.createKeywordTypeNode(SyntaxKind.UnknownKeyword);
                }
                return factory.createPropertySignature(
                  undefined,
                  factory.createIdentifier(key),
                  undefined,
                  type,
                );
              }),
            );
          }
        }

        // If no default value, return default object type
        // This handles the case where object selector has fields but no default
        return factory.createUnionTypeNode([
          context.serviceDomain === "scene" && context.serviceName === "apply"
            ? factory.createTypeReferenceNode(factory.createIdentifier("Partial"), [
                factory.createTypeReferenceNode(factory.createIdentifier("Record"), [
                  factory.createTypeReferenceNode(
                    factory.createIdentifier("PICK_ENTITY"),
                    undefined,
                  ),
                  factory.createKeywordTypeNode(SyntaxKind.UnknownKeyword),
                ]),
              ])
            : factory.createTypeReferenceNode(factory.createIdentifier("Record"), [
                factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
                factory.createKeywordTypeNode(SyntaxKind.UnknownKeyword),
              ]),
          factory.createParenthesizedType(
            factory.createArrayTypeNode(factory.createKeywordTypeNode(SyntaxKind.UnknownKeyword)),
          ),
        ]);
      },
      matcher: (selector: ServiceListSelector) => {
        // Only match when object is defined AND not null
        return !is.undefined(selector?.object) && selector.object !== null;
      },
    });
  });
}
