import { randomUUID } from "node:crypto"

import {
  getHookPatternCard,
  listHookPatternRecommendationCards,
  type HookRecommendationCard,
  type SelectedCultureBorrowing,
} from "@/lib/hook-library"
import { selectCultureMotifBorrowing } from "@/lib/culture-motif-resources/motif-system"
import type { HookMarketingLogic, HookProductBrief, HookScriptResult } from "@/lib/hook-generator"

export type PostproductionTextOverlayEntry = {
  overlay_id: string
  start_sec: number
  end_sec: number
  applies_to_shot_ids: string[]
  text_lines: string[]
  overlay_intent: string
  persistence_mode: string
  placement_preset: string
  style_preset: string
}

export type HookOneShotIntent = "audience_first" | "pain_first" | "creative_first" | "offer_first"

export type HookOneShotAnalysisHints = {
  productCategory?: string | null
  coreSellingPoints?: string[]
  targetAudience?: string[]
  painPoints?: string[]
  visualFacts?: string[]
  proofPoints?: string[]
}

export type HookNarrativeRole = "intent-direct" | "contrast" | "culture-fused"

export type HookNarrativeDraw = {
  clientVideoId: string
  role: HookNarrativeRole
  selectedHook: HookRecommendationCard
  selectedCultureBorrowing: SelectedCultureBorrowing | null
}

type DrawOptions = {
  random?: () => number
  nonce?: string
  recentCultureTemplateIds?: string[]
}

const INTENT_HOOK_TYPE_TICKETS: Record<HookOneShotIntent, Record<string, number>> = {
  audience_first: {
    H4: 10,
    H6: 7,
    H3: 5,
    H7: 4,
    H5: 3,
    H2: 2,
    H1: 2,
  },
  pain_first: {
    H2: 9,
    H3: 8,
    H5: 7,
    H1: 5,
    H6: 3,
    H7: 3,
    H4: 2,
  },
  offer_first: {
    H5: 9,
    H3: 7,
    H6: 6,
    H1: 4,
    H7: 4,
    H4: 3,
    H2: 2,
  },
  creative_first: {
    H7: 10,
    H3: 8,
    H2: 7,
    H6: 6,
    H1: 5,
    H5: 3,
    H4: 3,
  },
}

const ROLE_TICKET_BONUS: Record<HookNarrativeRole, Record<string, number>> = {
  "intent-direct": {},
  contrast: {
    H1: 3,
    H2: 3,
    H3: 2,
    H6: 2,
  },
  "culture-fused": {
    H7: 6,
    H3: 3,
    H6: 3,
    H2: 2,
  },
}

function safeStringList(values?: string[] | null) {
  return (values ?? []).map((value) => String(value ?? "").trim()).filter(Boolean)
}

function includesAny(source: string, needles: string[]) {
  const normalized = source.toLowerCase()
  return needles.some((needle) => needle && normalized.includes(needle.toLowerCase()))
}

const GENERIC_AUDIENCE_LABELS = [
  "女生",
  "男生",
  "年轻人",
  "上班族",
  "宝妈",
  "妈妈",
  "用户",
  "人群",
  "大家",
]

const SCENE_SIGNAL_PATTERN = /久站|夜班|12\s*小时|9\s*to\s*5|下班|通勤|电梯|地铁|深夜|切换|多窗口|抱娃|出门|租房|桌面|玄关|刷牙|镜前|门口|健身|新手|铲屎|宠物毛|厨房|浴室|办公室|工牌|电脑包/i

function audienceSignalText(values: Array<string | null | undefined>) {
  return values.map((value) => String(value ?? "").trim()).filter(Boolean).join(" ")
}

function hasSpecificAudienceSignal(value: string) {
  const normalized = value.replace(/\s+/g, "")
  if (!normalized) return false
  const stripped = normalized.replace(/^给/, "").replace(/的?(好物|方法|推荐|必备|必买)$/, "")
  if (GENERIC_AUDIENCE_LABELS.includes(stripped)) return false
  return stripped.length >= 4 || /护士|founder|创始人|产后|租房党|铲屎官|护理人员|通勤族|新手|小团队/i.test(stripped)
}

function hasSceneSignal(value: string) {
  return SCENE_SIGNAL_PATTERN.test(value)
}

function isAudienceSceneCallout(card: HookRecommendationCard) {
  return card.subType === "audience_scene_callout"
}

function cardSearchText(card: HookRecommendationCard) {
  return [
    card.patternName,
    card.displayName,
    card.reason,
    card.exampleStructure,
    card.hookTypeLabel,
    card.subTypeLabel,
    card.categoryLabel,
    ...(card.audienceFit ?? []),
    card.productBridgeRule,
  ].filter(Boolean).join(" ")
}

