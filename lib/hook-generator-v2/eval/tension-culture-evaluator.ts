import type { HookOneShotRequest } from "@/lib/hook-generator-v2/graph/types"
import type { ConcreteCulturalMotif, HookCreativeResourceBundle } from "@/lib/hook-generator-v2/resources/types"
import type { HookScriptAsset } from "@/lib/hook-generator-v2/script-asset/types"
import type { HookRecommendationCard, SelectedCultureBorrowing } from "@/lib/hook-library"

export type HookCreativeScore = {
  firstSecondStopPower: number
  conflictSpecificity: number
  tensionEscalation: number
  stimulusStrength: number
  threeSecondRetention: number
  unresolvedQuestion: number
  productBridgeNaturalness: number
  visualConcreteness: number
  modelFeasibility: number
  productIdentitySafety: number
  noFullAdCompliance: number
  cultureConcreteSymbolUse: number | null
  cultureActionIntegration: number | null
  cultureSoundIntegration: number | null
  cultureProductBridgeIntegration: number | null
  fatalIssues: string[]
  rewriteTargets: Array<{
    field: string
    issue: string
    instruction: string
  }>
  decision: "pass" | "weak_pass" | "rewrite_recommended" | "fallback_recommended"
}

export function evaluateTensionAndCulture(input: {
  request: HookOneShotRequest
  selectedHook: HookRecommendationCard
  selectedCultureBorrowing?: SelectedCultureBorrowing | null
  resourceBundle: HookCreativeResourceBundle
  scriptAsset: HookScriptAsset
  currentFinalPrompt?: string | null
  assetCompilerShadowPrompt?: string | null
}): HookCreativeScore {
  const asset = input.scriptAsset
  const firstShot = asset.timelineShots[0]
  const secondShot = asset.timelineShots[1]
  const productBridgeShot = asset.timelineShots.find((shot) => shot.retentionPurpose === "product_bridge")
  const productVisibleInHook = asset.timelineShots.some((shot) => isVisibleSalesProductShot(shot))
  const productDeferredOrOptional = isProductDeferredOrOptional(asset)
  const promptText = [
    input.currentFinalPrompt,
    input.assetCompilerShadowPrompt,
    asset.hookSummary,
    asset.audienceStopReason,
    asset.productRole.whyItBelongs,
    ...asset.timelineShots.flatMap((shot) => [shot.scene, shot.action, shot.sound, shot.dialogue]),
  ].filter(Boolean).join(" ")

  const firstSecondStopPower = clampScore(
    scoreHasConcreteAction(firstShot?.action) +
    scoreContainsPressure(firstShotText(firstShot)) +
    scoreHasCamera(firstShot?.camera)
  )
  const conflictSpecificity = clampScore(
    scoreContainsPressure(promptText) +
    scoreHasConcreteAction(firstShot?.action) +
    (asset.tensionPlan?.pressureSource ? 2 : 0)
  )
  const tensionEscalation = clampScore(
    scoreHasConcreteAction(secondShot?.action) +
    (asset.tensionPlan?.escalationBeat ? 3 : 0) +
    (secondShot && firstShot && secondShot.action !== firstShot.action ? 2 : 0)
  )
  const stimulusStrength = clampScore(
    scoreContainsStimulus(promptText) +
    scoreContainsPressure(promptText) +
    (input.selectedHook.stimulationLevel === "S3" ? 2 : 0)
  )
  const unresolvedQuestion = clampScore(
    (asset.tensionPlan?.unresolvedQuestion ? 5 : 0) +
    scoreContainsCuriosity(promptText)
  )
  const productBridgeNaturalness = clampScore(
    productVisibleInHook
      ? (asset.productRole.avoidHardSell ? 2 : 0) +
        (asset.productRole.whyItBelongs.includes(input.resourceBundle.productContract.productName) ? 2 : 0) +
        (productBridgeShot ? 3 : 0) +
        (productBridgeShot?.productVisibility && productBridgeShot.productVisibility !== "none" ? 1 : 0)
      : (productDeferredOrOptional ? 8 : 6) +
        (asset.tensionPlan?.unresolvedQuestion ? 1 : 0)
  )
  const visualConcreteness = clampScore(
    asset.timelineShots.reduce((sum, shot) => sum + (isConcreteShot(shot.scene, shot.action) ? 2 : 0), 0)
  )
  const modelFeasibility = clampScore(10 - countRiskTerms(promptText) * 2)
  const productIdentitySafety = clampScore(
    (promptText.includes(input.resourceBundle.productContract.productName) ? 4 : 0) +
    (input.resourceBundle.productContract.visualAnchors.some((anchor) => promptText.includes(anchor)) ? 3 : 0) +
    (input.resourceBundle.productContract.forbiddenVisualConfusions.some((term) => promptText.includes(term)) ? -4 : 2)
  )
  const noFullAdCompliance = clampScore(
    promptText.includes("购买") || promptText.includes("下单") || promptText.includes("转化") ? 5 : 9
  )

  const cultureRequired = Boolean(input.resourceBundle.cultureMotif || asset.cultureFusionMechanism?.enabled)
  const cultureScores = cultureRequired
    ? evaluateCulture(asset, input.resourceBundle.cultureMotif, promptText)
    : {
      cultureConcreteSymbolUse: null,
      cultureActionIntegration: null,
      cultureSoundIntegration: null,
      cultureProductBridgeIntegration: null,
    }

  const fatalIssues: string[] = []
  const rewriteTargets: HookCreativeScore["rewriteTargets"] = []
  addRewriteIfLow(rewriteTargets, "tensionPlan.firstSecondShock", firstSecondStopPower, "0-1 秒缺少足够具体的停滑压力。", "把开场改成一个可拍摄的失败、打断、对峙、围观或临界动作。")
  addRewriteIfLow(rewriteTargets, "tensionPlan.escalationBeat", tensionEscalation, "1-2.5 秒没有明显升级。", "让第二拍比第一拍更紧张、更反常或更接近未完成结果。")
  if (productVisibleInHook) {
    addRewriteIfLow(rewriteTargets, "productRole", productBridgeNaturalness, "商品承接不够自然。", "让商品改变上一拍动作走向，而不是突然居中展示。")
  }
  if (cultureRequired) {
    addRewriteIfLow(rewriteTargets, "cultureFusionMechanism.actionIntegration", cultureScores.cultureActionIntegration ?? 0, "文化母题可能只是风格。", "使用现有 culture motif 的动作和商品承接符号，让文化母题改变动作链。")
    addRewriteIfLow(rewriteTargets, "cultureFusionMechanism.concreteSymbol", cultureScores.cultureConcreteSymbolUse ?? 0, "文化符号不够具体。", "至少放入一个可见文化道具、一个动作符号和一个声音符号，并让它们出现在镜头脚本里。")
    if (productVisibleInHook) {
      addRewriteIfLow(rewriteTargets, "cultureFusionMechanism.productBridgeIntegration", cultureScores.cultureProductBridgeIntegration ?? 0, "文化母题和商品承接关系偏弱。", "把商品写成文化动作里的道具、证据或通关物，而不是单独露出。")
    }
  }
  if (cultureRequired && !asset.cultureFusionMechanism?.notJustStyle) fatalIssues.push("culture_style_only")

  const minCoreScore = Math.min(firstSecondStopPower, conflictSpecificity, tensionEscalation)
  const decision: HookCreativeScore["decision"] = fatalIssues.length > 0
    ? "fallback_recommended"
    : rewriteTargets.length > 0 || minCoreScore < 6 || (productVisibleInHook && productBridgeNaturalness < 6)
      ? "rewrite_recommended"
      : minCoreScore < 8
        ? "weak_pass"
        : "pass"

  return {
    firstSecondStopPower,
    conflictSpecificity,
    tensionEscalation,
    stimulusStrength,
    threeSecondRetention: clampScore(Math.round((firstSecondStopPower + tensionEscalation + unresolvedQuestion) / 3)),
    unresolvedQuestion,
    productBridgeNaturalness,
    visualConcreteness,
    modelFeasibility,
    productIdentitySafety,
    noFullAdCompliance,
    ...cultureScores,
    fatalIssues,
    rewriteTargets,
    decision,
  }
}

