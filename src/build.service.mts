import { DOWN, is, TServiceParams, UP } from "@digital-alchemy/core";
import { ENTITY_STATE, PICK_ENTITY } from "@digital-alchemy/hass";
import { format } from "prettier";
import { exit } from "process";
import {
  createPrinter,
  createSourceFile,
  EmitHint,
  factory,
  NewLineKind,
  NodeFlags,
  ScriptKind,
  ScriptTarget,
  SyntaxKind,
} from "typescript";

export function BuildTypes({ config, logger, hass, type_build }: TServiceParams) {
  async function buildInstalledAddons(): Promise<string> {
    const addonMap = type_build.addonSelector.getAddonMap();
    const printer = createPrinter({ newLine: NewLineKind.LineFeed });
    const resultFile = createSourceFile("", "", ScriptTarget.Latest, false, ScriptKind.TS);

    let variableStatement;

    if (is.empty(addonMap)) {
      // Return empty object if no addons were loaded
      variableStatement = factory.createVariableStatement(
        [factory.createToken(SyntaxKind.ExportKeyword)],
        factory.createVariableDeclarationList(
          [
            factory.createVariableDeclaration(
              factory.createIdentifier("InstalledAddons"),
              undefined,
              undefined,
              factory.createAsExpression(
                factory.createObjectLiteralExpression([], false),
                factory.createTypeReferenceNode(factory.createIdentifier("const")),
              ),
            ),
          ],
          NodeFlags.Const,
        ),
      );
    } else {
      const properties = Object.entries(addonMap)
        .sort(([a], [b]) => (a > b ? UP : DOWN))
        .map(([name, slug]) =>
          factory.createPropertyAssignment(
            factory.createStringLiteral(name),
            factory.createStringLiteral(slug),
          ),
        );

      variableStatement = factory.createVariableStatement(
        [factory.createToken(SyntaxKind.ExportKeyword)],
        factory.createVariableDeclarationList(
          [
            factory.createVariableDeclaration(
              factory.createIdentifier("InstalledAddons"),
              undefined,
              undefined,
              factory.createAsExpression(
                factory.createObjectLiteralExpression(properties, false),
                factory.createTypeReferenceNode(factory.createIdentifier("const")),
              ),
            ),
          ],
          NodeFlags.Const,
        ),
      );
    }

    const output = printer.printNode(EmitHint.Unspecified, variableStatement, resultFile);
    return await format(output, {
      parser: "typescript",
      printWidth: config.type_build.PRINT_WIDTH,
    });
  }

  async function buildServices() {
    return [await type_build.call_service()];
  }

  function buildMappings(entities: ENTITY_STATE<PICK_ENTITY>[]) {
    return [
      type_build.identifiers.area(),
      type_build.identifiers.device(),
      type_build.identifiers.label(),
      type_build.identifiers.platforms(),
      type_build.identifiers.uniqueId(),
      type_build.identifiers.zone(),
      type_build.identifiers.floor(),
      type_build.identifiers.domains(entities),
    ];
  }

  async function buildRegistry() {
    return [await type_build.domain.build()];
  }

  /**
   * - Ensure that an import from @digital-alchemy/hass exists (even if nothing in particular)
   * - Import any additional helper types
   * - Build interfaces and merge into lib
   */
  return async function doBuild() {
    try {
      const entities = await hass.fetch.getAllEntities();
      const services = await type_build.printer(await buildServices());
      const registry = await type_build.printer(await buildRegistry());
      const mappings = await type_build.printer(buildMappings(entities));
      const installedAddons = await buildInstalledAddons();

      return {
        /**
         * Mappings file contains thing (area, label, etc) -> entity list
         */
        mappings: [`import "@digital-alchemy/hass";`, ``, mappings].join(`\n`),
        /**
         * Bind state & attribute data to entities
         */
        registry: [
          `import { DynamicMergeAttributes } from "@digital-alchemy/hass";`,
          ``,
          registry,
        ].join(`\n`),
        /**
         * Bind services to hass.call & entity proxies
         */
        services: [
          `import "@digital-alchemy/hass";`,
          ``,
          installedAddons,
          ``,
          `import {`,
          `  AndroidNotificationData,`,
          `  AppleNotificationData,`,
          `  NotificationData,`,
          `  PICK_ENTITY,`,
          ...(services.includes("PICK_FROM_PLATFORM") ? [`  PICK_FROM_PLATFORM,`] : []),
          `  SupportedCountries,`,
          `  SupportedLanguages,`,
          `  TAreaId,`,
          `  TDeviceId,`,
          `  TLabelId,`,
          `  WeatherGetForecasts,`,
          `} from "@digital-alchemy/hass";`,
          `import { EmptyObject, LiteralUnion, RequireAtLeastOne } from "type-fest";`,
          ``,
          services,
        ].join(`\n`),
      };
    } catch (error) {
      logger.error({ error }, "failed to build data, please report");
      exit();
    }
  };
}
