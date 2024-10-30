import { TServiceParams } from "@digital-alchemy/core";
import { exit } from "process";

const PICK_FROM_PLATFORM = `type PICK_FROM_PLATFORM<
  ID extends TPlatformId,
  DOMAIN extends TRawDomains = TRawDomains,
> = Extract<REGISTRY_SETUP["platform"][\`_\${ID}\`], PICK_ENTITY<DOMAIN>>;`;

export function BuildTypes({ logger, hass, type_build, internal }: TServiceParams) {
  // see file - libs/home-assistant/src/dynamic.ts
  return async function doBuild() {
    logger.info(`Pulling information`);
    const entities = await hass.fetch.getAllEntities();
    const entitySetup = {};
    entities.forEach(i => internal.utils.object.set(entitySetup, i.entity_id, i));

    try {
      logger.debug("building [ENTITY_SETUP]");
      const ENTITY_SETUP = await type_build.domain.build();
      logger.debug("building [iCallService]");
      const typeInterface = await type_build.call_service();

      return [
        `// This file is generated, and is automatically updated as a npm post install step`,
        "// Do not edit this file, it will only affect type definitions, not functional code",
        `import { RequireAtLeastOne } from "type-fest";`,
        `import {`,
        `  AndroidNotificationData,`,
        `  AppleNotificationData,`,
        `  NotificationData,`,
        `  PICK_ENTITY,`,
        `  WeatherGetForecasts,`,
        `} from "./helpers";`,
        ``,
        PICK_FROM_PLATFORM,
        ``,
        `// #MARK: ENTITY_SETUP`,
        ENTITY_SETUP,
        ``,
        `// #MARK: iCallService`,
        typeInterface,
        ``,
        `// #MARK: REGISTRY_SETUP`,
        type_build.identifiers.registryDetails(),
        ``,
        `// #MARK: TAreaId`,
        type_build.identifiers.area(),
        ``,
        `// #MARK: TDeviceId`,
        type_build.identifiers.device(),
        ``,
        `// #MARK: TFloorId`,
        type_build.identifiers.floor(),
        ``,
        `// #MARK: TLabelId`,
        type_build.identifiers.label(),
        ``,
        `// #MARK: TZoneId`,
        type_build.identifiers.zone(),
        ``,
        `// #MARK: TUniqueIDMapping`,
        type_build.identifiers.uniqueIdMapping(),
        ``,
        `// #MARK: TUniqueID`,
        type_build.identifiers.uniqueId(),
        ``,
        `// #MARK: TRawEntityIds`,
        type_build.identifiers.entityIds(entities),
        ``,
        `// #MARK: TPlatformId`,
        type_build.identifiers.platforms(),
        ``,
        `// #MARK: TRawDomains`,
        type_build.identifiers.domains(entities),
      ].join(`\n`);
    } catch (error) {
      logger.error({ error }, "failed to build data, please report");
      exit();
    }
  };
}
