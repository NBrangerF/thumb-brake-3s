import type { HookScriptResult, HookScriptTiming } from "@/lib/hook-generator"
import type { HookRecommendationCard, SelectedCultureBorrowing } from "@/lib/hook-library"
import type { HookCreativeResourceBundle } from "@/lib/hook-generator-v2/resources/types"

import { parseHookScriptAsset } from "./hook-script-asset-schema"
import type { HookScriptAsset, ScriptCreativeSpec, TimelineShot } from "./types"

export function buildHookScriptAssetFromLegacy(input: {
  legacyScript: HookScriptResult
  scriptCreativeSpec: ScriptCreativeSpec
  resourceBundle: HookCreativeResourceBundle
  selectedHook: HookRecommendationCard
  selectedCultureBorrowing: SelectedCultureBorrowing | null
}): HookScriptAsset {
  const bundle = input.resourceBundle
  const attention = bundle.attentionMicroPattern
  const bridge = bundle.bridgeCandidates[0]
  const culture = bundle.cultureMotif
  const timelineShots = input.legacyScript.shotTiming.map((shot, index) =>
    legacyShotToTimelineShot({
      shot,
      index,
      resourceBundle: bundle,
      scriptCreativeSpec: input.scriptCreativeSpec,
    })
  )

  return parseHookScriptAsset({
    hookSummary: input.legacyScript.hookSummary,
    audienceStopReason: audienceStopReason(input.scriptCreativeSpec),
    hookMechanism: {
      hookType: input.selectedHook.hookType,
      microPatternId: attention.id,
      mechanismName: attention.name,
      stopSignal: attention.stopSignalLogic,
      tensionEngine: attention.tensionEngine,
      curiosityGap: attention.curiosityEngine,
      payoffStyle: bundle.proofCandidates[0]?.goodHookUsage ?? input.legacyScript.productBridge,
    },
    productRole: {
      role: bridge?.role ?? "solution_clue",
      entryTime: bridge?.entryTimingRules[0] ?? "early_1_2_5s",
      entryAction: bridge?.entryActionTemplates[0]?.replace("{product}", input.scriptCreativeSpec.productLock.productName)
        ?? input.legacyScript.productBridge,
      whyItBelongs: input.legacyScript.productBridge,
      avoidHardSell: true,
      noFullClaim: true,
    },
    ...(culture ? {
      cultureFusionMechanism: {
        enabled: true,
        motifId: culture.id,
        borrowedSymbol: culture.visualSymbols[0] ?? culture.name,
        whereItAppears: [
          culture.visualSymbols[0],
          culture.motionSymbols[0],
          culture.audioSymbols[0],
        ].filter(Boolean),
        actionIntegration: culture.actionLogic,
        soundIntegration: culture.audioSymbols.join("、") || input.legacyScript.soundDesign,
        productBridgeIntegration: culture.productBridgeOptions.join("、") || input.legacyScript.productBridge,
        notJustStyle: true,
      },
    } : input.selectedCultureBorrowing ? {
      cultureFusionMechanism: {
        enabled: true,
        motifId: input.selectedCultureBorrowing.templateId,
        borrowedSymbol: input.selectedCultureBorrowing.symbolBorrowing.visual[0] ?? input.selectedCultureBorrowing.nameCn,
        whereItAppears: [
          input.selectedCultureBorrowing.symbolBorrowing.visual[0],
          input.selectedCultureBorrowing.symbolBorrowing.motion[0],
          input.selectedCultureBorrowing.symbolBorrowing.audio[0],
        ].filter(Boolean),
        actionIntegration: input.selectedCultureBorrowing.cultureMechanism.join("、") || input.selectedCultureBorrowing.productBridgeRule,
        soundIntegration: input.selectedCultureBorrowing.symbolBorrowing.audio.join("、") || input.legacyScript.soundDesign,
        productBridgeIntegration: input.selectedCultureBorrowing.symbolBorrowing.productBridge.join("、") || input.selectedCultureBorrowing.productBridgeRule,
        notJustStyle: true,
      },
    } : {}),
    timelineShots,
    soundDesign: {
      voiceoverAllowed: Boolean(input.legacyScript.script.trim()),
      speechMode: input.legacyScript.script.trim() ? "voiceover" : "no_voice",
      ambientSound: input.legacyScript.soundDesign,
      musicOrSfx: [
        attention.preferredSoundFunctions.join("、"),
        input.legacyScript.soundDesign,
      ].filter(Boolean).join("；"),
    },
    textOverlay: input.legacyScript.textOverlay,
    firstFrameIntent: {
      stopSignal: input.legacyScript.hookSummary,
      composition: input.legacyScript.visualDescription,
      emotion: bundle.audienceSituations[0]?.emotionalTriggers[0] ?? "停顿和好奇",
      mustShow: input.scriptCreativeSpec.productLock.mustShowSignals,
      mustAvoid: input.scriptCreativeSpec.productLock.forbiddenConfusions,
      compatibilityPrompt: input.legacyScript.firstFramePrompt,
    },
    videoPromptHints: {
      visualMood: input.legacyScript.visualStyle,
      cameraBehavior: bundle.shotCandidates.map((shot) => `${shot.name}:${shot.camera}`).slice(0, 3).join("；"),
      keyObjects: [
        input.scriptCreativeSpec.productLock.productName,
        ...input.scriptCreativeSpec.productLock.mustShowSignals.slice(0, 4),
      ],
      motionPriorities: timelineShots.map((shot) => shot.action).slice(0, 4),
      avoid: [
        ...input.scriptCreativeSpec.productLock.forbiddenConfusions,
        ...bundle.failureWarnings.map((warning) => warning.warning),
      ],
      providerNeutralPrompt: input.legacyScript.videoPrompt,
    },
    riskFlags: [
      ...bundle.productContract.modelRiskTags,
      ...bundle.proofCandidates.flatMap((proof) => proof.modelFeasibilityRiskTags),
    ],
    generationRecommendation: input.legacyScript.generationRecommendation,
  })
}

