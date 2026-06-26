import type { HookRepairRecord, HookValidationIssue } from "@/lib/hook-generator-v2/graph/types"
import type { HookCreativeResourceBundle } from "@/lib/hook-generator-v2/resources/types"
import { parseHookScriptAsset } from "@/lib/hook-generator-v2/script-asset/hook-script-asset-schema"
import type { HookScriptAsset, ScriptCreativeSpec, TimelineShot } from "@/lib/hook-generator-v2/script-asset/types"

import { validateHookScriptAsset, type HookQualityGateResult } from "./deterministic-validator"

export type HookScriptAssetRepairResult = {
  repaired: boolean
  scriptAsset: HookScriptAsset
  repairRecord: HookRepairRecord | null
}

export type HookScriptAssetRepairLoopResult = {
  scriptAsset: HookScriptAsset
  qualityGate: HookQualityGateResult
  repairAttempts: number
  repairHistory: HookRepairRecord[]
}

export function validateAndRepairHookScriptAsset(input: {
  scriptAsset: HookScriptAsset
  scriptCreativeSpec: ScriptCreativeSpec
  resourceBundle: HookCreativeResourceBundle
  maxRepairAttempts: number
}): HookScriptAssetRepairLoopResult {
  let scriptAsset = input.scriptAsset
  let qualityGate = validateHookScriptAsset({
    scriptAsset,
    scriptCreativeSpec: input.scriptCreativeSpec,
    resourceBundle: input.resourceBundle,
  })
  const repairHistory: HookRepairRecord[] = []

  while (qualityGate.status === "fail" && repairHistory.length < input.maxRepairAttempts) {
    const repair = repairHookScriptAsset({
      scriptAsset,
      scriptCreativeSpec: input.scriptCreativeSpec,
      resourceBundle: input.resourceBundle,
      issues: qualityGate.issues,
      attempt: repairHistory.length + 1,
      maxRepairAttempts: input.maxRepairAttempts,
    })
    if (!repair.repaired || !repair.repairRecord) break
    scriptAsset = repair.scriptAsset
    repairHistory.push(repair.repairRecord)
    qualityGate = validateHookScriptAsset({
      scriptAsset,
      scriptCreativeSpec: input.scriptCreativeSpec,
      resourceBundle: input.resourceBundle,
    })
  }

  return {
    scriptAsset,
    qualityGate,
    repairAttempts: repairHistory.length,
    repairHistory,
  }
}

export function repairHookScriptAsset(input: {
  scriptAsset: HookScriptAsset
  scriptCreativeSpec: ScriptCreativeSpec
  resourceBundle: HookCreativeResourceBundle
  issues: HookValidationIssue[]
  attempt: number
  maxRepairAttempts?: number
  repairedAt?: string
}): HookScriptAssetRepairResult {
  const maxRepairAttempts = input.maxRepairAttempts ?? 1
  if (input.attempt > maxRepairAttempts) {
    return {
      repaired: false,
      scriptAsset: input.scriptAsset,
      repairRecord: null,
    }
  }

  const issueCodes = new Set(input.issues.map((issue) => issue.code))
  let repaired = cloneScriptAsset(input.scriptAsset)

  if (issueCodes.has("PRODUCT_IDENTITY_DRIFT")) {
    repaired = repairProductIdentity(repaired, input.scriptCreativeSpec, input.resourceBundle)
  }
  if (issueCodes.has("MISSING_PRODUCT_BRIDGE")) {
    repaired = repairProductBridge(repaired, input.scriptCreativeSpec, input.resourceBundle)
  }
  if (
    issueCodes.has("CULTURE_STYLE_ONLY") ||
    issueCodes.has("MISSING_CULTURE_MOTIF") ||
    issueCodes.has("MISSING_VISUAL_RENDER_PROFILE") ||
    issueCodes.has("MISSING_MOTIF_SHOT_PRIMITIVES")
  ) {
    repaired = repairCultureFusion(repaired, input.resourceBundle)
  }
  if (issueCodes.has("NON_FILMABLE_ACTION") || issueCodes.has("SCRIPT_ASSET_SCHEMA_INVALID")) {
    repaired = repairFilmableActions(repaired, input.scriptCreativeSpec)
  }
  if (
    issueCodes.has("GENERIC_AUDIENCE_LABEL") ||
    issueCodes.has("AUDIENCE_LABEL_WITHOUT_SCENE") ||
    issueCodes.has("SENSITIVE_AUDIENCE_CLAIM") ||
    issueCodes.has("AUDIENCE_CALLOUT_NO_BRIDGE")
  ) {
    repaired = repairAudienceSceneCallout(repaired, input.scriptCreativeSpec, input.resourceBundle)
  }

  return {
    repaired: true,
    scriptAsset: parseHookScriptAsset(repaired),
    repairRecord: {
      attempt: input.attempt,
      reason: [...issueCodes].join(", ") || "TARGETED_REPAIR",
      repairedAt: input.repairedAt ?? new Date().toISOString(),
      issues: input.issues,
    },
  }
}

