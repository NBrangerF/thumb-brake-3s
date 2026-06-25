import type { LlmConfig } from "@/lib/llm-config"
import { callLlm } from "@/lib/llm-client"
import type { UserIntentExpansion } from "@/lib/hook-generator-v2/intent-expansion/user-intent-expansion"
import {
  type CultureSymbolBorrowingPackage,
  type SelectedCultureBorrowing,
  getHookAttentionProfile,
  getHookMoodDefinitions,
  getHookPatternCard,
  type HookPatternCard,
  type HookRecommendationCard,
} from "@/lib/hook-library"

export type HookMarketingLogic = {
  coreSellingPoints: string[]
  targetAudience: string[]
  painPoints: string[]
  usageContext?: string
  desiredOutcome?: string
  differentiator?: string
  proofPoints: string[]
  brandTone?: string
  forbiddenClaims: string[]
}

export type HookProductBrief = {
  productId?: string | null
  productName: string
  productCategory?: string | null
  productImage?: string | null
  productImages?: string[]
  marketingLogic: HookMarketingLogic
}

export type HookScriptTiming = {
  timeRange: string
  visual: string
  script?: string
  textOverlay?: string
}

export type HookGenerationRecommendation = {
  preferredPath: "direct_video" | "first_frame" | "reference_video"
  reason: string
  availablePaths: Array<"direct_video" | "first_frame" | "reference_video">
}

export type HookScriptResult = {
  hookSummary: string
  visualDescription: string
  visualStyle: string
  script: string
  soundDesign: string
  textOverlay: string[]
  shotTiming: HookScriptTiming[]
  productBridge: string
  videoPrompt: string
  firstFramePrompt: string
  generationRecommendation: HookGenerationRecommendation
}

export type JsonPrimitive = string | number | boolean | null
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue }

export type HookScriptUserIntent = "audience_first" | "pain_first" | "creative_first" | "offer_first"

type HookScriptBuildInput = {
  product: HookProductBrief
  selectedHook: HookRecommendationCard | { patternCardId: string }
  selectedCultureBorrowing?: SelectedCultureBorrowing | null
  includeVoiceover?: boolean
  durationSeconds: number
  intent?: HookScriptUserIntent
  intentText?: string
  userIntentExpansion?: UserIntentExpansion | null
}

type ProductIdentityHints = {
  productName: string
  productCategory: string
  concreteProductTypeCn: string
  concreteProductTypeEn: string
  visualIdentity: string
  sceneSignals: string[]
  forbiddenSubstitutions: string[]
  coreSellingPoints: string[]
  painPoints: string[]
}

const PRODUCT_IDENTITY_RULES: Array<{
  terms: string[]
  concreteProductTypeCn: string
  concreteProductTypeEn: string
  visualIdentity: string
  sceneSignals: string[]
  forbiddenSubstitutions: string[]
}> = [
  {
    terms: ["牙膏", "牙渍", "牙齿", "口气", "口腔", "美白牙", "刷牙"],
    concreteProductTypeCn: "牙膏",
    concreteProductTypeEn: "toothpaste tube",
    visualIdentity: "牙膏软管包装、可见管盖、口腔护理包装版式，可搭配牙刷、挤出的膏体、牙齿或浴室镜前刷牙场景",
    sceneSignals: ["牙齿色差", "牙渍", "牙刷", "浴室镜", "口腔护理"],
    forbiddenSubstitutions: ["精华液瓶", "护肤滴管", "面霜罐", "香水瓶", "普通化妆品瓶"],
  },
  {
    terms: ["拖把", "拖布", "清洁", "污渍", "水渍", "地面"],
    concreteProductTypeCn: "清洁工具",
    concreteProductTypeEn: "cleaning tool",
    visualIdentity: "清洁工具本体、拖布或刷头结构、地面污渍/水渍对比和真实家居清洁场景",
    sceneSignals: ["地面污渍", "水渍", "拖布", "厨房或客厅地面"],
    forbiddenSubstitutions: ["护肤品", "食品包装", "电子设备"],
  },
  {
    terms: ["定型", "啫喱", "发蜡", "发泥", "头发", "造型"],
    concreteProductTypeCn: "男士发型产品",
    concreteProductTypeEn: "men's hair styling product",
    visualIdentity: "发型产品包装、手指蘸取膏体或整理头发动作、镜前快速造型场景",
    sceneSignals: ["凌乱头发", "镜前造型", "发型前后对比"],
    forbiddenSubstitutions: ["护肤精华", "牙膏", "清洁工具"],
  },
]

function safeJsonParse(value?: string | null): unknown {
  if (!value) return null
  try {
    return JSON.parse(value) as unknown
  } catch {
    return value
  }
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.map((item) => String(item ?? "").trim()).filter(Boolean)
}

function firstNonEmpty(...values: Array<string | null | undefined>) {
  return values.find((value) => typeof value === "string" && value.trim())?.trim() ?? ""
}

function compactLines(lines: Array<string | null | undefined>) {
  return lines.map((line) => line?.trim()).filter((line): line is string => Boolean(line))
}

function normalizedProductSource(product: HookProductBrief) {
  return [
    product.productName,
    product.productCategory,
    ...product.marketingLogic.coreSellingPoints,
    ...product.marketingLogic.painPoints,
    ...product.marketingLogic.targetAudience,
  ].filter(Boolean).join(" ").toLowerCase()
}

function includesAnyTerm(source: string, terms: string[]) {
  return terms.some((term) => source.includes(term.toLowerCase()))
}

export function deriveHookProductIdentity(product: HookProductBrief): ProductIdentityHints {
  const source = normalizedProductSource(product)
  const matchedRule = PRODUCT_IDENTITY_RULES.find((rule) => includesAnyTerm(source, rule.terms))
  const concreteProductTypeCn = matchedRule?.concreteProductTypeCn
    ?? product.productCategory
    ?? product.productName
  const concreteProductTypeEn = matchedRule?.concreteProductTypeEn
    ?? "the exact ecommerce product shown in the product image"

  return {
    productName: product.productName,
    productCategory: product.productCategory ?? "",
    concreteProductTypeCn,
    concreteProductTypeEn,
    visualIdentity: matchedRule?.visualIdentity
      ?? `必须保留${product.productName}的真实商品形态、包装比例、标签布局和核心使用场景`,
    sceneSignals: matchedRule?.sceneSignals ?? product.marketingLogic.painPoints.slice(0, 3),
    forbiddenSubstitutions: matchedRule?.forbiddenSubstitutions ?? ["无关品类商品", "泛化替代包装", "看不出品类的普通瓶罐"],
    coreSellingPoints: product.marketingLogic.coreSellingPoints,
    painPoints: product.marketingLogic.painPoints,
  }
}

export function buildProductIdentityLockText(product: HookProductBrief) {
  const identity = deriveHookProductIdentity(product)
  return [
    `Product identity lock: the concrete product is ${identity.productName}, a ${identity.concreteProductTypeEn}.`,
    `The uploaded product image is an identity reference, not a requirement that the product must appear in the hook. If the product appears, do not replace it with a broad category item; it must visibly read as: ${identity.visualIdentity}.`,
    identity.coreSellingPoints.length > 0 ? `Core selling points: ${identity.coreSellingPoints.join(", ")}.` : null,
    identity.painPoints.length > 0 ? `User pain points: ${identity.painPoints.join(", ")}.` : null,
    identity.sceneSignals.length > 0 ? `Required scene signals: ${identity.sceneSignals.join(", ")}.` : null,
    identity.forbiddenSubstitutions.length > 0 ? `Forbidden substitutions: ${identity.forbiddenSubstitutions.join(", ")}.` : null,
  ].filter(Boolean).join(" ")
}

export function buildProductIdentityLockTextZh(product: HookProductBrief) {
  const identity = deriveHookProductIdentity(product)
  return compactLines([
    `具体商品：${identity.productName}，必须被理解为${identity.concreteProductTypeCn}，但商品不一定要出现在本 hook 当中。`,
    `商品主图只做身份参考；如果商品入镜，视觉身份必须保留：${identity.visualIdentity}。`,
    identity.coreSellingPoints.length > 0 ? `可用卖点线索：${identity.coreSellingPoints.join("、")}。` : null,
    identity.painPoints.length > 0 ? `可用痛点线索：${identity.painPoints.join("、")}。` : null,
    identity.sceneSignals.length > 0 ? `必要场景信号：${identity.sceneSignals.join("、")}。` : null,
    identity.forbiddenSubstitutions.length > 0 ? `禁止替换成：${identity.forbiddenSubstitutions.join("、")}。` : null,
  ]).join(" ")
}

function hookScopeOf(selectedHook?: Partial<HookRecommendationCard> | null, pattern?: HookPatternCard | null) {
  return selectedHook?.hookScope ?? pattern?.hookScope ?? (selectedHook?.scopeLabel === "强刺激钩子" ? "product_independent" : "product_related")
}

