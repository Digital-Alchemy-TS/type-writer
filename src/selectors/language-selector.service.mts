import { is, TServiceParams } from "@digital-alchemy/core";
import { ServiceListSelector } from "@digital-alchemy/hass";
import { factory, TypeNode } from "typescript";

export function LanguageSelector({ lifecycle, type_build }: TServiceParams) {
  lifecycle.onPreInit(() => {
    type_build.selectors.register({
      generator: (): TypeNode => {
        return factory.createTypeReferenceNode(
          factory.createIdentifier("SupportedLanguages"),
          undefined,
        );
      },
      matcher: (selector: ServiceListSelector) => !is.undefined(selector?.language),
    });
  });
}
