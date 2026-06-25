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

function unique(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))]
}