function defaultVisualStyle(input: {
  selectedHook?: Partial<HookRecommendationCard> | null
  pattern?: HookPatternCard | null
}) {
  const isPureHook = hookScopeOf(input.selectedHook, input.pattern) === "product_independent"
  return isPureHook
    ? "写实手机 UGC，强视觉冲突，近距离手持镜头，真实生活光线，画面像突然拍到的反常瞬间"
    : "写实手机 UGC，竖屏 9:16，自然室内光，轻微手持感，商品包装可读，避免棚拍广告感"
}

function cultureVisualStyleLine(culture?: SelectedCultureBorrowing | null) {
  if (!culture) return ""
  const symbolStyleSlots = uniqueShort([
    ...(culture.symbolBorrowing?.style ?? []),
    ...(culture.symbolBorrowing?.visual ?? []),
    ...(culture.matchedSymbolEntries?.flatMap((symbol) => [
      ...symbol.styleSlots.slice(0, 2),
      ...symbol.visualSlots.slice(0, 2),
    ]) ?? []),
  ], 8)
  return compactLines([
    `${culture.nameCn}`,
    culture.cultureMechanism.length ? culture.cultureMechanism.join("、") : null,
    symbolStyleSlots.length ? symbolStyleSlots.join("、") : null,
  ]).join("；")
}

export function applyCultureToVisualStyle(baseStyle: string, culture?: SelectedCultureBorrowing | null) {
  const base = baseStyle.trim()
  const cultureStyle = cultureVisualStyleLine(culture)
  if (!cultureStyle) return base
  if (base.includes(culture?.nameCn ?? "") || base.includes("文化借势")) return base
  return `${base}；文化借势画面风格：${cultureStyle}`
}

function defaultSoundDesign(input: {
  selectedHook?: Partial<HookRecommendationCard> | null
  pattern?: HookPatternCard | null
}) {
  const isPureHook = hookScopeOf(input.selectedHook, input.pattern) === "product_independent"
  return isPureHook
    ? "开头 0-0.4 秒使用短促停顿音或环境突变声，随后保留真实环境底噪，结尾不给完整广告口播"
    : "真实环境底噪为主，开头用轻微停顿音抓注意力，口播短促清楚，不使用夸张广告配乐"
}

function voiceoverDisabledSoundDesign(soundDesign: string) {
  const base = soundDesign.trim() || "真实环境底噪、短促停顿音、镜头切换声、拟音细节。"
  if (base.includes("不要人声口播")) return base
  return `${base} 全片不要人声口播、不要旁白、不要角色说话，只保留环境声、拟音和音效节奏。`
}

function hookIntentLabel(intent?: HookScriptUserIntent) {
  if (intent === "pain_first") return "痛点优先"
  if (intent === "audience_first") return "人群优先"
  if (intent === "creative_first") return "剧情创意"
  if (intent === "offer_first") return "优惠优先"
  return "钩子模式"
}

function normalizedHookIntentText(input: Pick<HookScriptBuildInput, "intent" | "intentText" | "product">) {
  const direct = input.intentText?.trim()
  if (direct) return direct
  const logic = input.product.marketingLogic
  if (input.intent === "creative_first" && logic.usageContext?.trim()) return logic.usageContext.trim()
  if (input.intent === "pain_first" && logic.painPoints[0]) return logic.painPoints[0]
  if (input.intent === "audience_first" && logic.targetAudience[0]) return logic.targetAudience[0]
  if (input.intent === "offer_first" && logic.desiredOutcome?.trim()) return logic.desiredOutcome.trim()
  return ""
}

function hookUserInputContract(input: Pick<HookScriptBuildInput, "intent" | "intentText" | "product">) {
  const text = normalizedHookIntentText(input)
  if (!text) return null
  return `钩子模式：${hookIntentLabel(input.intent)}；用户补充输入：${text}。必须把这条输入落实到开场动作、人物动机、冲突来源或后续承接线索里，不能只复制成一句文案。`
}

function hookUserIntentExpansionContract(expansion?: UserIntentExpansion | null) {
  if (!expansion) return null
  const concepts = expansion.concepts.slice(0, 4).map((concept) => {
    const evidence = [
      concept.relationToEvent,
      ...safeArray(concept.observableEvidence).slice(0, 2),
      ...safeArray(concept.actionPrimitives).slice(0, 1),
    ].filter(Boolean).join("、")
    return `${concept.text}/${concept.semanticRole}${evidence ? `=${evidence}` : ""}`
  })
  return compactLines([
    `用户输入语义拆解：${expansion.frame.summary}`,
    concepts.length ? `概念关系：${concepts.join("；")}。` : null,
    expansion.hookSignals.openingAction ? `开场动作：${expansion.hookSignals.openingAction}。` : null,
    expansion.hookSignals.conflictSource ? `冲突来源：${expansion.hookSignals.conflictSource}。` : null,
    expansion.hookSignals.painEvidence.length ? `可拍证据：${expansion.hookSignals.painEvidence.slice(0, 4).join("、")}。` : null,
    expansion.hookSignals.openLoop ? `开环线索：${expansion.hookSignals.openLoop}。` : null,
    `商品露出策略：${expansion.productExposurePolicy.requiredInHook ? "商品可以自然出现在本 hook 中" : "商品不强制出现在本 hook 中"}；${expansion.productExposurePolicy.saferBridge}。`,
  ]).join(" ")
}

function safeArray<T>(value: T[] | undefined | null) {
  return Array.isArray(value) ? value : []
}

function applyHookUserInputToShotTiming(
  shots: HookScriptTiming[],
  input: Pick<HookScriptBuildInput, "intent" | "intentText" | "product">,
) {
  const contract = hookUserInputContract(input)
  if (!contract) return shots
  return shots.map((shot, index) => {
    if (index === 0) {
      return {
        ...shot,
        visual: `${shot.visual} ${contract}`,
      }
    }
    if (index === shots.length - 1) {
      return {
        ...shot,
        visual: `${shot.visual} 结尾回收到用户补充输入对应的真实判断，不偏离商品分析。`,
      }
    }
    return shot
  })
}

function applyVoiceoverPreference(script: HookScriptResult, includeVoiceover: boolean): HookScriptResult {
  if (includeVoiceover) return script
  return {
    ...script,
    script: "",
    soundDesign: voiceoverDisabledSoundDesign(script.soundDesign),
    shotTiming: script.shotTiming.map((shot) => ({ ...shot, script: undefined })),
  }
}

type HookCultureFusionBlueprint = {
  fusionThesis: string
  fusionMode: string
  hookJob: string
  cultureRole: string
  visualContract: string
  temporalContract: string
  cameraContract: string
  stopSignal: string
  escalationSignal: string
  productBridgeSignal: string
  soundSignal: string
  verbalSignal: string
  firstFrameSignal: string
  timelineRules: string[]
  symbolPackage: CultureSymbolBorrowingPackage
}

function symbolList(
  culture: SelectedCultureBorrowing | null | undefined,
  key: keyof CultureSymbolBorrowingPackage,
  fallback: string[] = [],
) {
  const values = culture?.symbolBorrowing?.[key] ?? []
  return values.length ? values : fallback
}

function firstSymbol(
  culture: SelectedCultureBorrowing | null | undefined,
  key: keyof CultureSymbolBorrowingPackage,
  fallback = "",
) {
  return symbolList(culture, key, fallback ? [fallback] : [])[0] ?? fallback
}

function shortText(value: string | null | undefined, max = 90) {
  const normalized = String(value ?? "").replace(/\s+/g, " ").trim()
  if (normalized.length <= max) return normalized
  return `${normalized.slice(0, max - 1)}…`
}

function stripTerminalPunctuation(value: string) {
  return value.replace(/[。；;,.，]+$/g, "")
}

function stripLeadingTimeLabel(value: string) {
  return value.replace(/^\s*(?:\d+(?:\.\d+)?(?:-\d+(?:\.\d+)?)?\s*秒|0-\d+\s*秒|[0-9.]+-[0-9.]+\s*秒)[：:]\s*/, "").trim()
}

function uniqueShort(values: Array<string | null | undefined>, limit = 3) {
  const seen = new Set<string>()
  const output: string[] = []
  for (const raw of values) {
    const value = shortText(raw, 32)
    if (!value || seen.has(value)) continue
    seen.add(value)
    output.push(value)
    if (output.length >= limit) break
  }
  return output
}

function hasProductReferenceImage(product: HookProductBrief) {
  return Boolean(product.productImage || product.productImages?.some(Boolean))
}

