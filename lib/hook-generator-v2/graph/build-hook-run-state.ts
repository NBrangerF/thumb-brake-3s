import type { HookNarrativeDraw } from "@/lib/hook-one-shot"

import {
  DEFAULT_HOOK_RUN_POLICY,
  type HookOneShotRequest,
  type HookOneShotVideoSettings,
  type HookRunPolicy,
  type HookRunState,
  type VariantState,
} from "./types"
import type { HookProductBrief } from "@/lib/hook-generator"

export type BuildHookRunStateInput = {
  requestId: string
  batchId: string
  input: HookOneShotRequest
  videoSettings: HookOneShotVideoSettings
  productBrief: HookProductBrief
  narrativeDraws: HookNarrativeDraw[]
  runPolicy?: Partial<HookRunPolicy>
}

export function buildHookRunState(input: BuildHookRunStateInput): HookRunState {
  const runPolicy: HookRunPolicy = {
    ...DEFAULT_HOOK_RUN_POLICY,
    ...input.runPolicy,
  }

  return {
    requestId: input.requestId,
    batchId: input.batchId,
    input: input.input,
    videoSettings: input.videoSettings,
    productBrief: input.productBrief,
    narrativeDraws: input.narrativeDraws,
    variants: buildVariantStates(input.narrativeDraws),
    runPolicy,
    trace: [],
  }
}

function buildVariantStates(narrativeDraws: HookNarrativeDraw[]) {
  return narrativeDraws.reduce<Record<string, VariantState>>((variants, draw) => {
    variants[draw.clientVideoId] = {
      clientVideoId: draw.clientVideoId,
      role: draw.role,
      selectedHook: draw.selectedHook,
      selectedCultureBorrowing: draw.selectedCultureBorrowing,
      repairAttempts: 0,
      repairHistory: [],
      status: "pending",
    }
    return variants
  }, {})
}
