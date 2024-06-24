import { TServiceParams } from "@digital-alchemy/core";
import { exit } from "process";

export function Runner({ type_writer, lifecycle, logger }: TServiceParams) {
  lifecycle.onReady(async () => {
    logger.debug(`starting build`);
    await type_writer.build();
    setImmediate(() => exit());
  });
}