function hookAttentionJob(selectedHook?: Partial<HookRecommendationCard> | null, pattern?: HookPatternCard | null) {
  const hookType = selectedHook?.hookType || pattern?.hookType
  const profile = getHookAttentionProfile(hookType)
  if (profile) return profile.attentionObjective
  return selectedHook?.subTypeLabel || selectedHook?.hookTypeLabel || pattern?.oneSentenceLogic || "制造一个强停滑事件"
}

function hookTypeOf(selectedHook?: Partial<HookRecommendationCard> | null, pattern?: HookPatternCard | null) {
  return selectedHook?.hookType || pattern?.hookType || ""
}

function hookAttentionProfileFor(selectedHook?: Partial<HookRecommendationCard> | null, pattern?: HookPatternCard | null) {
  return getHookAttentionProfile(hookTypeOf(selectedHook, pattern))
}

function hookCultureFusionStrategy(hookType: string, isPureHook: boolean) {
  switch (hookType) {
    case "H1":
      return {
        fusionMode: "感官断点 × 文化符号可感化",
        hookVerb: "打断感官预期",
        cultureUse: "把文化符号变成颜色、材质、声音或动作异常，而不是装饰背景",
        temporal: "0-1 秒先给异常感官，1-2 秒让观众寻找原因，随后商品可以作为异常来源/答案，也可以留到 hook 之后",
        camera: "微距或冲镜近景，单一推近，不同时摇移",
        productRole: isPureHook ? "结尾反差答案" : "异常来源",
      }
    case "H2":
      return {
        fusionMode: "冲突关系 × 文化场面调度",
        hookVerb: "把冲突卡在失控前一秒",
        cultureUse: "用文化里的审判、对峙、群像或仪式关系放大冲突",
        temporal: "0-1 秒定格冲突，1-2.5 秒放大误会或压力，商品可以作为冲突答案、证据或救场线索，也可以不在本段出现",
        camera: "固定机位或低角度压迫，只保留一种主要运镜",
        productRole: isPureHook ? "最后一秒反差回收" : "冲突证据",
      }
    case "H3":
      return {
        fusionMode: "悬念缺口 × 文化任务线索",
        hookVerb: "只露出答案的一半",
        cultureUse: "用文化里的门、卷轴、图鉴、任务卡或线索台面制造未完成感",
        temporal: "0-1 秒遮住关键结果，1-2.5 秒只补一条线索，商品晚一点作为揭晓物",
        camera: "门缝、遮挡或慢推，镜头不要同时变焦和横移",
        productRole: isPureHook ? "最后揭晓物" : "关键线索",
      }
    case "H4":
      return {
        fusionMode: "身份共鸣 × 文化角色借位",
        hookVerb: "让观众立刻认出这是自己",
        cultureUse: "用文化里的学生、打工人、家人、高手新手等关系替观众站位",
        temporal: "0-1 秒拍熟悉错误动作，1-2 秒放大尴尬，商品可作为自我校准道具进入，也可后置",
        camera: "真实手机视角，贴近日常动作，避免过度舞台化",
        productRole: "身份校准道具",
      }
    case "H5":
      return {
        fusionMode: "证据先行 × 文化验证仪式",
        hookVerb: "先摆证据再解释",
        cultureUse: "用公堂、侦探、实验、战报或图鉴等验证语法让证据更有重量",
        temporal: "0-1 秒证据特写，1-2 秒观众判断真假，商品可作为证据来源/验证路径，也可后置",
        camera: "证据桌面近景或中心构图，单一推近",
        productRole: "证据来源",
      }
    case "H6":
      return {
        fusionMode: "社交围观 × 文化群像反应",
        hookVerb: "制造被点名或被围观感",
        cultureUse: "用群体转头、评论分裂、转身选择或全场静音让观众想站队",
        temporal: "0-1 秒先给群体反应，1-2.5 秒放大为什么大家都看，商品可以作为争议原因",
        camera: "先拍反应再拍对象，避免解释性旁白过多",
        productRole: isPureHook ? "争议答案" : "被围观对象",
      }
    case "H7":
      return {
        fusionMode: "文化识别 × 类型片冷开场",
        hookVerb: "触发熟悉但不一样的识别快感",
        cultureUse: "直接使用符号化场景、声音和动作语法，但不复刻具体 IP",
        temporal: "0-1 秒文化识别，1-2.5 秒错位升级，商品可作为道具、证据或任务物进入，也可留到下一段",
        camera: "按所选文化类型保持一种清晰镜头语法",
        productRole: "错位道具",
      }
    default:
      return {
        fusionMode: "注意力任务 × 文化符号动作链",
        hookVerb: "制造一个必须停住看的动作",
        cultureUse: "把文化符号落到看得见的物、动作、声音和关系里",
        temporal: "先 attention，再悬念升级，商品可以作为答案或线索出现，也可以留到 hook 之后",
        camera: "每个时间片只使用一种主要运镜",
        productRole: isPureHook ? "结尾回收" : "答案线索",
      }
  }
}

function hookSpecificPlan(input: {
  hookMechanism: string
  profile: ReturnType<typeof getHookAttentionProfile>
  product: HookProductBrief
  identity: ProductIdentityHints
  corePoint: string
  painPoint: string
  audience: string
  duration: number
  isPureHook: boolean
}) {
  const { hookMechanism, profile, product, identity, corePoint, painPoint, audience, duration, isPureHook } = input
  const productLateWindow = `${Math.max(2.5, duration - 1)}-${duration} 秒`
  const type = profile?.hookType

  if (type === "H1") {
    return {
      opening: `0-1 秒：用「${hookMechanism}」做感官打断，画面只给一个强刺激焦点，例如色块/材质/声音/冻结感突然异常，先不解释商品。`,
      escalation: `1-2 秒：继续放大这种感官异常，让观众判断「哪里不对」，不要进入卖点说明。`,
      bridge: `2-${Math.min(3.5, duration)} 秒：如果出现${product.productName}这支${identity.concreteProductTypeCn}，只作为异常来源或答案短暂出现；如果不出现，继续保留异常线索。`,
      scriptLine: `先别解释，先看这个反常点。`,
      overlay: "哪里不对",
    }
  }

  if (type === "H2") {
    return {
      opening: `0-1 秒：用「${hookMechanism}」制造人和人/人和物之间的冲突瞬间，表情、视线或手部动作停在快要失控前。`,
      escalation: `1-2.5 秒：冲突继续升温，观众只知道现场不对劲，还不知道原因。`,
      bridge: `${isPureHook ? productLateWindow : "2.5-4 秒"}：可以只停在冲突原因/反差答案/救场线索的开环；如果出现${product.productName}，必须避免让观众误解它是问题来源。`,
      scriptLine: `等一下，刚刚那一下是谁的问题？`,
      overlay: "刚刚发生了什么",
    }
  }

  if (type === "H3") {
    return {
      opening: `0-1 秒：用「${hookMechanism}」只露出答案的一半，动作卡在临界点或结果被遮住，商品不要急着出现。`,
      escalation: `1-2.5 秒：给一个线索但继续延迟答案，让观众想等揭晓。`,
      bridge: `${productLateWindow}：隐藏答案或最后线索出现；${product.productName}可以后置，不必在 hook 内清晰露出。`,
      scriptLine: `答案先别急着看完，你以为的不是重点。`,
      overlay: "答案还没露出来",
    }
  }

  if (type === "H4") {
    return {
      opening: `0-1 秒：直接拍出${audience}熟悉的日常动作或错误习惯，让用户觉得「这就是我」。`,
      escalation: `1-2 秒：把「${painPoint}」变成身份相关的小尴尬或重复误区，不要泛泛说品类。`,
      bridge: `2-3.5 秒：自我校准线索进入镜头；如果${product.productName}入镜，只做自然线索，不做正面 packshot。`,
      scriptLine: `如果你也经常这样，先停一下。`,
      overlay: "这类人先停一下",
    }
  }

  if (type === "H5") {
    return {
      opening: `0-1 秒：先上证据，不上过程；用近景结果、局部对比或可验证痕迹停滑。`,
      escalation: `1-2 秒：镜头只揭示证据来自「${painPoint}」这个问题，仍不完整解释。`,
      bridge: `2-3 秒：证据来源或验证路径继续推进；${product.productName}可以作为线索，也可以留到后续解决方案转折。`,
      scriptLine: `先看证据，过程等一下再说。`,
      overlay: "证据先放这",
    }
  }

  if (type === "H6") {
    return {
      opening: `0-1 秒：先给直视镜头、旁人回头、围观或评论分裂的社交信号，让观众有被点名感。`,
      escalation: `1-2.5 秒：放大「大家为什么都在看」的疑问，制造站队或确认欲。`,
      bridge: `${isPureHook ? productLateWindow : "2.5-4 秒"}：继续放大被围观对象、争议原因或反应触发器；如果${product.productName}出现，必须像答案线索而不是问题来源。`,
      scriptLine: `评论区先别吵，你们看到了吗？`,
      overlay: "大家都在看这里",
    }
  }

  if (type === "H7") {
    return {
      opening: `0-1 秒：用熟悉的类型片、年代感、平台梗或符号化文化语法触发识别，但不复制具体 IP。`,
      escalation: `1-2.5 秒：让这种文化语法里的动作、声音或关系继续推动悬念。`,
      bridge: `2.5-${duration} 秒：道具、证据、任务物或错位对象进入；${product.productName}可作为后置线索，不强制露出。`,
      scriptLine: `这个开场你肯定见过，但答案不一样。`,
      overlay: "熟悉但不一样",
    }
  }

  return {
    opening: `0-1 秒：用「${hookMechanism}」制造强停滑，画面要像${audience}真实遇到的瞬间。`,
    escalation: `1-2 秒：把「${painPoint}」拍成一眼能懂的具体细节。`,
    bridge: `2-3.5 秒：用一个具体线索承接「${corePoint}」；如果${product.productName}进入镜头，只做自然答案或证据。`,
    scriptLine: `先别划走，这个细节很多人第一眼就中。`,
    overlay: painPoint,
  }
}

