import { ZodError } from "zod"

import type { HookValidationIssue } from "@/lib/hook-generator-v2/graph/types"
import type { HookCreativeResourceBundle } from "@/lib/hook-generator-v2/resources/types"
import { parseHookScriptAsset } from "@/lib/hook-generator-v2/script-asset/hook-script-asset-schema"
import type { HookScriptAsset, ScriptCreativeSpec } from "@/lib/hook-generator-v2/script-asset/types"

export type HookQualityGateResult = {
  status: "pass" | "fail"
  issues: HookValidationIssue[]
}

export function validateHookScriptAsset(input: {
  scriptAsset: HookScriptAsset
  scriptCreativeSpec: ScriptCreativeSpec
  resourceBundle: HookCreativeResourceBundle
}): HookQualityGateResult {
  const issues: HookValidationIssue[] = []
  const parsed = safeParseAsset(input.scriptAsset, issues)
  if (!parsed) return { status: "fail", issues }

  issues.push(...validateProductIdentity({
    scriptAsset: parsed,
    scriptCreativeSpec: input.scriptCreativeSpec,
    resourceBundle: input.resourceBundle,
  }))
  issues.push(...validateProductBridge(parsed, input.scriptCreativeSpec))
  issues.push(...validateCultureFusion(parsed, input.resourceBundle))
  issues.push(...validateUserIntentExpansionGrounding(parsed, input.scriptCreativeSpec))
  issues.push(...validateAudienceSceneCallout(parsed, input.scriptCreativeSpec, input.resourceBundle))

  return {
    status: issues.some((issue) => issue.severity === "error") ? "fail" : "pass",
    issues,
  }
}

function safeParseAsset(
  scriptAsset: HookScriptAsset,
  issues: HookValidationIssue[],
) {
  try {
    return parseHookScriptAsset(scriptAsset)
  } catch (error) {
    if (error instanceof ZodError) {
      const abstractActionIssue = error.issues.find((issue) =>
        String(issue.message).includes("不可拍") || String(issue.message).includes("abstract")
      )
      if (abstractActionIssue) {
        issues.push({
          code: "NON_FILMABLE_ACTION",
          message: abstractActionIssue.message,
          severity: "error",
          fieldPath: abstractActionIssue.path.join("."),
        })
        return scriptAsset
      }
      issues.push({
        code: "SCRIPT_ASSET_SCHEMA_INVALID",
        message: error.issues[0]?.message ?? "HookScriptAsset schema invalid",
        severity: "error",
        fieldPath: error.issues[0]?.path.join("."),
      })
      return null
    }
    issues.push({
      code: "SCRIPT_ASSET_SCHEMA_INVALID",
      message: error instanceof Error ? error.message : "HookScriptAsset schema invalid",
      severity: "error",
    })
    return null
  }
}

function validateProductIdentity(input: {
  scriptAsset: HookScriptAsset
  scriptCreativeSpec: ScriptCreativeSpec
  resourceBundle: HookCreativeResourceBundle
}): HookValidationIssue[] {
  const productName = input.scriptCreativeSpec.productLock.productName
  const anchors = [
    productName,
    ...input.scriptCreativeSpec.productLock.mustShowSignals,
    ...input.resourceBundle.productContract.visualAnchors,
  ].map(normalizeForMatch).filter(Boolean)
  const forbidden = [
    ...input.scriptCreativeSpec.productLock.forbiddenConfusions,
    ...input.resourceBundle.productContract.forbiddenVisualConfusions,
  ].map(normalizeForMatch).filter(Boolean)
  const productVisibleShots = input.scriptAsset.timelineShots.filter((shot) =>
    shot.productVisibility === "partial" ||
    shot.productVisibility === "clear_but_not_packshot" ||
    shot.productVisibility === "hero_visible"
  )
  const badShots = productVisibleShots.filter((shot) => {
    const haystack = normalizeForMatch([
      shot.scene,
      shot.subject,
      shot.action,
      ...shot.mustShow,
    ].join(" "))
    const hasAnchor = anchors.some((anchor) => haystack.includes(anchor))
    const hasForbidden = forbidden.some((term) => haystack.includes(term))
    return !hasAnchor || hasForbidden
  })

  return badShots.map((shot) => ({
    code: "PRODUCT_IDENTITY_DRIFT",
    message: `Product-visible shot must preserve ${productName} identity and avoid forbidden confusions.`,
    severity: "error" as const,
    fieldPath: `timelineShots.${input.scriptAsset.timelineShots.indexOf(shot)}`,
  }))
}

