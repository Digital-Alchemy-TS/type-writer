import { TServiceParams } from "@digital-alchemy/core";

export function BinarySensorBuilder({ type_writer, logger, hass }: TServiceParams) {
  type_writer.domain.register({
    attributes: () => undefined,
    domain: "binary_sensor",
    state: () => type_writer.ast.on_off(),
  });
}
