#!/usr/bin/env node
import { CreateApplication } from "@digital-alchemy/core";
import { LIB_HASS } from "@digital-alchemy/hass";

import { Runner } from "./runner.extension";
import { TYPE_BUILD } from "./type-writer.module";

const TYPE_WRITER = CreateApplication({
  libraries: [LIB_HASS, TYPE_BUILD],
  name: "type_writer",
  services: {
    runner: Runner,
  },
});
setImmediate(async () => {
  await TYPE_WRITER.bootstrap({
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
    type_writer: typeof TYPE_WRITER;
  }
}
