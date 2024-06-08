import { TServiceParams } from "@digital-alchemy/core";

export function PersonBuilder({ type_writer }: TServiceParams) {
  type_writer.domain.register({
    attributes: () => undefined,
    domain: "person",
    state: () => type_writer.ast.state_enum(["home", "away"]),
  });
}