function validateProductBridge(
  scriptAsset: HookScriptAsset,
  scriptCreativeSpec: ScriptCreativeSpec,
): HookValidationIssue[] {
  const productName = normalizeForMatch(scriptCreativeSpec.productLock.productName)
  const bridgeText = normalizeForMatch([
    scriptAsset.productRole.entryAction,
    scriptAsset.productRole.whyItBelongs,
  ].join(" "))
  const productVisibleShots = scriptAsset.timelineShots.filter((shot) => isVisibleSalesProductShot(shot))
  const bridgeShotExists = scriptAsset.timelineShots.some((shot) =>
    shot.retentionPurpose === "product_bridge" &&
    isVisibleSalesProductShot(shot) &&
    normalizeForMatch([shot.scene, shot.subject, shot.action, ...shot.mustShow].join(" ")).includes(productName)
  )

  if (isShortPainHook(scriptCreativeSpec)) {
    const deferredBridge = normalizeForMatch([
      scriptAsset.productRole.entryTime,
      scriptAsset.productRole.entryAction,
      scriptAsset.productRole.whyItBelongs,
      scriptAsset.tensionPlan?.productResolutionRole ?? "",
    ].join(" "))
    const hasDeferredSignal = /4秒后|后续|下一段|解决方案转折|明确转折|延后|不直接露出|避免误解/.test(deferredBridge)
    const hasClearSalesProduct = scriptAsset.timelineShots.some((shot) => isClearSalesProductShot(shot))
    if (bridgeText.includes(productName) && hasDeferredSignal && !hasClearSalesProduct && scriptAsset.productRole.avoidHardSell) {
      return []
    }
  }

  if (productVisibleShots.length === 0) {
    return []
  }

  if (bridgeText.includes(productName) && bridgeShotExists && scriptAsset.productRole.avoidHardSell) {
    return []
  }

  return [{
    code: "MISSING_PRODUCT_BRIDGE",
    message: "When the sales product is visible inside the hook, it must change the action chain instead of appearing as a disconnected packshot.",
    severity: "error",
    fieldPath: "productRole",
  }]
}

function validateCultureFusion(
  scriptAsset: HookScriptAsset,
  resourceBundle: HookCreativeResourceBundle,
): HookValidationIssue[] {
  const requiresCulture = Boolean(resourceBundle.cultureMotif || scriptAsset.cultureFusionMechanism?.enabled)
  if (!requiresCulture) return []

  const issues: HookValidationIssue[] = []
  const fusion = scriptAsset.cultureFusionMechanism
  const resourceIds = resourceBundle.resourceIds
  const cultureMotifId = resourceBundle.cultureMotif?.cultureMotifId ?? resourceIds?.cultureMotifId ?? fusion?.motifId
  const visualRenderProfileId = resourceBundle.cultureMotif?.visualRenderProfileId ?? resourceIds?.visualRenderProfileId
  const shotPrimitiveIds = resourceBundle.cultureMotif?.shotPrimitiveIds ?? resourceIds?.shotPrimitiveIds ?? []
  if (!cultureMotifId || !fusion?.motifId) {
    issues.push({
      code: "MISSING_CULTURE_MOTIF",
      message: "Culture-fused variants must carry an explicit cultureMotifId in resource trace and script asset.",
      severity: "error",
      fieldPath: "cultureFusionMechanism.motifId",
    })
  }
  if (!visualRenderProfileId) {
    issues.push({
      code: "MISSING_VISUAL_RENDER_PROFILE",
      message: "Culture-fused variants must bind a concrete visualRenderProfileId, not generic cultural style.",
      severity: "error",
      fieldPath: "resourceBundle.resourceIds.visualRenderProfileId",
    })
  }
  if (shotPrimitiveIds.length < 3) {
    issues.push({
      code: "MISSING_MOTIF_SHOT_PRIMITIVES",
      message: "Culture-fused variants must bind at least opening, tension, and product bridge shot primitives.",
      severity: "error",
      fieldPath: "resourceBundle.resourceIds.shotPrimitiveIds",
    })
  }

  if (
    fusion?.notJustStyle &&
    fusion.actionIntegration.trim() &&
    fusion.whereItAppears.length > 0 &&
    (hasVisibleCultureAction(scriptAsset) ||
      hasDeferredProductBridge(scriptAsset) ||
      scriptAsset.timelineShots.some((shot) => shot.retentionPurpose === "product_bridge"))
  ) {
    return issues
  }

  issues.push({
    code: "CULTURE_STYLE_ONLY",
    message: "Culture fusion must alter a visible action, sound, or open-loop beat, not only visual style.",
    severity: "error",
    fieldPath: "cultureFusionMechanism",
  })
  return issues
}

