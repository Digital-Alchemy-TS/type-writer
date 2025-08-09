import { is, TServiceParams } from "@digital-alchemy/core";
import { domain, ENTITY_STATE, PICK_ENTITY } from "@digital-alchemy/hass";
import { factory, SyntaxKind } from "typescript";

export function Identifiers({ hass, logger }: TServiceParams) {
  function uniquePlatforms() {
    return is.unique(hass.entity.registry.current.map(i => i.platform));
  }

  return {
    /**
     * mapping of area_id: entity_id (union list)
     *
     * note: keys prefixed with underscore
     */
    area() {
      return factory.createInterfaceDeclaration(
        [factory.createToken(SyntaxKind.ExportKeyword)],
        factory.createIdentifier("HassAreaMapping"),
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
    /**
     * mapping of device id: entity_id (union list)
     *
     * note: keys prefixed with underscore
     */
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
    /**
     * mapping of domain: entity_id (union list)
     */
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
    /**
     * mapping of floor_id: entity_id (union list)
     *
     * note: keys prefixed with underscore
     */
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
    /**
     * mapping of label_id: entity_id (union list)
     *
     * note: keys prefixed with underscore
     */
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
    /**
     * mapping of platform: entity_id (union list)
     *
     * note: keys prefixed with underscore
     */
    platforms() {
      return factory.createInterfaceDeclaration(
        [factory.createToken(SyntaxKind.ExportKeyword)],
        factory.createIdentifier("HassPlatformMapping"),
        undefined,
        undefined,
        uniquePlatforms().map(platform => {
          const list = hass.idBy.platform(platform);
          return factory.createPropertySignature(
            undefined,
            factory.createStringLiteral(`_${platform}`),
            undefined,
            is.empty(list)
              ? factory.createKeywordTypeNode(SyntaxKind.NeverKeyword)
              : factory.createUnionTypeNode(
                  hass.idBy
                    .platform(platform)
                    .map(id => factory.createLiteralTypeNode(factory.createStringLiteral(id))),
                ),
          );
        }),
      );
    },
    /**
     * mapping of unique_id: entity_id (single)
     */
    uniqueId() {
      const used = new Map<string, string>();
      const base = hass.entity.registry.current
        // enforce has entity_id + unique id
        // ? when would an entity id be empty from inside type-writer?
        .filter(i => !is.empty(i.entity_id) && (is.number(i.unique_id) || !is.empty(i.unique_id)));
      const list = base.filter(i => {
        // @ts-expect-error need to add an update entity to dev-types
        // this is valid
        if (domain(i.entity_id) === "update") {
          // if there is an ID collision between an update entity any something else, do not print update entity
          // hass.idBy.uniqueId implements matching logic to ignore the update entity
          return !base.find(
            item => item.unique_id === i.unique_id && item.entity_id !== i.entity_id,
          );
        }

        if (used.has(i.unique_id)) {
          // dev note: never actually seen this happen after filtering out update entities
          // there is a matching runtime warning on the unique_id lookup if it does happen
          logger.warn(
            { ids: [used.get(i.unique_id), i.entity_id] },
            `duplicate unique_id {%s}`,
            i.unique_id,
          );
          return false;
        }
        used.set(i.unique_id, i.entity_id);
        return true;
      });

      return factory.createInterfaceDeclaration(
        [factory.createToken(SyntaxKind.ExportKeyword)],
        factory.createIdentifier("HassUniqueIdMapping"),
        undefined,
        undefined,
        list.map(entity =>
          factory.createPropertySignature(
            undefined,
            factory.createStringLiteral(String(entity.unique_id)),
            undefined,
            factory.createLiteralTypeNode(factory.createStringLiteral(entity.entity_id)),
          ),
        ),
      );
    },
    /**
     * mapping of zone_id: true
     * the true part might change if zones ever do anything useful
     *
     * note: keys prefixed with underscore
     */
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
