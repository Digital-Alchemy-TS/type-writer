import { is, TServiceParams } from "@digital-alchemy/core";
import { existsSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { exit } from "process";
import { fileURLToPath } from "url";

export function Runner({ type_build, lifecycle, logger, config }: TServiceParams) {
  async function runner() {
    try {
      // install location
      // node_modules/@digital-alchemy/type-writer/dist/index.js
      //
      // relative target file
      // ../../hass/dist/dynamic.d.mts
      //
      const path = is.empty(config.type_writer.TARGET_FILE)
        ? join(dirname(fileURLToPath(import.meta.url)), "..", "..", "hass", "dist", "dynamic.d.mts")
        : config.type_writer.TARGET_FILE;
      if (!existsSync(path)) {
        if (config.type_writer.TARGET_FILE !== path) {
          // Represents an error with the script
          // Calculated the wrong path, and something is up
          logger.fatal({ path }, `cannot locate target file, aborting`);
          return;
        }
        logger.warn({ path }, `creating new type definitions file`);
      }
      const text = await type_build.build();
      writeFileSync(path, text);
      logger.warn({ path }, `successfully wrote type definitions file`);
      logger.info(`{reload your editor to update types}`);
    } catch (error) {
      logger.fatal({ error }, `failed to write type definitions file`);
    }
  }

  lifecycle.onReady(async () => {
    logger.debug(`starting build`);
    await runner();
    setImmediate(() => exit());
  });
}
