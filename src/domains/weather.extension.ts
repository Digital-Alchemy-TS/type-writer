import { TServiceParams } from "@digital-alchemy/core";
import { factory, SyntaxKind } from "typescript";

export function WeatherBuilder({ type_writer }: TServiceParams) {
  // @ts-expect-error ignore this
  type_writer.domain.register<"weather">({
    async attributes(data) {
      return type_writer.ast.attributes({
        data: data.attributes,
        literal: [
          "temperature_unit",
          "pressure_unit",
          "wind_speed_unit",
          "visibility_unit",
          "precipitation_unit",
        ],
      });
    },
    domain: "weather",
    state() {
      return factory.createKeywordTypeNode(SyntaxKind.StringKeyword);
    },
  });
}
