import { TServiceParams } from "@digital-alchemy/core";
import { factory, SyntaxKind } from "typescript";

export function DeviceTrackerBuilder({ type_build }: TServiceParams) {
  // @ts-expect-error ignore
  type_build.domain.register<"device_tracker">({
    async attributes(data) {
      return type_build.ast.attributes({
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