function repairProductIdentity(
  asset: HookScriptAsset,
  spec: ScriptCreativeSpec,
  bundle: HookCreativeResourceBundle,
) {
  const productName = spec.productLock.productName
  const mustShow = unique([
    productName,
    ...spec.productLock.mustShowSignals,
    ...bundle.productContract.visualAnchors,
  ]).slice(0, 5)
  return {
    ...asset,
    timelineShots: asset.timelineShots.map((shot) => {
      if (shot.productVisibility === "none" || shot.productVisibility === "background_hint") return shot
      return {
        ...shot,
        scene: `${productName} 在${bundle.productContract.typicalUseScenes[0] ?? "真实使用场景"}中进入动作链`,
        subject: productName,
        action: `${productName}${spec.productLock.allowedProductActions[0] ?? "执行一个清晰可见的使用动作"}`,
        mustShow,
      }
    }),
    firstFrameIntent: {
      ...asset.firstFrameIntent,
      mustShow: unique([...asset.firstFrameIntent.mustShow, ...mustShow]).slice(0, 6),
      mustAvoid: unique([...asset.firstFrameIntent.mustAvoid, ...spec.productLock.forbiddenConfusions]),
    },
    videoPromptHints: {
      ...asset.videoPromptHints,
      keyObjects: unique([productName, ...asset.videoPromptHints.keyObjects, ...mustShow]).slice(0, 8),
      avoid: unique([...asset.videoPromptHints.avoid, ...spec.productLock.forbiddenConfusions]),
    },
  }
}

function repairProductBridge(
  asset: HookScriptAsset,
  spec: ScriptCreativeSpec,
  bundle: HookCreativeResourceBundle,
) {
  const productName = spec.productLock.productName
  const action = `${productName}${spec.productLock.allowedProductActions[0] ?? "进入动作链"}`
  return {
    ...asset,
    productRole: {
      ...asset.productRole,
      entryAction: action,
      whyItBelongs: `${productName} 作为 ${bundle.bridgeCandidates?.[0]?.name ?? "商品承接"} 回收前面的停顿或冲突。`,
      avoidHardSell: true,
      noFullClaim: true,
    },
    timelineShots: ensureProductBridgeShot(asset.timelineShots, spec),
  }
}

function repairCultureFusion(
  asset: HookScriptAsset,
  bundle: HookCreativeResourceBundle,
) {
  const motif = bundle.cultureMotif
  if (!motif && !asset.cultureFusionMechanism?.enabled) return asset
  const current = asset.cultureFusionMechanism
  return {
    ...asset,
    cultureFusionMechanism: {
      enabled: true,
      motifId: motif?.id ?? current?.motifId ?? "culture_motif",
      borrowedSymbol: motif?.visualSymbols[0] ?? current?.borrowedSymbol ?? "文化动作符号",
      whereItAppears: unique([
        ...(current?.whereItAppears ?? []),
        ...(motif?.visualSymbols ?? []),
        ...(motif?.motionSymbols ?? []),
      ]).slice(0, 5),
      actionIntegration: motif?.actionLogic ?? current?.actionIntegration ?? "文化元素必须改变人物动作链",
      soundIntegration: motif?.audioSymbols.join("、") || current?.soundIntegration || "动作同步音",
      productBridgeIntegration: motif?.productBridgeOptions.join("、") || current?.productBridgeIntegration || asset.productRole.role,
      notJustStyle: true,
    },
  }
}

