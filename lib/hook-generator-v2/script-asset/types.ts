import type { HookGenerationRecommendation } from "@/lib/hook-generator"
import type { HookNarrativeRole, HookOneShotIntent } from "@/lib/hook-one-shot"
import type { UserIntentExpansion } from "@/lib/hook-generator-v2/intent-expansion/user-intent-expansion"
import type { HookCreativeResourceIds } from "@/lib/hook-generator-v2/resources/types"

export type ScriptCreativeSpec = {
  task: "generate_hook_script_asset"
  duration: number
  platform: "short_video_feed"
  productLock: {
    productName: string
    category: string
    inferredSubCategory: string
    mustShowSignals: string[]
    usageSignals: string[]
    forbiddenConfusions: string[]
    allowedProductActions: string[]
  }
  intentContract: {
    intentType: HookOneShotIntent
    userIntentText: string
    variantRole: HookNarrativeRole
    creativeHypothesis: string
    userIntentExpansion?: UserIntentExpansion
  }
  resourceIds: HookCreativeResourceIds
  hardRules: string[]
  softRules?: string[]
}

export type TimelineShot = {
  time: string
  retentionPurpose:
    | "stop_scroll"
    | "build_tension"
    | "curiosity_gap"
    | "product_bridge"
    | "proof_hint"
    | "reaction"
    | "open_loop"
  scene: string
  subject: string
  action: string
  eventPrimitiveId?: string
  shotCardId?: string
  camera: string
  sound: string
  dialogue?: string
  textOverlay?: string
  productVisibility:
    | "none"
    | "background_hint"
    | "partial"
    | "clear_but_not_packshot"
    | "hero_visible"
  mustShow: string[]
  mustAvoid: string[]
  transitionToNextShot: string
}

export type HookScriptAsset = {
  hookSummary: string
  audienceStopReason: string
  tensionPlan?: {
    conflictType: string
    pressureSource: string
    firstSecondShock: string
    escalationBeat: string
    unresolvedQuestion: string
    emotionalPressure: string
    productResolutionRole: string
    riskIfTooSubtle: string
  }
  hookMechanism: {
    hookType: string
    microPatternId: string
    mechanismName: string
    stopSignal: string
    tensionEngine: string
    curiosityGap: string
    payoffStyle: string
  }
  productRole: {
    role: string
    entryTime: string
    entryAction: string
    whyItBelongs: string
    avoidHardSell: boolean
    noFullClaim: boolean
  }
  cultureFusionMechanism?: {
    enabled: boolean
    motifId: string
    templateId?: string
    borrowedSymbol: string
    concreteSymbol?: string
    whereItAppears: string[]
    actionIntegration: string
    actionTranslation?: string
    soundIntegration: string
    soundTranslation?: string
    visualComposition?: string
    productBridgeIntegration: string
    productBridgeSymbol?: string
    appearsInShots?: string[]
    forbiddenShallowUse?: string[]
    notJustStyle: boolean
  }
  timelineShots: TimelineShot[]
  soundDesign: {
    voiceoverAllowed: boolean
    speechMode: "voiceover" | "dialogue" | "no_voice"
    ambientSound: string
    musicOrSfx: string
  }
  textOverlay: string[]
  firstFrameIntent: {
    stopSignal: string
    composition: string
    emotion: string
    mustShow: string[]
    mustAvoid: string[]
    compatibilityPrompt?: string
  }
  videoPromptHints: {
    visualMood: string
    cameraBehavior: string
    keyObjects: string[]
    motionPriorities: string[]
    avoid: string[]
    providerNeutralPrompt?: string
  }
  riskFlags: string[]
  generationRecommendation: HookGenerationRecommendation
}