export function toLegacyHookScriptResult(asset: HookScriptAsset): HookScriptResult {
  const parsed = parseHookScriptAsset(asset)
  return {
    hookSummary: parsed.hookSummary,
    visualDescription: parsed.timelineShots.map((shot) => `${shot.time} ${shot.scene}：${shot.subject}${shot.action}`).join("\n"),
    visualStyle: parsed.videoPromptHints.visualMood,
    script: parsed.soundDesign.speechMode === "no_voice" ? "" : parsed.textOverlay.join("；"),
    soundDesign: [parsed.soundDesign.ambientSound, parsed.soundDesign.musicOrSfx].filter(Boolean).join("；"),
    textOverlay: parsed.textOverlay,
    shotTiming: parsed.timelineShots.map(timelineShotToLegacyTiming),
    productBridge: `${parsed.productRole.entryAction} ${parsed.productRole.whyItBelongs}`.trim(),
    videoPrompt: parsed.videoPromptHints.providerNeutralPrompt ?? buildProviderNeutralPrompt(parsed),
    firstFramePrompt: parsed.firstFrameIntent.compatibilityPrompt ?? buildFirstFramePrompt(parsed),
    generationRecommendation: parsed.generationRecommendation,
  }
}

function legacyShotToTimelineShot(input: {
  shot: HookScriptTiming
  index: number
  resourceBundle: HookCreativeResourceBundle
  scriptCreativeSpec: ScriptCreativeSpec
}): TimelineShot {
  const shotCard = input.resourceBundle.shotCandidates[input.index % input.resourceBundle.shotCandidates.length]
  const event = input.resourceBundle.eventCandidates[input.index % input.resourceBundle.eventCandidates.length]
  const productVisible = legacyShotMentionsSalesProduct(input.shot, input.scriptCreativeSpec)
  const purposes: TimelineShot["retentionPurpose"][] = productVisible
    ? ["stop_scroll", "product_bridge", "proof_hint", "open_loop"]
    : ["stop_scroll", "build_tension", "open_loop", "open_loop"]
  const productVisibility: TimelineShot["productVisibility"] = productVisible
    ? input.index === 0
      ? event?.productVisibility ?? "background_hint"
      : input.index === 1
        ? "clear_but_not_packshot"
        : "hero_visible"
    : "none"

  return {
    time: input.shot.timeRange,
    retentionPurpose: purposes[Math.min(input.index, purposes.length - 1)],
    scene: input.shot.visual,
    subject: productVisible ? input.scriptCreativeSpec.productLock.productName : inferNonProductSubject(input.shot.visual),
    action: filmableActionFromVisual(input.shot.visual),
    eventPrimitiveId: event?.id,
    shotCardId: shotCard?.id,
    camera: shotCard?.camera ?? "手持近景",
    sound: input.shot.script || "真实环境声和短促动作音",
    ...(input.shot.textOverlay ? { textOverlay: input.shot.textOverlay } : {}),
    productVisibility,
    mustShow: productVisible
      ? input.index === 0
        ? input.scriptCreativeSpec.productLock.mustShowSignals.slice(0, 3)
        : [
            input.scriptCreativeSpec.productLock.productName,
            ...input.scriptCreativeSpec.productLock.usageSignals.slice(0, 2),
          ]
      : [
          inferNonProductSubject(input.shot.visual),
          ...input.scriptCreativeSpec.productLock.usageSignals.filter((signal) => input.shot.visual.includes(signal)).slice(0, 2),
        ].filter(Boolean),
    mustAvoid: input.scriptCreativeSpec.productLock.forbiddenConfusions,
    transitionToNextShot: productVisible
      ? input.index === 0 ? "停顿后切到商品承接动作" : "保持同一动作链继续推进"
      : input.index === 0 ? "停顿后继续观察冲突" : "留下继续观看的开环",
  }
}

