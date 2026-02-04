// Polyfill MUST be first import for Speechmatics SDK
import "event-target-polyfill";

/**
 * Speechmatics Flow Provider
 *
 * Wrapper component that provides Speechmatics Flow context to children.
 * Should wrap any component tree that uses useSpeechmaticsFlow hook.
 */

import { FlowProvider } from "@speechmatics/flow-client-react";
import type { ReactNode } from "react";

interface SpeechmaticsFlowProviderProps {
  children: ReactNode;
}

/**
 * Provider component for Speechmatics Flow
 *
 * Wraps children with FlowProvider configured for React Native.
 *
 * @example
 * ```tsx
 * <SpeechmaticsFlowProvider>
 *   <CookModeContent />
 * </SpeechmaticsFlowProvider>
 * ```
 */
export function SpeechmaticsFlowProvider({
  children,
}: SpeechmaticsFlowProviderProps) {
  return (
    <FlowProvider appId="digero-cook-mode" websocketBinaryType="arraybuffer">
      {children}
    </FlowProvider>
  );
}