export function buildHookCultureFusionBlueprint(input: {
  product: HookProductBrief
  selectedHook?: Partial<HookRecommendationCard> | null
  pattern?: HookPatternCard | null
  selectedCultureBorrowing?: SelectedCultureBorrowing | null
  durationSeconds: number
}): HookCultureFusionBlueprint | null {
  const culture = input.selectedCultureBorrowing
  if (!culture) return null
  const identity = deriveHookProductIdentity(input.product)
  const hookLabel = input.selectedHook?.displayName || input.pattern?.patternName || "短视频钩子"
  const hookMechanism = input.selectedHook?.subTypeLabel || input.selectedHook?.hookTypeLabel || "注意力钩子"
  const hookJob = hookAttentionJob(input.selectedHook, input.pattern)
  const isPureHook = hookScopeOf(input.selectedHook, input.pattern) === "product_independent"
  const strategy = hookCultureFusionStrategy(hookTypeOf(input.selectedHook, input.pattern), isPureHook)
  const visualSymbol = firstSymbol(culture, "visual", culture.openingCapture)
  const visualSymbols = uniqueShort(symbolList(culture, "visual", [culture.openingCapture]), 4).join("、")
  const styleSymbol = firstSymbol(culture, "style", culture.cultureMechanism[0] || culture.nameCn)
  const styleSymbols = uniqueShort(symbolList(culture, "style", [culture.cultureMechanism[0] || culture.nameCn]), 3).join("、")
  const motionSymbol = firstSymbol(culture, "motion", "一个动作停在半空")
  const motionSymbols = uniqueShort(symbolList(culture, "motion", ["一个动作停在半空"]), 3).join("、")
  const audioSymbol = firstSymbol(culture, "audio", culture.audioFormulaCn || "短促停顿音")
  const verbalSymbol = firstSymbol(culture, "verbal", culture.verbalFormulaCn || "一句短促提示")
  const narrativeSymbol = firstSymbol(culture, "narrative", culture.cultureMechanism[0] || "悬念升级")
  const bridgeSymbol = firstSymbol(culture, "productBridge", culture.productBridgeRule)
  const firstFrameSymbol = firstSymbol(culture, "firstFrame", culture.firstFrameFormula)
  const productTiming = isPureHook
    ? `${Math.max(2.5, input.durationSeconds - 1)}-${input.durationSeconds} 秒可短暂露出、反差回收或继续开环`
    : "2-3.5 秒建立后续关系线索，商品可出现也可后置"

  return {
    fusionThesis: `「${hookLabel}」负责${strategy.hookVerb}，「${culture.nameCn}」负责把这个停滑任务落成${visualSymbol}、${motionSymbol}、${audioSymbol}这些可感知符号；商品只在需要时承担${strategy.productRole}，不能牺牲停滑。`,
    fusionMode: strategy.fusionMode,
    hookJob,
    cultureRole: `${strategy.cultureUse}。优先调用「${visualSymbol}」「${motionSymbol}」「${styleSymbol}」「${audioSymbol}」，让${hookMechanism}变成观众能看见和听见的事件。`,
    visualContract: `文化视觉锚点必须出现：${visualSymbols}；动作锚点=${motionSymbols}；风格/光线=${styleSymbols}；商品主图只做身份参考，如果商品入镜才需要保留=${identity.visualIdentity}。不能只写成泛化的舞台、讲台或背景。`,
    temporalContract: strategy.temporal,
    cameraContract: strategy.camera,
    stopSignal: `0-1 秒：${strategy.hookVerb}，把「${hookMechanism}」拍成「${visualSymbol} + ${motionSymbol}」，用「${audioSymbol}」做半秒注意力断点。`,
    escalationSignal: `1-2.5 秒：继续执行「${narrativeSymbol}」，配合「${verbalSymbol}」制造误判、缺口或围观压力，不提前解释卖点。`,
    productBridgeSignal: `${productTiming}：用「${bridgeSymbol}」把文化符号回收到下一步线索；如果${input.product.productName}这支${identity.concreteProductTypeCn}出现，要像${strategy.productRole}一样自然进入，而不是硬塞进画面。`,
    soundSignal: audioSymbol,
    verbalSignal: verbalSymbol,
    firstFrameSignal: `首帧必须同时看到「${visualSymbol}」和「${motionSymbol}」的冲突瞬间，并保留「${styleSymbol}」的光影/材质；${firstFrameSymbol}`,
    timelineRules: [
      `0-1 秒：${hookJob}；文化符号必须可见或可听，不只写在风格里。${strategy.hookVerb}。`,
      `1-2.5 秒：${narrativeSymbol}负责升级停留，观众应该想知道下一秒发生什么。`,
      `${productTiming}：${bridgeSymbol}；商品不强制露出，如果露出，商品身份必须读得出${identity.visualIdentity}。`,
      `运镜：${strategy.camera}。`,
      "全片只做 hook，结尾保留继续观看欲望，不写完整转化收口。",
    ],
    symbolPackage: culture.symbolBorrowing,
  }
}

function symbolPackageLines(symbolPackage?: CultureSymbolBorrowingPackage) {
  if (!symbolPackage) return []
  const format = (label: string, values: string[]) => values.length ? `${label}：${values.slice(0, 6).join("、")}` : null
  return compactLines([
    format("视觉符号", symbolPackage.visual),
    format("风格符号", symbolPackage.style),
    format("动作符号", symbolPackage.motion),
    format("声音符号", symbolPackage.audio),
    format("口播/字幕语法", symbolPackage.verbal),
    format("叙事关系", symbolPackage.narrative),
    format("商品承接符号", symbolPackage.productBridge),
  ])
}

function cultureBorrowingForPrompt(culture?: SelectedCultureBorrowing | null) {
  if (!culture) return null
  return {
    selected: true,
    template_id: culture.templateId,
    template_name: culture.nameCn,
    hook_scope: culture.hookScope,
    culture_mechanism: culture.cultureMechanism,
    opening_capture: culture.openingCapture,
    attention_escalation: culture.attentionEscalation,
    product_bridge_rule: culture.productBridgeRule,
    first_frame_formula: culture.firstFrameFormula,
    final_video_prompt_formula_cn: culture.finalVideoPromptFormulaCn,
    audio_formula_cn: culture.audioFormulaCn,
    verbal_formula_cn: culture.verbalFormulaCn,
    required_product_appearance_timing: culture.requiredProductAppearanceTiming,
    symbol_borrowing: culture.symbolBorrowing,
    fusion_directives: culture.fusionDirectives,
    symbol_slots: culture.matchedSymbolEntries?.slice(0, 6).map((symbol) => ({
      name_cn: symbol.nameCn,
      category_l1: symbol.categoryL1,
      visual_slots: symbol.visualSlots,
      style_slots: symbol.styleSlots,
      motion_slots: symbol.motionSlots,
      audio_slots: symbol.audioSlots,
      verbal_slots: symbol.verbalSlots,
      first_frame_prompt_slots: symbol.firstFramePromptSlots,
      video_prompt_slots: symbol.videoPromptSlots,
    })) ?? [],
  }
}

function conciseProductLock(product: HookProductBrief, identity: ProductIdentityHints) {
  const sellingPoints = uniqueShort(identity.coreSellingPoints, 2)
  const forbidden = uniqueShort(identity.forbiddenSubstitutions, 3)
  return compactLines([
    `商品锁定：${product.productName}=${identity.concreteProductTypeCn}；商品主图只做身份参考，不强制在本钩子内露出；如果商品入镜，保留${identity.visualIdentity}。`,
    sellingPoints.length ? `卖点只用：${sellingPoints.join("、")}。` : null,
    forbidden.length ? `禁止替换为：${forbidden.join("、")}。` : null,
  ]).join(" ")
}

