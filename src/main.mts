#!/usr/bin/env node
import { CreateApplication } from "@digital-alchemy/core";
import { LIB_HASS } from "@digital-alchemy/hass";

import { Runner } from "./runner.service.mts";
import { LIB_TYPE_BUILD } from "./type-writer.module.mts";

const TYPE_WRITER = CreateApplication({
  configuration: {
    INCLUDE_UNAVAILABLE_STATE: {
      default: false,
      type: "boolean",
    },
    TARGET_FILE: {
      description: "Define a file to write types to. Autodetect = default behavior",
      type: "string",
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
