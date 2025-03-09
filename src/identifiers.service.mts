import { is, TServiceParams } from "@digital-alchemy/core";
import { domain, ENTITY_STATE, PICK_ENTITY } from "@digital-alchemy/hass";
import { factory, SyntaxKind } from "typescript";

export function Identifiers({ hass }: TServiceParams) {
  function uniquePlatforms() {
    return is.unique(hass.entity.registry.current.map(i => i.platform));
  }

  return {
    area() {
      return factory.createInterfaceDeclaration(
        [factory.createToken(SyntaxKind.ExportKeyword)],
        factory.createIdentifier("HassUniqueIdMapping"),
        undefined,
        undefined,
        hass.area.current.map(area =>
          factory.createPropertySignature(
            undefined,
            factory.createStringLiteral(`_${area.area_id}`),
            undefined,
            is.empty(hass.idBy.area(area.area_id))
              ? factory.createKeywordTypeNode(SyntaxKind.NeverKeyword)
              : factory.createUnionTypeNode(
                  hass.idBy
                    .area(area.area_id)
                    .map(id => factory.createLiteralTypeNode(factory.createStringLiteral(id))),
                ),
          ),
        ),
      );
    },
    device() {
      return factory.createInterfaceDeclaration(
        [factory.createToken(SyntaxKind.ExportKeyword)],
        factory.createIdentifier("HassDeviceMapping"),
        undefined,
        undefined,
        hass.device.current.map(device =>
          factory.createPropertySignature(
            undefined,
            factory.createStringLiteral(`_${device.id}`),
            undefined,
            is.empty(hass.idBy.device(device.id))
              ? factory.createKeywordTypeNode(SyntaxKind.NeverKeyword)
              : factory.createUnionTypeNode(
                  hass.idBy
                    .device(device.id)
                    .map(id => factory.createLiteralTypeNode(factory.createStringLiteral(id))),
                ),
          ),
        ),
      );
    },
    domains(list: ENTITY_STATE<PICK_ENTITY>[]) {
      return factory.createInterfaceDeclaration(
        [factory.createToken(SyntaxKind.ExportKeyword)],
        factory.createIdentifier("HassDomainMapping"),
        undefined,
        undefined,
        is
          .unique(list.map(i => domain(i.entity_id)))
          .map(name =>
            factory.createPropertySignature(
              undefined,
              factory.createStringLiteral(name),
              undefined,
              factory.createUnionTypeNode(
                list
                  .filter(i => domain(i) === name)
                  .map(entity =>
                    factory.createLiteralTypeNode(factory.createStringLiteral(entity.entity_id)),
                  ),
              ),
            ),
          ),
      );
    },
    floor() {
      return factory.createInterfaceDeclaration(
        [factory.createToken(SyntaxKind.ExportKeyword)],
        factory.createIdentifier("HassFloorMapping"),
        undefined,
        undefined,
        hass.floor.current.map(floor =>
          factory.createPropertySignature(
            undefined,
            factory.createStringLiteral(`_${floor.floor_id}`),
            undefined,
            is.empty(hass.idBy.floor(floor.floor_id))
              ? factory.createKeywordTypeNode(SyntaxKind.NeverKeyword)
              : factory.createUnionTypeNode(
                  hass.idBy
                    .floor(floor.floor_id)
                    .map(id => factory.createLiteralTypeNode(factory.createStringLiteral(id))),
                ),
          ),
        ),
      );
    },
    label() {
      return factory.createInterfaceDeclaration(
        [factory.createToken(SyntaxKind.ExportKeyword)],
        factory.createIdentifier("HassLabelMapping"),
        undefined,
        undefined,
        hass.label.current.map(label =>
          factory.createPropertySignature(
            undefined,
            factory.createStringLiteral(`_${label.label_id}`),
            undefined,
            is.empty(hass.idBy.label(label.label_id))
              ? factory.createKeywordTypeNode(SyntaxKind.NeverKeyword)
              : factory.createUnionTypeNode(
                  hass.idBy
                    .label(label.label_id)
                    .map(id => factory.createLiteralTypeNode(factory.createStringLiteral(id))),
                ),
          ),
        ),
      );
    },
    platforms() {
      return factory.createInterfaceDeclaration(
        [factory.createToken(SyntaxKind.ExportKeyword)],
        factory.createIdentifier("HassPlatformMapping"),
        undefined,
        undefined,
        uniquePlatforms().map(platform =>
          factory.createPropertySignature(
            undefined,
            factory.createStringLiteral(`_${platform}`),
            undefined,
            factory.createUnionTypeNode(
              hass.idBy
                .platform(platform)
                .map(id => factory.createLiteralTypeNode(factory.createStringLiteral(id))),
            ),
          ),
        ),
      );
    },
    uniqueId() {
      return factory.createInterfaceDeclaration(
        [factory.createToken(SyntaxKind.ExportKeyword)],
        factory.createIdentifier("HassUniqueIdMapping"),
        undefined,
        undefined,
        hass.entity.registry.current
          // enforce has entity_id + unique id
          // ? when would an entity id be empty from inside type-writer?
          .filter(i => !is.empty(i.entity_id) && (is.number(i.unique_id) || !is.empty(i.unique_id)))
          .map(entity =>
            factory.createPropertySignature(
              undefined,
              factory.createStringLiteral(entity.unique_id),
              undefined,
              factory.createLiteralTypeNode(factory.createStringLiteral(entity.entity_id)),
            ),
          ),
      );
    },
    zone() {
      return factory.createInterfaceDeclaration(
        [factory.createToken(SyntaxKind.ExportKeyword)],
        factory.createIdentifier("HassZoneMapping"),
        undefined,
        undefined,
        hass.zone.current.map(zone =>
          factory.createPropertySignature(
            undefined,
            factory.createStringLiteral(`_${zone.id}`),
            undefined,
            factory.createLiteralTypeNode(factory.createTrue()),
          ),
        ),
      );
    },
  };
}
