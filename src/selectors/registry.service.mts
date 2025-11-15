import { TServiceParams } from "@digital-alchemy/core";
import { ServiceListFieldDescription, ServiceListSelector } from "@digital-alchemy/hass";
import { TypeNode } from "typescript";

export type SelectorMatcher = (
  selector: ServiceListSelector,
  details: ServiceListFieldDescription,
  context: {
    parameterName: string;
    serviceDomain: string;
    serviceName: string;
  },
) => boolean;

export type SelectorGenerator = (
  selector: ServiceListSelector,
  details: ServiceListFieldDescription,
  context: {
    parameterName: string;
    serviceDomain: string;
    serviceName: string;
  },
) => TypeNode;

export type SelectorHandler = {
  matcher: SelectorMatcher;
  generator: SelectorGenerator;
};

export function SelectorRegistry({}: TServiceParams) {
  const handlers: SelectorHandler[] = [];

  return {
    find(
      selector: ServiceListSelector,
      details: ServiceListFieldDescription,
      context: { parameterName: string; serviceDomain: string; serviceName: string },
    ): SelectorHandler | undefined {
      return handlers.find(handler => handler.matcher(selector, details, context));
    },
    register(handler: SelectorHandler) {
      handlers.push(handler);
    },
  };
}
