import { is, TServiceParams } from "@digital-alchemy/core";
import { ServiceListSelector } from "@digital-alchemy/hass";
import { factory, SyntaxKind, TypeNode } from "typescript";

export function ThemeSelector({ hass, lifecycle, logger, type_build }: TServiceParams) {
  let themeNames: string[] = [];

  hass.socket.onConnect(async () => {
    try {
      const themes = await hass.frontend.getThemes();
      themeNames = Object.keys(themes).filter(Boolean);
      logger.debug({ count: themeNames.length }, "loaded theme names for type generation");
    } catch (error) {
      logger.warn({ error }, "failed to fetch themes, falling back to string type");
      themeNames = [];
    }
  });

  lifecycle.onPreInit(() => {
    type_build.selectors.register({
      generator: (): TypeNode => {
        if (is.empty(themeNames)) {
          return factory.createKeywordTypeNode(SyntaxKind.StringKeyword);
        }
        return factory.createUnionTypeNode(
          themeNames.map(name => factory.createLiteralTypeNode(factory.createStringLiteral(name))),
        );
      },
      matcher: (selector: ServiceListSelector) => !is.undefined(selector?.theme),
    });
  });
}