function conciseAssetMappings(params: {
  generationPath: "direct_video" | "first_frame" | "reference_video"
  product: HookProductBrief
}) {
  if (!hasProductReferenceImage(params.product)) return []
  if (params.generationPath === "first_frame") {
    return [
      "@图1（确认后的首帧图）作为开场构图和人物/场景状态参考。",
      "@图2（商品原始图）作为商品身份参考，只校准包装比例、颜色、标签布局和品类形态。",
    ]
  }
  if (params.generationPath === "reference_video") {
    return [
      "@图1（商品主图）作为商品身份参考。",
      "@视频1（参考视频）只借运动节奏和镜头关系，不复制无关商品、品牌或人物。",
    ]
  }
  return [
    "@图1（商品主图）作为商品身份参考，保留包装比例、品类形态、主色块和可读使用场景。",
  ]
}

function conciseCultureSymbolLine(culture?: SelectedCultureBorrowing | null, fusion?: HookCultureFusionBlueprint | null) {
  if (!culture) return null
  const visual = uniqueShort([
    ...(culture.symbolBorrowing.visual ?? []),
    fusion?.firstFrameSignal,
  ], 3).join("、")
  const style = uniqueShort(culture.symbolBorrowing.style ?? [], 2).join("、")
  const motion = uniqueShort([
    ...(culture.symbolBorrowing.motion ?? []),
    fusion?.stopSignal,
    fusion?.productBridgeSignal,
  ], 2).join("、")
  const audio = uniqueShort([
    ...(culture.symbolBorrowing.audio ?? []),
    fusion?.soundSignal,
  ], 2).join("、")
  return compactLines([
    `文化借势：${culture.nameCn}`,
    style ? `风格=${style}` : null,
    visual ? `视觉=${visual}` : null,
    motion ? `动作=${motion}` : null,
    audio ? `声音=${audio}` : null,
  ]).join("；") + "。"
}

function conciseProductBridgeLine(value: string | null | undefined) {
  const firstSentence = String(value ?? "").split(/[。]/)[0]
  return stripTerminalPunctuation(shortText(firstSentence, 82))
}

function conciseShotLine(params: {
  shot: HookScriptTiming
  index: number
  includeVoiceover: boolean
  fallbackCamera: string
}) {
  const camera = params.index === 0 ? params.fallbackCamera : "单一镜头动作，避免同时推拉摇移"
  const visual = stripLeadingTimeLabel(params.shot.visual)
  const parts = [
    `${params.shot.timeRange}：${shortText(visual, 150)}`,
    `运镜：${camera}`,
  ]
  if (params.includeVoiceover && params.shot.script) {
    parts.push(`声音：${shortText(params.shot.script, 70)}`)
  }
  if (!params.includeVoiceover) {
    parts.push("声音：只用环境声、拟音和节奏停顿，不要人声")
  }
  return parts.join("；")
}

export function buildSeedance2HookVideoPrompt(input: {
  product: HookProductBrief
  script: HookScriptResult
  selectedHook?: Partial<HookRecommendationCard> | null
  pattern?: HookPatternCard | null
  selectedCultureBorrowing?: SelectedCultureBorrowing | null
  includeVoiceover?: boolean
  durationSeconds: number
  generationPath?: "direct_video" | "first_frame" | "reference_video"
  intent?: HookScriptUserIntent
  intentText?: string
  userIntentExpansion?: UserIntentExpansion | null
}) {
  const identity = deriveHookProductIdentity(input.product)
  const isPureHook = hookScopeOf(input.selectedHook, input.pattern) === "product_independent"
  const attentionProfile = hookAttentionProfileFor(input.selectedHook, input.pattern)
  const generationPath = input.generationPath ?? "direct_video"
  const fusion = buildHookCultureFusionBlueprint({
    product: input.product,
    selectedHook: input.selectedHook,
    pattern: input.pattern,
    selectedCultureBorrowing: input.selectedCultureBorrowing,
    durationSeconds: input.durationSeconds,
  })
  const assetMappings = conciseAssetMappings({ generationPath, product: input.product })
  const productTimingRule = isPureHook
    ? "可以全段不出现商品，完全服务停滑；如果商品出现，只能作为反差答案、证据或线索短暂回收。"
    : "先拿 attention；商品可以成为答案、证据或线索，也可以留到钩子之后再出现，不做完整转化广告。"
  const timingLines = input.script.shotTiming.length > 0
    ? input.script.shotTiming.map((shot, index) => conciseShotLine({
        shot,
        index,
        includeVoiceover: input.includeVoiceover !== false,
        fallbackCamera: fusion?.cameraContract ?? "固定近景或轻微推近，只保留一种主要运镜",
      }))
    : [`0-${input.durationSeconds} 秒：${shortText(input.script.visualDescription, 180)}；运镜：${fusion?.cameraContract ?? "单一镜头动作"}`]
  const visualStyle = applyCultureToVisualStyle(
    input.script.visualStyle || defaultVisualStyle({ selectedHook: input.selectedHook, pattern: input.pattern }),
    input.selectedCultureBorrowing,
  )
  const soundDesign = input.includeVoiceover === false
    ? voiceoverDisabledSoundDesign(input.script.soundDesign || defaultSoundDesign({ selectedHook: input.selectedHook, pattern: input.pattern }))
    : input.script.soundDesign || defaultSoundDesign({ selectedHook: input.selectedHook, pattern: input.pattern })
  const hookLabel = input.selectedHook?.displayName ?? input.pattern?.patternName ?? "短视频钩子"
  const hookObjective = attentionProfile
    ? `${attentionProfile.shortLabel}：${attentionProfile.attentionObjective}`
    : hookAttentionJob(input.selectedHook, input.pattern)
  const cultureLine = conciseCultureSymbolLine(input.selectedCultureBorrowing, fusion)
  const productBridgeLine = conciseProductBridgeLine(input.script.productBridge)
  const timingText = timingLines.join("\n")
  const shouldIncludeProductBridge = Boolean(productBridgeLine)
    && !timingText.includes(productBridgeLine.slice(0, Math.min(18, productBridgeLine.length)))
  const baseVisualStyle = visualStyle.split("；文化借势画面风格：")[0] || visualStyle
  const compressedStyle = shortText(
    baseVisualStyle
      .replace(/写实手机\s+UGC/g, "真实手机随手拍")
      .replace(/\bUGC\b/g, "真实手机随手拍"),
    96,
  )
  const voiceAndSoundLine = input.includeVoiceover === false
    ? "声音策略：不要生成人声口播、旁白或角色说话；只用环境声、拟音、停顿音和镜头动作音。"
    : `声音策略：${shortText(soundDesign, 96)}。`
  const userInputContract = hookUserInputContract(input)
  const userIntentExpansionContract = hookUserIntentExpansionContract(input.userIntentExpansion)

  return compactLines([
    "全局基础设定：",
    ...assetMappings,
    `生成 ${input.durationSeconds} 秒竖屏 9:16 短视频钩子；唯一目标是停滑、3 秒留存和继续观看欲望。`,
    conciseProductLock(input.product, identity),
    userInputContract,
    userIntentExpansionContract,
    `钩子任务：${hookLabel}；${shortText(hookObjective, 86)}；${productTimingRule}`,
    cultureLine,
    shouldIncludeProductBridge ? `商品承接：${productBridgeLine}。` : null,
    `画面风格：${compressedStyle}。`,
    voiceAndSoundLine,
    "",
    "时间片分镜脚本：",
    ...timingLines,
    "",
    "画质、风格与约束：",
    "真实细节清楚，人物表情和手部稳定，商品包装不能变形；每个时间片只使用一种主要运镜，不要同时推拉摇移。",
    "不要在画面里渲染字幕、界面、水印、贴纸、随机文字、多余标志、具体栏目名、商业 IP 角色脸或原音乐。",
  ]).join("\n")
}

export function strengthenHookScriptProductIdentity(script: HookScriptResult, product: HookProductBrief): HookScriptResult {
  const providerLock = buildProductIdentityLockText(product)
  const providerLockZh = buildProductIdentityLockTextZh(product)

  return {
    ...script,
    videoPrompt: `${script.videoPrompt}\n${providerLockZh}`,
    firstFramePrompt: `${script.firstFramePrompt} ${providerLock}`,
  }
}

