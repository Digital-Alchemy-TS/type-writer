import { TServiceParams } from "@digital-alchemy/core";
import { factory, TypeNode, TypeParameterDeclaration } from "typescript";

export function WeatherForecastsOverride({ lifecycle, type_build }: TServiceParams) {
  lifecycle.onPreInit(() => {
    type_build.serviceOverrides.register({
      generator: (domain: string, serviceName: string) => {
        // https://github.com/Digital-Alchemy-TS/hass/issues/66
        const genericIdentities = "ENTITIES";
        const defaultReturnType: TypeNode = factory.createTypeReferenceNode(
          factory.createIdentifier("Record"),
          [
            factory.createTypeReferenceNode(factory.createIdentifier("ENTITIES"), undefined),
            factory.createTypeLiteralNode([
              factory.createPropertySignature(
                undefined,
                factory.createIdentifier("forecast"),
                undefined,
                factory.createArrayTypeNode(
                  factory.createTypeReferenceNode(
                    factory.createIdentifier("WeatherGetForecasts"),
                    undefined,
                  ),
                ),
              ),
            ]),
          ],
        );
        const genericParams: TypeParameterDeclaration[] = [
          factory.createTypeParameterDeclaration(
            undefined,
            factory.createIdentifier(genericIdentities),
            factory.createTypeReferenceNode(factory.createIdentifier("PICK_ENTITY"), [
              factory.createLiteralTypeNode(factory.createStringLiteral("weather")),
            ]),
            undefined,
          ),
        ];

        return {
          defaultReturnType,
          genericIdentities,
          genericParams,
        };
      },
      matcher: (domain: string, serviceName: string) => {
        return domain === "weather" && serviceName === "get_forecasts";
      },
    });
  });
}
