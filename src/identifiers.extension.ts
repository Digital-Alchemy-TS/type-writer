import { is, TServiceParams } from "@digital-alchemy/core";
import { domain, ENTITY_STATE, PICK_ENTITY } from "@digital-alchemy/hass";
import { factory, PropertySignature, SyntaxKind } from "typescript";

export function Identifiers({ hass, type_build }: TServiceParams) {
  function registryType(type: string, value: PropertySignature[]) {
    return factory.createPropertySignature(
      undefined,
      factory.createIdentifier(type),
      undefined,
      factory.createTypeLiteralNode(value),
    );
  }

  function entityUnion(list: PICK_ENTITY[]) {
    if (is.empty(list)) {
      return factory.createKeywordTypeNode(SyntaxKind.NeverKeyword);
    }
    return factory.createUnionTypeNode(
      list.map(i => factory.createLiteralTypeNode(factory.createStringLiteral(i))),
    );
  }

  function uniquePlatforms() {
    return is.unique(hass.entity.registry.current.map(i => i.platform));
  }

  function itemObject(name: string, entities: PICK_ENTITY[]) {
    return factory.createPropertySignature(
      undefined,
      factory.createIdentifier(name),
      undefined,
      entityUnion(entities),
    );
  }

  function RegistryDetails() {
    return type_build.printer(
      "REGISTRY_SETUP",
      factory.createTypeLiteralNode([
        registryType(
          "area",
          hass.area.current.map(({ area_id }) =>
            itemObject(`_${area_id}`, hass.idBy.area(area_id)),
          ),
        ),
        registryType(
          "platform",
          uniquePlatforms().map(platform =>
            itemObject(`_${platform}`, hass.idBy.platform(platform)),
          ),
        ),
        registryType(
          "label",
          hass.label.current.map(({ label_id }) =>
            itemObject(`_${label_id}`, hass.idBy.label(label_id)),
          ),
        ),
        registryType(
          "floor",
          hass.floor.current.map(({ floor_id }) =>
            itemObject(`_${floor_id}`, hass.idBy.floor(floor_id)),
          ),
        ),
        registryType(
          "device",
          hass.device.current.map(({ id }) => itemObject(`_${id}`, hass.idBy.device(id))),
        ),
      ]),
    );
  }

  return {
    area() {
      return type_build.printer(
        "TAreaId",
        is.empty(hass.area.current)
          ? factory.createKeywordTypeNode(SyntaxKind.StringKeyword)
          : factory.createUnionTypeNode(
              hass.area.current.map(i =>
                factory.createLiteralTypeNode(factory.createStringLiteral(i.area_id)),
              ),
            ),
      );
    },
    device() {
      return type_build.printer(
        "TDeviceId",
        is.empty(hass.device.current)
          ? factory.createKeywordTypeNode(SyntaxKind.StringKeyword)
          : factory.createUnionTypeNode(
              hass.device.current.map(i =>
                factory.createLiteralTypeNode(factory.createStringLiteral(i.id)),
              ),
            ),
      );
    },
    domains(list: ENTITY_STATE<PICK_ENTITY>[]) {
      return type_build.printer(
        "TRawDomains",
        factory.createUnionTypeNode(
          is
            .unique(list.map(i => domain(i.entity_id)))
            .map(i => factory.createLiteralTypeNode(factory.createStringLiteral(i))),
        ),
      );
    },
    entityIds(list: ENTITY_STATE<PICK_ENTITY>[]) {
      return type_build.printer(
        "TRawEntityIds",
        factory.createUnionTypeNode(
          list.map(i => factory.createLiteralTypeNode(factory.createStringLiteral(i.entity_id))),
        ),
      );
    },
    floor() {
      return type_build.printer(
        "TFloorId",
        is.empty(hass.floor.current)
          ? factory.createKeywordTypeNode(SyntaxKind.StringKeyword)
          : factory.createUnionTypeNode(
              hass.floor.current.map(i =>
                factory.createLiteralTypeNode(factory.createStringLiteral(i.floor_id)),
              ),
            ),
      );
    },
    label() {
      return type_build.printer(
        "TLabelId",
        is.empty(hass.label.current)
          ? factory.createKeywordTypeNode(SyntaxKind.StringKeyword)
          : factory.createUnionTypeNode(
              hass.label.current.map(i =>
                factory.createLiteralTypeNode(factory.createStringLiteral(i.label_id)),
              ),
            ),
      );
    },
    platforms() {
      return type_build.printer(
        "TPlatformId",
        factory.createUnionTypeNode(
          uniquePlatforms().map(i => factory.createLiteralTypeNode(factory.createStringLiteral(i))),
        ),
      );
    },
    registryDetails: RegistryDetails,
    uniqueId() {
      return type_build.printer(
        "TUniqueID",
        factory.createUnionTypeNode(
          hass.entity.registry.current
            .filter(
              i => !is.empty(i.entity_id) && (is.number(i.unique_id) || !is.empty(i.unique_id)),
            )
            .map(item =>
              factory.createLiteralTypeNode(
                is.number(item.unique_id)
                  ? factory.createNumericLiteral(String(item.unique_id))
                  : factory.createStringLiteral(item.unique_id),
              ),
            ),
        ),
      );
    },
    uniqueIdMapping() {
      return type_build.printer(
        "TUniqueIDMapping",
        factory.createTypeLiteralNode(
          hass.entity.registry.current
            .filter(
              i => !is.empty(i.entity_id) && (is.number(i.unique_id) || !is.empty(i.unique_id)),
            )
            .map(item =>
              factory.createPropertySignature(
                undefined,
                factory.createStringLiteral(item.entity_id),
                undefined,
                factory.createLiteralTypeNode(
                  is.number(item.unique_id)
                    ? factory.createNumericLiteral(String(item.unique_id))
                    : factory.createStringLiteral(item.unique_id),
                ),
              ),
            ),
        ),
      );
    },
    zone() {
      return type_build.printer(
        "TZoneId",
        is.empty(hass.zone.current)
          ? factory.createKeywordTypeNode(SyntaxKind.StringKeyword)
          : factory.createUnionTypeNode(
              hass.zone.current.map(i =>
                factory.createLiteralTypeNode(factory.createStringLiteral(i.id)),
              ),
            ),
      );
    },
  };
}