function validateUserIntentExpansionGrounding(
  scriptAsset: HookScriptAsset,
  scriptCreativeSpec: ScriptCreativeSpec,
): HookValidationIssue[] {
  const expansion = scriptCreativeSpec.intentContract.userIntentExpansion
  if (!expansion) return []

  const candidates = [
    expansion.hookSignals.openingAction,
    expansion.hookSignals.conflictSource,
    expansion.hookSignals.openLoop,
    ...expansion.hookSignals.painEvidence,
    ...expansion.hookSignals.socialPressureSignals,
    ...expansion.concepts.flatMap((concept) => [
      ...safeArray(concept.observableEvidence),
      ...safeArray(concept.actionPrimitives),
    ]),
  ].map(signalFingerprint).filter((value) => value.length >= 4)

  if (candidates.length === 0) return []

  const firstShot = scriptAsset.timelineShots[0]
  const openLoopShots = scriptAsset.timelineShots.filter((shot) => shot.retentionPurpose === "open_loop")
  const groundedText = [
    firstShot ? shotGroundingText(firstShot) : "",
    scriptAsset.tensionPlan?.pressureSource ?? "",
    scriptAsset.tensionPlan?.firstSecondShock ?? "",
    scriptAsset.tensionPlan?.escalationBeat ?? "",
    scriptAsset.tensionPlan?.unresolvedQuestion ?? "",
    ...openLoopShots.map(shotGroundingText),
  ].map(signalFingerprint).join(" ")

  const grounded = candidates.some((candidate) => groundedText.includes(candidate))
  if (grounded) return []

  return [{
    code: "USER_INTENT_EXPANSION_NOT_GROUNDED",
    message: "User intent semantic expansion should land in opening action, conflict source, or open-loop signal.",
    severity: "warning",
    fieldPath: "intentContract.userIntentExpansion",
  }]
}

function validateAudienceSceneCallout(
  scriptAsset: HookScriptAsset,
  scriptCreativeSpec: ScriptCreativeSpec,
  resourceBundle: HookCreativeResourceBundle,
): HookValidationIssue[] {
  if (!isAudienceSceneCalloutSpec(scriptCreativeSpec)) return []

  const issues: HookValidationIssue[] = []
  const earlyShots = scriptAsset.timelineShots.slice(0, 2)
  const earlyRawText = [
    scriptAsset.hookSummary,
    scriptAsset.audienceStopReason,
    scriptAsset.firstFrameIntent.stopSignal,
    ...scriptAsset.textOverlay,
    scriptAsset.tensionPlan?.firstSecondShock ?? "",
    scriptAsset.tensionPlan?.escalationBeat ?? "",
    ...earlyShots.flatMap((shot) => [
      shot.scene,
      shot.subject,
      shot.action,
      shot.dialogue ?? "",
      shot.textOverlay ?? "",
      ...shot.mustShow,
    ]),
  ].join(" ")
  const earlyText = signalFingerprint(earlyRawText)
  const matchedSignals = audienceRecognitionSignals(resourceBundle)
    .filter((signal) => textContainsSignal(earlyText, signalFingerprint(signal)))

  if (hasGenericAudienceLabelOnly(earlyRawText) && matchedSignals.length < 2) {
    issues.push({
      code: "GENERIC_AUDIENCE_LABEL",
      message: "Audience-scene callout cannot stop at generic labels like 给女生/给年轻人/宝妈必买.",
      severity: "error",
      fieldPath: "timelineShots.0",
    })
  }

  if (matchedSignals.length < 2) {
    issues.push({
      code: "AUDIENCE_LABEL_WITHOUT_SCENE",
      message: "Audience-scene callout must show at least two visual recognition signals in the first 3 seconds.",
      severity: "error",
      fieldPath: "timelineShots",
    })
  }

  if (hasSensitiveAudienceClaim(earlyRawText)) {
    issues.push({
      code: "SENSITIVE_AUDIENCE_CLAIM",
      message: "Audience-scene callout must avoid shame, medicalized, or body-anxiety claims.",
      severity: "error",
      fieldPath: "textOverlay",
    })
  }

  if (!hasAudienceSceneBridge(scriptAsset, scriptCreativeSpec, resourceBundle)) {
    issues.push({
      code: "AUDIENCE_CALLOUT_NO_BRIDGE",
      message: "Audience-scene callout must bridge the identified moment to a product role, result, or next action.",
      severity: "error",
      fieldPath: "productRole",
    })
  }

  return issues
}

function isAudienceSceneCalloutSpec(scriptCreativeSpec: ScriptCreativeSpec) {
  return scriptCreativeSpec.intentContract.intentType === "audience_first" &&
    ["H4_C_AUDIENCE_SCENE_CALLOUT", "H4_V1_AUDIENCE_SCENE_CALLOUT"].includes(scriptCreativeSpec.resourceIds.attentionMicroPatternId)
}

