import type { HookProductBrief } from "@/lib/hook-generator"
import type {
  HookNarrativeDraw,
  HookNarrativeRole,
  HookOneShotAnalysisHints,
  HookOneShotIntent,
} from "@/lib/hook-one-shot"
import type { HookRecommendationCard, SelectedCultureBorrowing } from "@/lib/hook-library"
import type { VideoModelFamily, VideoProvider } from "@/lib/video-generation/model-capabilities"
import type { CompiledHookVideoPrompt } from "@/lib/hook-generator-v2/compiler/types"
import type { HookCreativeScore } from "@/lib/hook-generator-v2/eval/tension-culture-evaluator"
import type { HookCreativeResourceBundle, RuntimeProductContract } from "@/lib/hook-generator-v2/resources/types"
import type { HookScriptAsset, ScriptCreativeSpec } from "@/lib/hook-generator-v2/script-asset/types"

export type HookOneShotRequest = {
  productImage: string
  productTitle: string
  intent: HookOneShotIntent
  intentText: string
  analysisHints?: HookOneShotAnalysisHints
  videoProvider?: VideoProvider
  videoModel?: string
  videoDuration?: number
  videoRatio?: HookVideoRatio
  videoResolution?: HookVideoResolution
  generateAudio?: boolean
}

export type HookVideoRatio = "9:16" | "16:9"

export type HookVideoResolution = "720p" | "1080p" | "small" | "large" | "4k"

export type HookOneShotModelFamily = Extract<VideoModelFamily, "seedance" | "sora" | "veo">

export type HookOneShotVideoSettings = {
  videoProvider: VideoProvider
  videoModel: string
  videoDuration: number
  videoRatio: HookVideoRatio
  videoResolution: HookVideoResolution
  generateAudio: boolean
  modelFamily: HookOneShotModelFamily
}

export type HookQualityMode = "fast" | "balanced-lite" | "balanced" | "premium"

export type HookRunPolicy = {
  qualityMode: HookQualityMode
  maxRepairAttempts: number
  enableMechanismPlanner: boolean
  enableCreativeEvaluator: boolean
  enableFirstFrameOptimizer: boolean
}

export const DEFAULT_HOOK_RUN_POLICY: HookRunPolicy = {
  qualityMode: "fast",
  maxRepairAttempts: 1,
  enableMechanismPlanner: false,
  enableCreativeEvaluator: false,
  enableFirstFrameOptimizer: false,
}

export type HookVariantStatus =
  | "pending"
  | "resource_ready"
  | "script_ready"
  | "repairing"
  | "compiled"
  | "submitted"
  | "fallback"
  | "failed"

export type HookValidationIssue = {
  code: string
  message: string
  severity: "warning" | "error"
  fieldPath?: string
}

export type HookRepairRecord = {
  attempt: number
  reason: string
  repairedAt: string
  issues: HookValidationIssue[]
}

export type HookFirstFrameState = {
  prompt?: string
  imageUrl?: string
  status?: "not_required" | "pending" | "ready" | "failed"
}

export type HookVideoJobState = {
  runId?: string
  taskId?: string
  status?: string
  currentStage?: string
  progress?: number
}

export type HookTraceEvent = {
  event: string
  at: string
  variantId?: string
  details?: Record<string, unknown>
}

export type HookTraceTiming = {
  node: string
  startedAt: string
  endedAt: string
  durationMs: number
  status: "ok" | "error" | "skipped"
  details?: Record<string, unknown>
}

export type HookTracePersistenceState = {
  attempted: boolean
  persisted: number
  errors: string[]
}

export type VariantState = {
  clientVideoId: string
  role: HookNarrativeRole
  selectedHook: HookRecommendationCard
  selectedCultureBorrowing: SelectedCultureBorrowing | null
  creativeBrief?: unknown
  productContract?: RuntimeProductContract
  resourceBundle?: HookCreativeResourceBundle
  scriptCreativeSpec?: ScriptCreativeSpec
  mechanismCandidates?: unknown[]
  selectedMechanism?: unknown
  scriptAssetDraft?: HookScriptAsset
  validationIssues?: HookValidationIssue[]
  creativeScore?: HookCreativeScore
  nativeScriptAssetShadow?: HookScriptAsset
  nativeScriptAssetShadowError?: string
  nativeScriptAssetShadowRawSnippet?: string
  traceTimings?: HookTraceTiming[]
  assetCompilerShadowPrompt?: CompiledHookVideoPrompt
  assetCompilerShadowError?: string
  scriptAssetSource?: "native_asset" | "legacy_adapter"
  promptCompilerMode?: "asset_compiler_primary" | "legacy_compiler"
  evaluatorRewriteApplied?: boolean
  evaluatorRewriteHistory?: HookRepairRecord[]
  repairAttempts: number
  repairHistory: HookRepairRecord[]
  finalScriptAsset?: HookScriptAsset
  compiledVideoPrompt?: CompiledHookVideoPrompt
  firstFrame?: HookFirstFrameState
  videoJob?: HookVideoJobState
  status: HookVariantStatus
}

export type HookRunState = {
  requestId: string
  batchId: string
  input: HookOneShotRequest
  videoSettings: HookOneShotVideoSettings
  productBrief: HookProductBrief
  productContract?: RuntimeProductContract
  narrativeDraws: HookNarrativeDraw[]
  variants: Record<string, VariantState>
  runPolicy: HookRunPolicy
  trace: HookTraceEvent[]
  tracePersistence?: HookTracePersistenceState
}
