import {
  createPrinter,
  createSourceFile,
  EmitHint,
  factory,
  NewLineKind,
  ScriptKind,
  ScriptTarget,
  SyntaxKind,
  TypeNode,
} from "typescript";

export function Printer() {
  const printer = createPrinter({ newLine: NewLineKind.LineFeed });
  const resultFile = createSourceFile(
    "",
    "",
    ScriptTarget.Latest,
    false,
    ScriptKind.TS,
  );

  return function (name: string, types: TypeNode) {
    return printer.printNode(
      EmitHint.Unspecified,
      factory.createTypeAliasDeclaration(
        [factory.createModifier(SyntaxKind.ExportKeyword)],
        factory.createIdentifier(name),
        undefined,
        types,
      ),
      resultFile,
    );
  };
}
