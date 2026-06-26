import type { HookProductBrief } from "@/lib/hook-generator"
import type { HookNarrativeRole, HookOneShotIntent } from "@/lib/hook-one-shot"
import type { HookRecommendationCard, SelectedCultureBorrowing } from "@/lib/hook-library"
import {
  listHookGenerationFewShots,
  listHookCategoryPlaybooks,
  listHookReferenceAssets,
  listHookTrendObservations,
} from "@/lib/hook-library"
import type { HookRunState, VariantState } from "@/lib/hook-generator-v2/graph/types"

import {
  ATTENTION_MICRO_PATTERNS,
  AUDIENCE_SITUATION_PATTERNS,
  CONSTRAINT_RULES,
  EVENT_PRIMITIVES,
  FAILURE_MODES,
  P0_CATEGORY_RULES,
  PRODUCT_BRIDGE_ROLES,
  PROOF_VISUALIZATION_CARDS,
  SHOT_CARDS,
} from "./p0-resource-library"
import { CULTURE_MOTIF_CARDS } from "@/lib/culture-motif-resources"
import type {
  AttentionMicroPattern,
  ConcreteCulturalMotif,
  EventPrimitive,
  GoldHookExample,
  HookCreativeResourceBundle,
  HookResourceLibraryRefs,
  ProductBridgeRoleResource,
  ProofVisualizationCard,
  RuntimeProductContract,
} from "./types"

export function injectResourcesForHookRunState(state: HookRunState): HookRunState {
  const productContract = buildRuntimeProductContract({
    productBrief: state.productBrief,
    productCategoryHint: state.input.analysisHints?.productCategory,
  })
  const variants = Object.fromEntries(
    Object.entries(state.variants).map(([clientVideoId, variant]) => {
      const resourceBundle = injectHookResources({
        productBrief: state.productBrief,
        productContract,
        intent: state.input.intent,
        intentText: state.input.intentText,
        variant,
        durationSeconds: state.videoSettings.videoDuration,
      })
      return [clientVideoId, {
        ...variant,
        productContract,
        resourceBundle,
        status: "resource_ready" as const,
      }]
    }),
  )

  return {
    ...state,
    productContract,
    variants,
  }
}

export function injectHookResources(input: {
  productBrief: HookProductBrief
  productContract: RuntimeProductContract
  intent: HookOneShotIntent
  intentText: string
  variant: VariantState
  durationSeconds: number
}): HookCreativeResourceBundle {
  const categoryRule = categoryRuleForContract(input.productContract)
  const hookStudioCategory = categoryRule.hookStudioCategory
  const attentionMicroPattern = selectAttentionMicroPattern(input.variant.selectedHook, input.intent, input.variant.role)
  const eventCandidates = selectEventPrimitives(attentionMicroPattern, input.intent, input.variant.role)
  const bridgeCandidates = selectBridgeRoles({
    selectedHook: input.variant.selectedHook,
    intent: input.intent,
    role: input.variant.role,
    productCategory: input.productContract.productCategory,
    eventCandidates,
  })
  const proofCandidates = selectProofCards({
    intent: input.intent,
    selectedHook: input.variant.selectedHook,
    attentionMicroPattern,
    bridgeCandidates,
    productBrief: input.productBrief,
  })
  const cultureMotif = selectCultureMotif({
    intent: input.intent,
    role: input.variant.role,
    selectedCultureBorrowing: input.variant.selectedCultureBorrowing,
    productCategory: input.productContract.productCategory,
  })
  const shotCandidates = selectShotCards({
    eventCandidates,
    bridgeCandidates,
    proofCandidates,
    cultureMotif,
  })
  const audienceSituations = selectAudienceSituations({
    intent: input.intent,
    intentText: input.intentText,
    targetAudience: input.productBrief.marketingLogic.targetAudience,
    selectedHook: input.variant.selectedHook,
    productCategory: input.productContract.productCategory,
    role: input.variant.role,
  })
  const constraints = selectConstraints(input.variant.role, Boolean(cultureMotif))
  const failureWarnings = selectFailureWarnings(input.variant.role, Boolean(cultureMotif))
  const libraryRefs = collectHookStudioRefs({
    category: hookStudioCategory,
    hookType: input.variant.selectedHook.hookType,
  })
  const examples = buildExamples(libraryRefs, hookStudioCategory, input.variant.selectedHook.hookType, input.intent)

  return {
    productContract: input.productContract,
    audienceSituations,
    attentionMicroPattern,
    eventCandidates,
    bridgeCandidates,
    proofCandidates,
    cultureMotif,
    shotCandidates,
    constraints,
    failureWarnings,
    examples,
    resourceIds: {
      audienceSituationIds: audienceSituations.map((item) => item.id),
      attentionMicroPatternId: attentionMicroPattern.id,
      eventPrimitiveIds: eventCandidates.map((item) => item.id),
      productBridgeRoleIds: bridgeCandidates.map((item) => item.id),
      proofVisualizationIds: proofCandidates.map((item) => item.id),
      ...(cultureMotif ? { cultureMotifId: cultureMotif.cultureMotifId ?? cultureMotif.id } : {}),
      ...(cultureMotif?.visualRenderProfileId ? { visualRenderProfileId: cultureMotif.visualRenderProfileId } : {}),
      ...(cultureMotif?.shotPrimitiveIds?.length ? { shotPrimitiveIds: cultureMotif.shotPrimitiveIds } : {}),
      shotCardIds: shotCandidates.map((item) => item.id),
      constraintRuleIds: constraints.map((item) => item.id),
      failureWarningIds: failureWarnings.map((item) => item.id),
      exampleIds: examples.map((item) => item.id),
    },
    libraryRefs,
    retrievalPolicy: {
      intent: input.intent,
      role: input.variant.role,
      bounded: true,
    },
  }
}