function legacyShotMentionsSalesProduct(shot: HookScriptTiming, spec: ScriptCreativeSpec) {
  const text = [shot.visual, shot.script, shot.textOverlay].join(" ")
  const anchors = [
    spec.productLock.productName,
    ...spec.productLock.mustShowSignals,
  ].map((value) => value.trim()).filter((value) => value && !isGenericUsageProp(value))
  return anchors.some((anchor) => text.includes(anchor))
}

function isGenericUsageProp(value: string) {
  return /牙刷|牙齿|牙渍|浴室|镜前|使用场景|商品主图外形|外形/.test(value)
}

function inferNonProductSubject(visual: string) {
  if (/妈妈|母亲|家长/.test(visual)) return "妈妈"
  if (/爸爸|父亲/.test(visual)) return "爸爸"
  if (/青少年|孩子|儿童|小孩/.test(visual)) return "孩子"
  if (/牙刷/.test(visual)) return "牙刷"
  if (/牙齿|牙渍/.test(visual)) return "牙齿"
  return "人物和场景线索"
}

function timelineShotToLegacyTiming(shot: TimelineShot): HookScriptTiming {
  return {
    timeRange: shot.time,
    visual: `${shot.scene} ${shot.subject}${shot.action}`,
    script: shot.sound,
    ...(shot.textOverlay ? { textOverlay: shot.textOverlay } : {}),
  }
}

function audienceStopReason(spec: ScriptCreativeSpec) {
  return `${spec.intentContract.userIntentText} 在 ${spec.intentContract.variantRole} 变体里被拍成第一秒可见动作。`
}

function filmableActionFromVisual(visual: string) {
  const normalized = visual.replace(/\s+/g, " ").trim()
  if (!normalized) return "执行一个清晰可见的手部动作"
  const withoutTime = normalized.replace(/^\d+(?:\.\d+)?(?:-\d+(?:\.\d+)?)?s?[：:]\s*/, "")
  return withoutTime.length > 80 ? withoutTime.slice(0, 80) : withoutTime
}

function buildProviderNeutralPrompt(asset: HookScriptAsset) {
  return [
    `Hook: ${asset.hookSummary}`,
    `Product role: ${asset.productRole.role}, ${asset.productRole.entryAction}`,
    `Visual mood: ${asset.videoPromptHints.visualMood}`,
    `Timeline: ${asset.timelineShots.map((shot) => `${shot.time} ${shot.subject}${shot.action}`).join(" | ")}`,
    `Avoid: ${asset.videoPromptHints.avoid.join("、")}`,
  ].join("\n")
}

function buildFirstFramePrompt(asset: HookScriptAsset) {
  return [
    asset.firstFrameIntent.composition,
    `Must show: ${asset.firstFrameIntent.mustShow.join(", ")}`,
    `Must avoid: ${asset.firstFrameIntent.mustAvoid.join(", ")}`,
  ].join(" ")
}
