import { TServiceParams } from "@digital-alchemy/core";
import { factory } from "typescript";

export function UpdateBuilder({ type_build }: TServiceParams) {
  // @ts-expect-error ignore
  type_build.domain.register<"update">({
    async attributes(data) {
      return type_build.ast.attributes({
        data: data.attributes as object,
        literal: ["installed_version", "latest_version", "title"],
      });
    },
    domain: "update",
    state() {
      return factory.createUnionTypeNode(
        ["on", "off"].map(option =>
          factory.createLiteralTypeNode(factory.createStringLiteral(option)),
        ),
      );
    },
  });
}