function withSeedance2VideoPrompt(
  script: HookScriptResult,
  input: HookScriptBuildInput,
  pattern: HookPatternCard,
) {
  const includeVoiceover = input.includeVoiceover ?? true
  const strengthened = applyVoiceoverPreference(strengthenHookScriptProductIdentity(script, input.product), includeVoiceover)
  const visualStyle = applyCultureToVisualStyle(strengthened.visualStyle || defaultVisualStyle({
    selectedHook: "displayName" in input.selectedHook ? input.selectedHook as HookRecommendationCard : null,
    pattern,
  }), input.selectedCultureBorrowing)
  const soundDesign = strengthened.soundDesign || defaultSoundDesign({
    selectedHook: "displayName" in input.selectedHook ? input.selectedHook as HookRecommendationCard : null,
    pattern,
  })
  const preparedScript = { ...strengthened, visualStyle, soundDesign }
  return {
    ...preparedScript,
    videoPrompt: buildSeedance2HookVideoPrompt({
      product: input.product,
      script: preparedScript,
      selectedHook: "displayName" in input.selectedHook ? input.selectedHook as HookRecommendationCard : null,
      pattern,
      selectedCultureBorrowing: input.selectedCultureBorrowing,
      includeVoiceover,
      durationSeconds: input.durationSeconds,
      intent: input.intent,
      intentText: input.intentText,
      userIntentExpansion: input.userIntentExpansion,
    }),
  }
}

export function parseHookScriptResult(content: string): HookScriptResult {
  const cleaned = content.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim()
  const raw = JSON.parse(cleaned.match(/\{[\s\S]*\}/)?.[0] ?? cleaned) as Partial<HookScriptResult>
  const recommendation = raw.generationRecommendation
  const recommendedPaths: Array<"direct_video" | "first_frame"> = Array.isArray(recommendation?.availablePaths)
    ? recommendation.availablePaths.filter((item): item is "direct_video" | "first_frame" => item === "direct_video" || item === "first_frame")
    : []
  const availablePaths: HookGenerationRecommendation["availablePaths"] = recommendedPaths.length ? recommendedPaths : ["direct_video", "first_frame"]
  return {
    hookSummary: firstNonEmpty(raw.hookSummary, "用强停顿点承接商品卖点。"),
    visualDescription: firstNonEmpty(raw.visualDescription, "短视频开场先给出强停顿画面，商品可作为后续答案线索，也可以不在本段出现。"),
    visualStyle: firstNonEmpty(raw.visualStyle, "写实手机 UGC，竖屏自然光，轻微手持感，商品包装可读。"),
    script: firstNonEmpty(raw.script, "看这里，问题的关键在这一步。"),
    soundDesign: firstNonEmpty(raw.soundDesign, "真实环境底噪，开头轻微停顿音，口播短促。"),
    textOverlay: asStringArray(raw.textOverlay),
    shotTiming: Array.isArray(raw.shotTiming) ? raw.shotTiming.map((item) => ({
      timeRange: firstNonEmpty((item as HookScriptTiming).timeRange, "0-4 秒"),
      visual: firstNonEmpty((item as HookScriptTiming).visual, raw.visualDescription, "商品钩子画面。"),
      script: firstNonEmpty((item as HookScriptTiming).script),
      textOverlay: firstNonEmpty((item as HookScriptTiming).textOverlay),
    })) : [],
    productBridge: firstNonEmpty(raw.productBridge, "把视觉冲突连接到结果线索或后续解决方案，但不要扩写成长广告；商品不强制在本段出现。"),
    videoPrompt: firstNonEmpty(raw.videoPrompt, raw.visualDescription, "中文 Seedance2 视频提示词待生成。"),
    firstFramePrompt: firstNonEmpty(raw.firstFramePrompt, raw.visualDescription, "Create a realistic first frame for this ecommerce hook."),
    generationRecommendation: {
      preferredPath: recommendation?.preferredPath === "first_frame" ? "first_frame" : "direct_video",
      reason: firstNonEmpty(recommendation?.reason, "脚本信息足够，适合直接生成短视频。"),
      availablePaths,
    },
  }
}

