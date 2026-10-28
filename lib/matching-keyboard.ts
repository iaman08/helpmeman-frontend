/** Input policy for global matchmaker shortcuts; editing and native controls win. */
export interface MatchKeyboardInput {
  key: string;
  repeat?: boolean;
  busy?: boolean;
  isComposing?: boolean;
  defaultPrevented?: boolean;
  altKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  targetIsInteractive?: boolean;
}

export type MatchKeyboardAction = "skip" | "interested" | "priority" | "expand" | "undo";

export function getMatchKeyboardAction(input: MatchKeyboardInput): MatchKeyboardAction | null {
  if (input.busy || input.defaultPrevented || input.repeat || input.isComposing || input.targetIsInteractive || input.altKey) return null;
  if (input.ctrlKey || input.metaKey) {
    return !input.shiftKey && input.key.toLowerCase() === "z" ? "undo" : null;
  }
  if (input.shiftKey) return null;
  switch (input.key) {
    case "ArrowLeft": return "skip";
    case "ArrowRight": return "interested";
    case "ArrowUp": return "priority";
    case "Enter": return "expand";
    default: return null;
  }
}
