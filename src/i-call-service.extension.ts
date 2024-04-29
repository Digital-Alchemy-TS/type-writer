import { DOWN, is, TServiceParams, UP } from "@digital-alchemy/core";
import {
  HassServiceDTO,
  ServiceListField,
  ServiceListFieldDescription,
  ServiceListServiceTarget,
} from "@digital-alchemy/hass";
import { factory, SyntaxKind, TypeElement, TypeNode } from "typescript";

export async function ICallServiceExtension({ hass, type_writer }: TServiceParams) {
  return async function () {
    const domains = await hass.fetch.listServices();

    // #MARK: fieldPropertySignature
    function fieldPropertySignature(
      parameterName: string,
      { selector, ...details }: ServiceListFieldDescription,
      serviceDomain: string,
      serviceName: string,
    ) {
      let node: TypeNode;
      const { domain } = selector?.entity ?? {};
      // : boolean
      if (!is.undefined(selector?.boolean))
        node = factory.createKeywordTypeNode(SyntaxKind.BooleanKeyword);
      // : number
      else if (!is.undefined(selector?.number))
        node = factory.createKeywordTypeNode(SyntaxKind.NumberKeyword);
      // : string
      else if (!is.undefined(selector?.text) || !is.undefined(selector?.time))
        node = factory.createKeywordTypeNode(SyntaxKind.StringKeyword);
      // string | `domain.${keyof typeof ENTITY_SETUP.domain}`
      else if (!is.undefined(selector?.entity))
        // some combination of: PICK_ENTITY | PICK_ENTITY[] | PICK_ENTITY<"domain"> | PICK_ENTITY<"domain">[]
        node = type_writer.entity.buildEntityReference(domain, selector);
      // : "option" | "option" | "option" | "option"
      else if (!is.undefined(selector?.select))
        node = factory.createUnionTypeNode(
          selector?.select.options.map((i: string | Record<"label" | "value", string>) =>
            factory.createLiteralTypeNode(factory.createStringLiteral(is.string(i) ? i : i.value)),
          ),
        );
      // : Record<string, unknown> | (unknown[]);
      else if (is.undefined(selector?.object)) {
        node = factory.createKeywordTypeNode(SyntaxKind.UnknownKeyword);
      }
      // else if (!is.undefined(selector?.))
      // : unknown
      else {
        node = handleSelectors(serviceDomain, serviceName, {
          selector,
          ...details,
        });
      }

      return type_writer.tsdoc.parameterComment(
        factory.createPropertySignature(
          undefined,
          factory.createIdentifier(parameterName),
          details.required ? undefined : factory.createToken(SyntaxKind.QuestionToken),
          node,
        ),
        parameterName,
        { selector, ...details },
      );
    }

    // #MARK: handleSelectors
    function handleSelectors(
      serviceDomain: string,
      serviceName: string,
      { selector }: ServiceListFieldDescription,
    ) {
      if ("object" in selector && selector.object === null) {
        // if (serviceDomain === "conversation") {
        // console.log({ serviceDomain, serviceName }, selector, options);
        // }
        return factory.createKeywordTypeNode(SyntaxKind.UnknownKeyword);
      }

      return factory.createUnionTypeNode([
        serviceDomain === "scene" && serviceName === "apply"
          ? factory.createTypeReferenceNode(factory.createIdentifier("Partial"), [
              factory.createTypeReferenceNode(factory.createIdentifier("Record"), [
                factory.createTypeReferenceNode(factory.createIdentifier("PICK_ENTITY"), undefined),
                factory.createKeywordTypeNode(SyntaxKind.UnknownKeyword),
              ]),
            ])
          : factory.createTypeReferenceNode(factory.createIdentifier("Record"), [
              factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
              factory.createKeywordTypeNode(SyntaxKind.UnknownKeyword),
            ]),
        factory.createParenthesizedType(
          factory.createArrayTypeNode(factory.createKeywordTypeNode(SyntaxKind.UnknownKeyword)),
        ),
      ]);
    }

    // #MARK: BuildServiceParameters
    function serviceParameters(domain: string, key: string, value: ServiceListField) {
      return [
        // f( service_data: { ...definition } )
        //    Provide this        ^^^^^^
        factory.createParameterDeclaration(
          undefined,
          undefined,
          factory.createIdentifier("service_data"),
          // ? If all the parameters are optional, then don't require the data at all
          Object.values(value.fields).some(i => (is.boolean(i.required) ? !i.required : true))
            ? factory.createToken(SyntaxKind.QuestionToken)
            : undefined,
          factory.createTypeLiteralNode(
            [
              ...Object.entries(value.fields)
                .sort(([a], [b]) => (a > b ? UP : DOWN))
                .map(([service, details]) => fieldPropertySignature(service, details, domain, key)),
              type_writer.entity.createTarget(value.target as ServiceListServiceTarget),
            ].filter(i => !is.undefined(i)) as TypeElement[],
          ),
        ),
      ];
    }

    // #MARK: BuildService
    function buildService(domain: string, key: string, value: ServiceListField) {
      return type_writer.tsdoc.serviceComment(
        factory.createMethodSignature(
          undefined,
          factory.createIdentifier(key),
          undefined,
          undefined,
          serviceParameters(domain, key, value),
          factory.createTypeReferenceNode(factory.createIdentifier("Promise"), [
            factory.createKeywordTypeNode(SyntaxKind.VoidKeyword),
          ]),
        ),
        key,
        value,
      );
    }

    // #MARK: BuildDomain
    function buildDomain({ domain, services }: HassServiceDTO) {
      return type_writer.tsdoc.domainMarker(
        factory.createPropertySignature(
          undefined,
          factory.createIdentifier(domain),
          undefined,
          factory.createTypeLiteralNode(
            // Create functions based on provided services
            // { [...service_name](service_data): Promise<void> }
            Object.entries(services)
              .sort(([a], [b]) => (a > b ? UP : DOWN))
              .map(([key, value]) => buildService(domain, key, value)),
          ),
        ),
        domain,
      );
    }

    // #MARK: final build
    return type_writer.printer(
      "iCallService",
      factory.createTypeLiteralNode(
        domains
          .sort((a, b) => (a.domain > b.domain ? UP : DOWN))
          .map(domain => buildDomain(domain)),
      ),
    );
  };
}
