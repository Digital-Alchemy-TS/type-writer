import { TServiceParams } from "@digital-alchemy/core";
import { factory } from "typescript";

export function UpdateBuilder({ type_writer }: TServiceParams) {
  // @ts-expect-error ignore
  type_writer.domain.register<"update">({
    async attributes(data) {
      return type_writer.ast.attributes({
        data: data.attributes,
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
