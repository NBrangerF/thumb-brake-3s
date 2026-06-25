import { randomUUID } from "node:crypto"

import type { HookRunState, VariantState } from "@/lib/hook-generator-v2/graph/types"

import type { HookRunTraceDraft, HookVariantTraceDraft } from "./types"

export type HookGenerationTraceRecord = {
  id: string
  requestId: string
  batchId: string
  clientVideoId: string
  videoRunId: string | null
  variantRole: string
  selectedHookId: string
  selectedHookType: string
  selectedCultureBorrowingId: string | null
  selectedCultureBorrowingName: string | null
  scriptSource: string
  videoProvider: string
  videoModel: string
  traceJson: Record<string, unknown>
  createdAt: string
}

export type PersistHookTraceResult = {
  attempted: boolean
  persisted: number
  errors: string[]
}

export function serializeHookTraceRecords(input: {
  state: HookRunState
  traceDraft: HookRunTraceDraft
  createdAt?: string
}): HookGenerationTraceRecord[] {
  const createdAt = input.createdAt ?? input.traceDraft.createdAt
  return input.traceDraft.variants.map((variantTrace) => {
    const variant = input.state.variants[variantTrace.clientVideoId]
    return {
      id: stableTraceId(input.traceDraft.batchId, variantTrace.clientVideoId),
      requestId: input.traceDraft.requestId,
      batchId: input.traceDraft.batchId,
      clientVideoId: variantTrace.clientVideoId,
      videoRunId: variantTrace.videoRunId,
      variantRole: variantTrace.role,
      selectedHookId: variantTrace.selectedHookId,
      selectedHookType: variantTrace.selectedHookType,
      selectedCultureBorrowingId: variantTrace.selectedCultureBorrowingId,
      selectedCultureBorrowingName: variantTrace.selectedCultureBorrowingName,
      scriptSource: variantTrace.scriptSource,
      videoProvider: input.state.videoSettings.videoProvider,
      videoModel: input.state.videoSettings.videoModel,
      traceJson: buildTraceJson(input.state, variantTrace, variant),
      createdAt,
    }
  })
}

export async function persistHookTraceBestEffort(input: {
  state: HookRunState
  traceDraft: HookRunTraceDraft | null
}): Promise<PersistHookTraceResult> {
  if (!input.traceDraft) {
    return { attempted: false, persisted: 0, errors: ["traceDraft missing"] }
  }
  return {
    attempted: false,
    persisted: 0,
    errors: ["Persistence is disabled in Fantastic Hook standalone v1"],
  }
}

function stableTraceId(batchId: string, clientVideoId: string) {
  if (batchId && clientVideoId) return `hook-trace-${batchId}-${clientVideoId}`
  return `hook-trace-${randomUUID()}`
}

function buildTraceJson(
  state: HookRunState,
  variantTrace: HookVariantTraceDraft,
  variant: VariantState | undefined,
): Record<string, unknown> {
  return {
    requestId: state.requestId,
    batchId: state.batchId,
    input: {
      productTitle: state.input.productTitle,
      intent: state.input.intent,
      intentText: state.input.intentText,
      analysisHints: state.input.analysisHints ?? null,
    },
    videoSettings: state.videoSettings,
    productBriefSummary: {
      productName: state.productBrief.productName,
      productCategory: state.productBrief.productCategory ?? null,
      coreSellingPoints: state.productBrief.marketingLogic.coreSellingPoints,
      targetAudience: state.productBrief.marketingLogic.targetAudience,
      painPoints: state.productBrief.marketingLogic.painPoints,
    },
    productContract: variant?.productContract ?? state.productContract ?? null,
    variantTrace,
    selectedHook: variant?.selectedHook ?? null,
    selectedCultureBorrowing: variant?.selectedCultureBorrowing ? {
      templateId: variant.selectedCultureBorrowing.templateId,
      nameCn: variant.selectedCultureBorrowing.nameCn,
      symbolEntryIds: variant.selectedCultureBorrowing.symbolEntryIds,
      symbolBorrowing: variant.selectedCultureBorrowing.symbolBorrowing,
      fusionDirectives: variant.selectedCultureBorrowing.fusionDirectives,
    } : null,
    resourceBundleIds: variant?.resourceBundle?.resourceIds ?? null,
    resourceLibraryRefs: variant?.resourceBundle?.libraryRefs ?? null,
    scriptCreativeSpec: variant?.scriptCreativeSpec ?? null,
    nativeScriptAssetShadow: variant?.nativeScriptAssetShadow ?? null,
    nativeScriptAssetShadowError: variant?.nativeScriptAssetShadowError ?? null,
    nativeScriptAssetShadowRawSnippet: variant?.nativeScriptAssetShadowRawSnippet ?? null,
    traceTimings: variant?.traceTimings ?? [],
    scriptAssetSource: variant?.scriptAssetSource ?? null,
    promptCompilerMode: variant?.promptCompilerMode ?? null,
    evaluatorRewriteApplied: variant?.evaluatorRewriteApplied ?? null,
    evaluatorRewriteHistory: variant?.evaluatorRewriteHistory ?? [],
    scriptAssetBeforeRepair: variant?.scriptAssetDraft ?? null,
    validationIssues: variant?.validationIssues ?? [],
    repairHistory: variant?.repairHistory ?? [],
    finalScriptAsset: variant?.finalScriptAsset ?? null,
    currentFinalPrompt: variant?.compiledVideoPrompt?.prompt ?? null,
    assetCompilerShadowPrompt: variant?.assetCompilerShadowPrompt?.prompt ?? null,
    assetCompilerShadowSections: variant?.assetCompilerShadowPrompt?.sections ?? null,
    assetCompilerShadowError: variant?.assetCompilerShadowError ?? null,
    evaluatorScores: variant?.creativeScore ?? null,
    videoJob: variant?.videoJob ?? null,
  }
}
