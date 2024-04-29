import { is, TServiceParams } from "@digital-alchemy/core";
import { ServiceListFieldDescription } from "@digital-alchemy/hass";
import { factory, SyntaxKind, TypeNode } from "typescript";

export function FieldBuilder({ type_writer }: TServiceParams) {
  // #MARK: handleSelectors
  function handleSelectors(
    serviceDomain: string,
    serviceName: string,
    { selector }: ServiceListFieldDescription,
  ) {
    if ("object" in selector && selector.object === null) {
      // if (serviceDomain === "conversation") {
      // console.log({ serviceDomain, serviceName }, selector, options);
      // }
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

  // #MARK: fieldPropertySignature
  function fieldPropertySignature(
    parameterName: string,
    { selector, ...details }: ServiceListFieldDescription,
    serviceDomain: string,
    serviceName: string,
  ) {
    let node: TypeNode;
    const { domain } = selector?.entity ?? {};
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
      node = type_writer.entity.buildEntityReference(domain, selector);
    // : "option" | "option" | "option" | "option"
    else if (!is.undefined(selector?.select))
      node = factory.createUnionTypeNode(
        selector?.select.options.map((i: string | Record<"label" | "value", string>) =>
          factory.createLiteralTypeNode(factory.createStringLiteral(is.string(i) ? i : i.value)),
        ),
      );
    // : Record<string, unknown> | (unknown[]);
    else if (is.undefined(selector?.object)) {
      node = factory.createKeywordTypeNode(SyntaxKind.UnknownKeyword);
    }
    // else if (!is.undefined(selector?.))
    // : unknown
    else {
      node = handleSelectors(serviceDomain, serviceName, {
        selector,
        ...details,
      });
    }

    return type_writer.tsdoc.parameterComment(
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
