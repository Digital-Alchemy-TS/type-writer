#!/usr/bin/env node
import { CreateApplication } from "@digital-alchemy/core";
import { LIB_HASS } from "@digital-alchemy/hass";

import { Runner } from "./runner.service.mts";
import { LIB_TYPE_BUILD } from "./type-writer.module.mts";

const TYPE_WRITER = CreateApplication({
  configuration: {
    TARGET_DIR: {
      default: "src/hass",
      description: "Define a base folder to write types to",
      type: "string",
    },
    WATCH_MODE: {
      default: false,
      description: "Watch for changes in the Home Assistant registries",
      type: "boolean",
    },
  },
  libraries: [LIB_HASS, LIB_TYPE_BUILD],
  name: "type_writer",
  services: {
    runner: Runner,
  },
});
setImmediate(async () => {
  await TYPE_WRITER.bootstrap({
    configuration: {
      boilerplate: { LOG_LEVEL: "info" },
    },
  });
});

declare module "@digital-alchemy/core" {
  export interface LoadedModules {
    type_writer: typeof TYPE_WRITER;
  }
}
