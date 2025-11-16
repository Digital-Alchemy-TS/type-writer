import { is, TServiceParams } from "@digital-alchemy/core";
import { ServiceListSelector } from "@digital-alchemy/hass";
import { factory, SyntaxKind, TypeNode } from "typescript";

export function AddonSelector({ hass, lifecycle, logger, type_build }: TServiceParams) {
  let addonNames: string[] = [];
  let addonMap: Record<string, string> = {};

  hass.socket.onConnect(async () => {
    // lifecycle.onBootstrap(async () => {
    try {
      const addons = await hass.addon.list();
      // Build map of human-readable names to slugs
      addonMap = {};
      for (const addon of addons) {
        if (addon.name && addon.slug) {
          addonMap[addon.name] = addon.slug;
        }
      }
      // Collect both name and slug, as the selector accepts either
      addonNames = addons.flatMap(addon => [addon.name, addon.slug]).filter(Boolean);
      logger.debug(
        { count: addonNames.length, mapSize: Object.keys(addonMap).length },
        "loaded addon names for type generation",
      );
    } catch (error) {
      logger.warn({ error }, "failed to fetch addons, falling back to string type");
      addonNames = [];
      addonMap = {};
    }
  });

  lifecycle.onPreInit(() => {
    type_build.selectors.register({
      generator: (): TypeNode => {
        if (is.empty(addonMap)) {
          // Fallback to string if no addons were loaded
          return factory.createKeywordTypeNode(SyntaxKind.StringKeyword);
        }
        // Use InstalledAddons[keyof InstalledAddons] to get the string union of values (slugs)
        return factory.createIndexedAccessTypeNode(
          factory.createTypeQueryNode(factory.createIdentifier("InstalledAddons")),
          factory.createTypeOperatorNode(
            SyntaxKind.KeyOfKeyword,
            factory.createTypeQueryNode(factory.createIdentifier("InstalledAddons")),
          ),
        );
      },
      matcher: (selector: ServiceListSelector) => !is.undefined(selector?.addon),
    });
  });

  return {
    getAddonMap() {
      return addonMap;
    },
  };
}