export function buildRuntimeProductContract(input: {
  productBrief: HookProductBrief
  productCategoryHint?: string | null
}): RuntimeProductContract {
  const categoryRule = resolveP0CategoryRule([
    input.productCategoryHint,
    input.productBrief.productCategory,
    input.productBrief.productName,
  ])
  return {
    productName: input.productBrief.productName,
    productCategory: categoryRule.canonicalCategory,
    inferredSubCategory: categoryRule.inferredSubCategory,
    visualAnchors: unique([
      ...categoryRule.visualAnchors,
      input.productBrief.productImage ? "商品主图外形" : "",
    ]),
    packagingSignals: categoryRule.packagingSignals,
    usageAnchors: categoryRule.usageAnchors,
    typicalUseScenes: categoryRule.typicalUseScenes,
    allowedProductActions: categoryRule.allowedProductActions,
    forbiddenVisualConfusions: categoryRule.forbiddenVisualConfusions,
    claimRiskTags: unique([
      ...categoryRule.claimRiskTags,
      ...claimRiskTagsForMarketing(input.productBrief.marketingLogic.coreSellingPoints),
    ]),
    modelRiskTags: categoryRule.modelRiskTags,
    source: {
      productAnalysisUsed: Boolean(input.productCategoryHint || input.productBrief.productCategory),
      fallbackCategoryRuleIds: [categoryRule.id],
    },
  }
}

function resolveP0CategoryRule(values: Array<string | null | undefined>) {
  const searchText = values.map((value) => String(value ?? "").toLowerCase()).join(" ")
  return P0_CATEGORY_RULES.find((rule) =>
    rule.aliases.some((alias) => searchText.includes(alias.toLowerCase()))
  ) ?? P0_CATEGORY_RULES.find((rule) => rule.id === "p0_general_ecommerce")!
}

function categoryRuleForContract(contract: RuntimeProductContract) {
  return P0_CATEGORY_RULES.find((rule) => rule.canonicalCategory === contract.productCategory && rule.inferredSubCategory === contract.inferredSubCategory)
    ?? P0_CATEGORY_RULES.find((rule) => rule.id === contract.source.fallbackCategoryRuleIds[0])
    ?? P0_CATEGORY_RULES.find((rule) => rule.id === "p0_general_ecommerce")!
}

function claimRiskTagsForMarketing(sellingPoints: string[]) {
  const text = sellingPoints.join(" ").toLowerCase()
  return [
    /美白|祛痘|治疗|治愈|抗菌|杀菌/.test(text) ? "claim_needs_softening" : "",
  ].filter(Boolean)
}

