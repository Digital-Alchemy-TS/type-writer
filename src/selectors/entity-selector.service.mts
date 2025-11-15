import { is, TServiceParams } from "@digital-alchemy/core";
import { ServiceListSelector } from "@digital-alchemy/hass";

export function EntitySelector({ lifecycle, type_build }: TServiceParams) {
  lifecycle.onPreInit(() => {
    type_build.selectors.register({
      generator: (selector: ServiceListSelector) => {
        return type_build.entity.buildEntityReference(selector);
      },
      matcher: (selector: ServiceListSelector) => !is.undefined(selector?.entity),
    });
  });
}