function repairFilmableActions(
  asset: HookScriptAsset,
  spec: ScriptCreativeSpec,
) {
  return {
    ...asset,
    timelineShots: asset.timelineShots.map((shot) => ({
      ...shot,
      action: isAbstractAction(shot.action)
        ? `${spec.productLock.productName}${spec.productLock.allowedProductActions[0] ?? "执行一个清晰可见的使用动作"}`
        : shot.action,
    })),
  }
}

function repairAudienceSceneCallout(
  asset: HookScriptAsset,
  spec: ScriptCreativeSpec,
  bundle: HookCreativeResourceBundle,
) {
  const situation = bundle.audienceSituations[0]
  const audienceLabel = situation?.exampleAudienceInputs[0] ?? spec.intentContract.userIntentText
  const scene = situation?.commonScenes[0] ?? bundle.productContract.typicalUseScenes[0] ?? "真实使用场景"
  const signals = unique([
    ...(situation?.recognitionSignals ?? []),
    ...bundle.productContract.usageAnchors,
  ]).slice(0, 5)
  const firstSignal = signals.slice(0, 2).join("、") || "可见身份和场景线索"
  const productName = spec.productLock.productName
  const repairedShots = asset.timelineShots.length > 0 ? asset.timelineShots.map((shot, index) => {
    if (index > 1) return sanitizeShot(shot)
    return {
      ...sanitizeShot(shot),
      retentionPurpose: index === 0 ? "stop_scroll" as const : shot.retentionPurpose,
      scene: index === 0 ? `${scene}，${firstSignal}同框` : shot.scene,
      subject: index === 0 ? audienceLabel : shot.subject,
      action: index === 0
        ? `${audienceLabel}在${scene}停住，${firstSignal}让人一眼识别这是谁的时刻`
        : shot.action,
      textOverlay: index === 0 ? `${audienceLabel}` : shot.textOverlay,
      productVisibility: index === 0 ? "background_hint" as const : shot.productVisibility,
      mustShow: unique([...signals.slice(0, 4), ...shot.mustShow]).slice(0, 6),
      transitionToNextShot: index === 0 ? "继续展示这个人群为什么需要下一步" : shot.transitionToNextShot,
    }
  }) : [{
    time: "0-1s",
    retentionPurpose: "stop_scroll" as const,
    scene: `${scene}，${firstSignal}同框`,
    subject: audienceLabel,
    action: `${audienceLabel}在${scene}停住，${firstSignal}让人一眼识别这是谁的时刻`,
    camera: "环境中近景",
    sound: "真实环境声短暂停住",
    textOverlay: audienceLabel,
    productVisibility: "background_hint" as const,
    mustShow: signals.slice(0, 4),
    mustAvoid: spec.productLock.forbiddenConfusions,
    transitionToNextShot: "继续展示这个人群为什么需要下一步",
  }]

  return {
    ...asset,
    hookSummary: sanitizeAudienceText(asset.hookSummary || `${audienceLabel}的场景化人群点名`),
    audienceStopReason: `${audienceLabel}会先认出${scene}里的${firstSignal}，再看下一步怎么被接住。`,
    productRole: {
      ...asset.productRole,
      entryAction: `${productName}作为这个场景的下一步线索进入，不硬切 packshot。`,
      whyItBelongs: `${productName}承接${audienceLabel}在${scene}里的具体停顿，让动作继续或结果变清楚。`,
      avoidHardSell: true,
      noFullClaim: true,
    },
    timelineShots: repairedShots,
    textOverlay: unique(asset.textOverlay.map(sanitizeAudienceText).concat(audienceLabel)).slice(0, 4),
    firstFrameIntent: {
      ...asset.firstFrameIntent,
      stopSignal: sanitizeAudienceText(asset.firstFrameIntent.stopSignal || audienceLabel),
      mustShow: unique([...signals.slice(0, 4), ...asset.firstFrameIntent.mustShow]).slice(0, 6),
      mustAvoid: unique([...asset.firstFrameIntent.mustAvoid, ...spec.productLock.forbiddenConfusions]),
    },
    videoPromptHints: {
      ...asset.videoPromptHints,
      keyObjects: unique([...signals.slice(0, 4), ...asset.videoPromptHints.keyObjects, productName]).slice(0, 8),
      avoid: unique([...asset.videoPromptHints.avoid, ...spec.productLock.forbiddenConfusions]),
    },
    riskFlags: unique([...asset.riskFlags, "audience_scene_repaired"]),
  }
}

