import { is, SINGLE, START, TServiceParams } from "@digital-alchemy/core";
import {
  ALL_DOMAINS,
  ServiceListField,
  ServiceListFieldDescription,
  ServiceListSelector,
} from "@digital-alchemy/hass";
import { dump } from "js-yaml";
import { addSyntheticLeadingComment, PropertySignature, SyntaxKind } from "typescript";

export function TSDoc({ config }: TServiceParams) {
  // #MARK: escapeCommentContent
  function escapeCommentContent(content: string): string {
    // Always sanitize content first to prevent comment breaking
    let sanitized = content.replace(/\*\//g, "[COMMENT_END]").replace(/\/\*/g, "[COMMENT_START]");

    if (
      config.type_build.SHORTEN_COMMENTS &&
      sanitized.length > config.type_build.SHORTEN_COMMENTS
    ) {
      sanitized =
        sanitized.substring(START, config.type_build.SHORTEN_COMMENTS) + "... [truncated]";
    }

    return sanitized;
  }

  function showSelectorContent(selector: ServiceListSelector) {
    if (selector?.boolean === null) {
      return false;
    }
    if (selector?.text === null) {
      return false;
    }
    if (selector?.select) {
      return false;
    }
    if (selector?.number === null) {
      return false;
    }
    if (selector?.time === null) {
      return false;
    }
    if (is.object(selector?.entity) && Object.keys(selector.entity).length === SINGLE) {
      const entity = selector.entity;
      if (entity.multiple === true) {
        return false;
      }
      if (!is.empty(entity.domain)) {
        return false;
      }
    }
    return true;
  }

  // #MARK: ServiceComment
  function serviceComment(method: PropertySignature, key: string, value: ServiceListField) {
    return addSyntheticLeadingComment(
      method,
      SyntaxKind.MultiLineCommentTrivia,
      `*\n` +
        [
          `### ${value.name || key}`,
          "",
          ...escapeCommentContent(value.description)
            .split("\n")
            .map(i => `> ${i}`),
        ]
          .map(i => ` * ${i}`)
          .join(`\n`) +
        "\n ",
      true,
    );
  }

  // #MARK: parameterComment
  function parameterComment(
    property: PropertySignature,
    parameterName: string,
    { selector, ...details }: ServiceListFieldDescription,
  ) {
    const example = String(details.example ?? "");
    const selectorContent = showSelectorContent(selector)
      ? [
          "",
          "## Selector",
          "",
          "> ```yaml",
          ...dump(selector)
            .trim()
            .split("\n")
            .map(i => `> ${i}`),
          "> ```",
        ]
      : [];

    let out =
      `*\n` +
      [
        "## " + (is.empty(details.name) ? parameterName : details.name),
        ...(is.empty(details.description)
          ? []
          : ["", "> " + escapeCommentContent(details.description)]),
        ...(is.empty(example)
          ? []
          : [
              "",
              `### Example`,
              "",
              "> ```json",
              ...JSON.stringify({ [parameterName]: example }, undefined, "  ")
                .split("\n")
                .map(i => `> ${i}`),
              "> ```",
            ]),
        ...(is.undefined(details.default)
          ? []
          : [
              "",
              `### Default`,
              "",
              "> ```json",
              ...JSON.stringify(details.default)
                .split("\n")
                .map(i => `> ${i}`),
              "> ```",
            ]),
        ...selectorContent,
      ]
        .map(i => ` * ${i}`)
        .join(`\n`);
    out = out + "\n ";

    return addSyntheticLeadingComment(property, SyntaxKind.MultiLineCommentTrivia, out, true);
  }

  function domainMarker(property: PropertySignature, domain: ALL_DOMAINS) {
    return addSyntheticLeadingComment(
      property,
      SyntaxKind.SingleLineCommentTrivia,
      ` # MARK: ${domain}`,
      true,
    );
  }

  return { domainMarker, escapeCommentContent, parameterComment, serviceComment };
}
