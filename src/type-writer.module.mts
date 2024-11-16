#!/usr/bin/env node
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
import { QuickTypeExtension } from "./quicktype.service.mts";
import { TSDoc as TSDocument } from "./tsdoc.service.mts";

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

export const LIB_TYPE_BUILD = CreateLibrary({
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
    quicktype: QuickTypeExtension,
    tsdoc: TSDocument,
  },
});

declare module "@digital-alchemy/core" {
  export interface LoadedModules {
    type_build: typeof LIB_TYPE_BUILD;
  }
}
