import { TServiceParams } from "@digital-alchemy/core";

export function SwitchBuilder({ type_build }: TServiceParams) {
  type_build.domain.register<"switch">({
    async attributes(data) {
      return type_build.ast.attributes({ data: data.attributes as object });
    },
    domain: "switch",
    state() {
      return type_build.ast.union(["on", "off"]);
    },
  });
}