function selectAudienceSituations(input: {
  intent: HookOneShotIntent
  intentText?: string
  targetAudience?: string[]
  selectedHook: HookRecommendationCard
  productCategory: string
  role: HookNarrativeRole
}) {
  const audienceText = [
    input.intentText ?? "",
    ...(input.targetAudience ?? []),
  ].join(" ")
  return takeScored(AUDIENCE_SITUATION_PATTERNS, (item) => {
    let score = 0
    if (item.compatibleIntentTypes.includes(input.intent)) score += 5
    if (item.compatibleCategories.includes(input.productCategory)) score += 4
    if (item.applicableProductCategories?.includes(input.productCategory)) score += 3
    if (item.weakFitCategories?.includes(input.productCategory)) score -= 2
    if (item.avoidForCategories?.includes(input.productCategory)) score -= 8
    if (item.compatibleHookTypes.includes(input.selectedHook.hookType)) score += 3
    if (input.role === "culture-fused" && item.id === "aud_creative_mismatch_viewer") score += 5
    if (matchesAudienceSituationText(item, audienceText)) score += 7
    return score
  }, 3, 1)
}

function selectAttentionMicroPattern(
  selectedHook: HookRecommendationCard,
  intent: HookOneShotIntent,
  role: HookNarrativeRole,
) {
  return takeScored(ATTENTION_MICRO_PATTERNS, (item) => {
    let score = item.parentHookType === selectedHook.hookType ? 10 : 0
    if (item.bestForIntentModes.includes(intent)) score += 4
    if (matchesSelectedHookSubType(item, selectedHook.subType)) score += 8
    if (selectedHook.subType === "audience_scene_callout" && item.id === "H4_C_AUDIENCE_SCENE_CALLOUT") score += 8
    if (intent === "audience_first" && item.id === "H4_C_AUDIENCE_SCENE_CALLOUT") score += 2
    if (role === "culture-fused" && item.parentHookType === "H7") score += 6
    if (role === "contrast" && ["H2", "H5"].includes(item.parentHookType)) score += 3
    return score
  }, 1, 1)[0]
}

function selectEventPrimitives(
  attentionMicroPattern: AttentionMicroPattern,
  intent: HookOneShotIntent,
  role: HookNarrativeRole,
) {
  return takeScored(EVENT_PRIMITIVES, (item) => {
    let score = 0
    if (item.compatibleMicroPatternIds.includes(attentionMicroPattern.id)) score += 8
    if (eventMatchesAttentionQuery(item, attentionMicroPattern)) score += 3
    if (item.compatibleIntentTypes.includes(intent)) score += 4
    if (role === "culture-fused" && item.eventKind.includes("cultural")) score += 6
    if (role === "contrast" && ["comparison_split", "repeated_failure"].includes(item.eventKind)) score += 4
    return score
  }, 5, 3)
}

function selectBridgeRoles(input: {
  selectedHook: HookRecommendationCard
  intent: HookOneShotIntent
  role: HookNarrativeRole
  productCategory: string
  eventCandidates: EventPrimitive[]
}) {
  const eventKinds = new Set(input.eventCandidates.map((event) => event.eventKind))
  return takeScored(PRODUCT_BRIDGE_ROLES, (item) => {
    let score = 0
    if (item.bestForHookTypes.includes(input.selectedHook.hookType)) score += 5
    if (item.bestForIntentModes.includes(input.intent)) score += 5
    if (item.bestForProductCategoryTags.includes(input.productCategory)) score += 2
    if (item.compatibleEventKinds.some((kind) => eventKinds.has(kind))) score += 3
    if (input.role === "culture-fused" && item.compatibleCulturalMotifTypes.length > 0) score += 3
    return score
  }, 3, 2)
}

function selectProofCards(input: {
  intent: HookOneShotIntent
  selectedHook: HookRecommendationCard
  attentionMicroPattern: AttentionMicroPattern
  bridgeCandidates: ProductBridgeRoleResource[]
  productBrief: HookProductBrief
}) {
  const bridgeRoles = new Set(input.bridgeCandidates.map((bridge) => bridge.role))
  const maxCount = input.intent === "creative_first" && input.selectedHook.hookType !== "H5" ? 1 : 3
  const minCount = input.intent === "audience_first" || input.intent === "creative_first" ? 1 : 2
  const pointsText = [
    ...input.productBrief.marketingLogic.coreSellingPoints,
    ...input.productBrief.marketingLogic.painPoints,
  ].join(" ")
  return takeScored(PROOF_VISUALIZATION_CARDS, (item) => {
    let score = 0
    if (item.compatibleIntentModes.includes(input.intent)) score += 4
    if (item.compatibleHookTypes.includes(input.selectedHook.hookType)) score += 4
    if (item.compatibleMicroPatterns.includes(input.attentionMicroPattern.id)) score += 4
    if (item.compatibleProductRoles.some((role) => bridgeRoles.has(role))) score += 3
    if (/优惠|折扣|半价|买|赠|组合|价值/.test(pointsText) && item.claimFamily === "value") score += 4
    if (/不爱|失败|麻烦|痛|脏|乱|卡/.test(pointsText) && item.claimTag === "failure_contrast") score += 4
    return score
  }, maxCount, minCount)
}

