#!/usr/bin/env node
import { CreateApplication } from "@digital-alchemy/core";
import { LIB_HASS } from "@digital-alchemy/hass";

import { BuildTypes } from "./build.extension";
import { TypeWriter } from "./type-writer.extension";

export const TYPE_WRITER = CreateApplication({
  configuration: {
    TARGET_FILE: {
      description:
        "Define a file to write types to. Autodetect = default behavior",
      type: "string",
    },
  },
  libraries: [LIB_HASS],
  name: "type_writer",
  services: {
    build: BuildTypes,
    type_writer: TypeWriter,
  },
});
setImmediate(async () => {
  await TYPE_WRITER.bootstrap({
    configuration: {
      boilerplate: {
        LOG_LEVEL: "warn",
      },
      hass: {
        AUTO_CONNECT_SOCKET: false,
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
