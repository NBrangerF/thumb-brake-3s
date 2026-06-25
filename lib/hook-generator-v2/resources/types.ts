import type { HookNarrativeRole, HookOneShotIntent } from "@/lib/hook-one-shot"
import type { ConcreteCulturalMotif } from "@/lib/culture-motif-resources"

export type { ConcreteCulturalMotif } from "@/lib/culture-motif-resources"

export type RuntimeProductContract = {
  productName: string
  productCategory: string
  inferredSubCategory: string
  visualAnchors: string[]
  packagingSignals: string[]
  usageAnchors: string[]
  typicalUseScenes: string[]
  allowedProductActions: string[]
  forbiddenVisualConfusions: string[]
  claimRiskTags: string[]
  modelRiskTags: string[]
  source: {
    productAnalysisUsed: boolean
    fallbackCategoryRuleIds: string[]
  }
}

export type AudienceSituationPattern = {
  id: string
  name: string
  lifeState: string
  emotionalTriggers: string[]
  hiddenDoubts: string[]
  likelyScrollReasons: string[]
  recognitionSignals: string[]
  commonScenes: string[]
  compatibleIntentTypes: HookOneShotIntent[]
  compatibleCategories: string[]
  compatibleHookTypes: string[]
  compatibleEventKinds: string[]
  exampleAudienceInputs: string[]
}

export type AttentionMicroPattern = {
  id: string
  parentHookType: string
  name: string
  attentionJob: string
  stopSignalLogic: string
  tensionEngine: string
  curiosityEngine: string
  bestForIntentModes: HookOneShotIntent[]
  compatibleProductRoles: string[]
  preferredProductEntryTiming: string
  eventQueryTags: string[]
  preferredShotFunctions: string[]
  preferredSoundFunctions: string[]
  preferredOverlayFunctions: string[]
  goodForProductTraits: string[]
  weakForProductTraits: string[]
  commonFailureModes: string[]
  guardrailNotes: string[]
}

export type EventPrimitive = {
  id: string
  name: string
  eventKind: string
  eventTemplate: string
  productVisibility: "none" | "background_hint" | "partial" | "clear_but_not_packshot" | "hero_visible"
  compatibleMicroPatternIds: string[]
  recommendedProductRoles: string[]
  shotTags: string[]
  compatibleIntentTypes: HookOneShotIntent[]
}

export type ProductBridgeRoleResource = {
  id: string
  role: string
  name: string
  definition: string
  bestForHookTypes: string[]
  bestForIntentModes: HookOneShotIntent[]
  bestForProductCategoryTags: string[]
  entryTimingRules: string[]
  requiredPreEntryTension: string[]
  entryActionTemplates: string[]
  compatibleEventKinds: string[]
  compatibleProofTags: string[]
  compatibleCulturalMotifTypes: string[]
  recommendedShotIds: string[]
  textOverlaySyntaxHints: string[]
  soundHints: string[]
  avoidHardSellRules: string[]
  validatorChecks: string[]
}

export type ProofVisualizationCard = {
  id: string
  claimTag: string
  abstractClaim: string
  claimFamily: string
  bestProofModes: string[]
  visualProofs: string[]
  usageProofs: string[]
  closeUpProofs: string[]
  comparisonProofs: string[]
  reactionProofs: string[]
  compatibleIntentModes: HookOneShotIntent[]
  compatibleHookTypes: string[]
  compatibleMicroPatterns: string[]
  compatibleProductRoles: string[]
  compatibleEventKinds: string[]
  recommendedShotIds: string[]
  recommendedShotTags: string[]
  complianceRiskTags: string[]
  modelFeasibilityRiskTags: string[]
  goodHookUsage: string
}

export type ShotCard = {
  id: string
  name: string
  shotFunction: string
  camera: string
  composition: string
  motion: string
  productVisibilityRange: string[]
  compatibleEventKinds: string[]
  compatibleProductRoles: string[]
  compatibleProofModes: string[]
  modelRiskTags: string[]
}

export type ConstraintRule = {
  id: string
  severity: "hard" | "soft"
  rule: string
  appliesTo: Array<"product" | "script" | "culture" | "proof" | "shot" | "provider">
}

export type FailureMode = {
  id: string
  warning: string
  repairHint: string
  appliesTo: Array<"product" | "script" | "culture" | "proof" | "shot" | "provider">
}

export type GoldHookExample = {
  id: string
  source: "hook_reference_asset" | "hook_trend_observation" | "p0_seed"
  summary: string
  hookType?: string
  category?: string | null
}

export type HookCreativeResourceIds = {
  audienceSituationIds: string[]
  attentionMicroPatternId: string
  eventPrimitiveIds: string[]
  productBridgeRoleIds: string[]
  proofVisualizationIds: string[]
  cultureMotifId?: string
  visualRenderProfileId?: string
  shotPrimitiveIds?: string[]
  shotCardIds: string[]
  constraintRuleIds: string[]
  failureWarningIds: string[]
  exampleIds: string[]
}

export type HookResourceLibraryRefs = {
  categoryPlaybookIds: string[]
  referenceAssetIds: string[]
  trendObservationIds: string[]
}

export type HookCreativeResourceBundle = {
  productContract: RuntimeProductContract
  audienceSituations: AudienceSituationPattern[]
  attentionMicroPattern: AttentionMicroPattern
  eventCandidates: EventPrimitive[]
  bridgeCandidates: ProductBridgeRoleResource[]
  proofCandidates: ProofVisualizationCard[]
  cultureMotif: ConcreteCulturalMotif | null
  shotCandidates: ShotCard[]
  constraints: ConstraintRule[]
  failureWarnings: FailureMode[]
  examples: GoldHookExample[]
  resourceIds: HookCreativeResourceIds
  libraryRefs: HookResourceLibraryRefs
  retrievalPolicy: {
    intent: HookOneShotIntent
    role: HookNarrativeRole
    bounded: true
  }
}
