import { TServiceParams } from "@digital-alchemy/core";

export function BinarySensorBuilder({ type_build }: TServiceParams) {
  type_build.domain.register<"binary_sensor">({
    async attributes(data) {
      return type_build.ast.attributes({ data: data.attributes as object });
    },
    domain: "binary_sensor",
    state() {
      return type_build.ast.union(["on", "off"]);
    },
  });
}
