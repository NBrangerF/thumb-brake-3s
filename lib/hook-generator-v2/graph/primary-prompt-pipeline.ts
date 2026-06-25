import type { SelectedCultureBorrowing, HookRecommendationCard } from "@/lib/hook-library"
import {
  compileHookVideoPrompt,
  compileSeedanceAssetPromptPrimary,
} from "@/lib/hook-generator-v2/compiler/compile-hook-video-prompt"
import type { CompiledHookVideoPrompt } from "@/lib/hook-generator-v2/compiler/types"
import {
  evaluateTensionAndCulture,
  type HookCreativeScore,
} from "@/lib/hook-generator-v2/eval/tension-culture-evaluator"
import type { HookCreativeResourceBundle } from "@/lib/hook-generator-v2/resources/types"
import type { HookScriptAsset, ScriptCreativeSpec, TimelineShot } from "@/lib/hook-generator-v2/script-asset/types"
import type { HookRepairRecord } from "./types"
import type { HookOneShotRequest, HookOneShotVideoSettings, HookTraceTiming } from "./types"
import { validateAndRepairHookScriptAsset } from "../quality/targeted-repair"
import type { HookQualityGateResult } from "../quality/deterministic-validator"

export type PrimaryHookPromptArtifacts = {
  scriptAsset: HookScriptAsset
  scriptAssetSource: "native_asset" | "legacy_adapter"
  qualityGate: HookQualityGateResult
  repairAttempts: number
  repairHistory: HookRepairRecord[]
  creativeScore: HookCreativeScore
  evaluatorRewriteApplied: boolean
  evaluatorRewriteHistory: HookRepairRecord[]
  compiledVideoPrompt: CompiledHookVideoPrompt
  promptCompilerMode: "asset_compiler_primary" | "legacy_compiler"
  traceTimings: HookTraceTiming[]
}

export function buildPrimaryHookPromptArtifacts(input: {
  request: HookOneShotRequest
  settings: HookOneShotVideoSettings
  scriptCreativeSpec: ScriptCreativeSpec
  resourceBundle: HookCreativeResourceBundle
  selectedHook: HookRecommendationCard
  selectedCultureBorrowing?: SelectedCultureBorrowing | null
  initialScriptAsset: HookScriptAsset
  nativeScriptAsset?: HookScriptAsset
  productImage: string
  maxRepairAttempts: number
  primaryEnabled: boolean
}): PrimaryHookPromptArtifacts {
  const traceTimings: HookTraceTiming[] = []
  const scriptAssetSource = input.primaryEnabled && input.nativeScriptAsset ? "native_asset" : "legacy_adapter"
  const selectedAsset = scriptAssetSource === "native_asset" ? input.nativeScriptAsset! : input.initialScriptAsset
  const deterministic = timeSync(traceTimings, "deterministic_validation_repair", () => validateAndRepairHookScriptAsset({
    scriptAsset: selectedAsset,
    scriptCreativeSpec: input.scriptCreativeSpec,
    resourceBundle: input.resourceBundle,
    maxRepairAttempts: input.maxRepairAttempts,
  }))

  if (deterministic.qualityGate.status === "fail") {
    const compiledVideoPrompt = timeSync(traceTimings, "legacy_prompt_compiler", () => compileHookVideoPrompt({
      scriptAsset: deterministic.scriptAsset,
      scriptCreativeSpec: input.scriptCreativeSpec,
      modelFamily: input.settings.modelFamily,
      videoProvider: input.settings.videoProvider,
      productImage: input.productImage,
    }))
    return {
      scriptAsset: deterministic.scriptAsset,
      scriptAssetSource,
      qualityGate: deterministic.qualityGate,
      repairAttempts: deterministic.repairAttempts,
      repairHistory: deterministic.repairHistory,
      creativeScore: evaluateFor(input, deterministic.scriptAsset),
      evaluatorRewriteApplied: false,
      evaluatorRewriteHistory: [],
      compiledVideoPrompt,
      promptCompilerMode: "legacy_compiler",
      traceTimings,
    }
  }

  let scriptAsset = deterministic.scriptAsset
  let creativeScore = timeSync(traceTimings, "tension_culture_evaluator", () => evaluateFor(input, scriptAsset))
  const evaluatorRewriteHistory: HookRepairRecord[] = []
  if (input.primaryEnabled && shouldRewriteFromEvaluator(creativeScore)) {
    const rewrite = timeSync(traceTimings, "evaluator_targeted_rewrite", () => rewriteFromEvaluator({
      scriptAsset,
      score: creativeScore,
      scriptCreativeSpec: input.scriptCreativeSpec,
      resourceBundle: input.resourceBundle,
      selectedCultureBorrowing: input.selectedCultureBorrowing,
    }))
    if (rewrite.applied) {
      const rewritten = timeSync(traceTimings, "post_rewrite_validation_repair", () => validateAndRepairHookScriptAsset({
        scriptAsset: rewrite.scriptAsset,
        scriptCreativeSpec: input.scriptCreativeSpec,
        resourceBundle: input.resourceBundle,
        maxRepairAttempts: input.maxRepairAttempts,
      }))
      if (rewritten.qualityGate.status !== "fail") {
        scriptAsset = rewritten.scriptAsset
        evaluatorRewriteHistory.push(rewrite.repairRecord)
        evaluatorRewriteHistory.push(...rewritten.repairHistory)
        creativeScore = timeSync(traceTimings, "post_rewrite_evaluator", () => evaluateFor(input, scriptAsset))
      }
    }
  }

  const useAssetCompilerPrimary = input.primaryEnabled && input.settings.modelFamily === "seedance"
  const compiledVideoPrompt = useAssetCompilerPrimary
    ? timeSync(traceTimings, "seedance_asset_compiler", () => compileSeedanceAssetPromptPrimary({
      scriptAsset,
      scriptCreativeSpec: input.scriptCreativeSpec,
      resourceBundle: input.resourceBundle,
      videoProvider: input.settings.videoProvider,
      productImage: input.productImage,
      selectedCultureBorrowing: input.selectedCultureBorrowing,
    }))
    : timeSync(traceTimings, "legacy_prompt_compiler", () => compileHookVideoPrompt({
      scriptAsset,
      scriptCreativeSpec: input.scriptCreativeSpec,
      modelFamily: input.settings.modelFamily,
      videoProvider: input.settings.videoProvider,
      productImage: input.productImage,
    }))

  return {
    scriptAsset,
    scriptAssetSource,
    qualityGate: deterministic.qualityGate,
    repairAttempts: deterministic.repairAttempts + evaluatorRewriteHistory.length,
    repairHistory: [...deterministic.repairHistory, ...evaluatorRewriteHistory],
    creativeScore,
    evaluatorRewriteApplied: evaluatorRewriteHistory.length > 0,
    evaluatorRewriteHistory,
    compiledVideoPrompt,
    promptCompilerMode: useAssetCompilerPrimary ? "asset_compiler_primary" : "legacy_compiler",
    traceTimings,
  }
}

