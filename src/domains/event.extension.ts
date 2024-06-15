import { TServiceParams } from "@digital-alchemy/core";
import { factory, SyntaxKind } from "typescript";

export function EventBuilder({ type_writer }: TServiceParams) {
  // @ts-expect-error ignore
  type_writer.domain.register<"event">({
    async attributes(data) {
      const attributes = data.attributes as object as { event_types: string[] };
      return type_writer.ast.attributes({
        data: data.attributes,
        override: {
          event_type: type_writer.ast.union(attributes.event_types ?? []),
        },
      });
    },
    domain: "event",
    state() {
      return factory.createKeywordTypeNode(SyntaxKind.StringKeyword);
    },
  });
}
