import { is, TServiceParams } from "@digital-alchemy/core";
import { factory } from "typescript";

export function FanBuilder({ type_writer }: TServiceParams) {
  // @ts-expect-error ignore this
  type_writer.domain.register<"fan">({
    async attributes(data) {
      const attributes = data.attributes as object as Record<"preset_modes", string[]>;

      return type_writer.ast.attributes({
        data: data.attributes,
        override: {
          preset_mode: is.empty(attributes.preset_modes)
            ? factory.createLiteralTypeNode(factory.createNull())
            : type_writer.ast.tuple([..."xy"]),
        },
      });
    },
    domain: "fan",
    state() {
      return type_writer.ast.union(["on", "off"]);
    },
  });
}
