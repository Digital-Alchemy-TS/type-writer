import { is, TServiceParams } from "@digital-alchemy/core";
import { ConversationAgent, ServiceListSelector } from "@digital-alchemy/hass";
import { factory, SyntaxKind, TypeNode } from "typescript";

export function ConversationAgentSelector({ hass, lifecycle, logger, type_build }: TServiceParams) {
  let agentIds: string[] = [];

  hass.socket.onConnect(async () => {
    try {
      const agents = (await hass.conversation.listAgents()) as ConversationAgent[];
      agentIds = agents.map(agent => agent.id).filter(Boolean);
      logger.debug({ count: agentIds.length }, "loaded conversation agent IDs for type generation");
    } catch (error) {
      logger.warn({ error }, "failed to fetch conversation agents, falling back to string type");
      agentIds = [];
    }
  });

  lifecycle.onPreInit(() => {
    type_build.selectors.register({
      generator: (): TypeNode => {
        if (is.empty(agentIds)) {
          return factory.createKeywordTypeNode(SyntaxKind.StringKeyword);
        }
        return factory.createUnionTypeNode(
          agentIds.map(id => factory.createLiteralTypeNode(factory.createStringLiteral(id))),
        );
      },
      matcher: (selector: ServiceListSelector) => !is.undefined(selector?.conversation_agent),
    });
  });
}
