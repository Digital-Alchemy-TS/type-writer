import { format } from "prettier";
import {
  createPrinter,
  createSourceFile,
  EmitHint,
  factory,
  NewLineKind,
  ScriptKind,
  ScriptTarget,
  Statement,
  SyntaxKind,
} from "typescript";

export function Printer() {
  const printer = createPrinter({ newLine: NewLineKind.LineFeed });
  const resultFile = createSourceFile("", "", ScriptTarget.Latest, false, ScriptKind.TS);

  return async function (types: Statement[]) {
    const output = printer.printNode(
      EmitHint.Unspecified,
      factory.createModuleDeclaration(
        [factory.createToken(SyntaxKind.DeclareKeyword)],
        factory.createStringLiteral("@digital-alchemy/hass"),
        factory.createModuleBlock(types),
      ),
      resultFile,
    );
    return await format(output, {
      parser: "typescript",
    });
  };
}
