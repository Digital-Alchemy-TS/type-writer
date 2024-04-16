import { is, TServiceParams } from "@digital-alchemy/core";
import { factory, SyntaxKind } from "typescript";

export function Identifiers({ hass, type_writer }: TServiceParams) {
  return {
    area() {
      return type_writer.printer(
        "TAreaId",
        is.empty(hass.area.current)
          ? factory.createKeywordTypeNode(SyntaxKind.StringKeyword)
          : factory.createUnionTypeNode(
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
        is.empty(hass.device.current)
          ? factory.createKeywordTypeNode(SyntaxKind.StringKeyword)
          : factory.createUnionTypeNode(
              hass.device.current.map(i =>
                factory.createLiteralTypeNode(
                  factory.createStringLiteral(i.id),
                ),
              ),
            ),
      );
    },
    floor() {
      return type_writer.printer(
        "TFloorId",
        is.empty(hass.floor.current)
          ? factory.createKeywordTypeNode(SyntaxKind.StringKeyword)
          : factory.createUnionTypeNode(
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
        is.empty(hass.label.current)
          ? factory.createKeywordTypeNode(SyntaxKind.StringKeyword)
          : factory.createUnionTypeNode(
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
        is.empty(hass.zone.current)
          ? factory.createKeywordTypeNode(SyntaxKind.StringKeyword)
          : factory.createUnionTypeNode(
              hass.zone.current.map(i =>
                factory.createLiteralTypeNode(
                  factory.createStringLiteral(i.id),
                ),
              ),
            ),
      );
    },
  };
}
