import { formatCliCommand } from "../../cli/command-format.js";
import { SYSTEM_MARK, prefixSystemMessage } from "../../infra/system-message.js";
import type { ElevatedLevel, ReasoningLevel } from "./directives.js";

export const formatDirectiveAck = (text: string): string => {
  return prefixSystemMessage(text);
};

export const formatOptionsLine = (options: string) => `Options: ${options}.`;
export const withOptions = (line: string, options: string) =>
  `${line}\n${formatOptionsLine(options)}`;

export const formatElevatedRuntimeHint = () =>
  `${SYSTEM_MARK} Runtime is direct; sandboxing does not apply.`;

export const formatElevatedEvent = (level: ElevatedLevel) => {
  if (level === "full") {
    return "Elevated FULL — exec runs on host with auto-approval.";
  }
  if (level === "ask" || level === "on") {
    return "Elevated ASK — exec runs on host; approvals may still apply.";
  }
  return "Elevated OFF — exec stays in sandbox.";
};

export const formatReasoningEvent = (level: ReasoningLevel) => {
  if (level === "stream") {
    return "Reasoning STREAM — emit live <think>.";
  }
  if (level === "on") {
    return "Reasoning ON — include <think>.";
  }
  return "Reasoning OFF — hide <think>.";
};

export function enqueueModeSwitchEvents(params: {
  enqueueSystemEvent: (text: string, meta: { sessionKey: string; contextKey: string }) => void;
  sessionEntry: { elevatedLevel?: string | null; reasoningLevel?: string | null };
  sessionKey: string;
  elevatedChanged?: boolean;
  reasoningChanged?: boolean;
}): void {
  if (params.elevatedChanged) {
    const nextElevated = (params.sessionEntry.elevatedLevel ?? "off") as ElevatedLevel;
    params.enqueueSystemEvent(formatElevatedEvent(nextElevated), {
      sessionKey: params.sessionKey,
      contextKey: "mode:elevated",
    });
  }
  if (params.reasoningChanged) {
    const nextReasoning = (params.sessionEntry.reasoningLevel ?? "off") as ReasoningLevel;
    params.enqueueSystemEvent(formatReasoningEvent(nextReasoning), {
      sessionKey: params.sessionKey,
      contextKey: "mode:reasoning",
    });
  }
}

export function formatElevatedUnavailableText(params: {
  runtimeSandboxed: boolean;
  failures?: Array<{ gate: string; key: string }>;
  sessionKey?: string;
}): string {
  const lines: string[] = [];
  lines.push(
    `提升模式当前不可用 (runtime=${params.runtimeSandboxed ? "sandboxed" : "direct"}).`,
  );
  const failures = params.failures ?? [];
  if (failures.length > 0) {
    lines.push(`失败的门控: ${failures.map((f) => `${f.gate} (${f.key})`).join(", ")}`);
  } else {
    lines.push(
      "修复键: tools.elevated.enabled, tools.elevated.allowFrom.<provider>, agents.list[].tools.elevated.*",
    );
  }
  if (params.sessionKey) {
    lines.push(
      `参见: ${formatCliCommand(`openaeon sandbox explain --session ${params.sessionKey}`)}`,
    );
  }
  return lines.join("\n");
}