function timeSync<T>(timings: HookTraceTiming[], node: string, run: () => T): T {
  const started = Date.now()
  const startedAt = new Date(started).toISOString()
  try {
    const value = run()
    const ended = Date.now()
    timings.push({
      node,
      startedAt,
      endedAt: new Date(ended).toISOString(),
      durationMs: ended - started,
      status: "ok",
    })
    return value
  } catch (error) {
    const ended = Date.now()
    timings.push({
      node,
      startedAt,
      endedAt: new Date(ended).toISOString(),
      durationMs: ended - started,
      status: "error",
      details: { error: error instanceof Error ? error.message : String(error) },
    })
    throw error
  }
}

function evaluateFor(input: {
  request: HookOneShotRequest
  selectedHook: HookRecommendationCard
  selectedCultureBorrowing?: SelectedCultureBorrowing | null
  resourceBundle: HookCreativeResourceBundle
}, scriptAsset: HookScriptAsset) {
  return evaluateTensionAndCulture({
    request: input.request,
    selectedHook: input.selectedHook,
    selectedCultureBorrowing: input.selectedCultureBorrowing,
    resourceBundle: input.resourceBundle,
    scriptAsset,
  })
}

function shouldRewriteFromEvaluator(score: HookCreativeScore) {
  return score.decision === "rewrite_recommended" || score.decision === "fallback_recommended"
}

