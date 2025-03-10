import { is, TServiceParams } from "@digital-alchemy/core";
import { factory } from "typescript";

export function FanBuilder({ type_build }: TServiceParams) {
  // @ts-expect-error ignore this
  type_build.domain.register<"fan">({
    async attributes(data) {
      const attributes = data.attributes as object as Record<"preset_modes", string[]>;

      return type_build.ast.attributes({
        data: data.attributes as object,
        override: {
          preset_mode: is.empty(attributes.preset_modes)
            ? factory.createLiteralTypeNode(factory.createNull())
            : type_build.ast.tuple([..."xy"]),
        },
      });
    },
    domain: "fan",
    state() {
      return type_build.ast.union(["on", "off"]);
    },
  });
}
