/* eslint-disable unicorn/consistent-function-scoping */
import { DOWN, is, TServiceParams, UP } from "@digital-alchemy/core";
import {
  HassServiceDTO,
  ServiceListField,
  ServiceListFieldDescription,
  ServiceListServiceTarget,
} from "@digital-alchemy/hass";
import { dump } from "js-yaml";
import {
  addSyntheticLeadingComment,
  factory,
  SyntaxKind,
  TypeElement,
  TypeNode,
} from "typescript";
export async function ICallServiceExtension({
  hass,
  logger,
  type_writer,
}: TServiceParams) {
  return async function () {
    const domains = await hass.fetch.listServices();

    // #MARK: createTarget
    function createTarget(
      target: ServiceListServiceTarget,
      fallbackDomain: string,
    ) {
      if (is.empty(target)) {
        return undefined;
      }
      if (target.entity) {
        const property = factory.createPropertySignature(
          undefined,
          factory.createIdentifier("entity_id"),
          undefined,
          generateEntityList(target, fallbackDomain),
        );
        return addSyntheticLeadingComment(
          property,
          SyntaxKind.MultiLineCommentTrivia,
          "*\n" +
            ["Assisted definition"].map(i => ` * ${i}`).join(`\n`) +
            "\n ",
          true,
        );
      }
      if (target.integration) {
        return undefined;
      }
      if (target.device) {
        return undefined;
      }
      logger.error(
        { target },
        `this#createTarget doesn't know what to do with target. Report as bug with this log line`,
      );
      return undefined;
    }

    // #MARK: generateEntityList
    /**
     * # entity_id
     *
     * This block is specifically for refining the `entity_id` type definitions
     */
    function generateEntityList(
      target: ServiceListServiceTarget,
      fallbackDomain: string,
    ) {
      const isEmpty =
        is.empty(target.entity) || target.entity.every(i => is.empty(i));
      if (isEmpty) {
        return factory.createParenthesizedType(
          factory.createUnionTypeNode([
            factory.createTypeReferenceNode(
              factory.createIdentifier("PICK_ENTITY"),
              undefined,
            ),
            factory.createArrayTypeNode(
              factory.createTypeReferenceNode(
                factory.createIdentifier("PICK_ENTITY"),
                undefined,
              ),
            ),
          ]),
        );
      }
      const domain = target.entity.find(i => !is.empty(i.domain))?.domain;
      const domainReference = domain?.shift() ?? fallbackDomain;
      return factory.createParenthesizedType(
        factory.createUnionTypeNode([
          factory.createTypeReferenceNode(
            factory.createIdentifier("PICK_ENTITY"),
            [
              factory.createLiteralTypeNode(
                factory.createStringLiteral(domainReference),
              ),
            ],
          ),
          factory.createArrayTypeNode(
            factory.createTypeReferenceNode(
              factory.createIdentifier("PICK_ENTITY"),
              [
                factory.createLiteralTypeNode(
                  factory.createStringLiteral(domainReference),
                ),
              ],
            ),
          ),
        ]),
      );
    }

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
        node = is.empty(domain)
          ? factory.createKeywordTypeNode(SyntaxKind.StringKeyword)
          : factory.createParenthesizedType(
              factory.createUnionTypeNode([
                factory.createTypeReferenceNode(
                  factory.createIdentifier("PICK_ENTITY"),
                  [
                    factory.createLiteralTypeNode(
                      factory.createStringLiteral(domain),
                    ),
                  ],
                ),
                factory.createArrayTypeNode(
                  factory.createTypeReferenceNode(
                    factory.createIdentifier("PICK_ENTITY"),
                    [
                      factory.createLiteralTypeNode(
                        factory.createStringLiteral(domain),
                      ),
                    ],
                  ),
                ),
              ]),
            );
      // : "option" | "option" | "option" | "option"
      else if (!is.undefined(selector?.select))
        node = factory.createUnionTypeNode(
          selector?.select.options.map(
            (i: string | Record<"label" | "value", string>) =>
              factory.createLiteralTypeNode(
                factory.createStringLiteral(is.string(i) ? i : i.value),
              ),
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

      const property = factory.createPropertySignature(
        undefined,
        factory.createIdentifier(parameterName),
        details.required
          ? undefined
          : factory.createToken(SyntaxKind.QuestionToken),
        node,
      );
      return addSyntheticLeadingComment(
        property,
        SyntaxKind.MultiLineCommentTrivia,
        parameterComment(parameterName, { selector, ...details }),
        true,
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
          ? factory.createTypeReferenceNode(
              factory.createIdentifier("Partial"),
              [
                factory.createTypeReferenceNode(
                  factory.createIdentifier("Record"),
                  [
                    factory.createTypeReferenceNode(
                      factory.createIdentifier("PICK_ENTITY"),
                      undefined,
                    ),
                    factory.createKeywordTypeNode(SyntaxKind.UnknownKeyword),
                  ],
                ),
              ],
            )
          : factory.createTypeReferenceNode(
              factory.createIdentifier("Record"),
              [
                factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
                factory.createKeywordTypeNode(SyntaxKind.UnknownKeyword),
              ],
            ),
        factory.createParenthesizedType(
          factory.createArrayTypeNode(
            factory.createKeywordTypeNode(SyntaxKind.UnknownKeyword),
          ),
        ),
      ]);
    }

    // #MARK: parameterComment
    function parameterComment(
      parameterName: string,
      { selector, ...details }: ServiceListFieldDescription,
    ) {
      const example = String(details.example ?? "");
      let out =
        `*\n` +
        [
          "## " + (is.empty(details.name) ? parameterName : details.name),
          ...(is.empty(details.description) ? [] : ["", details.description]),
          ...(is.empty(example)
            ? []
            : [
                "",
                `### Example`,
                "",
                "```json",
                JSON.stringify(example, undefined, "  "),
                "```",
              ]),
          ...(is.undefined(details.default)
            ? []
            : [
                "",
                `### Default`,
                "",
                "```json",
                ...JSON.stringify(details.default).split("\n"),
                "```",
              ]),
          "",

          "## Selector",
          "",
          "```yaml",
          dump(selector).trim(),
          "```",
        ]
          .map(i => ` * ${i}`)
          .join(`\n`);
      out = out + "`\n ";
      return out;
    }

    // #MARK: ServiceComment
    function serviceComment(key: string, value: ServiceListField) {
      return (
        `*\n` +
        [
          `### ${value.name || key}`,
          "",
          ...value.description.split("\n").map(i => `> ${i}`),
        ]
          .map(i => ` * ${i}`)
          .join(`\n`) +
        "\n "
      );
    }

    // #MARK: BuildServiceParameters
    function serviceParameters(
      domain: string,
      key: string,
      value: ServiceListField,
    ) {
      return [
        // f( service_data: { ...definition } )
        //    Provide this        ^^^^^^
        factory.createParameterDeclaration(
          undefined,
          undefined,
          factory.createIdentifier("service_data"),
          // ? If all the parameters are optional, then don't require the data at all
          Object.values(value.fields).some(i =>
            is.boolean(i.required) ? !i.required : true,
          )
            ? factory.createToken(SyntaxKind.QuestionToken)
            : undefined,
          factory.createTypeLiteralNode(
            [
              ...Object.entries(value.fields)
                .sort(([a], [b]) => (a > b ? UP : DOWN))
                .map(([service, details]) =>
                  fieldPropertySignature(service, details, domain, key),
                ),
              createTarget(value.target as ServiceListServiceTarget, domain),
            ].filter(i => !is.undefined(i)) as TypeElement[],
          ),
        ),
      ];
    }

    // #MARK: BuildService
    function buildService(
      domain: string,
      key: string,
      value: ServiceListField,
    ) {
      return addSyntheticLeadingComment(
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
        SyntaxKind.MultiLineCommentTrivia,
        serviceComment(key, value),
        true,
      );
    }

    // #MARK: BuildDomain
    function buildDomain({ domain, services }: HassServiceDTO) {
      return factory.createPropertySignature(
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
