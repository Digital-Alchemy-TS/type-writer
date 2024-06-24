#!/usr/bin/env node
import { CreateApplication, CreateLibrary } from "@digital-alchemy/core";
import { LIB_HASS } from "@digital-alchemy/hass";

import { ASTFragmentsExtension } from "./ast-fragments.extension";
import { BuildTypes } from "./build.extension";
import { DomainBuilder } from "./domain-builder.extension";
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
} from "./domains";
import { EntityReference } from "./entity-reference.extension";
import { FieldBuilder } from "./field-builder.extension";
import { ICallServiceExtension } from "./i-call-service.extension";
import { Identifiers } from "./identifiers.extension";
import { Printer } from "./printer.extension";
import { QuickTypeExtension } from "./quicktype.extension";
import { TSDoc } from "./tsdoc.extension";

const DOMAINS = {
  binary_sensor: BinarySensorBuilder,
  camera: CameraBuilder,
  climate: ClimateBuilder,
  device_tracker: DeviceTrackerBuilder,
  event: EventBuilder,
  fan: FanBuilder,
  generic: GenericDomainBuilder,
  light: LightBuilder,
  number: NumberBuilder,
  select: SelectBuilder,
  sensor: SensorBuilder,
  switch: SwitchBuilder,
  update: UpdateBuilder,
  weather: WeatherBuilder,
};

export const TYPE_WRITER = CreateLibrary({
  configuration: {
    TARGET_FILE: {
      description: "Define a file to write types to. Autodetect = default behavior",
      type: "string",
    },
  },
  depends: [LIB_HASS],
  name: "type_writer",
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
    quicktype: QuickTypeExtension,
    tsdoc: TSDoc,
  },
});

declare module "@digital-alchemy/core" {
  export interface LoadedModules {
    type_writer: typeof TYPE_WRITER;
  }
}
