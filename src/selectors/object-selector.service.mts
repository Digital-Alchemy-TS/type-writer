import { is, TServiceParams } from "@digital-alchemy/core";
import { ServiceListFieldDescription, ServiceListSelector } from "@digital-alchemy/hass";
import { factory, SyntaxKind, TypeNode } from "typescript";

export function ObjectSelector({ lifecycle, type_build }: TServiceParams) {
  lifecycle.onPreInit(() => {
    type_build.selectors.register({
      matcher: (selector: ServiceListSelector) => !is.undefined(selector?.object),
      generator: (
        selector: ServiceListSelector,
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
              : factory.createArrayTypeNode(factory.createKeywordTypeNode(SyntaxKind.UnknownKeyword));
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

        // Fallback to handleSelectors for object with null
        return type_build.fields.handleSelectors(
          context.parameterName,
          context.serviceDomain,
          context.serviceName,
          { selector, ...details },
        );
      },
    });
  });
}
