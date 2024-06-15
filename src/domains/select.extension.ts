import { is, TServiceParams } from "@digital-alchemy/core";
import { factory, SyntaxKind } from "typescript";

export function SelectBuilder({ type_writer }: TServiceParams) {
  // @ts-expect-error ignore
  type_writer.domain.register<"select">({
    async attributes(data) {
      return type_writer.ast.attributes({
        data: data.attributes,
      });
    },
    domain: "select",
    state(data) {
      const attributes = data.attributes as object as { options: string[] };
      if (is.empty(attributes.options)) {
        return factory.createKeywordTypeNode(SyntaxKind.StringKeyword);
      }
      return type_writer.ast.union(attributes.options);
    },
  });
}