function ensureProductBridgeShot(
  shots: TimelineShot[],
  spec: ScriptCreativeSpec,
) {
  const productName = spec.productLock.productName
  const bridgeIndex = shots.findIndex((shot) => shot.retentionPurpose === "product_bridge")
  if (bridgeIndex >= 0) {
    return shots.map((shot, index) => index === bridgeIndex ? repairBridgeShot(shot, spec) : shot)
  }
  const base = shots[0]
  const bridgeShot: TimelineShot = repairBridgeShot({
    ...(base ?? {
      time: "1-3s",
      retentionPurpose: "product_bridge",
      scene: `${productName} 进入真实使用场景`,
      subject: productName,
      action: `${productName}${spec.productLock.allowedProductActions[0] ?? "执行一个清晰可见的使用动作"}`,
      camera: "手部中近景",
      sound: "真实环境声",
      productVisibility: "clear_but_not_packshot",
      mustShow: [productName],
      mustAvoid: spec.productLock.forbiddenConfusions,
      transitionToNextShot: "继续到证明镜头",
    }),
    retentionPurpose: "product_bridge",
  }, spec)
  return shots.length > 0 ? [shots[0], bridgeShot, ...shots.slice(1)] : [bridgeShot]
}

function repairBridgeShot(shot: TimelineShot, spec: ScriptCreativeSpec): TimelineShot {
  const productName = spec.productLock.productName
  return {
    ...shot,
    retentionPurpose: "product_bridge",
    scene: `${productName} 进入真实使用动作`,
    subject: productName,
    action: `${productName}${spec.productLock.allowedProductActions[0] ?? "执行一个清晰可见的使用动作"}`,
    productVisibility: "clear_but_not_packshot",
    mustShow: unique([productName, ...spec.productLock.mustShowSignals]).slice(0, 5),
    mustAvoid: spec.productLock.forbiddenConfusions,
    transitionToNextShot: "保持同一动作链继续推进",
  }
}

function cloneScriptAsset(asset: HookScriptAsset): HookScriptAsset {
  return JSON.parse(JSON.stringify(asset)) as HookScriptAsset
}

function isAbstractAction(action: string) {
  const normalized = action.replace(/\s+/g, "")
  return ["展示痛点", "呈现痛点", "展示卖点", "呈现卖点", "呈现高级感", "展示高级感"].some((phrase) =>
    normalized.includes(phrase)
  )
}

function sanitizeShot(shot: TimelineShot): TimelineShot {
  return {
    ...shot,
    scene: sanitizeAudienceText(shot.scene),
    subject: sanitizeAudienceText(shot.subject),
    action: sanitizeAudienceText(shot.action),
    dialogue: shot.dialogue ? sanitizeAudienceText(shot.dialogue) : shot.dialogue,
    textOverlay: shot.textOverlay ? sanitizeAudienceText(shot.textOverlay) : shot.textOverlay,
    mustShow: shot.mustShow.map(sanitizeAudienceText),
  }
}

function sanitizeAudienceText(value: string) {
  return value
    .replace(/产后妈妈.{0,8}(恢复身材|瘦|减肥|焦虑)/g, "产后妈妈出门前想找回舒适状态")
    .replace(/30\+.{0,8}(显老|衰老|必买)/g, "30+ 出门前想让状态更利落")
    .replace(/(女生|男生|年轻人|宝妈|妈妈|用户|大家)(都该用|必买|必备)/g, "$1的具体场景")
    .replace(/治疗|治愈|疼痛消失|医美级|逆龄/g, "日常护理")
}

function unique(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))]
}