function evaluateCulture(
  asset: HookScriptAsset,
  cultureMotif: ConcreteCulturalMotif | null | undefined,
  promptText: string,
) {
  const fusion = asset.cultureFusionMechanism
  const symbols = [
    fusion?.borrowedSymbol,
    fusion?.concreteSymbol,
    ...(fusion?.whereItAppears ?? []),
    ...(cultureMotif?.visualSymbols ?? []),
    ...(cultureMotif?.motionSymbols ?? []),
    ...(cultureMotif?.audioSymbols ?? []),
    ...(cultureMotif?.productBridgeOptions ?? []),
  ].filter(Boolean) as string[]
  const symbolHit = symbols.some((symbol) => promptText.includes(symbol))
  return {
    cultureConcreteSymbolUse: clampScore((symbolHit ? 5 : 0) + (fusion?.concreteSymbol || fusion?.borrowedSymbol ? 3 : 0)),
    cultureActionIntegration: clampScore((fusion?.actionIntegration ? 4 : 0) + (fusion?.actionTranslation ? 2 : 0) + scoreHasConcreteAction(fusion?.actionIntegration)),
    cultureSoundIntegration: clampScore((fusion?.soundIntegration ? 4 : 0) + (fusion?.soundTranslation ? 2 : 0) + (cultureMotif?.audioSymbols.length ? 2 : 0)),
    cultureProductBridgeIntegration: clampScore((fusion?.productBridgeIntegration ? 4 : 0) + (fusion?.productBridgeSymbol ? 2 : 0) + (cultureMotif?.productBridgeOptions.length ? 2 : 0)),
  }
}