function selectCultureMotif(input: {
  intent: HookOneShotIntent
  role: HookNarrativeRole
  selectedCultureBorrowing: SelectedCultureBorrowing | null
  productCategory: string
}): ConcreteCulturalMotif | null {
  if (input.selectedCultureBorrowing) {
    const matchedSymbols = input.selectedCultureBorrowing.matchedSymbolEntries ?? []
    return {
      id: input.selectedCultureBorrowing.templateId,
      name: input.selectedCultureBorrowing.nameCn,
      source: "selected_culture_borrowing",
      motifType: input.selectedCultureBorrowing.cultureMotifId ?? "selected_template",
      motifFamily: input.selectedCultureBorrowing.motifFamily,
      actionLogic: input.selectedCultureBorrowing.cultureMechanism.join(" / ") || input.selectedCultureBorrowing.productBridgeRule,
      visualSymbols: unique([
        ...matchedSymbols.flatMap((symbol) => [symbol.nameCn, ...symbol.visualSlots]),
        input.selectedCultureBorrowing.firstFrameFormula,
        ...input.selectedCultureBorrowing.symbolBorrowing.visual,
      ]).slice(0, 12),
      motionSymbols: unique([
        ...matchedSymbols.flatMap((symbol) => symbol.motionSlots),
        input.selectedCultureBorrowing.openingCapture,
        input.selectedCultureBorrowing.attentionEscalation,
        ...input.selectedCultureBorrowing.symbolBorrowing.motion,
      ]).slice(0, 12),
      audioSymbols: unique([
        ...matchedSymbols.flatMap((symbol) => symbol.audioSlots),
        input.selectedCultureBorrowing.audioFormulaCn,
        ...input.selectedCultureBorrowing.symbolBorrowing.audio,
      ]).slice(0, 10),
      productBridgeOptions: unique([
        input.selectedCultureBorrowing.productBridgeRule,
        ...matchedSymbols.map((symbol) => symbol.bridgeType),
        ...input.selectedCultureBorrowing.symbolBorrowing.productBridge,
      ]).slice(0, 10),
      compatibleIntentModes: ["creative_first", input.intent],
      compatibleCategories: input.selectedCultureBorrowing.applicableCategories,
      guardrails: unique([
        ...input.selectedCultureBorrowing.fusionDirectives,
        ...matchedSymbols.flatMap((symbol) => [
          symbol.symbolizationRule,
          ...symbol.doNotUse.map((item) => `不要使用：${item}`),
        ]),
      ]).slice(0, 16),
      cultureMotifId: input.selectedCultureBorrowing.cultureMotifId,
      visualRenderProfileId: input.selectedCultureBorrowing.visualRenderProfileId,
      shotPrimitiveIds: input.selectedCultureBorrowing.shotPrimitiveIds,
      whySelected: input.selectedCultureBorrowing.whySelected,
    }
  }
  if (input.role !== "culture-fused") return null
  return takeScored(CULTURE_MOTIF_CARDS, (motif) => {
    let score = 0
    if (motif.compatibleIntentModes.includes(input.intent)) score += 5
    if (motif.compatibleCategories.includes(input.productCategory)) score += 4
    if (motif.compatibleCategories.includes("general")) score += 1
    return score
  }, 1, 1)[0] ?? null
}

