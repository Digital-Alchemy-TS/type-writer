import { TServiceParams } from "@digital-alchemy/core";

export function BinarySensorBuilder({ type_writer }: TServiceParams) {
  type_writer.domain.register<"binary_sensor">({
    async attributes(data) {
      return type_writer.ast.attributes({ data: data.attributes });
    },
    domain: "binary_sensor",
    state() {
      return type_writer.ast.union(["on", "off"]);
    },
  });
}
