import { DOWN, is, TServiceParams, UP } from "@digital-alchemy/core";
import { HassServiceDTO, ServiceListField, ServiceListServiceTarget } from "@digital-alchemy/hass";
import { factory, SyntaxKind, TypeElement, TypeNode, TypeParameterDeclaration } from "typescript";

export async function ICallServiceExtension({ hass, type_build }: TServiceParams) {
  return async function () {
    const domains = await hass.fetch.listServices();
    const sortedDomains = domains.toSorted((a, b) => a.domain.localeCompare(b.domain));

    function serviceParameters(
      domain: string,
      key: string,
      value: ServiceListField,
      genericEntities: string,
    ) {
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
              type_build.entity.createTarget(
                value.target as ServiceListServiceTarget,
                genericEntities,
              ),
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
      const isReturnResponse = is.boolean(value.response?.optional);
      const genericIdent = "T";
      let genericIdentities = "";
      const generic = [] as TypeParameterDeclaration[];

      // Override default return type for some known cases
      let defaultReturnType: TypeNode = factory.createKeywordTypeNode(SyntaxKind.UnknownKeyword);
      // * weather.get_forecasts
      if (domain === "weather" && key === "get_forecasts") {
        // https://github.com/Digital-Alchemy-TS/hass/issues/66
        genericIdentities = "ENTITIES";
        defaultReturnType = factory.createTypeReferenceNode(factory.createIdentifier("Record"), [
          factory.createTypeReferenceNode(factory.createIdentifier("ENTITIES"), undefined),
          factory.createTypeLiteralNode([
            factory.createPropertySignature(
              undefined,
              factory.createIdentifier("forecast"),
              undefined,
              factory.createArrayTypeNode(
                factory.createTypeReferenceNode(
                  factory.createIdentifier("WeatherGetForecasts"),
                  undefined,
                ),
              ),
            ),
          ]),
        ]);
        generic.push(
          factory.createTypeParameterDeclaration(
            undefined,
            factory.createIdentifier(genericIdentities),
            factory.createTypeReferenceNode(factory.createIdentifier("PICK_ENTITY"), [
              factory.createLiteralTypeNode(factory.createStringLiteral("weather")),
            ]),
            undefined,
          ),
        );
      }

      let returnType: TypeNode | undefined = factory.createTypeReferenceNode(
        factory.createIdentifier("Promise"),
        [factory.createKeywordTypeNode(SyntaxKind.VoidKeyword)],
      );

      // If the service might return a response, change instead to <T = unknown>(service_data) => Promise<T>
      if (isReturnResponse) {
        generic.push(
          factory.createTypeParameterDeclaration(
            undefined,
            factory.createIdentifier(genericIdent),
            undefined,
            defaultReturnType,
          ),
        );
        returnType = factory.createExpressionWithTypeArguments(
          factory.createIdentifier("Promise"),
          [factory.createTypeReferenceNode(factory.createIdentifier(genericIdent), undefined)],
        );
      }

      return type_build.tsdoc.serviceComment(
        factory.createMethodSignature(
          undefined,
          factory.createIdentifier(key),
          undefined,
          generic,
          serviceParameters(domain, key, value, genericIdentities),
          returnType,
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
