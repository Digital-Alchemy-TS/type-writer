import { DOWN, is, TServiceParams, UP } from "@digital-alchemy/core";
import { HassServiceDTO, ServiceListField, ServiceListServiceTarget } from "@digital-alchemy/hass";
import { factory, SyntaxKind, TypeElement } from "typescript";

export async function ICallServiceExtension({ hass, type_writer }: TServiceParams) {
  return async function () {
    const domains = await hass.fetch.listServices();

    // #MARK: BuildServiceParameters
    function serviceParameters(domain: string, key: string, value: ServiceListField) {
      return [
        // Build contents of object:
        //
        // f(service_data: {
        //   [service]: [property signature]
        //  })
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
                .map(([service, details]) =>
                  type_writer.fields.fieldPropertySignature(service, details, domain, key),
                ),
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
