import { TServiceParams } from "@digital-alchemy/core";
import { factory, SyntaxKind } from "typescript";

export function NumberBuilder({ type_writer }: TServiceParams) {
  // @ts-expect-error ignore this
  type_writer.domain.register<"number">({
    async attributes(data) {
      return type_writer.ast.attributes({
        data: data.attributes,
        literal: ["mode"],
      });
    },
    domain: "number",
    state() {
      return factory.createKeywordTypeNode(SyntaxKind.NumberKeyword);
    },
  });
}
