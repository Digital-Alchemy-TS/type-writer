#!/usr/bin/env node
import { CreateApplication } from "@digital-alchemy/core";
import { LIB_HASS } from "@digital-alchemy/hass";

import { TYPE_WRITER } from "./type-writer.module";

const RUNNER = CreateApplication({
  configuration: {
    TARGET_FILE: {
      description: "Define a file to write types to. Autodetect = default behavior",
      type: "string",
    },
  },
  libraries: [LIB_HASS, TYPE_WRITER],
  name: "runner",
  services: {},
});
setImmediate(async () => {
  await RUNNER.bootstrap({
    configuration: {
      boilerplate: { LOG_LEVEL: "info" },
      hass: {
        AUTO_SCAN_CALL_PROXY: false,
      },
    },
  });
});

declare module "@digital-alchemy/core" {
  export interface LoadedModules {
    runner: typeof RUNNER;
  }
}