function rewriteFromEvaluator(input: {
  scriptAsset: HookScriptAsset
  score: HookCreativeScore
  scriptCreativeSpec: ScriptCreativeSpec
  resourceBundle: HookCreativeResourceBundle
  selectedCultureBorrowing?: SelectedCultureBorrowing | null
}) {
  let scriptAsset = cloneScriptAsset(input.scriptAsset)
  let applied = false
  const fields = new Set(input.score.rewriteTargets.map((target) => target.field))
  const productVisibleInHook = scriptAsset.timelineShots.some((shot) => isVisibleSalesProductShot(shot))

  if (fields.has("tensionPlan.firstSecondShock") || input.score.firstSecondStopPower < 7) {
    scriptAsset = strengthenFirstSecond(scriptAsset, input.scriptCreativeSpec)
    applied = true
  }
  if (fields.has("tensionPlan.escalationBeat") || input.score.tensionEscalation < 7) {
    scriptAsset = strengthenEscalation(scriptAsset, input.scriptCreativeSpec)
    applied = true
  }
  if (
    productVisibleInHook &&
    (fields.has("productRole") || input.score.productBridgeNaturalness < 7)
  ) {
    scriptAsset = strengthenProductBridge(scriptAsset, input.scriptCreativeSpec, input.resourceBundle)
    applied = true
  }
  if (
    fields.has("cultureFusionMechanism.actionIntegration") ||
    fields.has("cultureFusionMechanism.concreteSymbol") ||
    fields.has("cultureFusionMechanism.productBridgeIntegration") ||
    input.score.fatalIssues.includes("culture_style_only")
  ) {
    scriptAsset = strengthenCultureIntegration(scriptAsset, input.resourceBundle)
    applied = true
  }
  if (applied) {
    scriptAsset = ensureDialogueBeats(scriptAsset, input.scriptCreativeSpec)
  }

  return {
    applied,
    scriptAsset,
    repairRecord: {
      attempt: 1,
      reason: `EVALUATOR_TARGETED_REWRITE: ${input.score.rewriteTargets.map((target) => target.field).join(", ")}`,
      repairedAt: new Date().toISOString(),
      issues: input.score.rewriteTargets.map((target) => ({
        code: `EVALUATOR_${target.field}`,
        message: `${target.issue} ${target.instruction}`,
        severity: "warning" as const,
        fieldPath: target.field,
      })),
    },
  }
}

function strengthenFirstSecond(asset: HookScriptAsset, spec: ScriptCreativeSpec): HookScriptAsset {
  const shots = [...asset.timelineShots]
  const first = shots[0]
  if (!first) return asset
  const action = firstSecondAction(first, spec)
  shots[0] = {
    ...first,
    retentionPurpose: "stop_scroll",
    action,
    camera: first.camera || "低角度近景轻微推近",
    sound: first.sound || "环境声突然停顿",
    dialogue: first.dialogue || fallbackDialogue(0, spec),
  }
  return {
    ...asset,
    tensionPlan: {
      ...fallbackTensionPlan(asset, spec),
      ...asset.tensionPlan,
      firstSecondShock: action,
    },
    timelineShots: shots,
  }
}

function strengthenEscalation(asset: HookScriptAsset, spec: ScriptCreativeSpec): HookScriptAsset {
  const shots = [...asset.timelineShots]
  const second = shots[1] ?? shots[0]
  if (!second) return asset
  const action = escalationAction(second, spec)
  const replacement = {
    ...second,
    retentionPurpose: second.retentionPurpose === "product_bridge" ? "product_bridge" as const : "build_tension" as const,
    action,
    sound: second.sound || "短促停顿和轻微叹气声",
    dialogue: second.dialogue || fallbackDialogue(1, spec),
  }
  if (shots[1]) shots[1] = replacement
  else shots.push(replacement)
  return {
    ...asset,
    tensionPlan: {
      ...fallbackTensionPlan(asset, spec),
      ...asset.tensionPlan,
      escalationBeat: action,
    },
    timelineShots: shots,
  }
}

function strengthenProductBridge(
  asset: HookScriptAsset,
  spec: ScriptCreativeSpec,
  bundle: HookCreativeResourceBundle,
): HookScriptAsset {
  const productName = spec.productLock.productName
  const productAction = spec.productLock.allowedProductActions[0] ?? "进入上一拍卡住的动作"
  const bridgeAction = `${productName}${productAction}，牙刷和手保持分离，前一拍停住的动作重新继续`
  const shots = ensureProductBridgeShot(asset.timelineShots, spec, bridgeAction)
  return {
    ...asset,
    productRole: {
      ...asset.productRole,
      entryAction: bridgeAction,
      whyItBelongs: `${productName} 作为${bundle.bridgeCandidates[0]?.name ?? "解决线索"}，不是突然展示，而是改变上一拍卡住的刷牙动作走向。`,
      avoidHardSell: true,
      noFullClaim: true,
    },
    tensionPlan: {
      ...fallbackTensionPlan(asset, spec),
      ...asset.tensionPlan,
      productResolutionRole: `${productName} 让前一拍停住的刷牙动作重新推进。`,
    },
    timelineShots: shots,
  }
}

