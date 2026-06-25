import type { HookRunState } from "@/lib/hook-generator-v2/graph/types"

import type { VariantState } from "@/lib/hook-generator-v2/graph/types"
import type { HookCreativeResourceBundle, RuntimeProductContract } from "@/lib/hook-generator-v2/resources/types"

import {
  HOOK_TRACE_PERSISTENCE_DECISION,
  type HookRunTraceDraft,
  type HookSubmittedRunTraceInput,
} from "./types"

export type BuildHookTraceDraftInput = {
  state: HookRunState
  submittedRuns: HookSubmittedRunTraceInput[]
  createdAt?: string
}

export function buildHookTraceDraft(input: BuildHookTraceDraftInput): HookRunTraceDraft {
  const submittedByClientVideoId = new Map(
    input.submittedRuns.map((run) => [run.clientVideoId, run]),
  )

  return {
    requestId: input.state.requestId,
    batchId: input.state.batchId,
    createdAt: input.createdAt ?? new Date().toISOString(),
    persistenceDecision: HOOK_TRACE_PERSISTENCE_DECISION,
    variants: input.state.narrativeDraws.map((draw) => {
      const variant = input.state.variants[draw.clientVideoId]
      const submitted = submittedByClientVideoId.get(draw.clientVideoId)

      return {
        clientVideoId: draw.clientVideoId,
        role: variant?.role ?? draw.role,
        selectedHookId: variant?.selectedHook.patternCardId ?? draw.selectedHook.patternCardId,
        selectedHookType: variant?.selectedHook.hookType ?? draw.selectedHook.hookType,
        selectedCultureBorrowingId: variant?.selectedCultureBorrowing?.templateId ?? null,
        selectedCultureBorrowingName: variant?.selectedCultureBorrowing?.nameCn ?? null,
        scriptSource: submitted?.scriptSource ?? "fallback",
        finalPromptReady: submitted?.finalPromptReady ?? false,
        videoRunId: submitted?.videoRunId ?? null,
        ...(variant?.resourceBundle ? { resourceBundleIds: variant.resourceBundle.resourceIds } : {}),
        ...(variant?.resourceBundle ? { resourceLibraryRefs: variant.resourceBundle.libraryRefs } : {}),
        ...(variant ? { culture: summarizeCultureTrace(variant) } : {}),
        ...(summarizeProductTrace(variant, input.state) ? { product: summarizeProductTrace(variant, input.state)! } : {}),
        ...(variant?.resourceBundle ? { resourceSummary: summarizeResourceTrace(variant.resourceBundle) } : {}),
        ...(variant ? summarizeScriptAssetTrace(variant) : {}),
        ...(variant ? { qualityGate: summarizeQualityTrace(variant) } : {}),
        ...(variant?.compiledVideoPrompt ? { compiler: {
          provider: variant.compiledVideoPrompt.provider,
          modelFamily: variant.compiledVideoPrompt.modelFamily,
          promptReady: Boolean(variant.compiledVideoPrompt.prompt.trim()),
          firstFramePromptReady: Boolean(variant.compiledVideoPrompt.firstFramePrompt?.trim()),
          inputImageRoles: variant.compiledVideoPrompt.inputImages.map((image) => image.declared_role),
          productName: variant.compiledVideoPrompt.metadata.productName,
          productCategory: variant.compiledVideoPrompt.metadata.productCategory,
        } } : {}),
        ...(variant ? { shadow: {
          nativeScriptAssetReady: Boolean(variant.nativeScriptAssetShadow),
          ...(variant.nativeScriptAssetShadowError ? { nativeScriptAssetError: variant.nativeScriptAssetShadowError } : {}),
          assetCompilerPromptReady: Boolean(variant.assetCompilerShadowPrompt?.prompt.trim()),
          ...(variant.assetCompilerShadowPrompt?.prompt ? { assetCompilerPromptLength: variant.assetCompilerShadowPrompt.prompt.length } : {}),
          ...(variant.assetCompilerShadowError ? { assetCompilerError: variant.assetCompilerShadowError } : {}),
        } } : {}),
        ...(variant?.creativeScore ? { evaluator: variant.creativeScore } : {}),
      }
    }),
  }
}