function selectShotCards(input: {
  eventCandidates: EventPrimitive[]
  bridgeCandidates: ProductBridgeRoleResource[]
  proofCandidates: ProofVisualizationCard[]
  cultureMotif: ConcreteCulturalMotif | null
}) {
  const eventKinds = new Set(input.eventCandidates.map((event) => event.eventKind))
  const bridgeRoles = new Set(input.bridgeCandidates.map((bridge) => bridge.role))
  const proofModes = new Set(input.proofCandidates.flatMap((proof) => proof.bestProofModes))
  return takeScored(SHOT_CARDS, (item) => {
    let score = 0
    if (item.compatibleEventKinds.some((kind) => eventKinds.has(kind))) score += 5
    if (item.compatibleProductRoles.some((role) => bridgeRoles.has(role))) score += 4
    if (item.compatibleProofModes.some((mode) => proofModes.has(mode))) score += 3
    if (input.cultureMotif && item.id.includes("CULTURAL")) score += 4
    if (input.cultureMotif && item.id.includes("RITUAL")) score += 3
    return score
  }, 6, 3)
}

function selectConstraints(role: HookNarrativeRole, hasCulture: boolean) {
  const preferred = CONSTRAINT_RULES.filter((rule) =>
    rule.id !== "CONSTRAINT_CULTURE_ACTION" || hasCulture || role === "culture-fused"
  )
  return preferred.slice(0, 8)
}

function selectFailureWarnings(role: HookNarrativeRole, hasCulture: boolean) {
  const prioritized = FAILURE_MODES.filter((mode) =>
    hasCulture || role === "culture-fused" ? true : mode.id !== "FAIL_STYLE_ONLY_CULTURE"
  )
  return prioritized.slice(0, 3)
}

function collectHookStudioRefs(input: {
  category: string
  hookType: string
}): HookResourceLibraryRefs {
  const playbooks = listHookCategoryPlaybooks({ category: input.category })
  const references = firstNonEmpty([
    () => listHookReferenceAssets({ category: input.category, hookType: input.hookType, size: 2 }).items,
    () => listHookReferenceAssets({ category: input.category, size: 2 }).items,
    () => listHookReferenceAssets({ hookType: input.hookType, size: 2 }).items,
  ])
  const observations = firstNonEmpty([
    () => listHookTrendObservations({ category: input.category, hookType: input.hookType, size: 2 }).items,
    () => listHookTrendObservations({ category: input.category, size: 2 }).items,
    () => listHookTrendObservations({ hookType: input.hookType, size: 2 }).items,
  ])

  return {
    categoryPlaybookIds: playbooks.slice(0, 1).map((item) => item.id),
    referenceAssetIds: references.slice(0, 2).map((item) => item.id),
    trendObservationIds: observations.slice(0, 2).map((item) => item.id),
  }
}

function buildExamples(
  refs: HookResourceLibraryRefs,
  category: string,
  hookType: string,
  intent: HookOneShotIntent,
): GoldHookExample[] {
  const examples: GoldHookExample[] = []
  const fewShotRows = firstNonEmpty([
    () => listHookGenerationFewShots({ category, hookType, intentMode: intent, size: 2 }).items,
    () => listHookGenerationFewShots({ hookType, intentMode: intent, size: 2 }).items,
    () => listHookGenerationFewShots({ hookType, size: 2 }).items,
  ])
  for (const fewShot of fewShotRows.slice(0, 1)) {
    const first3Seconds = Object.entries(fewShot.expectedHookCard.first3Seconds)
      .map(([time, beat]) => `${time}: ${beat}`)
      .join(" / ")
    examples.push({
      id: `example_fs_${fewShot.id}`,
      source: "hook_generation_few_shot",
      summary: [
        `${fewShot.expectedHookCard.hookTitle}: ${fewShot.expectedHookCard.shortScript}`,
        `前三秒结构：${first3Seconds}`,
        `可见证据：${fewShot.expectedHookCard.visualEvidence.join("、")}`,
        `避免：${fewShot.badExampleToAvoid}`,
        fewShot.expectedHookCard.safeGuardrailNote,
      ].filter(Boolean).join("；"),
      hookType,
      category: fewShot.category,
    })
  }
  const referenceRows = listHookReferenceAssets({ category, hookType, size: 2 }).items
    .filter((item) => refs.referenceAssetIds.includes(item.id))
  for (const reference of referenceRows) {
    examples.push({
      id: `example_ref_${reference.id}`,
      source: "hook_reference_asset",
      summary: reference.successNotes || `${reference.referenceRole} reference for ${hookType}`,
      hookType,
      category,
    })
  }
  const observationRows = listHookTrendObservations({ category, hookType, size: 2 }).items
    .filter((item) => refs.trendObservationIds.includes(item.id))
  for (const observation of observationRows) {
    examples.push({
      id: `example_obs_${observation.id}`,
      source: "hook_trend_observation",
      summary: observation.first5sSummary,
      hookType,
      category: observation.observedCategory,
    })
  }
  if (examples.length === 0) {
    examples.push({
      id: "example_p0_generic_action_bridge",
      source: "p0_seed",
      summary: "先给一个可见动作卡点，再让商品作为动作链的一部分进入。",
      hookType,
      category,
    })
  }
  return examples.slice(0, 2)
}