export function hookPatternTicketWeight(input: {
  card: HookRecommendationCard
  intent: HookOneShotIntent
  role: HookNarrativeRole
  productCategory?: string | null
  intentText?: string | null
  targetAudience?: string[]
  usedHookTypes?: Set<string>
  usedSubTypes?: Set<string>
}) {
  const { card, intent, role } = input
  let tickets = 2
  tickets += INTENT_HOOK_TYPE_TICKETS[intent][card.hookType] ?? 1
  tickets += ROLE_TICKET_BONUS[role][card.hookType] ?? 0

  if (card.hookScope === "product_independent") tickets += role === "contrast" ? 3 : 1
  if (input.productCategory && card.categoryId && card.categoryId === input.productCategory) tickets += 2
  if (input.intentText && includesAny(cardSearchText(card), [input.intentText])) tickets += 2
  if (isAudienceSceneCallout(card)) {
    const signalText = audienceSignalText([input.intentText, ...(input.targetAudience ?? [])])
    if (intent !== "audience_first") {
      tickets = Math.max(1, Math.floor(tickets * 0.65))
    } else if (hasSpecificAudienceSignal(signalText) && hasSceneSignal(signalText)) {
      tickets += 12
    } else if (hasSpecificAudienceSignal(signalText)) {
      tickets += 6
    } else {
      tickets = Math.max(1, Math.floor(tickets * 0.7))
    }
  }
  if (input.usedHookTypes?.has(card.hookType)) tickets = Math.max(1, Math.floor(tickets * 0.38))
  if (input.usedSubTypes?.has(card.subType)) tickets = Math.max(1, Math.floor(tickets * 0.55))

  return Math.max(1, Math.min(tickets, 22))
}

function weightedPick<T>(
  items: T[],
  weight: (item: T) => number,
  random: () => number,
) {
  const weighted = items.map((item) => ({ item, weight: Math.max(1, Math.floor(weight(item))) }))
  const total = weighted.reduce((sum, item) => sum + item.weight, 0)
  let cursor = random() * total
  for (const item of weighted) {
    cursor -= item.weight
    if (cursor <= 0) return item.item
  }
  return weighted.at(-1)?.item ?? items[0]
}

function shuffled<T>(items: T[], random: () => number) {
  const output = [...items]
  for (let i = output.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    const tmp = output[i]
    output[i] = output[j]
    output[j] = tmp
  }
  return output
}

function allHookRecommendationCards(productCategory?: string | null) {
  const common = {
    size: 200,
    productCategory: productCategory ?? undefined,
    format: "recommendation",
  }
  return [
    ...listHookPatternRecommendationCards({ ...common, hookScope: "product_related" }).items,
    ...listHookPatternRecommendationCards({ ...common, hookScope: "product_independent" }).items,
  ].filter((card) => Boolean(getHookPatternCard(card.patternCardId)))
}

function drawCultureBorrowing(input: {
  selectedHook: HookRecommendationCard
  productCategory?: string | null
  intent: HookOneShotIntent
  random: () => number
  nonce: string
  recentCultureTemplateIds?: string[]
}) {
  return selectCultureMotifBorrowing({
    productCategory: input.productCategory,
    intent: input.intent,
    hookScope: input.selectedHook.hookScope,
    selectedHook: input.selectedHook,
    durationSeconds: 5,
    nonce: `${input.nonce}:${input.intent}:${input.selectedHook.patternCardId}`,
    recentTemplateIds: input.recentCultureTemplateIds,
    limit: 12,
  }, input.random)
}

export function drawHookNarrativesForIntent(input: {
  intent: HookOneShotIntent
  intentText: string
  productCategory?: string | null
  targetAudience?: string[]
}, options: DrawOptions = {}): HookNarrativeDraw[] {
  const random = options.random ?? Math.random
  const nonce = options.nonce ?? randomUUID()
  const cards = allHookRecommendationCards(input.productCategory)
  if (cards.length < 3) {
    throw new Error("Hook Pattern 候选不足，无法生成三条差异化视频")
  }

  const usedPatternIds = new Set<string>()
  const usedHookTypes = new Set<string>()
  const usedSubTypes = new Set<string>()
  const roles: HookNarrativeRole[] = ["intent-direct", "contrast", "culture-fused"]
  const draws: HookNarrativeDraw[] = []

  for (const role of roles) {
    const available = cards.filter((card) => !usedPatternIds.has(card.patternCardId))
    const diverse = available.filter((card) => !usedHookTypes.has(card.hookType))
    const pool = diverse.length >= roles.length - draws.length ? diverse : available
    const selectedHook = weightedPick(
      pool,
      (card) => hookPatternTicketWeight({
        card,
        intent: input.intent,
        role,
        productCategory: input.productCategory,
        intentText: input.intentText,
        targetAudience: input.targetAudience,
        usedHookTypes,
        usedSubTypes,
      }),
      random,
    )
    if (!selectedHook) throw new Error("Hook Pattern 抽取失败")
    usedPatternIds.add(selectedHook.patternCardId)
    usedHookTypes.add(selectedHook.hookType)
    usedSubTypes.add(selectedHook.subType)
    draws.push({
      clientVideoId: `hook-card-${randomUUID()}`,
      role,
      selectedHook,
      selectedCultureBorrowing: role === "culture-fused"
        ? drawCultureBorrowing({
            selectedHook,
            productCategory: input.productCategory,
            intent: input.intent,
            random,
            nonce,
            recentCultureTemplateIds: options.recentCultureTemplateIds,
          })
        : null,
    })
  }

  return shuffled(draws, random)
}

