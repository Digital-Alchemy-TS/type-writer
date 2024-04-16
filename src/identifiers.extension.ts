/* eslint-disable unicorn/consistent-function-scoping */
import { TServiceParams } from "@digital-alchemy/core";
import { PICK_ENTITY } from "@digital-alchemy/hass";
import { factory, PropertySignature } from "typescript";

export function Identifiers({ hass, type_writer }: TServiceParams) {
  function RegistryType(type: string, value: PropertySignature[]) {
    return factory.createPropertySignature(
      undefined,
      factory.createIdentifier(type),
      undefined,
      factory.createTypeLiteralNode(value),
    );
  }

  function EntityObject(list: PICK_ENTITY[]) {
    return factory.createTypeLiteralNode(
      list.map(i =>
        factory.createPropertySignature(
          undefined,
          factory.createStringLiteral(i),
          undefined,
          factory.createLiteralTypeNode(factory.createTrue()),
        ),
      ),
    );
  }

  function ItemObject(name: string, entities: PICK_ENTITY[]) {
    return factory.createPropertySignature(
      undefined,
      factory.createIdentifier(name),
      undefined,
      EntityObject(entities),
    );
  }

  return function () {
    return type_writer.printer(
      "REGISTRY_SETUP",
      factory.createTypeLiteralNode([
        RegistryType(
          "area",
          hass.area.current.map(({ area_id }) =>
            ItemObject(area_id, hass.entity.byArea(area_id)),
          ),
        ),
        RegistryType(
          "label",
          hass.label.current.map(({ label_id }) =>
            ItemObject(label_id, hass.entity.byLabel(label_id)),
          ),
        ),
        RegistryType(
          "floor",
          hass.floor.current.map(({ floor_id }) =>
            ItemObject(floor_id, hass.entity.byFloor(floor_id)),
          ),
        ),
        RegistryType(
          "device",
          hass.device.current.map(({ id }) =>
            ItemObject(id, hass.entity.byDevice(id)),
          ),
        ),
      ]),
    );
  };
}