export function buildFallbackHookScript(input: HookScriptBuildInput, pattern: HookPatternCard): HookScriptResult {
  const product = input.product
  const identity = deriveHookProductIdentity(product)
  const logic = product.marketingLogic
  const duration = input.durationSeconds
  const corePoint = logic.coreSellingPoints[0] ?? logic.differentiator ?? product.productName
  const painPoint = logic.painPoints[0] ?? "使用前后的差异不够直观"
  const proof = logic.proofPoints[0] ?? "用结果画面证明卖点"
  const audience = logic.targetAudience[0] ?? "目标用户"
  const selectedHook = "displayName" in input.selectedHook ? input.selectedHook as HookRecommendationCard : null
  const hookName = selectedHook?.displayName || "短视频钩子"
  const hookMechanism = selectedHook?.subTypeLabel || selectedHook?.hookTypeLabel || "注意力停顿点"
  const attentionProfile = hookAttentionProfileFor(selectedHook, pattern)
  const isPureHook = pattern.hookScope === "product_independent"
  const attentionPlan = hookSpecificPlan({
    hookMechanism,
    profile: attentionProfile,
    product,
    identity,
    corePoint,
    painPoint,
    audience,
    duration,
    isPureHook,
  })
  const culture = input.selectedCultureBorrowing
  const fusion = buildHookCultureFusionBlueprint({
    product,
    selectedHook,
    pattern,
    selectedCultureBorrowing: culture,
    durationSeconds: duration,
  })
  const cultureOpening = culture?.openingCapture || attentionPlan.opening
  const cultureEscalation = culture?.attentionEscalation || attentionPlan.escalation
  const cultureBridge = culture?.productBridgeRule || ""
  const cultureName = culture ? ` + ${culture.nameCn}` : ""
  const fusedVerbal = fusion?.verbalSignal || culture?.verbalFormulaCn || ""
  const includeVoiceover = input.includeVoiceover ?? true
  const shortPainHook = input.intent === "pain_first" && duration <= 4
  const deferProductTerms = (value: string) => shortPainHook ? value
    .replaceAll(product.productName, "后续解决方案")
    .replaceAll(`这支${identity.concreteProductTypeCn}`, "后续线索")
    .replaceAll("商品", "下一步线索") : value
  const fusedOpening = deferProductTerms(fusion?.stopSignal || cultureOpening)
  const fusedEscalation = deferProductTerms(fusion?.escalationSignal || cultureEscalation)
  const shortPainDeferredBridge = "保留痛点证据、人物反应、旧牙刷或换方法的手部开环，商品留到后续解决方案转折再出现，避免观众误解商品导致问题。"
  const fusedBridge = shortPainHook
    ? shortPainDeferredBridge
    : deferProductTerms(fusion?.productBridgeSignal || compactLines([cultureBridge, attentionPlan.bridge]).join(" "))
  const recoveryRule = isPureHook
    ? `这个强刺激开场以抓注意力为第一目标，可以全段不解释、不露出商品；如果最后用${product.productName}回收，也只做短线索，不做完整转化。`
    : `开场只服务「${attentionProfile?.shortLabel || hookMechanism}」这种注意力，不要求高度产品绑定；商品可在注意力成立后作为答案、证据或线索出现，也可以留到 hook 之后。`
  const availablePaths: HookGenerationRecommendation["availablePaths"] = ["direct_video", "first_frame"]

  const rawShotTiming: HookScriptTiming[] = isPureHook
      ? [
        { timeRange: "0-1 秒", visual: fusedOpening, textOverlay: attentionPlan.overlay },
        { timeRange: "1-2.5 秒", visual: fusedEscalation, script: includeVoiceover ? fusedVerbal || attentionPlan.scriptLine : undefined },
        { timeRange: `2.5-${duration} 秒`, visual: fusedBridge, script: includeVoiceover ? `先把这个线索留住，答案后面再看。` : undefined },
      ]
    : [
        { timeRange: "0-1 秒", visual: fusedOpening || attentionPlan.opening, textOverlay: attentionPlan.overlay },
        { timeRange: "1-2 秒", visual: culture ? fusedEscalation : attentionPlan.escalation, script: includeVoiceover ? fusedVerbal || attentionPlan.scriptLine : undefined },
        { timeRange: "2-3.5 秒", visual: fusedBridge, script: includeVoiceover ? `先别急着当广告看，这里只是答案线索。` : undefined },
        { timeRange: `3.5-${duration} 秒`, visual: `留下一个结果缺口或下一秒想看的动作，不完整解释卖点。`, textOverlay: shortPainHook ? "下一秒换方法" : proof },
      ]
  const shotTiming = applyHookUserInputToShotTiming(rawShotTiming, input)
  const userInputContract = hookUserInputContract(input)
  const userIntentExpansionContract = hookUserIntentExpansionContract(input.userIntentExpansion)
  const hookIntentText = normalizedHookIntentText(input)

  const baseScript: HookScriptResult = {
    hookSummary: isPureHook
      ? `${hookName}${cultureName}：用${hookMechanism}和${culture?.nameCn ?? "强刺激画面"}融合成同一个停滑事件，前半段抢注意力，商品可不在本段出现。`
      : `${hookName}${cultureName}：按「${attentionProfile?.shortLabel || hookMechanism}」先制造独立 attention，再决定是否用${product.productName}这支${identity.concreteProductTypeCn}作为答案、证据或线索。`,
    visualDescription: compactLines([
      attentionProfile ? `Hook 差异化：${attentionProfile.shortLabel}。${attentionProfile.attentionObjective}。商品自由度：${attentionProfile.productRole}` : null,
      userInputContract,
      userIntentExpansionContract,
      fusion ? `融合逻辑：${fusion.fusionThesis}` : null,
      fusion ? `0-1 秒：${fusedOpening}` : attentionPlan.opening,
      culture ? `文化借势：${culture.nameCn}。它必须提供符号、动作、声音和叙事语法，而不是只改变画风。${culture.fusionDirectives.slice(0, 2).join(" ")}` : null,
      isPureHook
        ? `1-2.5 秒：${fusion?.escalationSignal || "继续放大视觉冲突或未完成动作，优先制造停留，不急着出商品。"}`
        : `1-2 秒：${fusion?.escalationSignal || attentionPlan.escalation}`,
      isPureHook
        ? `${Math.max(2.5, duration - 1)}-${duration} 秒：${fusion?.productBridgeSignal || `保留反差解释或下一秒线索；${product.productName}可不在本段出现。`}`
        : `2-3.5 秒：${shortPainHook ? fusedBridge : fusion?.productBridgeSignal || attentionPlan.bridge}`,
      `全片只做钩子，结尾留住下一秒，不做完整转化段。`,
      recoveryRule,
      fusion ? `可借符号：${symbolPackageLines(fusion.symbolPackage).join("；")}` : null,
    ]).join(" "),
    visualStyle: applyCultureToVisualStyle(defaultVisualStyle({ selectedHook, pattern }), culture),
    script: includeVoiceover
      ? isPureHook
        ? `${fusedVerbal ? `${fusedVerbal} ` : ""}${hookIntentText ? `这次按「${hookIntentText}」来拍。` : ""}停一下，这个画面哪里不对？答案先别急着露。`
        : `${fusedVerbal ? `${fusedVerbal} ` : ""}${hookIntentText ? `这次按「${hookIntentText}」来拍。` : ""}${attentionPlan.scriptLine}`
      : "",
    soundDesign: includeVoiceover
      ? culture?.audioFormulaCn ? `${culture.audioFormulaCn} ${attentionProfile?.audioGrammar || defaultSoundDesign({ selectedHook, pattern })}` : `${attentionProfile?.audioGrammar || defaultSoundDesign({ selectedHook, pattern })}。${defaultSoundDesign({ selectedHook, pattern })}`
      : voiceoverDisabledSoundDesign(culture?.audioFormulaCn || defaultSoundDesign({ selectedHook, pattern })),
    textOverlay: [
      attentionPlan.overlay,
      culture?.nameCn ?? "",
      attentionProfile?.shortLabel ?? "",
      shortPainHook ? "下一秒换方法" : `${identity.concreteProductTypeCn} · ${corePoint}`,
    ].filter(Boolean),
    shotTiming,
    productBridge: isPureHook
      ? compactLines([fusedBridge, `强刺激段先拿停留，商品可以不出现；如果结尾出现，只能作为反差答案或线索短暂回收。`]).join(" ")
      : compactLines([fusedBridge, `先用${hookMechanism}和${culture?.nameCn ?? "场景语法"}一起拿到停留，再由 LLM 判断是否让${product.productName}这支${identity.concreteProductTypeCn}成为「${painPoint}」的具体线索，或留到 hook 后。`]).join(" "),
    videoPrompt: "中文 Seedance2 视频提示词待生成。",
    firstFramePrompt: [
      `A realistic UGC first frame for a ${duration}-second ecommerce hook video.`,
      culture ? `Culture borrowing template: ${culture.nameCn}. Hook-culture fusion: ${fusion?.fusionThesis ?? culture.fusionDirectives.join(" ")}. First-frame formula: ${fusion?.firstFrameSignal ?? culture.firstFrameFormula}. Opening capture: ${culture.openingCapture}.` : null,
      fusion ? `Borrowable multimodal symbols: ${symbolPackageLines(fusion.symbolPackage).join("; ")}.` : null,
      `Product: ${product.productName}. Concrete product type: ${identity.concreteProductTypeEn}. Category: ${product.productCategory ?? "general"}.`,
      `The uploaded product image is only an identity reference. If the product appears in this first frame, it must visibly preserve: ${identity.visualIdentity}.`,
      attentionProfile ? `Hook attention archetype: ${attentionProfile.shortLabel}. Objective: ${attentionProfile.attentionObjective}. Opening signal: ${attentionProfile.openingSignal}. Visual grammar: ${attentionProfile.visualGrammar}. Product does not need to dominate the first frame if it weakens attention.` : null,
      `Visual stop signal: ${hookMechanism}; create obvious visual conflict, unfinished action, contrast, or abnormal clue in the first frame.`,
      `Use a real phone-camera daily-life scene; product-readable packaging only if the product naturally appears, no text overlay, no polished ad poster feel.`,
    ].filter(Boolean).join(" "),
    generationRecommendation: {
      preferredPath: pattern.recommendedGenerationMode === "first_frame" ? "first_frame" : "direct_video",
      reason: pattern.recommendedGenerationMode === "first_frame"
        ? "这个钩子更依赖首帧视觉停留，建议先生成首帧。"
        : "这个钩子的画面结构可以直接交给短视频生成。",
      availablePaths,
    },
  }

  return withSeedance2VideoPrompt(baseScript, input, pattern)
}

