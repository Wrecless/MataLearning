import type { ReactNode } from "react";

export type MessageTone = "neutral" | "success" | "error" | "hint";

export interface StatusMessageProps {
  children: ReactNode;
  tone: MessageTone;
}

export interface MetricProps {
  label: string;
  value: string | number;
}

export interface GlossaryTerm {
  term: string;
  definition: string;
}