function audienceRecognitionSignals(resourceBundle: HookCreativeResourceBundle) {
  return [...new Set(resourceBundle.audienceSituations.flatMap((situation) => [
    situation.name,
    ...situation.recognitionSignals,
    ...situation.commonScenes,
    ...situation.exampleAudienceInputs,
  ]).map((value) => value.trim()).filter((value) => value.length >= 2))]
}

function textContainsSignal(text: string, signal: string) {
  if (!text || !signal) return false
  if (text.includes(signal) || signal.includes(text)) return true
  for (let index = 0; index < signal.length - 1; index += 1) {
    const gram = signal.slice(index, index + 2)
    if (!["的人", "一个", "场景", "日常", "用户"].includes(gram) && text.includes(gram)) return true
  }
  return false
}

function hasGenericAudienceLabelOnly(value: string) {
  return /给?(女生|男生|年轻人|上班族|宝妈|妈妈|用户|大家)(都该用|必买|必备|的好物|推荐)?/.test(value)
}

function hasSensitiveAudienceClaim(value: string) {
  return /产后.{0,8}(恢复身材|瘦|减肥|焦虑)|30\+.{0,8}(显老|衰老|必买)|治疗|治愈|疼痛消失|医美级|逆龄/.test(value)
}

function hasAudienceSceneBridge(
  scriptAsset: HookScriptAsset,
  scriptCreativeSpec: ScriptCreativeSpec,
  resourceBundle: HookCreativeResourceBundle,
) {
  const productName = signalFingerprint(scriptCreativeSpec.productLock.productName)
  const bridgeTerms = [
    productName,
    ...resourceBundle.bridgeCandidates.map((bridge) => signalFingerprint(bridge.name)),
    "下一步",
    "承接",
    "结果",
    "线索",
    "解决",
    "继续",
  ].filter(Boolean)
  const bridgeText = signalFingerprint([
    scriptAsset.productRole.entryTime,
    scriptAsset.productRole.entryAction,
    scriptAsset.productRole.whyItBelongs,
    scriptAsset.tensionPlan?.productResolutionRole ?? "",
    ...scriptAsset.timelineShots
      .filter((shot) => shot.retentionPurpose === "product_bridge" || shot.retentionPurpose === "proof_hint")
      .flatMap((shot) => [shot.scene, shot.subject, shot.action, shot.textOverlay ?? "", ...shot.mustShow]),
  ].join(" "))

  return bridgeTerms.some((term) => term && bridgeText.includes(term))
}

function safeArray<T>(value: T[] | undefined | null) {
  return Array.isArray(value) ? value : []
}

function normalizeForMatch(value: string) {
  return value.replace(/\s+/g, "").toLowerCase()
}

function shotGroundingText(shot: HookScriptAsset["timelineShots"][number]) {
  return [
    shot.scene,
    shot.subject,
    shot.action,
    shot.sound,
    shot.dialogue ?? "",
    ...shot.mustShow,
  ].join(" ")
}

function signalFingerprint(value: string) {
  return normalizeForMatch(value)
    .replace(/[，。！？、；：“”"'.:;!?|/\\()[\]{}<>《》【】]/g, "")
}

function isShortPainHook(scriptCreativeSpec: ScriptCreativeSpec) {
  return scriptCreativeSpec.intentContract.intentType === "pain_first" && scriptCreativeSpec.duration <= 4
}

function isClearSalesProductShot(shot: HookScriptAsset["timelineShots"][number]) {
  return shot.productVisibility === "clear_but_not_packshot" || shot.productVisibility === "hero_visible"
}

function isVisibleSalesProductShot(shot: HookScriptAsset["timelineShots"][number]) {
  return shot.productVisibility === "partial" ||
    shot.productVisibility === "clear_but_not_packshot" ||
    shot.productVisibility === "hero_visible"
}

function hasDeferredProductBridge(scriptAsset: HookScriptAsset) {
  const text = normalizeForMatch([
    scriptAsset.productRole.entryTime,
    scriptAsset.productRole.entryAction,
    scriptAsset.productRole.whyItBelongs,
    scriptAsset.tensionPlan?.productResolutionRole ?? "",
  ].join(" "))
  return /4秒后|后续|下一段|解决方案转折|明确转折|延后|不直接露出|避免误解/.test(text)
}

function hasVisibleCultureAction(scriptAsset: HookScriptAsset) {
  const fusion = scriptAsset.cultureFusionMechanism
  if (!fusion) return false
  const symbols = [
    fusion.borrowedSymbol,
    fusion.concreteSymbol,
    ...fusion.whereItAppears,
  ].filter((value): value is string => Boolean(value)).map(normalizeForMatch).filter(Boolean)
  return scriptAsset.timelineShots.some((shot) => {
    const text = normalizeForMatch([shot.scene, shot.subject, shot.action, shot.sound, ...shot.mustShow].join(" "))
    return symbols.some((symbol) => text.includes(symbol))
  })
}
