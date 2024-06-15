import { TServiceParams } from "@digital-alchemy/core";
import { factory, SyntaxKind } from "typescript";

export function CameraBuilder({ type_writer }: TServiceParams) {
  // @ts-expect-error ignore this
  type_writer.domain.register<"camera">({
    async attributes(data) {
      return type_writer.ast.attributes({
        data: data.attributes,
        literal: ["frontend_stream_type"],
      });
    },
    domain: "camera",
    state() {
      return factory.createKeywordTypeNode(SyntaxKind.StringKeyword);
    },
  });
}
