import { each, is, TServiceParams } from "@digital-alchemy/core";
import { ALL_DOMAINS, ANY_ENTITY, domain, ENTITY_STATE } from "@digital-alchemy/hass";
import { factory, SyntaxKind, TypeElement, TypeNode } from "typescript";

export function DomainBuilder({ hass, type_writer, logger }: TServiceParams) {
  const object_id = (entity: ANY_ENTITY) => entity.split(".").pop();

  async function buildEntitySignature(entity_id: ANY_ENTITY) {
    const entity = hass.entity.raw(entity_id);

    // @ts-expect-error no cares given
    const builder = DOMAIN_BUILDERS[domain(entity_id)] || DOMAIN_BUILDERS.generic;
    return factory.createParenthesizedType(
      factory.createIntersectionTypeNode([
        // { state, entity_id, attributes }
        factory.createTypeLiteralNode([
          // * state
          factory.createPropertySignature(
            undefined,
            factory.createIdentifier("state"),
            undefined,
            builder.state
              ? builder.state(entity)
              : factory.createKeywordTypeNode(SyntaxKind.UnknownKeyword),
          ),
          // * entity_id
          factory.createPropertySignature(
            undefined,
            factory.createIdentifier("entity_id"),
            undefined,
            factory.createLiteralTypeNode(factory.createStringLiteral(entity_id)),
          ),
          // * attributes
          factory.createPropertySignature(
            undefined,
            factory.createIdentifier("attributes"),
            undefined,
            builder.attributes
              ? await builder.attributes(entity)
              : factory.createLiteralTypeNode(factory.createStringLiteral(entity_id)),
          ),
        ]),
        // & ExtraIntersectionData
        factory.createTypeReferenceNode(factory.createIdentifier("TEntityCommon"), undefined),
      ]),
    );
  }

  async function buildEntityDomain(domain: ALL_DOMAINS) {
    const parts = [] as TypeElement[];
    await each(hass.idBy.domain(domain), async entity_id => {
      const registry = hass.entity.registry.current.find(i => i.entity_id === entity_id);
      if (!is.empty(registry?.disabled_by)) {
        return;
      }
      parts.push(
        factory.createPropertySignature(
          undefined,
          factory.createIdentifier(`"${object_id(entity_id)}"`),
          undefined,
          await buildEntitySignature(entity_id),
        ),
      );
    });

    return factory.createPropertySignature(
      undefined,
      factory.createIdentifier(`"${domain}"`),
      undefined,
      factory.createTypeLiteralNode(parts),
    );
  }

  const DOMAIN_BUILDERS = {} as {
    [DOMAIN in ALL_DOMAINS]: DomainBuilderOptions<DOMAIN>;
  };
  return {
    async build() {
      const full = hass.entity.listEntities().filter(entity_id => {
        const found = hass.entity.registry.current.find(i => i.entity_id === entity_id);
        if (!found) {
          logger.debug({ name: entity_id }, `cannot find in registry, assuming not disabled`);
          return true;
        }
        return is.empty(found?.disabled_by);
      });
      const domains = is.unique(hass.entity.listEntities().map(i => domain(i)));
      const out = [] as TypeElement[];
      await each(domains, async domain => out.push(await buildEntityDomain(domain)));
      return type_writer.printer("ENTITY_SETUP", factory.createTypeLiteralNode(out));
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
