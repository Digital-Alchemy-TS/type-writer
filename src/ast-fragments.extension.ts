import { is } from "@digital-alchemy/core";
import { PICK_ENTITY } from "@digital-alchemy/hass";
import { dump } from "js-yaml";
import {
  addSyntheticLeadingComment,
  factory,
  SyntaxKind,
  TypeLiteralNode,
  TypeNode,
} from "typescript";

export function ASTFragmentsExtension() {
  // #MARK: attributes
  function attributes<
    DATA extends object,
    KEYS extends Extract<keyof DATA, string> = Extract<keyof DATA, string>,
  >({ data, literal = [], override = {} }: AttributesBuilderOptions<DATA>): TypeLiteralNode {
    const keys = Object.keys(data) as KEYS[];
    literal.push(
      "friendly_name",
      "icon",
      "device_class",
      "unit_of_measurement",
      "state_class",
      "device_id",
      "zone_id",
    );
    // * return final object
    return factory.createTypeLiteralNode(
      keys.map(key => {
        let node: TypeNode = override[key];
        let showHelp = true;
        if (is.undefined(node)) {
          const value = data[key];
          switch (typeof value) {
            case "string": {
              if (literal.includes(key)) {
                node = factory.createLiteralTypeNode(
                  factory.createStringLiteral(data[key] as string),
                );
                showHelp = false;
              } else {
                node = factory.createKeywordTypeNode(SyntaxKind.StringKeyword);
              }
              break;
            }
            case "number": {
              node = factory.createKeywordTypeNode(SyntaxKind.NumberKeyword);
              break;
            }
            case "boolean": {
              showHelp = false;
              node = factory.createKeywordTypeNode(SyntaxKind.BooleanKeyword);
              break;
            }
            case "object": {
              // eslint-disable-next-line unicorn/prefer-ternary
              if (is.array(value)) {
                showHelp = false;
                // @ts-expect-error because it sucks at keeping track of types
                node = buildArray(value as Array);
              } else if (value === null) {
                showHelp = false;
                node = factory.createLiteralTypeNode(factory.createNull());
              } else {
                node = factory.createKeywordTypeNode(SyntaxKind.ObjectKeyword);
              }
              break;
            }
            default: {
              node = factory.createKeywordTypeNode(SyntaxKind.UnknownKeyword);
              // console.log({
              //   key,
              //   value: entity.attributes[key],
              // });
            }
          }
        }
        const property = factory.createPropertySignature(undefined, `"${key}"`, undefined, node);
        if (!showHelp) {
          return property;
        }
        return addSyntheticLeadingComment(
          property,
          SyntaxKind.MultiLineCommentTrivia,
          "*\n" +
            [
              "> ```yaml",
              ...dump({ [key]: data[key] })
                .trim()
                .split("\n")
                .map(i => `> ${i}`),
            ]
              .map(i => ` * ${i}`)
              .join(`\n`) +
            "\n * > ```\n ",
        );
      }),
    );
  }

  const buildArray = (data: unknown[]) => {
    const isStringArray = !is.empty(data) && data.every(i => is.string(i));
    if (isStringArray) {
      return factory.createArrayTypeNode(
        factory.createParenthesizedType(
          factory.createUnionTypeNode(
            data.map(option =>
              factory.createLiteralTypeNode(factory.createStringLiteral(option as string)),
            ),
          ),
        ),
      );
    }
    return factory.createTupleTypeNode([]);
  };
  const tuple = (list: string[]) =>
    factory.createTupleTypeNode(
      list.map(i =>
        factory.createNamedTupleMember(
          undefined,
          factory.createIdentifier(i),
          undefined,
          factory.createKeywordTypeNode(SyntaxKind.NumberKeyword),
        ),
      ),
    );
  const union = (list: string[]) =>
    factory.createUnionTypeNode(
      list.map(option => factory.createLiteralTypeNode(factory.createStringLiteral(option))),
    );

  return {
    attributes,
    // #MARK: entity_id
    /**
     * "entity_id": "domain.object_id"
     */
    entity_id: (entity_id: PICK_ENTITY) =>
      factory.createPropertySignature(
        undefined,
        factory.createIdentifier("entity_id"),
        undefined,
        factory.createLiteralTypeNode(factory.createStringLiteral(entity_id)),
      ),

    tuple,
    union,
  };
}

type AttributesBuilderOptions<DATA extends object> = {
  data: DATA;
  literal?: string[];
  override?: Record<string, TypeNode>;
};