export function buildHookScriptPrompt(input: HookScriptBuildInput, pattern: HookPatternCard) {
  const mood = getHookMoodDefinitions().find((item) => item.id === pattern.emotionalPath)
  const identity = deriveHookProductIdentity(input.product)
  const isPureHook = pattern.hookScope === "product_independent"
  const culture = cultureBorrowingForPrompt(input.selectedCultureBorrowing)
  const attentionProfile = getHookAttentionProfile(pattern.hookType)
  const userInputContract = hookUserInputContract(input)
  const userIntentExpansionContract = hookUserIntentExpansionContract(input.userIntentExpansion)
  const fusion = buildHookCultureFusionBlueprint({
    product: input.product,
    selectedHook: "displayName" in input.selectedHook ? input.selectedHook as HookRecommendationCard : null,
    pattern,
    selectedCultureBorrowing: input.selectedCultureBorrowing,
    durationSeconds: input.durationSeconds,
  })
  return {
    systemPrompt: `You are a short ecommerce hook creative director. Generate only strict JSON. Optimize only for attention capture, 3-second retention, and feed ranking. The output must describe a ${input.durationSeconds}-second video hook, not a long ad. Do not write a conversion section. Never include claims that are forbidden by the user. The uploaded product image is an identity reference, not a requirement that the product must appear in the hook. Product identity is non-negotiable only when the product is visible: never replace the concrete product with a broad category item.`,
    userPrompt: JSON.stringify({
      task: "Generate a 4-9 second hook script for ecommerce short video generation.",
      hard_success_criteria: [
        "0-1 秒必须有一个可视化停滑信号。",
        userInputContract
          ? `必须显式使用用户补充输入：${userInputContract}`
          : "如果有用户补充输入，必须进入脚本和最终视频提示词，不得只停留在商品信息里。",
        userIntentExpansionContract
          ? `优先使用用户输入语义拆解，把至少一个拆解结果落到开场动作、冲突来源或开环线索：${userIntentExpansionContract}`
          : "如存在用户输入语义拆解，把它作为拍摄线索使用；不要把推断出的可拍证据当成商品事实。",
        "1-2.5 秒必须继续制造好奇、冲突、异常线索或痛点，不要进入完整广告解释。",
        attentionProfile
          ? `必须严格按照「${attentionProfile.shortLabel}」生成：${attentionProfile.attentionObjective}。开场必须是：${attentionProfile.openingSignal}。不要把它写成其他 hook 类型。`
          : "必须让所选 hook 类型和其他 hook 类型在开场动作、声音、文本和商品出现时机上明显不同。",
        attentionProfile
          ? `商品绑定自由度：${attentionProfile.productRole}。${attentionProfile.productTiming}。不要为了产品相关性牺牲停滑。`
          : "商品不一定要高度绑定开场，也不一定要出现在 hook 当中；先保证 attention，再决定是否回收商品。",
        attentionProfile
          ? `同质化禁区：${attentionProfile.avoidSameness}。`
          : "不要把所有 hook 都生成成痛点说明 + 商品展示。",
        isPureHook
          ? "强刺激钩子可以全段不出现商品，完全服务停滑；如需出现，也只能在结尾短暂作为答案或线索。"
          : "相关钩子也可以先做独立 attention，再决定商品作为答案、证据、线索或错位物出现；不要求商品在本 hook 内露出。",
        culture
          ? "已选择 Culture Borrowing。它不是画面风格外挂：selectedHook 提供注意力任务，Culture Borrowing 提供可借视觉/动作/声音/口播/叙事符号；每个时间片都必须把两者融合成一个可见可听的动作链。"
          : "没有选择 Culture Borrowing，不要强行加入文化借势。",
        culture
          ? "如果脚本只按钩子模式写、文化借势只出现在 visualStyle 或单独一行，视为失败。shotTiming 每段都要体现 hook task + culture symbol 的共同作用。"
          : "没有文化借势时，shotTiming 只需服务所选钩子模式。",
        culture
          ? "首帧、画面描述、音效设计、口播/字幕元数据、productBridge 和 final video prompt 都要使用 culture_borrowing.symbol_borrowing 里的多模态符号；这些符号可以服务开环，不必都导向商品露出。"
          : "不要虚构文化借势符号。",
        culture
          ? "Culture Borrowing 不得输出具体 IP 名称、角色脸、Logo、原台词、原音乐、平台 UI 或随机文字。"
          : "不要输出具体 IP 名称、角色脸、Logo、原台词、原音乐、平台 UI 或随机文字。",
        "结尾只留下继续观看欲望或反差答案，不写转化段，不写完整广告收口。",
        "所有视觉、口播、字幕元数据、音效都必须服务停滑和 3 秒留存。",
        "画面描述必须具体到主体、动作、场景、光线、镜头和声音触发，不要只写「制造冲突」「文化借势」「效果展示」这类抽象词。",
        "shotTiming.visual 每段必须是可拍摄的动作句：谁/什么物体在什么场景里做什么，镜头怎么拍，文化符号如何出现。",
        input.includeVoiceover === false
          ? "用户没有勾选口播：script 必须为空字符串，shotTiming.script 必须为空或省略，soundDesign 只能包含环境声、拟音和音效，不得出现人声口播、旁白或角色说话。"
          : "用户勾选了口播：口播必须短促，只服务停滑和留存，不写完整广告转化。",
        culture
          ? "visualStyle 必须显式写入所选 Culture Borrowing 的画面风格，例如年代质感、黑白纪实、综艺舞台、游戏关卡或文化符号化视觉风格。"
          : "visualStyle 必须给出明确画面风格，例如写实手机 UGC、动漫、70 年代电视剧、黑白纪实。",
        "videoPrompt 不要堆长篇重复信息；最终视频提示词会由系统按 Seedance2 三段式重新压缩生成。",
      ],
      product_identity_lock: {
        product_name: input.product.productName,
        broad_category: input.product.productCategory,
        concrete_product_type_cn: identity.concreteProductTypeCn,
        concrete_product_type_en: identity.concreteProductTypeEn,
        visual_identity_if_product_appears: identity.visualIdentity,
        required_scene_signals: identity.sceneSignals,
        forbidden_visual_substitutions: identity.forbiddenSubstitutions,
        rule: "The product is allowed to be absent from the hook. If the product is visible in any script field or provider prompt, it must be about this concrete product type, not only the broad category. If the product is toothpaste and appears, show toothpaste tube/oral-care cues and never skincare bottles or serum droppers.",
      },
      attention_profile: attentionProfile,
      hook_culture_fusion_blueprint: fusion,
      output_contract: {
        hookSummary: "Chinese one sentence",
        visualDescription: "Chinese visual description",
        visualStyle: "Chinese visual style line, e.g. 写实手机UGC / 动漫 / 70年代电视剧 / 黑白纪实",
        script: input.includeVoiceover === false ? "empty string; user disabled voiceover" : "Chinese voice/script line",
        soundDesign: "Chinese sound design line with sound effects and ambient audio",
        textOverlay: ["short Chinese overlay candidates, metadata only"],
        shotTiming: [{ timeRange: "0-1 秒", visual: "Chinese shot visual", script: input.includeVoiceover === false ? "empty or omitted" : "optional Chinese spoken line", textOverlay: "optional Chinese metadata only" }],
        productBridge: "Chinese sentence explaining the hook handoff. The product may enter as answer/evidence/clue, or may be deferred after the hook when that better preserves attention or avoids misattribution.",
        videoPrompt: "Brief Chinese source prompt only; system will rebuild the concise Seedance2 final video prompt, no rendered text overlay",
        firstFramePrompt: "English image prompt for first frame generation, no rendered text; product can be absent. If product appears, include concrete product type and visual identity lock",
        generationRecommendation: {
          preferredPath: "direct_video | first_frame",
          reason: "Chinese reason",
          availablePaths: ["direct_video", "first_frame"],
        },
      },
      duration_seconds: input.durationSeconds,
      include_voiceover: input.includeVoiceover ?? true,
      hook_mode: hookIntentLabel(input.intent),
      user_hook_input: normalizedHookIntentText(input),
      user_hook_input_contract: userInputContract,
      user_hook_input_semantic_expansion_contract: userIntentExpansionContract,
      user_intent_expansion: input.userIntentExpansion ?? null,
      product: input.product,
      hook_pattern: {
        id: pattern.id,
        name: pattern.patternName,
        hook_type: pattern.hookType,
        sub_type: pattern.subType,
        product_relation_type: pattern.productRelationType,
        narrative_function: pattern.narrativeFunction,
        logic: pattern.oneSentenceLogic,
        time_structure: safeJsonParse(pattern.timeStructureJson),
        visual_criteria: safeJsonParse(pattern.visualCriteriaJson),
        motion_criteria: safeJsonParse(pattern.motionCriteriaJson),
        text_criteria: safeJsonParse(pattern.textCriteriaJson),
        product_bridge_rule: pattern.productBridgeRule,
        recommended_generation_mode: pattern.recommendedGenerationMode,
        hook_scope: pattern.hookScope,
      },
      culture_borrowing: culture,
      mood_path: mood ?? null,
    }, null, 2),
  }
}

export async function generateHookScriptWithLlm(
  input: HookScriptBuildInput,
  pattern: HookPatternCard,
  config: LlmConfig,
) {
  const prompt = buildHookScriptPrompt(input, pattern)
  const response = await callLlm(config, {
    messages: [
      { role: "system", content: prompt.systemPrompt },
      { role: "user", content: prompt.userPrompt },
    ],
    model: config.model,
    temperature: 0.72,
    maxTokens: 2200,
    timeoutMs: 90_000,
    retries: 1,
    retryDelayMs: 1500,
  })
  return withSeedance2VideoPrompt(parseHookScriptResult(response.content), input, pattern)
}

export function resolveHookPatternOrThrow(patternCardId: string) {
  const pattern = getHookPatternCard(patternCardId)
  if (!pattern) throw new Error(`Hook pattern not found: ${patternCardId}`)
  return pattern
}

export function hookScriptScoreDetail(params: {
  selectedHook: HookRecommendationCard | { patternCardId: string }
  selectedCultureBorrowing?: SelectedCultureBorrowing | null
  script: HookScriptResult
  durationSeconds: number
  includeVoiceover?: boolean
  source: "llm" | "fallback"
}): JsonValue {
  const selected = params.selectedHook as Partial<HookRecommendationCard> & { patternCardId: string }
  const culture = params.selectedCultureBorrowing
  return {
    hook_generator: true,
    patternCardId: params.selectedHook.patternCardId,
    hookScope: selected.hookScope ?? (selected.scopeLabel === "强刺激钩子" ? "product_independent" : "product_related"),
    durationSeconds: params.durationSeconds,
    includeVoiceover: params.includeVoiceover ?? true,
    generationRecommendation: params.script.generationRecommendation,
    captureMechanism: selected.subTypeLabel ?? selected.hookTypeLabel ?? null,
    diagnosticityBridge: params.script.productBridge,
    threeSecondRetentionTarget: selected.hookScope === "product_independent"
      ? "0-2.5 秒优先强停滑和好奇缺口，商品可不出现或在结尾短暂回收"
      : "0-1 秒停滑，1-2 秒痛点/异常线索，2-3.5 秒可以是商品关系线索，也可以是继续观看开环",
    conversionBridge: "Hook Generator V1 不生成完整转化段，只保留注意力回收线索",
    visualStyle: params.script.visualStyle,
    soundDesign: params.script.soundDesign,
    cultureBorrowing: culture ? {
      templateId: culture.templateId,
      nameCn: culture.nameCn,
      cultureMechanism: culture.cultureMechanism,
      requiredProductAppearanceTiming: culture.requiredProductAppearanceTiming,
      productBridgeRule: culture.productBridgeRule,
      fusionDirectives: culture.fusionDirectives,
      symbolBorrowing: culture.symbolBorrowing,
      fusionSummary: "selectedHook 提供注意力任务，Culture Borrowing 提供多模态符号，两者必须共同决定 shotTiming、首帧和视频提示词。",
    } : null,
    source: params.source,
  }
}
