import { TServiceParams } from "@digital-alchemy/core";

export function SwitchBuilder({ type_build, config }: TServiceParams) {
  type_build.domain.register<"switch">({
    async attributes(data) {
      return type_build.ast.attributes({ data: data.attributes });
    },
    domain: "switch",
    state() {
      if (config.type_writer.INCLUDE_UNAVAILABLE_STATE) {
        return type_build.ast.union(["on", "off", "unavailable"]);
      }
      return type_build.ast.union(["on", "off"]);
    },
  });
}
