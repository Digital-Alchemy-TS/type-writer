import { FIRST, is, TServiceParams } from "@digital-alchemy/core";
import {
  ALL_DOMAINS,
  ServiceListSelector,
  ServiceListServiceTarget,
  TPlatformId,
} from "@digital-alchemy/hass";
import { dump } from "js-yaml";
import { addSyntheticLeadingComment, factory, PropertySignature, SyntaxKind } from "typescript";

// * asdf
type TargetReference = {
  domain?: ALL_DOMAINS[];
  platform?: TPlatformId;
};

export function EntityReference({ logger, hass, type_build }: TServiceParams) {
  function buildTargetReference(data: TargetReference) {
    if (!is.empty(data.platform)) {
      if (!is.empty(data.domain)) {
        if (is.empty(hass.idBy.platform(data.platform, ...data.domain))) {
          return factory.createParenthesizedType(
            factory.createUnionTypeNode([
              factory.createKeywordTypeNode(SyntaxKind.NeverKeyword),
              factory.createArrayTypeNode(factory.createKeywordTypeNode(SyntaxKind.NeverKeyword)),
            ]),
          );
        }
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
      if (is.empty(hass.idBy.platform(data.platform))) {
        return factory.createParenthesizedType(
          factory.createUnionTypeNode([
            factory.createKeywordTypeNode(SyntaxKind.NeverKeyword),
            factory.createArrayTypeNode(factory.createKeywordTypeNode(SyntaxKind.NeverKeyword)),
          ]),
        );
      }
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
    if (!is.empty(data?.domain?.[FIRST]) && is.empty(hass.idBy.domain(data.domain[FIRST]))) {
      return factory.createParenthesizedType(
        factory.createUnionTypeNode([
          factory.createKeywordTypeNode(SyntaxKind.NeverKeyword),
          factory.createArrayTypeNode(factory.createKeywordTypeNode(SyntaxKind.NeverKeyword)),
        ]),
      );
    }
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
    const [entity] = is.array(target.entity) ? target.entity : [target.entity];
    return buildTargetReference({
      domain: is.array(entity?.domain) ? entity?.domain : [entity?.domain],
      platform: entity?.integration,
    });
  }
  // #MARK: createTarget
  function createTarget(target: ServiceListServiceTarget, generic: string): PropertySignature[] {
    if (is.empty(target)) {
      return [];
    }
    if (target.entity) {
      const property = factory.createPropertySignature(
        undefined,
        factory.createIdentifier("entity_id"),
        undefined,
        is.empty(generic)
          ? generateEntityList(target)
          : factory.createUnionTypeNode([
              factory.createTypeReferenceNode(factory.createIdentifier(generic), undefined),
              factory.createArrayTypeNode(
                factory.createTypeReferenceNode(factory.createIdentifier(generic), undefined),
              ),
            ]),
      );
      return [
        addSyntheticLeadingComment(
          property,
          SyntaxKind.MultiLineCommentTrivia,
          "*\n" +
            [
              "Assisted definition",
              "> ```yaml",
              ...type_build.tsdoc
                .escapeCommentContent(dump(target))
                .trim()
                .split("\n")
                .map(i => `> ${i}`),
            ]
              .map(i => ` * ${i}`)
              .join(`\n`) +
            "\n * > ```\n ",
          true,
        ),
        factory.createPropertySignature(
          undefined,
          factory.createIdentifier("device_id"),
          undefined,
          factory.createUnionTypeNode([
            factory.createTypeReferenceNode(factory.createIdentifier("TDeviceId"), undefined),
            factory.createArrayTypeNode(
              factory.createTypeReferenceNode(factory.createIdentifier("TDeviceId"), undefined),
            ),
          ]),
        ),
        factory.createPropertySignature(
          undefined,
          factory.createIdentifier("label_id"),
          undefined,
          factory.createUnionTypeNode([
            factory.createTypeReferenceNode(factory.createIdentifier("TLabelId"), undefined),
            factory.createArrayTypeNode(
              factory.createTypeReferenceNode(factory.createIdentifier("TLabelId"), undefined),
            ),
          ]),
        ),
        factory.createPropertySignature(
          undefined,
          factory.createIdentifier("area_id"),
          undefined,
          factory.createUnionTypeNode([
            factory.createTypeReferenceNode(factory.createIdentifier("TAreaId"), undefined),
            factory.createArrayTypeNode(
              factory.createTypeReferenceNode(factory.createIdentifier("TAreaId"), undefined),
            ),
          ]),
        ),
      ];
    }
    if (target.device) {
      return [];
    }
    logger.error({ target }, `createTarget doesn't know what to do with target`);
    return [];
  }
  return { buildEntityReference, createTarget };
}
