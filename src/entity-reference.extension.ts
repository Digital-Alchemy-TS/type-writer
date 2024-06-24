/* eslint-disable unicorn/consistent-function-scoping */
import { FIRST, is, TServiceParams } from "@digital-alchemy/core";
import {
  ALL_DOMAINS,
  ServiceListSelector,
  ServiceListServiceTarget,
  TPlatformId,
} from "@digital-alchemy/hass";
import { dump } from "js-yaml";
import { addSyntheticLeadingComment, factory, SyntaxKind } from "typescript";

// * asdf
type TargetReference = {
  domain?: ALL_DOMAINS[];
  platform?: TPlatformId;
};

export function EntityReference({ logger, type_build }: TServiceParams) {
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

  // #MARK: buildEntityReference
  function buildEntityReference(selector: ServiceListSelector) {
    const entity = selector.entity;
    return buildTargetReference({
      domain: is.empty(entity?.domain) ? [] : [entity.domain].flat(),
      platform: entity?.integration,
    });
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
    logger.error({ target }, `createTarget doesn't know what to do with target`);
    return undefined;
  }

  function buildEntitySetup() {
    return type_build.printer("ENTITY_SETUP", undefined);
  }

  return { buildEntityReference, buildEntitySetup, createTarget };
}