export function buildOneShotProductBrief(input: {
  productTitle: string
  productImage: string
  intent: HookOneShotIntent
  intentText: string
  analysisHints?: HookOneShotAnalysisHints
}): HookProductBrief {
  const hints = input.analysisHints ?? {}
  const coreSellingPoints = safeStringList(hints.coreSellingPoints)
  const targetAudience = safeStringList(hints.targetAudience)
  const painPoints = safeStringList(hints.painPoints)
  const visualFacts = safeStringList(hints.visualFacts)
  const proofPoints = safeStringList(hints.proofPoints)
  const intentText = input.intentText.trim()
  const marketingLogic: HookMarketingLogic = {
    coreSellingPoints: input.intent === "offer_first"
      ? [intentText, ...coreSellingPoints].filter(Boolean)
      : coreSellingPoints,
    targetAudience: input.intent === "audience_first"
      ? [intentText, ...targetAudience].filter(Boolean)
      : targetAudience,
    painPoints: input.intent === "pain_first"
      ? [intentText, ...painPoints].filter(Boolean)
      : painPoints,
    desiredOutcome: input.intent === "offer_first" ? intentText : undefined,
    differentiator: input.intent === "offer_first" ? intentText : undefined,
    usageContext: input.intent === "creative_first" ? intentText : undefined,
    brandTone: input.intent === "creative_first" ? "剧情创意钩子" : undefined,
    proofPoints: input.intent === "offer_first"
      ? [intentText, ...proofPoints, ...coreSellingPoints, ...visualFacts].filter(Boolean)
      : [...proofPoints, ...coreSellingPoints, ...visualFacts].filter(Boolean),
    forbiddenClaims: [],
  }

  return {
    productName: input.productTitle.trim(),
    productCategory: hints.productCategory?.trim() || null,
    productImage: input.productImage,
    productImages: [input.productImage],
    marketingLogic,
  }
}

function shortOverlayLine(value: string) {
  return value
    .replace(/\s+/g, " ")
    .replace(/[。；;,.，]+$/g, "")
    .trim()
    .slice(0, 32)
}

function uniqueOverlayLines(script: HookScriptResult, fallback: string) {
  const seen = new Set<string>()
  const candidates = [
    ...script.textOverlay,
    ...script.shotTiming.map((shot) => shot.textOverlay ?? ""),
    script.hookSummary,
    fallback,
  ]
  const output: string[] = []
  for (const raw of candidates) {
    const line = shortOverlayLine(raw)
    if (!line || seen.has(line)) continue
    seen.add(line)
    output.push(line)
    if (output.length >= 3) break
  }
  return output.length ? output : [shortOverlayLine(fallback || "先看这里")]
}

export function buildOneShotOverlayTimeline(input: {
  script: HookScriptResult
  durationSeconds: number
  fallbackText: string
}): PostproductionTextOverlayEntry[] {
  const lines = uniqueOverlayLines(input.script, input.fallbackText)
  const duration = Math.max(4, input.durationSeconds)
  const windows = [
    [0.25, Math.min(1.55, duration - 2.8)],
    [1.75, Math.min(3.05, duration - 1.35)],
    [Math.max(3.25, duration - 1.35), Math.max(3.8, duration - 0.25)],
  ]

  return lines.slice(0, 3).map((line, index) => ({
    overlay_id: `hook_overlay_${index + 1}`,
    start_sec: Number(windows[index][0].toFixed(2)),
    end_sec: Number(Math.max(windows[index][1], windows[index][0] + 0.5).toFixed(2)),
    applies_to_shot_ids: [`shot_${index + 1}`],
    text_lines: [line],
    overlay_intent: index === 0 ? "hook" : index === 1 ? "benefit" : "scenario_bridge",
    persistence_mode: index === 0 ? "flash" : "hold",
    placement_preset: index === 0 ? "center_safe" : "lower_safe",
    style_preset: index === 2 ? "spec_badge" : "ugc_light",
  }))
}
