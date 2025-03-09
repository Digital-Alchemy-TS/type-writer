import { is, TServiceParams } from "@digital-alchemy/core";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "fs";
import { isAbsolute, join } from "path";
import { cwd, exit } from "process";

export function Runner({ type_build, lifecycle, logger, config }: TServiceParams) {
  async function runner() {
    try {
      const writeBase = isAbsolute(config.type_writer.TARGET_DIR)
        ? config.type_writer.TARGET_DIR
        : join(cwd(), config.type_writer.TARGET_DIR);
      if (existsSync(writeBase)) {
        logger.info(`rm -r {%s}`, writeBase);
        rmSync(writeBase, { recursive: true });
      }
      mkdirSync(writeBase);

      const { services, registry, mappings } = await type_build.build();

      if (!is.empty(writeBase)) {
        writeFileSync(join(writeBase, `mappings.mts`), mappings, "utf8");
        writeFileSync(join(writeBase, `services.mts`), services, "utf8");
        writeFileSync(join(writeBase, `registry.mts`), registry, "utf8");
      }
      logger.warn({ base: writeBase }, `successfully wrote type definitions file`);
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
