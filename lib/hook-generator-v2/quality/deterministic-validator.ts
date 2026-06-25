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
