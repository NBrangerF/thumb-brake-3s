import { z } from "zod"

export const timelineShotSchema = z.object({
  time: z.string().min(1),
  retentionPurpose: z.enum([
    "stop_scroll",
    "build_tension",
    "curiosity_gap",
    "product_bridge",
    "proof_hint",
    "reaction",
    "open_loop",
  ]),
  scene: z.string().min(1),
  subject: z.string().min(1),
  action: z.string().min(1),
  eventPrimitiveId: z.string().optional(),
  shotCardId: z.string().optional(),
  camera: z.string().min(1),
  sound: z.string().min(1),
  dialogue: z.string().min(1).optional(),
  textOverlay: z.string().optional(),
  productVisibility: z.enum([
    "none",
    "background_hint",
    "partial",
    "clear_but_not_packshot",
    "hero_visible",
  ]),
  mustShow: z.array(z.string().min(1)),
  mustAvoid: z.array(z.string().min(1)),
  transitionToNextShot: z.string().min(1),
}).superRefine((shot, ctx) => {
  if (isAbstractShotAction(shot.action)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Timeline shot action is abstract / 不可拍: ${shot.action}`,
      path: ["action"],
    })
  }
})

export const hookScriptAssetSchema = z.object({
  hookSummary: z.string().min(1),
  audienceStopReason: z.string().min(1),
  tensionPlan: z.object({
    conflictType: z.string().min(1),
    pressureSource: z.string().min(1),
    firstSecondShock: z.string().min(1),
    escalationBeat: z.string().min(1),
    unresolvedQuestion: z.string().min(1),
    emotionalPressure: z.string().min(1),
    productResolutionRole: z.string().min(1),
    riskIfTooSubtle: z.string().min(1),
  }).optional(),
  hookMechanism: z.object({
    hookType: z.string().min(1),
    microPatternId: z.string().min(1),
    mechanismName: z.string().min(1),
    stopSignal: z.string().min(1),
    tensionEngine: z.string().min(1),
    curiosityGap: z.string().min(1),
    payoffStyle: z.string().min(1),
  }),
  productRole: z.object({
    role: z.string().min(1),
    entryTime: z.string().min(1),
    entryAction: z.string().min(1),
    whyItBelongs: z.string().min(1),
    avoidHardSell: z.boolean(),
    noFullClaim: z.boolean(),
  }),
  cultureFusionMechanism: z.object({
    enabled: z.boolean(),
    motifId: z.string().min(1),
    templateId: z.string().min(1).optional(),
    borrowedSymbol: z.string().min(1),
    concreteSymbol: z.string().min(1).optional(),
    whereItAppears: z.array(z.string().min(1)),
    actionIntegration: z.string().min(1),
    actionTranslation: z.string().min(1).optional(),
    soundIntegration: z.string().min(1),
    soundTranslation: z.string().min(1).optional(),
    visualComposition: z.string().min(1).optional(),
    productBridgeIntegration: z.string().min(1),
    productBridgeSymbol: z.string().min(1).optional(),
    appearsInShots: z.array(z.string().min(1)).optional(),
    forbiddenShallowUse: z.array(z.string().min(1)).optional(),
    notJustStyle: z.boolean(),
  }).optional(),
  timelineShots: z.array(timelineShotSchema).min(1),
  soundDesign: z.object({
    voiceoverAllowed: z.boolean(),
    speechMode: z.enum(["voiceover", "dialogue", "no_voice"]),
    ambientSound: z.string().min(1),
    musicOrSfx: z.string().min(1),
  }),
  textOverlay: z.array(z.string()),
  firstFrameIntent: z.object({
    stopSignal: z.string().min(1),
    composition: z.string().min(1),
    emotion: z.string().min(1),
    mustShow: z.array(z.string().min(1)),
    mustAvoid: z.array(z.string().min(1)),
    compatibilityPrompt: z.string().optional(),
  }),
  videoPromptHints: z.object({
    visualMood: z.string().min(1),
    cameraBehavior: z.string().min(1),
    keyObjects: z.array(z.string().min(1)),
    motionPriorities: z.array(z.string().min(1)),
    avoid: z.array(z.string().min(1)),
    providerNeutralPrompt: z.string().optional(),
  }),
  riskFlags: z.array(z.string()),
  generationRecommendation: z.object({
    preferredPath: z.enum(["direct_video", "first_frame", "reference_video"]),
    reason: z.string().min(1),
    availablePaths: z.array(z.enum(["direct_video", "first_frame", "reference_video"])).min(1),
  }),
})

export type ParsedHookScriptAsset = z.infer<typeof hookScriptAssetSchema>

export function parseHookScriptAsset(value: unknown): ParsedHookScriptAsset {
  return hookScriptAssetSchema.parse(value)
}

export const nativeHookScriptAssetSchema = hookScriptAssetSchema.extend({
  tensionPlan: z.object({
    conflictType: z.string().min(1),
    pressureSource: z.string().min(1),
    firstSecondShock: z.string().min(1),
    escalationBeat: z.string().min(1),
    unresolvedQuestion: z.string().min(1),
    emotionalPressure: z.string().min(1),
    productResolutionRole: z.string().min(1),
    riskIfTooSubtle: z.string().min(1),
  }),
})

export type ParsedNativeHookScriptAsset = z.infer<typeof nativeHookScriptAssetSchema>

export function parseNativeHookScriptAsset(value: unknown): ParsedNativeHookScriptAsset {
  return nativeHookScriptAssetSchema.parse(normalizeNativeHookScriptAssetInput(value))
}

function normalizeNativeHookScriptAssetInput(value: unknown): unknown {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value
  const asset = { ...value } as Record<string, unknown>
  if (asset.cultureFusionMechanism == null || typeof asset.cultureFusionMechanism === "string") {
    delete asset.cultureFusionMechanism
  }
  if (Array.isArray(asset.timelineShots)) {
    asset.timelineShots = asset.timelineShots.map((shot) => {
      if (!shot || typeof shot !== "object" || Array.isArray(shot)) return shot
      const normalizedShot = { ...shot } as Record<string, unknown>
      normalizedShot.retentionPurpose = normalizeRetentionPurpose(normalizedShot.retentionPurpose)
      normalizedShot.productVisibility = normalizeProductVisibility(normalizedShot.productVisibility)
      if (typeof normalizedShot.transitionToNextShot !== "string" && typeof normalizedShot.transitionToNext === "string") {
        normalizedShot.transitionToNextShot = normalizedShot.transitionToNext
      }
      return normalizedShot
    })
  }
  return asset
}

function normalizeRetentionPurpose(value: unknown) {
  if (typeof value !== "string") return value
  const normalized = value.trim().toLowerCase().replace(/[\s-]+/g, "_")
  if ([
    "stop_scroll",
    "build_tension",
    "curiosity_gap",
    "product_bridge",
    "proof_hint",
    "reaction",
    "open_loop",
  ].includes(normalized)) return normalized
  if (["payoff", "resolution", "task_complete", "completion", "product_payoff"].includes(normalized)) {
    return "product_bridge"
  }
  if (normalized.includes("open_loop")) return "open_loop"
  if (normalized.includes("product_bridge")) return "product_bridge"
  if (normalized.includes("proof_hint")) return "proof_hint"
  if (["tension", "escalation", "build"].includes(normalized)) return "build_tension"
  if (["curiosity", "question", "gap"].includes(normalized)) return "curiosity_gap"
  if (["proof", "evidence"].includes(normalized)) return "proof_hint"
  return value
}

function normalizeProductVisibility(value: unknown) {
  if (typeof value !== "string") return value
  const normalized = value.trim().toLowerCase().replace(/[\s-]+/g, "_")
  if ([
    "none",
    "background_hint",
    "partial",
    "clear_but_not_packshot",
    "hero_visible",
  ].includes(normalized)) return normalized
  if (["background", "hint", "background_visible"].includes(normalized)) return "background_hint"
  if (["clear", "visible", "clear_visible", "non_packshot"].includes(normalized)) return "clear_but_not_packshot"
  if (["hero", "hero_shot", "pack_visible"].includes(normalized)) return "hero_visible"
  return value
}

function isAbstractShotAction(action: string) {
  const normalized = action.replace(/\s+/g, "")
  return [
    "展示痛点",
    "呈现痛点",
    "展示卖点",
    "呈现卖点",
    "呈现高级感",
    "展示高级感",
    "表达品质",
    "体现价值",
    "showpainpoint",
    "showsellingpoint",
  ].some((phrase) => normalized.toLowerCase().includes(phrase.toLowerCase()))
}
