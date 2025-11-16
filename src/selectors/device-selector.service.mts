import { is, TServiceParams } from "@digital-alchemy/core";
import { ServiceListSelector } from "@digital-alchemy/hass";
import { factory, TypeNode } from "typescript";

export function DeviceSelector({ lifecycle, type_build }: TServiceParams) {
  lifecycle.onPreInit(() => {
    type_build.selectors.register({
      generator: (selector: ServiceListSelector) => {
        let node: TypeNode = factory.createTypeReferenceNode(
          factory.createIdentifier("TDeviceId"),
          undefined,
        );
        if (selector.device?.multiple) {
          node = factory.createArrayTypeNode(node);
        }
        return node;
      },
      matcher: (selector: ServiceListSelector) => !is.undefined(selector?.device),
    });
  });
}