function summarizeCultureTrace(variant: VariantState) {
  const culture = variant.selectedCultureBorrowing
  const motif = variant.resourceBundle?.cultureMotif
  return {
    cultureMotifId: culture?.cultureMotifId ?? motif?.cultureMotifId ?? variant.resourceBundle?.resourceIds.cultureMotifId ?? null,
    motifFamily: culture?.motifFamily ?? motif?.motifFamily ?? null,
    visualRenderProfileId: culture?.visualRenderProfileId ?? motif?.visualRenderProfileId ?? variant.resourceBundle?.resourceIds.visualRenderProfileId ?? null,
    shotPrimitiveIds: culture?.shotPrimitiveIds ?? motif?.shotPrimitiveIds ?? variant.resourceBundle?.resourceIds.shotPrimitiveIds ?? [],
    whySelected: culture?.whySelected ?? motif?.whySelected ?? [],
  }
}

function summarizeProductTrace(
  variant: VariantState | undefined,
  state: HookRunState,
) {
  const contract = variant?.productContract ?? state.productContract ?? productBriefAsContract(state)
  if (!contract) return null
  return {
    productName: contract.productName,
    productCategory: contract.productCategory,
    inferredSubCategory: contract.inferredSubCategory ?? null,
    visualAnchorCount: contract.visualAnchors?.length ?? 0,
    usageAnchorCount: contract.usageAnchors?.length ?? 0,
    forbiddenConfusionCount: contract.forbiddenVisualConfusions?.length ?? 0,
  }
}

function productBriefAsContract(state: HookRunState): RuntimeProductContract | null {
  if (!state.productBrief.productName || !state.productBrief.productCategory) return null
  return {
    productName: state.productBrief.productName,
    productCategory: state.productBrief.productCategory,
    inferredSubCategory: state.productBrief.productCategory,
    visualAnchors: state.productBrief.productName ? [state.productBrief.productName] : [],
    packagingSignals: [],
    usageAnchors: [],
    typicalUseScenes: [],
    allowedProductActions: [],
    forbiddenVisualConfusions: [],
    claimRiskTags: [],
    modelRiskTags: [],
    source: {
      productAnalysisUsed: false,
      fallbackCategoryRuleIds: [],
    },
  }
}

function summarizeResourceTrace(bundle: HookCreativeResourceBundle) {
  return {
    hasAttentionMicroPattern: Boolean(bundle.attentionMicroPattern.id),
    audienceSituationCount: bundle.audienceSituations.length,
    eventPrimitiveCount: bundle.eventCandidates.length,
    productBridgeRoleCount: bundle.bridgeCandidates.length,
    proofVisualizationCount: bundle.proofCandidates.length,
    shotCardCount: bundle.shotCandidates.length,
    constraintRuleCount: bundle.constraints.length,
    failureWarningCount: bundle.failureWarnings.length,
    exampleCount: bundle.examples.length,
    hasCultureMotif: Boolean(bundle.cultureMotif),
    hookStudioReferenceCount: (
      bundle.libraryRefs.categoryPlaybookIds.length +
      bundle.libraryRefs.referenceAssetIds.length +
      bundle.libraryRefs.trendObservationIds.length
    ),
  }
}

function summarizeScriptAssetTrace(variant: VariantState) {
  const asset = variant.finalScriptAsset ?? variant.scriptAssetDraft
  if (!asset) return {}
  return {
    scriptAssetSummary: {
      hookSummary: asset.hookSummary,
      productRole: asset.productRole.role,
      timelineShotCount: asset.timelineShots.length,
      retentionPurposes: unique(asset.timelineShots.map((shot) => shot.retentionPurpose)),
      hasProductBridgeShot: asset.timelineShots.some((shot) =>
        shot.retentionPurpose === "product_bridge" &&
        shot.productVisibility !== "none"
      ),
      firstFrameStopSignal: asset.firstFrameIntent.stopSignal,
      riskFlags: asset.riskFlags,
      cultureFusionEnabled: Boolean(asset.cultureFusionMechanism?.enabled),
      cultureFusionNotJustStyle: asset.cultureFusionMechanism?.notJustStyle ?? null,
    },
  }
}

function summarizeQualityTrace(variant: VariantState) {
  const issues = variant.validationIssues ?? []
  return {
    status: issues.some((issue) => issue.severity === "error") ? "fail" as const : "pass" as const,
    issueCodes: unique(issues.map((issue) => issue.code)),
    issueCount: issues.length,
    repairAttempts: variant.repairAttempts,
    repairHistoryCount: variant.repairHistory.length,
  }
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))]
}
