#!/usr/bin/env node
import { CreateApplication } from "@digital-alchemy/core";
import { LIB_HASS } from "@digital-alchemy/hass";

import { ASTFragmentsExtension } from "./ast-fragments.extension";
import { BuildTypes } from "./build.extension";
import { DomainBuilder } from "./domain-builder.extension";
import {
  AlarmControlPanelBuilder,
  BinarySensorBuilder,
  ButtonBuilder,
  CameraBuilder,
  ClimateBuilder,
  CoverBuilder,
  DateBuilder,
  DateTimeBuilder,
  FanBuilder,
  ImageBuilder,
  LawnMowerBuilder,
  LightBuilder,
  LockBuilder,
  MediaPlayerBuilder,
  NotifyBuilder,
  NumberBuilder,
  PersonBuilder,
  RemoteBuilder,
  SceneBuilder,
  SelectBuilder,
  SensorBuilder,
  SirenBuilder,
  SwitchBuilder,
  TextBuilder,
  TodoListBuilder,
  UpdateBuilder,
  VacuumBuilder,
  ValveBuilder,
  WaterHeaterBuilder,
} from "./domains";
import { HumidifierBuilder } from "./domains/humidifier.extension";
import { EntityReference } from "./entity-reference.extension";
import { FieldBuilder } from "./field-builder.extension";
import { ICallServiceExtension } from "./i-call-service.extension";
import { Identifiers } from "./identifiers.extension";
import { Printer } from "./printer.extension";
import { TSDoc } from "./tsdoc.extension";

const DOMAINS = {
  alarm_control_panel: AlarmControlPanelBuilder,
  binary_sensor: BinarySensorBuilder,
  button: ButtonBuilder,
  camera: CameraBuilder,
  climate: ClimateBuilder,
  cover: CoverBuilder,
  date: DateBuilder,
  datetime: DateTimeBuilder,
  fan: FanBuilder,
  humidifier: HumidifierBuilder,
  image: ImageBuilder,
  lawn_mower: LawnMowerBuilder,
  light: LightBuilder,
  lock: LockBuilder,
  media_player: MediaPlayerBuilder,
  notify: NotifyBuilder,
  number: NumberBuilder,
  person: PersonBuilder,
  remote: RemoteBuilder,
  scene: SceneBuilder,
  select: SelectBuilder,
  sensor: SensorBuilder,
  siren: SirenBuilder,
  switch: SwitchBuilder,
  text: TextBuilder,
  todo_list: TodoListBuilder,
  update: UpdateBuilder,
  vacuum: VacuumBuilder,
  valve: ValveBuilder,
  water_heater: WaterHeaterBuilder,
};

export const TYPE_WRITER = CreateApplication({
  configuration: {
    TARGET_FILE: {
      description: "Define a file to write types to. Autodetect = default behavior",
      type: "string",
    },
  },
  libraries: [LIB_HASS],
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
    tsdoc: TSDoc,
  },
});
setImmediate(async () => {
  await TYPE_WRITER.bootstrap({
    configuration: {
      boilerplate: { LOG_LEVEL: "warn" },
      hass: { AUTO_SCAN_CALL_PROXY: false },
    },
  });
});

declare module "@digital-alchemy/core" {
  export interface LoadedModules {
    type_writer: typeof TYPE_WRITER;
  }
}
