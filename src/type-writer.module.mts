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
import {
  ActionSelector,
  AddonSelector,
  AreaSelector,
  AssistPipelineSelector,
  AttributeSelector,
  BackupLocationSelector,
  BooleanSelector,
  ColorRgbSelector,
  ColorTempSelector,
  ConditionSelector,
  ConfigEntrySelector,
  ConstantSelector,
  ConversationAgentSelector,
  CountrySelector,
  DateSelector,
  DatetimeSelector,
  DeviceSelector,
  DurationSelector,
  EntitySelector,
  FileSelector,
  FloorSelector,
  IconSelector,
  LabelSelector,
  LanguageSelector,
  LocationSelector,
  MediaSelector,
  NumberSelector,
  ObjectSelector,
  QrCodeSelector,
  SelectorRegistry,
  SelectSelector,
  StateSelector,
  StatisticSelector,
  TemplateSelector,
  TextSelector,
  ThemeSelector,
  TimeSelector,
  TriggerSelector,
} from "./selectors/index.mts";
import { NotificationDataSelector } from "./selectors-custom/index.mts";
import { ServiceOverrideRegistry, WeatherForecastsOverride } from "./services-custom/index.mts";
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

const SELECTORS = {
  actionSelector: ActionSelector,
  addonSelector: AddonSelector,
  areaSelector: AreaSelector,
  assistPipelineSelector: AssistPipelineSelector,
  attributeSelector: AttributeSelector,
  backupLocationSelector: BackupLocationSelector,
  booleanSelector: BooleanSelector,
  colorRgbSelector: ColorRgbSelector,
  colorTempSelector: ColorTempSelector,
  conditionSelector: ConditionSelector,
  configEntrySelector: ConfigEntrySelector,
  constantSelector: ConstantSelector,
  conversationAgentSelector: ConversationAgentSelector,
  countrySelector: CountrySelector,
  dateSelector: DateSelector,
  datetimeSelector: DatetimeSelector,
  deviceSelector: DeviceSelector,
  durationSelector: DurationSelector,
  entitySelector: EntitySelector,
  fileSelector: FileSelector,
  floorSelector: FloorSelector,
  iconSelector: IconSelector,
  labelSelector: LabelSelector,
  languageSelector: LanguageSelector,
  locationSelector: LocationSelector,
  mediaSelector: MediaSelector,
  numberSelector: NumberSelector,
  objectSelector: ObjectSelector,
  qrCodeSelector: QrCodeSelector,
  selectSelector: SelectSelector,
  stateSelector: StateSelector,
  statisticSelector: StatisticSelector,
  templateSelector: TemplateSelector,
  textSelector: TextSelector,
  themeSelector: ThemeSelector,
  timeSelector: TimeSelector,
  triggerSelector: TriggerSelector,
};

const SELECTORS_CUSTOM = {
  notificationDataSelector: NotificationDataSelector,
};

const SERVICES_CUSTOM = {
  weatherForecastsOverride: WeatherForecastsOverride,
};

export const LIB_TYPE_BUILD = CreateLibrary({
  configuration: {
    PRINT_WIDTH: {
      default: 100,
      description: "Prettier printWidth setting applied to output",
      type: "number",
    },
    SHORTEN_COMMENTS: {
      default: 500,
      description: "Truncate tsdoc comments longer than this many characters (0 = no truncation)",
      type: "number",
    },
  },
  depends: [LIB_HASS],
  name: "type_build",
  priorityInit: ["domain"],
  services: {
    ...DOMAINS,
    ...SELECTORS,
    ...SELECTORS_CUSTOM,
    ...SERVICES_CUSTOM,
    ast: ASTFragmentsExtension,
    build: BuildTypes,
    call_service: ICallServiceExtension,
    domain: DomainBuilder,
    entity: EntityReference,
    fields: FieldBuilder,
    identifiers: Identifiers,
    printer: Printer,
    selectors: SelectorRegistry,
    serviceOverrides: ServiceOverrideRegistry,
    tsdoc: TSDoc,
  },
});

declare module "@digital-alchemy/core" {
  export interface LoadedModules {
    type_build: typeof LIB_TYPE_BUILD;
  }
}
