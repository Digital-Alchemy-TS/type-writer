import { TServiceParams } from "@digital-alchemy/core";
import { factory, SyntaxKind } from "typescript";

export function NumberBuilder({ type_build }: TServiceParams) {
  // @ts-expect-error ignore this
  type_build.domain.register<"number">({
    async attributes(data) {
      return type_build.ast.attributes({
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
