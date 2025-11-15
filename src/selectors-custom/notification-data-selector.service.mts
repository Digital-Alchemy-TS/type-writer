import { TServiceParams } from "@digital-alchemy/core";
import { ServiceListFieldDescription, ServiceListSelector } from "@digital-alchemy/hass";
import { factory } from "typescript";

export function NotificationDataSelector({ lifecycle, type_build }: TServiceParams) {
  lifecycle.onPreInit(() => {
    type_build.selectors.register({
      generator: () => {
        return factory.createIntersectionTypeNode([
          factory.createTypeReferenceNode(factory.createIdentifier("NotificationData"), undefined),
          factory.createParenthesizedType(
            factory.createUnionTypeNode([
              factory.createTypeReferenceNode(
                factory.createIdentifier("AndroidNotificationData"),
                undefined,
              ),
              factory.createTypeReferenceNode(
                factory.createIdentifier("AppleNotificationData"),
                undefined,
              ),
            ]),
          ),
        ]);
      },
      matcher: (selector: ServiceListSelector, details: ServiceListFieldDescription, context) => {
        return (
          selector &&
          "object" in selector &&
          selector.object === null &&
          context.serviceDomain === "notify" &&
          context.parameterName === "data"
        );
      },
    });
  });
}
