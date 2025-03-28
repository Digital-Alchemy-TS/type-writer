import { is, TServiceParams } from "@digital-alchemy/core";
import { ServiceListFieldDescription, ServiceListSelector } from "@digital-alchemy/hass";
import { factory, SyntaxKind, TypeNode } from "typescript";

export function FieldBuilder({ type_build }: TServiceParams) {
  // #MARK: handleSelectors
  function handleSelectors(
    parameterName: string,
    serviceDomain: string,
    serviceName: string,
    { selector }: ServiceListFieldDescription,
  ) {
    if ("object" in selector && selector.object === null) {
      if (serviceDomain === "notify" && parameterName === "data") {
        return factory.createIntersectionTypeNode([
          factory.createTypeReferenceNode(factory.createIdentifier("NotificationData"), undefined),
          factory.createParenthesizedType(
            factory.createUnionTypeNode([
              factory.createTypeReferenceNode(
                factory.createIdentifier("AndroidNotificationData"),
                undefined,
              ),
              factory.createTypeReferenceNode(
                factory.createIdentifier("AppleNotificationData"),
                undefined,
              ),
            ]),
          ),
        ]);
      }
      return factory.createKeywordTypeNode(SyntaxKind.UnknownKeyword);
    }

    return factory.createUnionTypeNode([
      serviceDomain === "scene" && serviceName === "apply"
        ? factory.createTypeReferenceNode(factory.createIdentifier("Partial"), [
            factory.createTypeReferenceNode(factory.createIdentifier("Record"), [
              factory.createTypeReferenceNode(factory.createIdentifier("PICK_ENTITY"), undefined),
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
  }

  /**
   * Object selectors are a bit of a catchall for a variety of odd things
   *
   * dev note: it may be better to pull in quicktype as a next step, instead of further patching this logic
   * this seems like it could be anything, only going to account for some basics here
   */
  function objectSelector(
    serviceName: string,
    parameterName: string,
    serviceDomain: string,
    selector: ServiceListSelector,
    details: ServiceListFieldDescription,
  ) {
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

    return handleSelectors(parameterName, serviceDomain, serviceName, {
      selector,
      ...details,
    });
  }

  // #MARK: fieldPropertySignature
  /**
   * Used to determine the type for individual named function params.
   */
  function fieldPropertySignature(
    parameterName: string,
    { selector, ...details }: ServiceListFieldDescription,
    serviceDomain: string,
    serviceName: string,
  ) {
    let node: TypeNode;
    // : boolean
    if (!is.undefined(selector?.boolean))
      node = factory.createKeywordTypeNode(SyntaxKind.BooleanKeyword);
    // : number
    else if (!is.undefined(selector?.number))
      node = factory.createKeywordTypeNode(SyntaxKind.NumberKeyword);
    // : string
    else if (!is.undefined(selector?.text) || !is.undefined(selector?.time))
      node = factory.createKeywordTypeNode(SyntaxKind.StringKeyword);
    // string | `domain.${keyof typeof ENTITY_SETUP.domain}`
    else if (!is.undefined(selector?.entity))
      // some combination of: PICK_ENTITY | PICK_ENTITY[] | PICK_ENTITY<"domain"> | PICK_ENTITY<"domain">[]
      node = type_build.entity.buildEntityReference(selector);
    // : "option" | "option" | "option" | "option"
    else if (!is.undefined(selector?.select)) {
      node = is.empty(selector?.select.options)
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
    }
    // : Record<string, unknown> | (unknown[]);
    else if (is.undefined(selector?.object))
      node = factory.createKeywordTypeNode(SyntaxKind.UnknownKeyword);
    // else if (!is.undefined(selector?.))
    // : unknown
    else {
      node = objectSelector(serviceName, parameterName, serviceDomain, selector, details);
    }

    return type_build.tsdoc.parameterComment(
      factory.createPropertySignature(
        undefined,
        factory.createIdentifier(parameterName),
        details.required ? undefined : factory.createToken(SyntaxKind.QuestionToken),
        node,
      ),
      parameterName,
      { selector, ...details },
    );
  }

  return {
    fieldPropertySignature,
  };
}
