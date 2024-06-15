import { TServiceParams } from "@digital-alchemy/core";
import { factory, SyntaxKind } from "typescript";

export function DeviceTrackerBuilder({ type_writer }: TServiceParams) {
  // @ts-expect-error ignore
  type_writer.domain.register<"device_tracker">({
    async attributes(data) {
      return type_writer.ast.attributes({
        data: data.attributes,
        literal: ["source_type"],
      });
    },
    domain: "device_tracker",
    state() {
      return factory.createKeywordTypeNode(SyntaxKind.StringKeyword);
    },
  });
}
