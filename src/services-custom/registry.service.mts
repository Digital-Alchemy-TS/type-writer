import { TServiceParams } from "@digital-alchemy/core";
import { TypeNode, TypeParameterDeclaration } from "typescript";

export type ServiceOverrideMatcher = (domain: string, serviceName: string) => boolean;

export type ServiceOverrideGenerator = (domain: string, serviceName: string) => {
  genericIdentities?: string;
  defaultReturnType: TypeNode;
  genericParams?: TypeParameterDeclaration[];
};

export type ServiceOverrideHandler = {
  matcher: ServiceOverrideMatcher;
  generator: ServiceOverrideGenerator;
};

export function ServiceOverrideRegistry({}: TServiceParams) {
  const handlers: ServiceOverrideHandler[] = [];

  return {
    register(handler: ServiceOverrideHandler) {
      handlers.push(handler);
    },
    find(domain: string, serviceName: string): ServiceOverrideHandler | undefined {
      return handlers.find(handler => handler.matcher(domain, serviceName));
    },
  };
}