function strengthenCultureIntegration(
  asset: HookScriptAsset,
  bundle: HookCreativeResourceBundle,
): HookScriptAsset {
  const motif = bundle.cultureMotif
  if (!motif && !asset.cultureFusionMechanism?.enabled) return asset
  const current = asset.cultureFusionMechanism
  const symbol = current?.concreteSymbol ||
    motif?.visualSymbols[0] ||
    current?.borrowedSymbol ||
    "文化母题动作符号"
  const action = motif?.motionSymbols[0] ||
    current?.actionTranslation ||
    current?.actionIntegration ||
    "文化母题改变人物动作链"
  const productBridge = motif?.productBridgeOptions[0] ||
    current?.productBridgeSymbol ||
    current?.productBridgeIntegration ||
    asset.productRole.role
  const soundSymbol = motif?.audioSymbols[0] || current?.soundTranslation || current?.soundIntegration || "短促动作提示音"
  const productVisibleInHook = asset.timelineShots.some((shot) => isVisibleSalesProductShot(shot))
  const timelineShots = asset.timelineShots.map((shot, index) => {
    if (index === 0) {
      return {
        ...shot,
        scene: `${shot.scene}，画面里清楚出现${symbol}`,
        action: `${shot.action}，人物动作被${symbol}打断或停住`,
        sound: `${shot.sound}，加入${soundSymbol}`,
        mustShow: unique([...shot.mustShow, symbol]).slice(0, 6),
      }
    }
    if (shot.retentionPurpose === "product_bridge" || index === 1) {
      return {
        ...shot,
        action: productVisibleInHook
          ? `${shot.action}，${productBridge}让商品进入上一拍动作链`
          : `${shot.action}，${symbol}和${productBridge}形成继续观看的开环线索`,
        sound: productVisibleInHook
          ? `${shot.sound}，${soundSymbol}和商品动作同步`
          : `${shot.sound}，${soundSymbol}强化动作停顿`,
        mustShow: unique([...shot.mustShow, symbol, productBridge]).slice(0, 6),
      }
    }
    return shot
  })
  return {
    ...asset,
    cultureFusionMechanism: {
      enabled: true,
      motifId: motif?.id ?? current?.motifId ?? "culture_motif",
      templateId: motif?.id ?? current?.templateId,
      borrowedSymbol: current?.borrowedSymbol ?? symbol,
      concreteSymbol: symbol,
      whereItAppears: unique([
        ...(current?.whereItAppears ?? []),
        symbol,
        ...(motif?.visualSymbols ?? []),
      ]).slice(0, 5),
      actionIntegration: current?.actionIntegration || action,
      actionTranslation: current?.actionTranslation || action,
      soundIntegration: current?.soundIntegration || motif?.audioSymbols.join("、") || "动作同步音",
      soundTranslation: current?.soundTranslation || motif?.audioSymbols.join("、") || "动作同步音",
      visualComposition: current?.visualComposition || `${symbol} 与商品承接动作同框`,
      productBridgeIntegration: current?.productBridgeIntegration || productBridge,
      productBridgeSymbol: current?.productBridgeSymbol || productBridge,
      appearsInShots: current?.appearsInShots ?? asset.timelineShots.map((shot) => shot.time).slice(0, 3),
      forbiddenShallowUse: current?.forbiddenShallowUse ?? ["只做风格背景，不改变动作链"],
      notJustStyle: true,
    },
    timelineShots,
  }
}

function isVisibleSalesProductShot(shot: TimelineShot) {
  return shot.productVisibility === "partial" ||
    shot.productVisibility === "clear_but_not_packshot" ||
    shot.productVisibility === "hero_visible"
}

