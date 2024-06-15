import { START } from "@digital-alchemy/core";
import { exit } from "process";
import {
  InputData,
  jsonInputForTargetLanguage,
  quicktype,
  TypeScriptTargetLanguage,
} from "quicktype-core";
import ts, {
  createSourceFile,
  factory,
  ScriptKind,
  ScriptTarget,
  TypeElement,
  TypeNode,
} from "typescript";

export function QuickTypeExtension() {
  function convertToAst(tsCode: string) {
    const sourceFile = createSourceFile(
      "in-memory.ts",
      tsCode.replace("export interface Attributes", "export type Attributes"),
      ScriptTarget.Latest,
      true,
      ScriptKind.TS,
    );
    const out = {
      extra: [] as unknown[],
      main: undefined as TypeNode,
    };
    let index = START;
    ts.forEachChild(sourceFile, node => {
      if (index === START) {
        const children = [] as TypeElement[];
        node.forEachChild(item => {
          // console.log(item.getSourceFile());
          children.push(
            factory.createPropertySignature(
              undefined,
              factory.createIdentifier(item.getChildAt(0)?.getText?.() || "wat"),
              undefined,
              // @ts-expect-error test
              item.getChildAt(0),
            ),
          );
        });
        out.main = factory.createTypeLiteralNode(children);
        exit();
        // return;
      }
      out.extra.push(node);
      index++;
    });
    return out;
  }

  return async function (attributes: object) {
    const jsonInput = jsonInputForTargetLanguage("typescript");
    await jsonInput.addSource({
      name: "Attributes",
      samples: [JSON.stringify(attributes)],
    });
    const inputData = new InputData();
    inputData.addInput(jsonInput);

    const result = await quicktype({
      inputData,
      lang: new TypeScriptTargetLanguage(),
      rendererOptions: { "just-types": "true" },
    });
    return await convertToAst(result.lines.join("\n"));
  };
}
