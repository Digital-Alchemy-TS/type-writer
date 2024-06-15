import { TServiceParams } from "@digital-alchemy/core";

export function SwitchBuilder({ type_writer }: TServiceParams) {
  type_writer.domain.register<"switch">({
    async attributes(data) {
      return type_writer.ast.attributes({ data: data.attributes });
    },
    domain: "switch",
    state() {
      return type_writer.ast.union(["on", "off"]);
    },
  });
}
