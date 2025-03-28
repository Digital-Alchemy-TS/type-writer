import { TServiceParams } from "@digital-alchemy/core";
import { ENTITY_STATE, PICK_ENTITY } from "@digital-alchemy/hass";
import { exit } from "process";

export function BuildTypes({ logger, hass, type_build }: TServiceParams) {
  async function buildServices() {
    return [await type_build.call_service()];
  }

  function buildMappings(entities: ENTITY_STATE<PICK_ENTITY>[]) {
    return [
      type_build.identifiers.area(),
      type_build.identifiers.device(),
      type_build.identifiers.label(),
      type_build.identifiers.platforms(),
      type_build.identifiers.uniqueId(),
      type_build.identifiers.zone(),
      type_build.identifiers.floor(),
      type_build.identifiers.domains(entities),
    ];
  }

  async function buildRegistry() {
    return [await type_build.domain.build()];
  }

  /**
   * - Ensure that an import from @digital-alchemy/hass exists (even if nothing in particular)
   * - Import any additional helper types
   * - Build interfaces and merge into lib
   */
  return async function doBuild() {
    try {
      const entities = await hass.fetch.getAllEntities();
      const services = await type_build.printer(await buildServices());
      const registry = await type_build.printer(await buildRegistry());
      const mappings = await type_build.printer(buildMappings(entities));

      return {
        /**
         * Mappings file contains thing (area, label, etc) -> entity list
         */
        mappings: [`import "@digital-alchemy/hass";`, ``, mappings].join(`\n`),
        /**
         * Bind state & attribute data to entities
         */
        registry: [
          `import { DynamicMergeAttributes } from "@digital-alchemy/hass";`,
          ``,
          registry,
        ].join(`\n`),
        /**
         * Bind services to hass.call & entity proxies
         */
        services: [
          `import "@digital-alchemy/hass";`,
          ``,
          `import {`,
          `  AndroidNotificationData,`,
          `  AppleNotificationData,`,
          `  NotificationData,`,
          `  PICK_ENTITY,`,
          ...(services.includes("PICK_FROM_PLATFORM") ? [`  PICK_FROM_PLATFORM,`] : []),
          `  TAreaId,`,
          `  TDeviceId,`,
          `  TLabelId,`,
          `  WeatherGetForecasts,`,
          `} from "@digital-alchemy/hass";`,
          `import { EmptyObject, LiteralUnion, RequireAtLeastOne } from "type-fest";`,
          ``,
          services,
        ].join(`\n`),
      };
    } catch (error) {
      logger.error({ error }, "failed to build data, please report");
      exit();
    }
  };
}