function firstNonEmpty<T>(loaders: Array<() => T[]>) {
  for (const loader of loaders) {
    const rows = loader()
    if (rows.length > 0) return rows
  }
  return []
}

function takeScored<T>(items: T[], scoreItem: (item: T) => number, max: number, min: number) {
  const scored = items
    .map((item, index) => ({ item, index, score: scoreItem(item) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
  const positive = scored.filter((item) => item.score > 0).map((item) => item.item)
  const fallback = scored.map((item) => item.item)
  return uniqueBy([...positive, ...fallback], (item) => JSON.stringify(item)).slice(0, Math.max(min, Math.min(max, positive.length || min)))
}

function unique(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))]
}

function matchesAudienceSituationText(
  item: typeof AUDIENCE_SITUATION_PATTERNS[number],
  audienceText: string,
) {
  const normalizedInput = normalizeText(audienceText)
  if (!normalizedInput) return false
  return [
    item.name,
    item.lifeState,
    ...item.exampleAudienceInputs,
    ...item.recognitionSignals,
    ...item.commonScenes,
  ].some((value) => {
    const normalizedValue = normalizeText(value)
    return normalizedValue.length >= 2 && (
      normalizedInput.includes(normalizedValue) ||
      normalizedValue.includes(normalizedInput) ||
      hasMeaningfulOverlap(normalizedInput, normalizedValue)
    )
  })
}

function matchesSelectedHookSubType(item: AttentionMicroPattern, subType?: string | null) {
  const subTypeTokens = splitResourceTokens(subType)
  if (subTypeTokens.length === 0) return false
  const itemTokens = [
    item.id,
    item.name,
    item.attentionJob,
    item.stopSignalLogic,
    ...item.eventQueryTags,
    ...item.preferredShotFunctions,
    ...item.preferredSoundFunctions,
    ...item.preferredOverlayFunctions,
  ].flatMap(splitResourceTokens)
  return hasResourceTokenOverlap(subTypeTokens, itemTokens)
}

function eventMatchesAttentionQuery(event: EventPrimitive, attention: AttentionMicroPattern) {
  const attentionTokens = [
    ...attention.eventQueryTags,
    ...attention.preferredShotFunctions,
  ].flatMap(splitResourceTokens)
  const eventTokens = [
    event.eventKind,
    event.name,
    event.eventTemplate,
    ...event.shotTags,
  ].flatMap(splitResourceTokens)
  return hasResourceTokenOverlap(attentionTokens, eventTokens)
}

function splitResourceTokens(value?: string | null) {
  return String(value ?? "")
    .toLowerCase()
    .split(/[^a-z0-9\u4e00-\u9fa5]+/g)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3 && !["first", "product", "bridge"].includes(token))
}

function hasResourceTokenOverlap(left: string[], right: string[]) {
  return left.some((leftToken) =>
    right.some((rightToken) => leftToken.includes(rightToken) || rightToken.includes(leftToken))
  )
}

function normalizeText(value: string) {
  return value.replace(/[\s,，。；;:：、/|]+/g, "").toLowerCase()
}

function hasMeaningfulOverlap(left: string, right: string) {
  const ignored = new Set(["的人", "一个", "这个", "场景", "日常", "用户"])
  for (let index = 0; index < right.length - 1; index += 1) {
    const gram = right.slice(index, index + 2)
    if (!ignored.has(gram) && left.includes(gram)) return true
  }
  return false
}

function uniqueBy<T>(items: T[], key: (item: T) => string) {
  const seen = new Set<string>()
  return items.filter((item) => {
    const value = key(item)
    if (seen.has(value)) return false
    seen.add(value)
    return true
  })
}
