import { DOWN, is, TServiceParams, UP } from "@digital-alchemy/core";
import { HassServiceDTO, ServiceListField, ServiceListServiceTarget } from "@digital-alchemy/hass";
import { factory, SyntaxKind, TypeElement, TypeNode } from "typescript";

export async function ICallServiceExtension({ hass, type_build }: TServiceParams) {
  return async function () {
    const domains = await hass.fetch.listServices();
    const sortedDomains = domains.sort((a, b) => (a.domain > b.domain ? UP : DOWN));

    function serviceParameters(domain: string, key: string, value: ServiceListField) {
      // If the object doesn't require any properties to be passed, then
      // the entire argument should be flagged as optional
      const everythingIsOptional = Object.values(value.fields).some(i =>
        is.boolean(i.required) ? !i.required : true,
      );

      // * Build contents of object:
      // > iCallService = {
      // >  [DOMAIN]: {
      // >     [service_name]: (service_data) => Promise<void | unknown>
      //                          ^^^ this object
      // >   }
      // > }
      return [
        factory.createParameterDeclaration(
          undefined,
          undefined,
          factory.createIdentifier("service_data"),
          everythingIsOptional ? factory.createToken(SyntaxKind.QuestionToken) : undefined,
          factory.createTypeLiteralNode(
            [
              ...Object.entries(value.fields)
                .sort(([a], [b]) => (a > b ? UP : DOWN))
                .map(([service, details]) =>
                  type_build.fields.fieldPropertySignature(service, details, domain, key),
                ),
              type_build.entity.createTarget(value.target as ServiceListServiceTarget),
            ].filter(i => !is.undefined(i)) as TypeElement[],
          ),
        ),
      ];
    }

    function buildService(domain: string, key: string, value: ServiceListField) {
      // * Create all the methods for a particular domain
      // > iCallService = {
      // >  [DOMAIN]: {
      //          this object    vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
      // >     [service_name]: (service_data) => Promise<void | unknown>
      // >   }
      // > }
      const genericIdent = "T";
      let defaultReturnType: TypeNode = factory.createKeywordTypeNode(SyntaxKind.VoidKeyword);
      if (domain === "weather" && key === "get_forecasts") {
        defaultReturnType = factory.createTypeReferenceNode(
          factory.createIdentifier("WeatherGetForecasts"),
          undefined,
        );
      }
      return type_build.tsdoc.serviceComment(
        factory.createMethodSignature(
          undefined,
          factory.createIdentifier(key),
          undefined,
          [
            factory.createTypeParameterDeclaration(
              undefined,
              factory.createIdentifier(genericIdent),
              undefined,
              defaultReturnType,
            ),
          ],
          serviceParameters(domain, key, value),
          factory.createExpressionWithTypeArguments(factory.createIdentifier("Promise"), [
            factory.createTypeReferenceNode(factory.createIdentifier(genericIdent), undefined),
          ]),
        ),
        key,
        value,
      );
    }

    function buildDomain({ domain, services }: HassServiceDTO) {
      // * Create all the methods for a particular domain
      // > iCallService = {
      // >  [DOMAIN]: {
      //             ^^^ this object
      // >     [service_name]: (service_data) => Promise<void | unknown>
      // >   }
      // > }

      const sortedServices = Object.entries(services).sort(([a], [b]) => (a > b ? UP : DOWN));
      return type_build.tsdoc.domainMarker(
        factory.createPropertySignature(
          undefined,
          factory.createIdentifier(domain),
          undefined,
          factory.createTypeLiteralNode(
            sortedServices.map(([key, value]) => buildService(domain, key, value)),
          ),
        ),
        domain,
      );
    }

    // * Build the root level object based on the available list of service domains
    // > iCallService = {
    //                 ^^^ this object
    // >  [DOMAIN]: {
    // >     [service_name]: (service_data) => Promise<void | unknown>
    // >   }
    // > }
    return type_build.printer(
      "iCallService",
      factory.createTypeLiteralNode(sortedDomains.map(domain => buildDomain(domain))),
    );
  };
}
