import { is, TServiceParams } from "@digital-alchemy/core";
import { ConfigEntry, ServiceListSelector } from "@digital-alchemy/hass";
import { factory, SyntaxKind, TypeNode } from "typescript";

export function ConfigEntrySelector({ hass, lifecycle, logger, type_build }: TServiceParams) {
  let configEntryIds: string[] = [];

  hass.socket.onConnect(async () => {
    try {
      const entries = (await hass.configure.get()) as ConfigEntry[];
      configEntryIds = entries.map(entry => entry.entry_id).filter(Boolean);
      logger.debug({ count: configEntryIds.length }, "loaded config entry IDs for type generation");
    } catch (error) {
      logger.warn({ error }, "failed to fetch config entries, falling back to string type");
      configEntryIds = [];
    }
  });

  lifecycle.onPreInit(() => {
    type_build.selectors.register({
      generator: (): TypeNode => {
        if (is.empty(configEntryIds)) {
          return factory.createKeywordTypeNode(SyntaxKind.StringKeyword);
        }
        return factory.createUnionTypeNode(
          configEntryIds.map(id => factory.createLiteralTypeNode(factory.createStringLiteral(id))),
        );
      },
      matcher: (selector: ServiceListSelector) => !is.undefined(selector?.config_entry),
    });
  });
}