function ensureProductBridgeShot(
  shots: TimelineShot[],
  spec: ScriptCreativeSpec,
  bridgeAction: string,
) {
  const productName = spec.productLock.productName
  const bridgeIndex = shots.findIndex((shot) => shot.retentionPurpose === "product_bridge")
  const repair = (shot: TimelineShot): TimelineShot => ({
    ...shot,
    retentionPurpose: "product_bridge",
    scene: `${productName} 进入上一拍卡住的真实使用动作`,
    subject: productName,
    action: bridgeAction,
    dialogue: shot.dialogue || fallbackDialogue(2, spec),
    productVisibility: "clear_but_not_packshot",
    mustShow: unique([productName, ...spec.productLock.mustShowSignals]).slice(0, 6),
    mustAvoid: unique([...shot.mustAvoid, ...spec.productLock.forbiddenConfusions]),
    transitionToNextShot: "保持同一动作链继续推进",
  })
  if (bridgeIndex >= 0) {
    return shots.map((shot, index) => index === bridgeIndex ? repair(shot) : shot)
  }
  const base = shots[Math.min(1, Math.max(0, shots.length - 1))]
  const bridgeShot = repair({
    ...(base ?? {
      time: "2.5-4s",
      retentionPurpose: "product_bridge",
      scene: `${productName} 进入真实使用动作`,
      subject: productName,
      action: bridgeAction,
      camera: "手部中近景",
      sound: "管盖轻响",
      productVisibility: "clear_but_not_packshot",
      mustShow: [productName],
      mustAvoid: spec.productLock.forbiddenConfusions,
      transitionToNextShot: "保持同一动作链继续推进",
    }),
    time: "2.5-4s",
  })
  return shots.length > 0 ? [...shots.slice(0, 2), bridgeShot, ...shots.slice(2)] : [bridgeShot]
}

function ensureDialogueBeats(asset: HookScriptAsset, spec: ScriptCreativeSpec): HookScriptAsset {
  if (asset.soundDesign.speechMode === "no_voice") return asset
  const timelineShots = asset.timelineShots.map((shot, index) => ({
    ...shot,
    dialogue: shot.dialogue || fallbackDialogue(index, spec),
  }))
  return {
    ...asset,
    soundDesign: {
      ...asset.soundDesign,
      voiceoverAllowed: true,
      speechMode: "dialogue",
    },
    timelineShots,
  }
}

function firstSecondAction(shot: TimelineShot, spec: ScriptCreativeSpec) {
  const subject = humanSubject(shot.subject)
  const object = spec.productLock.usageSignals.find((item) => /牙刷|刷牙|挤牙膏|使用/.test(item)) || spec.productLock.usageSignals[0] || "正在进行的动作"
  if (/刷牙|牙刷|牙膏|不爱|不愿|拒绝/.test(spec.intentContract.userIntentText)) {
    return `${subject}后退半步，伸手挡开牙刷，嘴巴紧闭，${object}在镜前停住`
  }
  return `${subject}伸手挡住${object}，身体后退，动作在镜头前停住`
}

function escalationAction(shot: TimelineShot, spec: ScriptCreativeSpec) {
  const subject = humanSubject(shot.subject)
  if (/刷牙|牙刷|牙膏|不爱|不愿|拒绝/.test(spec.intentContract.userIntentText)) {
    return `${subject}第二次躲开牙刷，家长的手停在半空，睡前时间压力升级`
  }
  return `${subject}第二次尝试仍然失败，手部动作停在半空，压力比第一拍更明显`
}

function humanSubject(value: string) {
  if (/孩子|儿童|宝宝|小孩/.test(value)) return "孩子"
  if (/妈妈|家长|母亲|父亲|爸爸/.test(value)) return "家长"
  if (/手/.test(value)) return "人物的手"
  return "人物"
}

function fallbackDialogue(index: number, spec: ScriptCreativeSpec) {
  if (/刷牙|牙刷|牙膏|不爱|不愿|拒绝/.test(spec.intentContract.userIntentText)) {
    if (index === 0) return "孩子小声说：“我不要刷牙。”"
    if (index === 1) return "家长低声说：“再试一次，很快就好。”"
    return "孩子小声说：“这个是什么？”"
  }
  if (index === 0) return "人物小声说：“怎么又卡住了？”"
  if (index === 1) return "旁边的人说：“再试一次。”"
  return "人物小声说：“等一下，这个可以。”"
}

function fallbackTensionPlan(asset: HookScriptAsset, spec: ScriptCreativeSpec): NonNullable<HookScriptAsset["tensionPlan"]> {
  return asset.tensionPlan ?? {
    conflictType: "日常动作卡住",
    pressureSource: spec.intentContract.userIntentText,
    firstSecondShock: "第一秒出现可拍摄冲突动作",
    escalationBeat: "第二拍让冲突升级",
    unresolvedQuestion: "这个动作如何继续",
    emotionalPressure: "人物在日常流程中被卡住",
    productResolutionRole: `${spec.productLock.productName} 改变动作走向`,
    riskIfTooSubtle: "如果动作不够具体，会变成普通商品展示",
  }
}

function cloneScriptAsset(asset: HookScriptAsset): HookScriptAsset {
  return JSON.parse(JSON.stringify(asset)) as HookScriptAsset
}

function unique(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))]
}
