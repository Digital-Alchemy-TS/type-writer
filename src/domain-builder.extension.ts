import { TServiceParams } from "@digital-alchemy/core";
import { ALL_DOMAINS, PICK_ENTITY } from "@digital-alchemy/hass";
import { factory, PropertySignature } from "typescript";

export function DomainBuilder({ hass, type_writer }: TServiceParams) {
  // const buildAttributes = (domain: ALL_DOMAINS, attributes: Record<string, unknown>) => {
  //   const keys = new Set<string>(Object.keys(attributes));
  //   // const
  //   // switch( domain ) {
  //   //   case
  //   // }
  //   return factory.createPropertySignature(
  //     undefined,
  //     factory.createIdentifier("attributes"),
  //     undefined,
  //     factory.createTypeLiteralNode([
  //       factory.createPropertySignature(
  //         undefined,
  //         factory.createIdentifier("restored"),
  //         undefined,
  //         factory.createKeywordTypeNode(SyntaxKind.BooleanKeyword),
  //       ),
  //       factory.createPropertySignature(
  //         undefined,
  //         factory.createIdentifier("supported_features"),
  //         undefined,
  //         factory.createKeywordTypeNode(SyntaxKind.NumberKeyword),
  //       ),
  //     ]),
  //   );
  // };

  const DOMAIN_BUILDERS = new Map<ALL_DOMAINS, DomainBuilderOptions>();

  return {
    build(entity: PICK_ENTITY) {
      return;
    },
    register(options: DomainBuilderOptions) {
      DOMAIN_BUILDERS.set(options.domain, options);
    },
  };
}

type DomainBuilderOptions = {
  domain: ALL_DOMAINS;
  state: () => PropertySignature;
  attributes: () => PropertySignature;
};
