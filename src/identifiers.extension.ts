import { TServiceParams } from "@digital-alchemy/core";
import { factory } from "typescript";

export function Identifiers({ hass, type_writer }: TServiceParams) {
  return {
    area() {
      return type_writer.printer(
        "TAreaId",
        factory.createUnionTypeNode(
          hass.area.current.map(i =>
            factory.createLiteralTypeNode(
              factory.createStringLiteral(i.area_id),
            ),
          ),
        ),
      );
    },
    device() {
      return type_writer.printer(
        "TDeviceId",
        factory.createUnionTypeNode(
          hass.device.current.map(i =>
            factory.createLiteralTypeNode(factory.createStringLiteral(i.id)),
          ),
        ),
      );
    },
    floor() {
      return type_writer.printer(
        "TFloorId",
        factory.createUnionTypeNode(
          hass.floor.current.map(i =>
            factory.createLiteralTypeNode(
              factory.createStringLiteral(i.floor_id),
            ),
          ),
        ),
      );
    },
    label() {
      return type_writer.printer(
        "TLabelId",
        factory.createUnionTypeNode(
          hass.label.current.map(i =>
            factory.createLiteralTypeNode(
              factory.createStringLiteral(i.label_id),
            ),
          ),
        ),
      );
    },
    zone() {
      return type_writer.printer(
        "TZoneId",
        factory.createUnionTypeNode(
          hass.zone.current.map(i =>
            factory.createLiteralTypeNode(factory.createStringLiteral(i.id)),
          ),
        ),
      );
    },
  };
}
