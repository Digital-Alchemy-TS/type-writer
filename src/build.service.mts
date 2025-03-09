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
      const services = await buildServices();
      const registry = await buildRegistry();
      const mappings = buildMappings(entities);

      return {
        /**
         * Mappings file contains thing (area, label, etc) -> entity list
         */
        mappings: [
          // ! do not remove, required for declaration merges
          `import "@digital-alchemy/hass";`,
          ``,
          await type_build.printer(mappings),
        ].join(`\n`),
        /**
         * Bind state & attribute data to entities
         */
        registry: [
          `import { DynamicMergeAttributes } from "@digital-alchemy/hass";`,
          ``,
          await type_build.printer(registry),
        ].join(`\n`),
        /**
         * Bind services to hass.call & entity proxies
         */
        services: [
          `import "@digital-alchemy/hass";`,
          ``,
          `import { RequireAtLeastOne, EmptyObject } from "type-fest";`,
          `import {`,
          `  AndroidNotificationData,`,
          `  AppleNotificationData,`,
          `  TDeviceId,`,
          `  TLabelId,`,
          `  TAreaId,`,
          `  PICK_FROM_PLATFORM,`,
          `  NotificationData,`,
          `  PICK_ENTITY,`,
          `  WeatherGetForecasts,`,
          `} from "@digital-alchemy/hass";`,
          ``,
          await type_build.printer(services),
        ].join(`\n`),
      };
    } catch (error) {
      logger.error({ error }, "failed to build data, please report");
      exit();
    }
  };
}
