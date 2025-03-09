import { each, is, TServiceParams } from "@digital-alchemy/core";
import { ALL_DOMAINS, ANY_ENTITY, domain, ENTITY_STATE } from "@digital-alchemy/hass";
import { factory, SyntaxKind, TypeElement, TypeNode } from "typescript";

export function DomainBuilder({ hass, logger }: TServiceParams) {
  async function buildEntityDomain(entity_id: ANY_ENTITY) {
    const entity = hass.entity.getCurrentState(entity_id);

    // @ts-expect-error no cares given
    const builder = DOMAIN_BUILDERS[domain(entity_id)] || DOMAIN_BUILDERS.generic;
    // { state, entity_id, attributes }
    const node = factory.createTypeLiteralNode([
      // * state
      factory.createPropertySignature(
        undefined,
        factory.createIdentifier("state"),
        undefined,
        builder.state
          ? builder.state(entity)
          : factory.createKeywordTypeNode(SyntaxKind.UnknownKeyword),
      ),
      // * attributes
      factory.createPropertySignature(
        undefined,
        factory.createIdentifier("attributes"),
        undefined,
        builder.attributes
          ? factory.createTypeReferenceNode(factory.createIdentifier("DynamicMergeAttributes"), [
              factory.createLiteralTypeNode(factory.createStringLiteral(entity_id)),
              await builder.attributes(entity),
            ])
          : factory.createLiteralTypeNode(factory.createStringLiteral(entity_id)),
      ),
    ]);

    return factory.createPropertySignature(
      undefined,
      factory.createIdentifier(`"${entity_id}"`),
      undefined,
      node,
    );
  }

  const DOMAIN_BUILDERS = {} as {
    [DOMAIN in ALL_DOMAINS]: DomainBuilderOptions<DOMAIN>;
  };
  return {
    async build() {
      const entities = hass.entity.listEntities().filter(entity_id => {
        const found = hass.entity.registry.current.find(i => i.entity_id === entity_id);
        if (!found) {
          logger.debug({ name: entity_id }, `cannot find in registry, assuming not disabled`);
          return true;
        }
        return is.empty(found?.disabled_by);
      });
      const out = [] as TypeElement[];
      await each(entities, async domain => out.push(await buildEntityDomain(domain)));
      return factory.createInterfaceDeclaration(
        [factory.createToken(SyntaxKind.ExportKeyword)],
        factory.createIdentifier("HassEntitySetupMapping"),
        undefined,
        undefined,
        out,
      );
    },
    register<DOMAIN extends ALL_DOMAINS>(options: DomainBuilderOptions<DOMAIN>) {
      const domain = options.domain;
      // @ts-expect-error I don't care
      DOMAIN_BUILDERS[domain] = options;
    },
  };
}

type DomainBuilderOptions<DOMAIN extends ALL_DOMAINS = ALL_DOMAINS> = {
  domain: DOMAIN;
  state?: (state: ENTITY_STATE<ANY_ENTITY>) => TypeNode;
  attributes?: (state: ENTITY_STATE<ANY_ENTITY>) => Promise<TypeNode>;
};