function firstShotText(shot: HookScriptAsset["timelineShots"][number] | undefined) {
  if (!shot) return ""
  return [shot.scene, shot.subject, shot.action, shot.sound, shot.dialogue].join(" ")
}

function addRewriteIfLow(
  rewriteTargets: HookCreativeScore["rewriteTargets"],
  field: string,
  score: number,
  issue: string,
  instruction: string,
) {
  if (score >= 7) return
  rewriteTargets.push({ field, issue, instruction })
}

function scoreHasConcreteAction(value?: string) {
  if (!value) return 0
  if (/展示|呈现|体现|表达|营造|突出/.test(value)) return 0
  return /拿|递|挤|停|看|指|推|拉|打开|关上|放|转|躲|抢|围|拍|落|撞|切|翻|递出|伸手/.test(value) ? 3 : 1
}

function scoreHasCamera(value?: string) {
  if (!value) return 0
  return /近景|中景|推近|俯拍|手持|特写|固定|低角度|切镜|怼脸/.test(value) ? 2 : 1
}

function scoreContainsPressure(value: string) {
  return /失败|卡住|躲|抢|对峙|围观|质疑|突然|临界|倒计时|停住|不愿意|拒绝|打断|危险|尴尬|冲突/.test(value) ? 3 : 0
}

function scoreContainsStimulus(value: string) {
  return /突然|静音|倒吸|鼓点|冲镜|推近|怼脸|低角度|开门|撞入|抢走|全员|停住/.test(value) ? 3 : 0
}

function scoreContainsCuriosity(value: string) {
  return /为什么|怎么|哪里|答案|最后|下一秒|未完成|缺口|线索|看/.test(value) ? 3 : 0
}

function isConcreteShot(scene: string, action: string) {
  return scoreHasConcreteAction(action) >= 3 && scene.length > 8
}

function countRiskTerms(value: string) {
  return (value.match(/复杂同步|大量人群|精确文字|随机文字|复杂物理|小字|字幕/g) ?? []).length
}

function isVisibleSalesProductShot(shot: HookScriptAsset["timelineShots"][number]) {
  return shot.productVisibility === "partial" ||
    shot.productVisibility === "clear_but_not_packshot" ||
    shot.productVisibility === "hero_visible"
}

function isProductDeferredOrOptional(asset: HookScriptAsset) {
  const text = [
    asset.productRole.entryTime,
    asset.productRole.entryAction,
    asset.productRole.whyItBelongs,
    asset.tensionPlan?.productResolutionRole ?? "",
  ].join(" ")
  return /后续|下一段|延后|不直接露出|不露出|可以不出现|留到|开环|悬念|解决方案转折/.test(text)
}

function clampScore(value: number) {
  return Math.max(1, Math.min(10, value))
}
