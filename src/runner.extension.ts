import { TServiceParams } from "@digital-alchemy/core";
import { exit } from "process";

export function Runner({ type_build, lifecycle, logger }: TServiceParams) {
  lifecycle.onReady(async () => {
    logger.debug(`starting build`);
    await type_build.build();
    setImmediate(() => exit());
  });
}
