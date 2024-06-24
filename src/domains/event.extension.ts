import { TServiceParams } from "@digital-alchemy/core";
import { factory, SyntaxKind } from "typescript";

export function EventBuilder({ type_build }: TServiceParams) {
  // @ts-expect-error ignore
  type_build.domain.register<"event">({
    async attributes(data) {
      const attributes = data.attributes as object as { event_types: string[] };
      return type_build.ast.attributes({
        data: data.attributes,
        override: {
          event_type: type_build.ast.union(attributes.event_types ?? []),
        },
      });
    },
    domain: "event",
    state() {
      return factory.createKeywordTypeNode(SyntaxKind.StringKeyword);
    },
  });
}
