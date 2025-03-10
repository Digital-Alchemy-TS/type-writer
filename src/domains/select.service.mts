import { is, TServiceParams } from "@digital-alchemy/core";
import { factory, SyntaxKind } from "typescript";

export function SelectBuilder({ type_build }: TServiceParams) {
  // @ts-expect-error ignore
  type_build.domain.register<"select">({
    async attributes(data) {
      return type_build.ast.attributes({
        data: data.attributes as object,
      });
    },
    domain: "select",
    state(data) {
      const attributes = data.attributes as object as { options: string[] };
      if (is.empty(attributes.options)) {
        return factory.createKeywordTypeNode(SyntaxKind.StringKeyword);
      }
      return type_build.ast.union(attributes.options);
    },
  });
}
