import type { HookNarrativeRole } from "@/lib/hook-one-shot"
import type { VideoProvider } from "@/lib/video-generation/model-capabilities"
import type { HookOneShotModelFamily } from "@/lib/hook-generator-v2/graph/types"
import type { HookCreativeResourceIds, HookResourceLibraryRefs } from "@/lib/hook-generator-v2/resources/types"
import type { HookCreativeScore } from "@/lib/hook-generator-v2/eval/tension-culture-evaluator"

export type HookScriptSource = "fallback" | "llm"

export type HookTracePersistenceDecision = {
  phase: "phase_2"
  mode: "typed_object_and_db_best_effort"
  persistToDb: true
}

export const HOOK_TRACE_PERSISTENCE_DECISION: HookTracePersistenceDecision = {
  phase: "phase_2",
  mode: "typed_object_and_db_best_effort",
  persistToDb: true,
}

export type HookSubmittedRunTraceInput = {
  clientVideoId: string
  scriptSource: HookScriptSource
  finalPromptReady: boolean
  videoRunId: string | null
}

export type HookVariantProductTraceSummary = {
  productName: string
  productCategory: string
  inferredSubCategory: string | null
  visualAnchorCount: number
  usageAnchorCount: number
  forbiddenConfusionCount: number
}

export type HookVariantResourceTraceSummary = {
  hasAttentionMicroPattern: boolean
  audienceSituationCount: number
  eventPrimitiveCount: number
  productBridgeRoleCount: number
  proofVisualizationCount: number
  shotCardCount: number
  constraintRuleCount: number
  failureWarningCount: number
  exampleCount: number
  hasCultureMotif: boolean
  hookStudioReferenceCount: number
}

export type HookVariantCultureTraceSummary = {
  cultureMotifId: string | null
  motifFamily: string | null
  visualRenderProfileId: string | null
  shotPrimitiveIds: string[]
  whySelected: string[]
}

export type HookVariantScriptAssetTraceSummary = {
  hookSummary: string
  productRole: string
  timelineShotCount: number
  retentionPurposes: string[]
  hasProductBridgeShot: boolean
  firstFrameStopSignal: string
  riskFlags: string[]
  cultureFusionEnabled: boolean
  cultureFusionNotJustStyle: boolean | null
}

export type HookVariantQualityTraceSummary = {
  status: "pass" | "fail"
  issueCodes: string[]
  issueCount: number
  repairAttempts: number
  repairHistoryCount: number
}

export type HookVariantCompilerTraceSummary = {
  provider: VideoProvider
  modelFamily: HookOneShotModelFamily
  promptReady: boolean
  firstFramePromptReady: boolean
  inputImageRoles: string[]
  productName: string
  productCategory: string
}

export type HookVariantTraceDraft = {
  clientVideoId: string
  role: HookNarrativeRole
  selectedHookId: string
  selectedHookType: string
  selectedCultureBorrowingId: string | null
  selectedCultureBorrowingName: string | null
  scriptSource: HookScriptSource
  finalPromptReady: boolean
  videoRunId: string | null
  resourceBundleIds?: HookCreativeResourceIds
  resourceLibraryRefs?: HookResourceLibraryRefs
  culture?: HookVariantCultureTraceSummary
  product?: HookVariantProductTraceSummary
  resourceSummary?: HookVariantResourceTraceSummary
  scriptAssetSummary?: HookVariantScriptAssetTraceSummary
  qualityGate?: HookVariantQualityTraceSummary
  compiler?: HookVariantCompilerTraceSummary
  shadow?: {
    nativeScriptAssetReady: boolean
    nativeScriptAssetError?: string
    assetCompilerPromptReady: boolean
    assetCompilerPromptLength?: number
    assetCompilerError?: string
  }
  evaluator?: HookCreativeScore
}

export type HookRunTraceDraft = {
  requestId: string
  batchId: string
  createdAt: string
  persistenceDecision: HookTracePersistenceDecision
  variants: HookVariantTraceDraft[]
}
