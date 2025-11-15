import { TServiceParams } from "@digital-alchemy/core";
import { ServiceListFieldDescription } from "@digital-alchemy/hass";
import { factory, SyntaxKind, TypeNode } from "typescript";

export function FieldBuilder({ type_build }: TServiceParams) {
  // #MARK: handleSelectors
  function handleSelectors(
    parameterName: string,
    serviceDomain: string,
    serviceName: string,
    { selector, ...details }: ServiceListFieldDescription,
  ) {
    const context = { parameterName, serviceDomain, serviceName };

    // Try custom selectors first (they have more specific matchers)
    const handler = type_build.selectors.find(selector, details, context);
    if (handler) {
      return handler.generator(selector, details, context);
    }

    // Fallback for object with null
    if ("object" in selector && selector.object === null) {
      return factory.createKeywordTypeNode(SyntaxKind.UnknownKeyword);
    }

    // Default object selector behavior
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
    const context = { parameterName, serviceDomain, serviceName };

    // Try to find a handler in the registry
    const handler = type_build.selectors.find(selector, details, context);

    let node: TypeNode;
    if (handler) {
      node = handler.generator(selector, details, context);
    } else {
      // Fallback to unknown
      node = factory.createKeywordTypeNode(SyntaxKind.UnknownKeyword);
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
    handleSelectors, // Export for object selector fallback
  };
}
