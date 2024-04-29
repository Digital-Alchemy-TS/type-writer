/* eslint-disable unicorn/consistent-function-scoping */
import { FIRST, is, TServiceParams } from "@digital-alchemy/core";
import {
  ALL_DOMAINS,
  ServiceListSelector,
  ServiceListServiceTarget,
  TPlatformId,
} from "@digital-alchemy/hass";
import { dump } from "js-yaml";
import { addSyntheticLeadingComment, factory, SyntaxKind, TypeNode } from "typescript";

// * asdf
type TargetReference = {
  domain?: ALL_DOMAINS[];
  platform?: TPlatformId;
};

export function EntityReference({ logger }: TServiceParams) {
  function buildTargetReference(data: TargetReference) {
    if (!is.empty(data.platform)) {
      if (!is.empty(data.domain)) {
        // * PICK_FROM_PLATFORM<"platform", ..."domain"> | PICK_FROM_PLATFORM<"platform", ..."domain">[]
        return factory.createParenthesizedType(
          factory.createUnionTypeNode([
            factory.createTypeReferenceNode(factory.createIdentifier("PICK_FROM_PLATFORM"), [
              factory.createLiteralTypeNode(factory.createStringLiteral(data.platform)),
              ...data.domain.map(domain =>
                factory.createLiteralTypeNode(factory.createStringLiteral(domain)),
              ),
            ]),
            factory.createArrayTypeNode(
              factory.createTypeReferenceNode(factory.createIdentifier("PICK_FROM_PLATFORM"), [
                factory.createLiteralTypeNode(factory.createStringLiteral(data.platform)),
                ...data.domain.map(domain =>
                  factory.createLiteralTypeNode(factory.createStringLiteral(domain)),
                ),
              ]),
            ),
          ]),
        );
      }
      // * PICK_FROM_PLATFORM<"platform"> | PICK_FROM_PLATFORM<"platform">[]
      return factory.createParenthesizedType(
        factory.createUnionTypeNode([
          factory.createTypeReferenceNode(factory.createIdentifier("PICK_FROM_PLATFORM"), [
            factory.createLiteralTypeNode(factory.createStringLiteral(data.platform)),
          ]),
          factory.createArrayTypeNode(
            factory.createTypeReferenceNode(factory.createIdentifier("PICK_FROM_PLATFORM"), [
              factory.createLiteralTypeNode(factory.createStringLiteral(data.platform)),
            ]),
          ),
        ]),
      );
    }
    // * PICK_ENTITY<..."domain"> | PICK_ENTITY<..."domain">[]
    return factory.createParenthesizedType(
      factory.createUnionTypeNode([
        factory.createTypeReferenceNode(
          factory.createIdentifier("PICK_ENTITY"),
          data?.domain?.map(domain =>
            factory.createLiteralTypeNode(factory.createStringLiteral(domain)),
          ),
        ),
        factory.createArrayTypeNode(
          factory.createTypeReferenceNode(
            factory.createIdentifier("PICK_ENTITY"),
            data?.domain?.map(domain =>
              factory.createLiteralTypeNode(factory.createStringLiteral(domain)),
            ),
          ),
        ),
      ]),
    );
  }

  // #MARK: generateEntityList
  function generateEntityList(target: ServiceListServiceTarget) {
    return buildTargetReference({
      domain: target?.entity?.[FIRST]?.domain,
      platform: target?.entity?.[FIRST]?.integration,
    });
  }
  // #MARK: createTarget
  function createTarget(target: ServiceListServiceTarget) {
    if (is.empty(target)) {
      return undefined;
    }
    if (target.entity) {
      const property = factory.createPropertySignature(
        undefined,
        factory.createIdentifier("entity_id"),
        undefined,
        generateEntityList(target),
      );
      return addSyntheticLeadingComment(
        property,
        SyntaxKind.MultiLineCommentTrivia,
        "*\n" +
          [
            "Assisted definition",
            "> ```yaml",
            ...dump(target)
              .trim()
              .split("\n")
              .map(i => `> ${i}`),
          ]
            .map(i => ` * ${i}`)
            .join(`\n`) +
          "\n * > ```\n ",
        true,
      );
    }
    if (target.integration) {
      return undefined;
    }
    if (target.device) {
      return undefined;
    }
    logger.error(
      { target },
      `this#createTarget doesn't know what to do with target. Report as bug with this log line`,
    );
    return undefined;
  }

  // #MARK: buildEntityReference
  function buildEntityReference(domain: string, selector: ServiceListSelector) {
    let node: TypeNode;
    const type = is.empty(domain)
      ? factory.createTypeReferenceNode(factory.createIdentifier("PICK_ENTITY"))
      : factory.createTypeReferenceNode(factory.createIdentifier("PICK_ENTITY"), [
          factory.createLiteralTypeNode(factory.createStringLiteral(domain)),
        ]);

    if (selector?.entity?.multiple) {
      node = factory.createArrayTypeNode(type);
    } else {
      node = is.empty(domain)
        ? type
        : factory.createParenthesizedType(
            factory.createUnionTypeNode([type, factory.createArrayTypeNode(type)]),
          );
    }
    return node;
  }

  return { buildEntityReference, createTarget };
}
