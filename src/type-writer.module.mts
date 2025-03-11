#!/usr/bin/env node
import "@digital-alchemy/hass/dev-types";

import { CreateLibrary } from "@digital-alchemy/core";
import { LIB_HASS } from "@digital-alchemy/hass";

import { ASTFragmentsExtension } from "./ast-fragments.service.mts";
import { BuildTypes } from "./build.service.mts";
import { DomainBuilder } from "./domain-builder.service.mts";
import {
  BinarySensorBuilder,
  CameraBuilder,
  ClimateBuilder,
  DeviceTrackerBuilder,
  EventBuilder,
  FanBuilder,
  GenericDomainBuilder,
  LightBuilder,
  NumberBuilder,
  SelectBuilder,
  SensorBuilder,
  SwitchBuilder,
  UpdateBuilder,
  WeatherBuilder,
} from "./domains/index.mts";
import { EntityReference } from "./entity-reference.service.mts";
import { FieldBuilder } from "./field-builder.service.mts";
import { ICallServiceExtension } from "./i-call-service.service.mts";
import { Identifiers } from "./identifiers.service.mts";
import { Printer } from "./printer.service.mts";
import { TSDoc } from "./tsdoc.service.mts";

const DOMAINS = {
  BinarySensorBuilder,
  CameraBuilder,
  ClimateBuilder,
  DeviceTrackerBuilder,
  EventBuilder,
  FanBuilder,
  GenericDomainBuilder,
  LightBuilder,
  NumberBuilder,
  SelectBuilder,
  SensorBuilder,
  SwitchBuilder,
  UpdateBuilder,
  WeatherBuilder,
};

export const LIB_TYPE_BUILD = CreateLibrary({
  configuration: {
    PRINT_WIDTH: {
      default: 100,
      description: "Prettier printWidth setting applied to output",
      type: "number",
    },
  },
  depends: [LIB_HASS],
  name: "type_build",
  priorityInit: ["domain"],
  services: {
    ...DOMAINS,
    ast: ASTFragmentsExtension,
    build: BuildTypes,
    call_service: ICallServiceExtension,
    domain: DomainBuilder,
    entity: EntityReference,
    fields: FieldBuilder,
    identifiers: Identifiers,
    printer: Printer,
    tsdoc: TSDoc,
  },
});

declare module "@digital-alchemy/core" {
  export interface LoadedModules {
    type_build: typeof LIB_TYPE_BUILD;
  }
}
