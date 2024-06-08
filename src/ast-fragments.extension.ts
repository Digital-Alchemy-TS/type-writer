import { is, TServiceParams } from "@digital-alchemy/core";
import { PICK_ENTITY } from "@digital-alchemy/hass";
import {
  factory,
  PropertySignature,
  SyntaxKind,
  TypeElement,
  TypeLiteralNode,
  TypeNode,
} from "typescript";

export function ASTFragmentsExtension({ type_writer }: TServiceParams) {
  // #MARK: attributes
  function attributes<
    DATA extends object,
    KEYS extends Extract<keyof DATA, string> = Extract<keyof DATA, string>,
  >({ data, preserve = [], override = {} }: AttributesBuilderOptions<DATA>): TypeLiteralNode {
    const elements = [] as TypeElement[];
    const keys = Object.keys(data) as KEYS[];
    keys.forEach(key => {
      if (is.function(override[key])) {
        elements.push(override[key](data[key]));
        return;
      }
      let typeNode: TypeNode;
      switch (typeof data[key]) {
        case "string": {
          if (preserve.includes(key)) {
            // typeNode =
            break;
          }
          return;
        }
        case "number": {
          return;
        }
        default: {
          typeNode = factory.createKeywordTypeNode(SyntaxKind.UnknownKeyword);
        }
      }
      elements.push(factory.createPropertySignature(undefined, key, undefined, typeNode));
    });

    // * return final object
    return factory.createTypeLiteralNode(elements);
  }

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

    // #MARK: on_off
    /**
     * state: "on" | "off"
     */
    on_off: () => type_writer.ast.state_enum(["on", "off"]),

    // #MARK: state_enum
    /**
     * Create a string union for state
     */
    state_enum: (options: string[]) =>
      factory.createPropertySignature(
        undefined,
        factory.createIdentifier("state"),
        undefined,
        factory.createUnionTypeNode(
          options.map(option => factory.createLiteralTypeNode(factory.createStringLiteral(option))),
        ),
      ),
  };
}

type AttributesBuilderOptions<
  DATA extends object,
  KEYS extends Extract<keyof DATA, string> = Extract<keyof DATA, string>,
> = {
  data: DATA;
  preserve?: KEYS[];
  override?: Partial<{
    [KEY in KEYS]: (value: DATA[KEY]) => PropertySignature;
  }>;
};
