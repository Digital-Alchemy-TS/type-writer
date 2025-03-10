import { TServiceParams } from "@digital-alchemy/core";
import { factory, SyntaxKind } from "typescript";

export function CameraBuilder({ type_build }: TServiceParams) {
  // @ts-expect-error ignore this
  type_build.domain.register<"camera">({
    async attributes(data) {
      return type_build.ast.attributes({
        data: data.attributes as object,
        literal: ["frontend_stream_type"],
      });
    },
    domain: "camera",
    state() {
      return factory.createKeywordTypeNode(SyntaxKind.StringKeyword);
    },
  });
}
