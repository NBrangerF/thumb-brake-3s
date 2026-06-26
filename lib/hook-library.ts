import { readFileSync, readdirSync, statSync } from "fs"
import path from "path"
import { getCultureBorrowingTemplateByMotifId } from "@/lib/culture-motif-resources/motif-system"

export type PaginatedResponse<T> = {
  items: T[]
  page: number
  size: number
  total: number
  totalPages: number
}

export type HookPatternCard = {
  id: string
  hookScope: "product_related" | "product_independent"
  patternName: string
  hookType: string
  subType: string
  productRelationType: string
  narrativeFunction?: string | null
  oneSentenceLogic: string
  applicableCategoriesJson: string
  categoryFitWeightJson: string
  audienceFitJson?: string | null
  sellingPointFitJson?: string | null
  emotionalPath?: string | null
  stimulationLevel: string
  timeStructureJson?: string | null
  visualCriteriaJson?: string | null
  motionCriteriaJson?: string | null
  audioCriteriaJson?: string | null
  textCriteriaJson?: string | null
  productBridgeRule: string
  referenceRequirementsJson: string
  recommendedGenerationMode: string
  modelFeasibility: string
  promptSlotsJson?: string | null
  sampleConceptTemplatesJson?: string | null
  sourceObservationsJson?: string | null
  sourceMetadataJson?: string | null
  updateHistoryJson?: string | null
  status: string
  createdAt?: string | null
  updatedAt?: string | null
  approvedAt?: string | null
}

export type HookCategoryPlaybook = {
  id: string
  categoryId: string
  categoryName: string
  recommendedHooksJson: string
  exploratoryHooksJson: string
  highArousalHooksJson: string
  conflictNarrativeHooksJson: string
  culturalHooksJson: string
  nonFitObservationsJson: string
  priorityMatrixJson: string
  sourceMetadataJson?: string | null
  status: string
  updatedAt?: string | null
}

export type HookReferenceAsset = {
  id: string
  assetType: string
  sourceType: string
  referenceRole: string
  sourceUrl?: string | null
  hookTypeFitJson: string
  categoryFitJson: string
  motionTagsJson: string
  styleTagsJson: string
  generationModeFitJson: string
  linkedPatternCardsJson: string
  usageCount: number
  successNotes?: string | null
  status: string
  updatedAt?: string | null
}

export type HookTrendObservation = {
  id: string
  sourcePlatform: string
  observedCategory?: string | null
  first5sSummary: string
  detectedHookTypeJson: string
  productRelationType?: string | null
  narrativeFunction?: string | null
  emotionPath?: string | null
  dominantModality?: string | null
  keyVisualEvent?: string | null
  keyAudioEvent?: string | null
  keyText?: string | null
  productAppearanceTime?: number | null
  distilledPatternCandidate?: string | null
  sourceMetadataJson?: string | null
  status: string
  updatedAt?: string | null
  approvedAt?: string | null
}

export type HookGenerationFewShot = {
  id: string
  hookType: string
  intentMode: string
  category: string
  productInput: string
  audienceInput: string
  patternRefs: string[]
  badExampleToAvoid: string
  expectedHookCard: {
    hookTitle: string
    first3Seconds: Record<string, string>
    shortScript: string
    visualEvidence: string[]
    safeGuardrailNote: string
  }
}

export type HookLibraryCoverage = {
  patternCards: number
  productRelatedPatternCards: number
  productIndependentPatternCards: number
  hookTypeCounts: Record<string, number>
  nonProductFirstCount: number
  conflictNarrativeCount: number
  highStimulationCount: number
  categoryPlaybookCount: number
}

export type HookLibraryReviewCheck = {
  id: string
  label: string
  status: "pass" | "warn" | "fail"
  expected?: string
  actual?: string | number
  details?: string[]
}

export type HookLibraryCategoryCoverage = {
  categoryId: string
  hasPlaybook: boolean
  patternCards: number
  referenceAssets: number
  trendObservations: number
}

export type HookMoodVariant = {
  id: string
  trigger: string
  modality: string
  narrative_function: string
  example_structure: string
  reference_needs: string[]
}

export type HookMoodDefinition = {
  id: string
  display_name: string
  definition: string
  commerce_role: string
  common_categories: string[]
  arousal_profile: {
    start: string
    turn: string
    end: string
    intensity_range: string[]
  }
  product_bridge_logic: string
  preferred_generation_modes: string[]
  variants: HookMoodVariant[]
  negative_boundary: string
}

export type HookMoodCoverage = {
  moodId: string
  defined: boolean
  patternCards: number
  trendObservations: number
  hookTypes: number
  subTypes: number
  categories: number
  productRelations: number
  narrativeFunctions: number
  generationModes: number
  stimulationLevels: number
  variants: number
}

export type HookLibraryReview = {
  ok: boolean
  generatedAt: string
  resourceCounts: {
    patternCards: number
    categoryPlaybooks: number
    referenceAssets: number
    trendObservations: number
  }
  hookTypeCoverage: Record<string, { patternCards: number; referenceAssets: number }>
  categoryCoverage: HookLibraryCategoryCoverage[]
  moodCoverage: HookMoodCoverage[]
  checks: HookLibraryReviewCheck[]
}

export type CultureBorrowingScope = "product_related" | "product_independent" | "culture_borrowing"

export type CultureSymbolBorrowingPackage = {
  visual: string[]
  style: string[]
  motion: string[]
  audio: string[]
  verbal: string[]
  narrative: string[]
  productBridge: string[]
  firstFrame: string[]
  video: string[]
}

export type CultureSymbolEntry = {
  entryId: string
  nameCn: string
  categoryL1: string
  categoryL2: string
  symbolType: string
  sourceFamily: string
  borrowingLevel: string
  symbolizationRule: string
  doNotUse: string[]
  visualSlots: string[]
  styleSlots: string[]
  motionSlots: string[]
  audioSlots: string[]
  verbalSlots: string[]
  hookMechanisms: string[]
  stimulationLevel: number
  productDependency: "none" | "weak" | "medium" | "strong"
  bridgeType: string
  firstFramePromptSlots: string[]
  videoPromptSlots: string[]
  exampleScript: {
    voiceoverCn?: string
    overlayCn?: string[]
    soundEffectCn?: string[]
  }
  applicableCategories: string[]
  applicableSellingPoints: string[]
  tags: string[]
}

export type CultureBorrowingTemplate = {
  templateId: string
  nameCn: string
  hookScope: CultureBorrowingScope
  cultureMechanism: string[]
  symbolEntryIds: string[]
  recommendedDurationSec: number
  openingCapture: string
  attentionEscalation: string
  productBridgeRule: string
  firstFrameFormula: string
  finalVideoPromptFormulaCn: string
  audioFormulaCn: string
  verbalFormulaCn: string
  symbolBorrowing: CultureSymbolBorrowingPackage
  fusionDirectives: string[]
  applicableCategories: string[]
  productDependency: "none" | "weak" | "medium" | "strong"
  requiredProductAppearanceTiming: "0-1s" | "1-3s" | "3-5s" | "late_glimpse" | "optional"
  tags: string[]
}

export type SelectedCultureBorrowing = CultureBorrowingTemplate & {
  matchedSymbolEntries?: CultureSymbolEntry[]
  cultureMotifId?: string
  motifFamily?: string
  visualRenderProfileId?: string
  shotPrimitiveIds?: string[]
  whySelected?: string[]
}

export type CultureBorrowingRecommendationRequest = {
  productCategory?: string | null
  hookScope?: "product_related" | "product_independent"
  selectedHook?: Partial<HookRecommendationCard> | null
  durationSeconds?: number | null
  recentTemplateIds?: string[]
  nonce?: string | number | null
  limit?: number
}

export type CultureBorrowingRecommendationCard = {
  templateId: string
  nameCn: string
  whySelected?: string[]
  cultureMotifId?: string
  visualRenderProfileId?: string
  shotPrimitiveIds?: string[]
  presentationSignature: string
  hookScope: CultureBorrowingScope
  categoryLabels: string[]
  mechanismLabel: string
  firstFrameIdea: string
  productBridgeLabel: string
  audioLabel: string
  verbalLabel: string
  productTimingLabel: string
  borrowableSymbolsLabel: string
  fusionLabel: string
  symbolPreview: Pick<CultureSymbolBorrowingPackage, "visual" | "motion" | "audio" | "verbal">
  recommendedDurationSec: number
  productDependency: CultureBorrowingTemplate["productDependency"]
  score: number
}

type EnrichedCultureBorrowingTemplate = CultureBorrowingTemplate & {
  cultureMotifId?: string
  visualRenderProfileId?: string
  shotPrimitiveIds?: string[]
}

export type HookLibrarySnapshot = {
  id: string
  snapshotKey: string
  resourceText: string
  resourceJson?: string | null
  patternCount: number
  playbookCount: number
  referenceCount: number
  observationCount: number
  generatedAt?: string | null
}

export type HookRecommendationRequest = {
  productCategory?: string | null
  coreSellingPoints?: string[]
  targetAudience?: string[]
  historicalPatternIds?: string[]
  recentPatternIds?: string[]
  nonce?: string | number | null
  limit?: number
  hookScope?: "product_related" | "product_independent"
}

export type HookRecommendationCard = {
  patternCardId: string
  hookScope: "product_related" | "product_independent"
  hookType: string
  subType: string
  hookTypeLabel?: string
  subTypeLabel?: string
  categoryId?: string | null
  categoryLabel?: string | null
  moodLabel?: string | null
  patternName?: string
  audienceFit?: string[]
  scopeLabel?: string
  captureLabel?: string
  recoveryRuleLabel?: string
  attentionObjectiveLabel?: string
  openingSignalLabel?: string
  productFreedomLabel?: string
  displayName: string
  reason: string
  exampleStructure: string
  recommendedReferenceMode: string
  productRelationType: string
  emotionalPath?: string | null
  stimulationLevel: string
  hasReferenceVideo: boolean
  timeStructure?: unknown
  visualCriteria?: unknown[]
  textCriteria?: unknown[]
  productBridgeRule: string
  score: number
}

export type HookLibraryListParams = Record<string, string | number | boolean | null | undefined>

type JsonObject = Record<string, unknown>

const EXPECTED_EMOTIONAL_PATHS = [
  "tension_to_relief",
  "disgust_to_satisfaction",
  "embarrassment_to_confidence",
  "chaos_to_order",
  "curiosity_to_reveal",
  "conflict_to_resolution",
  "desire_to_projection",
  "shock_to_proof",
] as const

export const HOOK_CATEGORY_LABELS: Record<string, string> = {
  cleaning: "家居清洁",
  kitchen_tools: "厨房工具",
  womenswear: "女装穿搭",
  beauty: "美妆护肤",
  storage_home: "家居收纳",
  food_beverage: "食品饮料",
  personal_care: "个人护理",
  mother_baby: "母婴用品",
  pet: "宠物用品",
  ai_tools: "智能工具",
  education: "教育课程",
  sports_fitness: "运动健身",
}

const HOOK_CATEGORY_ALIASES: Record<string, string[]> = {
  cleaning: ["cleaning", "清洁", "家清", "拖把", "抹布", "去污", "清洗", "洗衣", "家务", "除垢"],
  kitchen_tools: ["kitchen_tools", "厨房", "厨具", "锅具", "刀具", "餐具", "砧板", "烹饪"],
  womenswear: ["womenswear", "女装", "服饰", "穿搭", "衣服", "连衣裙", "上衣", "裤装"],
  beauty: ["beauty", "美妆", "护肤", "彩妆", "口红", "面膜", "精华", "底妆"],
  storage_home: ["storage_home", "收纳", "整理", "置物", "家居", "衣柜", "柜子"],
  food_beverage: ["food_beverage", "食品", "饮料", "零食", "咖啡", "茶饮", "冲饮", "即食"],
  personal_care: ["personal_care", "个护", "个人护理", "口腔", "牙膏", "牙刷", "漱口", "洗发", "护发", "沐浴", "身体护理", "香氛"],
  mother_baby: ["mother_baby", "母婴", "婴儿", "宝宝", "奶瓶", "纸尿裤", "儿童"],
  pet: ["pet", "宠物", "猫", "狗", "猫粮", "狗粮", "铲屎"],
  ai_tools: ["ai_tools", "ai工具", "ai 工具", "软件", "效率工具", "自动化", "SaaS"],
  education: ["education", "教育", "课程", "学习", "培训", "知识付费"],
  sports_fitness: ["sports_fitness", "运动", "健身", "瑜伽", "跑步", "户外"],
}

export const HOOK_TYPE_LABELS: Record<string, string> = {
  H1: "感官拦截",
  H2: "高刺激冲突",
  H3: "好奇缺口",
  H4: "自我相关",
  H5: "结果证明",
  H6: "社交信号",
  H7: "文化识别",
}

export const HOOK_SUBTYPE_LABELS: Record<string, string> = {
  before_after: "前后对比",
  before_reveal: "揭晓前一秒",
  color_shock: "色彩冲击",
  comment_overlay: "评论钩子",
  conflict_shock: "冲突瞬间",
  counterintuitive_claim: "反常识声明",
  crowd_reaction: "群体反应",
  daily_scene: "日常场景",
  audience_scene_callout: "场景化人群点名",
  danger_threshold: "危险临界点",
  direct_gaze: "直视镜头",
  disgust_trigger: "厌恶触发",
  era_style: "年代风格",
  freeze_frame: "冻结画面",
  gaze_cue: "视线引导",
  genre_cold_open: "类型片开场",
  hidden_cause: "隐藏原因",
  color_collision: "色彩错位",
  sensory_macro_asymmetry: "微距感官反差",
  asmr_interrupt: "ASMR 打断",
  sound_cut: "突然静音",
  texture_proof: "质地证明",
  smell_cue_reaction: "气味反应",
  object_scale_surprise: "尺度惊讶",
  micro_motion_loop: "微动作循环",
  haptic_pop: "触感爆点",
  visual_static_break: "静帧打断",
  material_edge_reveal: "材质边界揭示",
  rhythm_cut: "节奏切断",
  lens_interrupt: "镜头遮挡揭示",
  scale_snap: "尺度瞬变",
  micro_disaster: "微型灾难",
  near_miss: "差点出事",
  public_private_flip: "私事公开化",
  routine_break: "流程中断",
  social_time_pressure: "社交时间压力",
  object_betrayal: "物件背叛",
  awkward_pause: "尴尬停顿",
  threshold_interruption: "临界打断",
  room_goes_quiet: "全场安静",
  wrong_item_panic: "拿错/带错惊慌",
  resource_spillover: "资源溢出",
  companion_reaction_escalation: "同伴反应升级",
  interruption_callout: "打断式点名",
  task_timer_trap: "任务计时陷阱",
  receipt_mystery: "票据悬念",
  comment_answer_gap: "评论答疑缺口",
  hidden_cost_math: "隐藏成本计算",
  test_reversal: "测试反转",
  unfinished_sentence: "半句悬念",
  result_first_gap: "结果先行缺口",
  masked_reveal: "遮挡揭晓",
  not_what_it_looks_like: "不是你想的那样",
  proof_without_context: "无上下文证明",
  two_choice_gap: "二选一缺口",
  negative_space_question: "留白提问",
  reverse_order_demo: "倒序演示",
  hidden_ingredient_reveal: "隐藏成分/部件揭示",
  future_pacing_gap: "近未来缺口",
  identity_callout: "身份点名",
  demographic_callout: "人群点名",
  situation_callout: "场景点名",
  routine_mirror: "日常镜像",
  role_pressure: "角色压力",
  receipt_proof: "票据证明",
  one_action_proof: "单动作证明",
  process_trace: "过程痕迹",
  side_by_side_truth: "并排真相",
  macro_evidence: "微距证据",
  stress_test_soft: "轻压力测试",
  value_stack_visual: "价值摊开",
  time_lapse_compression: "时间压缩",
  checklist_proof: "清单证明",
  use_case_stack: "使用场景堆叠",
  durability_moment: "耐用性瞬间",
  mini_before_after: "微型前后对比",
  ui_state_change: "界面状态变化",
  sensory_reaction_proof: "感官反应证明",
  creator_reply: "创作者回复",
  comment_challenge: "评论挑战",
  peer_steal: "朋友抢先拿走",
  live_room_energy: "直播间节奏",
  skeptical_friend: "怀疑型朋友",
  group_vote: "群体投票",
  duet_reaction: "分屏反应",
  social_receipt: "社交凭证",
  roommate_reaction: "室友/同伴反应",
  customer_objection_reply: "客户异议回复",
  comment_section_standoff: "评论区对峙",
  building_in_public: "公开构建",
  family_table_test: "家庭餐桌测试",
  crowd_waits_for_answer: "众人等待答案",
  nostalgia_reset: "怀旧重启",
  local_flavour: "本地风味",
  surreal_silliness: "超现实好笑",
  platform_native_bit: "平台原生段子",
  game_quest_logic: "游戏任务逻辑",
  office_core: "办公室语法",
  photobooth_retro: "复古拍立得",
  mini_docu_coldopen: "迷你纪录片冷开场",
  reality_show_confessional: "真人秀告白",
  micro_documentary: "微纪录片",
  retro_interface_reset: "复古界面重启",
  quest_ui_overlay: "任务 UI 叠层",
  meme_format_remix: "梗格式改写",
  aesthetic_subculture_code: "审美亚文化识别",
  loss_aversion: "损失规避",
  meme_structure: "梗结构",
  mistake_reminder: "错误提醒",
  motion_shock: "动作冲击",
  mystery_result: "结果悬念",
  pain_anticipation: "痛点预期",
  pain_point_callout: "痛点点名",
  parody_structure: "戏仿结构",
  platform_grammar: "平台语法",
  product_first_demo: "产品先出场",
  proof_closeup: "证据近景",
  result_compression: "结果压缩",
  sensory_overload: "感官过载",
  shocked_face: "震惊表情",
  social_embarrassment: "社交尴尬",
  social_proof: "社交证明",
  sound_hit: "声音重击",
  symbolic_object_pair: "符号物件对照",
  taboo_hint: "禁忌暗示",
  testimonial_line: "证言开场",
  unfinished_action: "未完成动作",
  visual_contrast: "视觉反差",
}

const HOOK_RELATION_LABELS: Record<string, string> = {
  direct: "产品直接出场",
  problem_first: "先呈现问题",
  conflict_first: "先呈现冲突",
  emotion_first: "先触发情绪",
  symbol_first: "先抛出符号",
  pure_decoy_observation: "先用观察拦截",
}

const HOOK_MOOD_LABELS: Record<string, string> = {
  tension_to_relief: "紧张到松弛",
  disgust_to_satisfaction: "厌恶到爽感",
  embarrassment_to_confidence: "尴尬到自信",
  chaos_to_order: "混乱到秩序",
  curiosity_to_reveal: "好奇到揭晓",
  conflict_to_resolution: "冲突到解决",
  desire_to_projection: "欲望到投射",
  shock_to_proof: "冲击到证明",
}

const HOOK_SCOPE_LABELS: Record<HookPatternCard["hookScope"], string> = {
  product_related: "相关钩子",
  product_independent: "强刺激钩子",
}

const STIMULATION_LABELS: Record<string, string> = {
  S0: "低刺激",
  S1: "中刺激",
  S2: "强刺激",
  S3: "高风险刺激",
}

export type HookAttentionProfile = {
  hookType: string
  shortLabel: string
  attentionObjective: string
  openingSignal: string
  tensionEngine: string
  productRole: string
  productTiming: string
  visualGrammar: string
  audioGrammar: string
  verbalGrammar: string
  avoidSameness: string
}

export const HOOK_ATTENTION_PROFILES: Record<string, HookAttentionProfile> = {
  H1: {
    hookType: "H1",
    shortLabel: "感官打断",
    attentionObjective: "用颜色、声音、触感、尺度或冻结感直接打断滑动惯性",
    openingSignal: "0-1 秒先给一个可感知的异常，不解释、不讲道理",
    tensionEngine: "持续放大感官不适、爽感预期或视觉错位",
    productRole: "商品可以只是异常来源、答案或结尾校准物，不必一开始绑定",
    productTiming: "0-3.5 秒均可，优先保证第一秒的感官断点",
    visualGrammar: "极近景、色块冲击、材质反差、突然冻结、错位物件",
    audioGrammar: "短促断音、近距离拟音、突然静音、物体轻响",
    verbalGrammar: "少说话，用一两个词制造感官判断",
    avoidSameness: "不要写成痛点说明或普通商品演示",
  },
  H2: {
    hookType: "H2",
    shortLabel: "冲突捕获",
    attentionObjective: "用社交尴尬、误会、对峙、临界点或轻度混乱制造即时停留",
    openingSignal: "0-1 秒先出现人和人、人和物之间的冲突关系",
    tensionEngine: "让观众想知道冲突为什么发生、下一秒会不会失控",
    productRole: "商品可以晚出现，作为冲突原因、反差答案或救场线索",
    productTiming: "强刺激可结尾短暂出现，相关钩子可 2-4 秒回收",
    visualGrammar: "表情反应、旁人转头、手部停在半空、物件即将翻车",
    audioGrammar: "环境突然安静、倒吸气、短促反应声、桌面轻撞",
    verbalGrammar: "一句像现场反应的话，不做解释型广告口播",
    avoidSameness: "不要把冲突马上解释成产品卖点",
  },
  H3: {
    hookType: "H3",
    shortLabel: "缺口悬念",
    attentionObjective: "用未完成动作、隐藏答案、反常识判断和遮挡揭晓制造继续观看",
    openingSignal: "0-1 秒只露出问题的一半或动作的临界一帧",
    tensionEngine: "延迟答案，给线索但不马上揭底",
    productRole: "商品通常作为最后的答案、钥匙、线索或反转原因出现",
    productTiming: "2.5 秒后更自然，前半段优先保留悬念",
    visualGrammar: "遮挡、半露、门缝、动作暂停、镜头不完整",
    audioGrammar: "滴答、停顿、轻微拉近声、答案前静音",
    verbalGrammar: "反问、倒计时、先别眨眼、答案不在你以为的地方",
    avoidSameness: "不要在第一秒就把商品和答案都讲完",
  },
  H4: {
    hookType: "H4",
    shortLabel: "身份命中",
    attentionObjective: "让特定人群觉得这个瞬间说的是自己",
    openingSignal: "0-1 秒先给身份、场景、习惯或错误动作的镜像",
    tensionEngine: "把用户自己的误区、尴尬、损失或日常重复动作具象化",
    productRole: "商品是用户自我校准后的工具，不是开场主角",
    productTiming: "1.5-3.5 秒可以出现，但必须先命中人群",
    visualGrammar: "第一视角、镜前、通勤/家庭/办公日常、手上习惯动作",
    audioGrammar: "自然环境声、朋友提醒、短句点名",
    verbalGrammar: "如果你也……、是不是每次都……、这类人先停一下",
    avoidSameness: "不要写成泛泛目标人群描述",
  },
  H5: {
    hookType: "H5",
    shortLabel: "证据诱饵",
    attentionObjective: "先给结果、证据、痕迹或局部证明，让观众想知道怎么来的",
    openingSignal: "0-1 秒先上证据，不先上过程",
    tensionEngine: "用近景、对比或局部结果制造验证欲",
    productRole: "商品必须成为证据来源或验证路径，比其他类型更可早出现",
    productTiming: "1-3 秒较自然，但仍只做 hook，不做完整转化",
    visualGrammar: "证据近景、结果一角、局部对比、可验证痕迹",
    audioGrammar: "轻微揭晓声、物件摩擦、镜头拉焦声",
    verbalGrammar: "先看这里、这不是滤镜、结果先放这",
    avoidSameness: "不要写成口头承诺，证据要靠画面",
  },
  H6: {
    hookType: "H6",
    shortLabel: "社交压力",
    attentionObjective: "用围观、评论分裂、他人反应或直视镜头制造被点名感",
    openingSignal: "0-1 秒先出现他人反应、镜头凝视或群体注意力",
    tensionEngine: "让观众想站队、反驳、确认别人为什么这样反应",
    productRole: "商品是争议对象、被围观对象或反应触发器，可以晚一点出现",
    productTiming: "2-5 秒均可，前半段先建立社交场",
    visualGrammar: "直视镜头、旁人回头、评论式构图、群体停顿",
    audioGrammar: "低声议论、倒吸气、短促笑声、环境突然变静",
    verbalGrammar: "评论区先别吵、你们看到了吗、大家都在看这里",
    avoidSameness: "不要变成普通单人口播介绍",
  },
  H7: {
    hookType: "H7",
    shortLabel: "文化识别",
    attentionObjective: "用熟悉的类型片、年代、平台梗或符号化文化语法触发识别",
    openingSignal: "0-1 秒先让观众识别一种熟悉语法，但不复制具体 IP",
    tensionEngine: "用文化记忆里的动作、声音、关系或场景制造期待",
    productRole: "商品是文化语法里的道具、证据、任务物或错位对象",
    productTiming: "由文化语法决定，可早可晚，但必须自然进入",
    visualGrammar: "类型片构图、年代质感、游戏关卡、综艺转身、仪式符号",
    audioGrammar: "类型化但不侵权的声音语法、停顿、鼓点、转场声",
    verbalGrammar: "符号化台词语气，不使用原台词或专名",
    avoidSameness: "不要只把文化借势写成视觉风格",
  },
}

export function getHookAttentionProfile(hookType?: string | null) {
  return hookType ? HOOK_ATTENTION_PROFILES[hookType] || null : null
}

const DATA_ROOT = path.join(process.cwd(), "data", "hook-studio")
const RESOURCE_ROOT = path.join(DATA_ROOT, "resources")

let cachedLibrary: HookLibraryData | null = null
let cachedLibrarySignature: string | null = null

type HookLibraryData = {
  patterns: HookPatternCard[]
  playbooks: HookCategoryPlaybook[]
  references: HookReferenceAsset[]
  observations: HookTrendObservation[]
  cultureSymbols: CultureSymbolEntry[]
  cultureTemplates: CultureBorrowingTemplate[]
  fewShots: HookGenerationFewShot[]
}

function readJson<T>(filePath: string): T {
  return JSON.parse(readFileSync(filePath, "utf8")) as T
}

function readCatalog() {
  return readJson<JsonObject>(path.join(DATA_ROOT, "HOOK_RESOURCE_CATALOG.json"))
}

function readMoodLibrary() {
  const payload = readJson<{ mood_paths?: HookMoodDefinition[] }>(path.join(RESOURCE_ROOT, "hook_mood_library.json"))
  return payload.mood_paths || []
}

function readJsonLines(filePath: string): JsonObject[] {
  return readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line) as JsonObject)
}

function fileSignature(filePath: string) {
  const stat = statSync(filePath)
  return `${filePath}:${stat.mtimeMs}:${stat.size}`
}

function directoryFiles(dirPath: string, extension: string) {
  try {
    return readdirSync(dirPath)
      .filter((fileName) => fileName.endsWith(extension))
      .sort()
      .map((fileName) => path.join(dirPath, fileName))
  } catch {
    return []
  }
}

function directoryFileSignatures(dirPath: string, extension: string) {
  return directoryFiles(dirPath, extension).map(fileSignature)
}

function currentLibrarySignature() {
  const patternRoot = path.join(RESOURCE_ROOT, "pattern_cards")
  const categoryRoot = path.join(RESOURCE_ROOT, "category_playbooks")
  const fewShotRoot = path.join(RESOURCE_ROOT, "few_shots")
  return [
    ...readdirSync(patternRoot).filter((fileName) => fileName.endsWith(".jsonl")).sort().map((fileName) => fileSignature(path.join(patternRoot, fileName))),
    ...readdirSync(categoryRoot).filter((fileName) => fileName.endsWith(".json")).sort().map((fileName) => fileSignature(path.join(categoryRoot, fileName))),
    ...directoryFileSignatures(fewShotRoot, ".json"),
    fileSignature(path.join(RESOURCE_ROOT, "reference_tag_dictionary.json")),
    fileSignature(path.join(RESOURCE_ROOT, "trend_observations", "v0_trend_observations.jsonl")),
    fileSignature(path.join(DATA_ROOT, "culture_symbol_entries.jsonl")),
    fileSignature(path.join(DATA_ROOT, "culture_hook_templates.jsonl")),
  ].join("|")
}

function text(node: JsonObject, key: string) {
  const value = node[key]
  return value === undefined || value === null ? null : String(value)
}

function jsonText(node: JsonObject, key: string, fallback: unknown) {
  const value = node[key] === undefined || node[key] === null ? fallback : node[key]
  return JSON.stringify(value)
}

function asNumber(node: JsonObject, key: string) {
  const value = node[key]
  if (typeof value === "number") return value
  if (typeof value === "string" && value.trim()) return Number(value)
  return null
}

function nowIso() {
  return new Date().toISOString()
}

function normalizePattern(node: JsonObject): HookPatternCard {
  const status = text(node, "status") || "active"
  const rawScope = text(node, "hook_scope") || text(node, "hookScope") || "product_related"
  return {
    id: text(node, "card_id") || "",
    hookScope: rawScope === "product_independent" ? "product_independent" : "product_related",
    patternName: text(node, "pattern_name") || "",
    hookType: text(node, "hook_type") || "",
    subType: text(node, "sub_type") || "",
    productRelationType: text(node, "product_relation_type") || "",
    narrativeFunction: text(node, "narrative_function"),
    oneSentenceLogic: text(node, "one_sentence_logic") || "",
    applicableCategoriesJson: jsonText(node, "applicable_categories", []),
    categoryFitWeightJson: jsonText(node, "category_fit_weight", {}),
    audienceFitJson: jsonText(node, "audience_fit", []),
    sellingPointFitJson: jsonText(node, "selling_point_fit", []),
    emotionalPath: text(node, "emotional_path"),
    stimulationLevel: text(node, "stimulation_level") || "S0",
    timeStructureJson: jsonText(node, "time_structure", {}),
    visualCriteriaJson: jsonText(node, "visual_criteria", []),
    motionCriteriaJson: jsonText(node, "motion_criteria", []),
    audioCriteriaJson: jsonText(node, "audio_criteria", []),
    textCriteriaJson: jsonText(node, "text_criteria", []),
    productBridgeRule: text(node, "product_bridge_rule") || "",
    referenceRequirementsJson: jsonText(node, "reference_requirements", []),
    recommendedGenerationMode: text(node, "recommended_generation_mode") || "",
    modelFeasibility: text(node, "model_feasibility") || "",
    promptSlotsJson: jsonText(node, "prompt_slots", {}),
    sampleConceptTemplatesJson: jsonText(node, "sample_concept_templates", []),
    sourceObservationsJson: jsonText(node, "source_observations", []),
    sourceMetadataJson: jsonText(node, "source_metadata", {}),
    updateHistoryJson: jsonText(node, "update_history", []),
    status,
    createdAt: "2026-05-13T00:00:00.000Z",
    updatedAt: "2026-05-13T00:00:00.000Z",
    approvedAt: status === "active" ? "2026-05-13T00:00:00.000Z" : null,
  }
}

function normalizePlaybook(node: JsonObject): HookCategoryPlaybook {
  return {
    id: text(node, "id") || text(node, "category_id") || "",
    categoryId: text(node, "category_id") || "",
    categoryName: text(node, "category_name") || "",
    recommendedHooksJson: jsonText(node, "recommended_hooks", []),
    exploratoryHooksJson: jsonText(node, "exploratory_hooks", []),
    highArousalHooksJson: jsonText(node, "high_arousal_hooks", []),
    conflictNarrativeHooksJson: jsonText(node, "conflict_narrative_hooks", []),
    culturalHooksJson: jsonText(node, "cultural_hooks", []),
    nonFitObservationsJson: jsonText(node, "non_fit_observations", []),
    priorityMatrixJson: jsonText(node, "priority_matrix", {}),
    sourceMetadataJson: jsonText(node, "source_metadata", {}),
    status: text(node, "status") || "active",
    updatedAt: "2026-05-13T00:00:00.000Z",
  }
}

function normalizeReference(node: JsonObject): HookReferenceAsset {
  return {
    id: text(node, "asset_id") || "",
    assetType: text(node, "asset_type") || "",
    sourceType: text(node, "source_type") || "",
    referenceRole: text(node, "reference_role") || "",
    sourceUrl: text(node, "source_url") || text(node, "url") || null,
    hookTypeFitJson: jsonText(node, "hook_type_fit", []),
    categoryFitJson: jsonText(node, "category_fit", []),
    motionTagsJson: jsonText(node, "motion_tags", []),
    styleTagsJson: jsonText(node, "style_tags", []),
    generationModeFitJson: jsonText(node, "generation_mode_fit", []),
    linkedPatternCardsJson: jsonText(node, "linked_pattern_cards", []),
    usageCount: asNumber(node, "usage_count") || 0,
    successNotes: text(node, "success_notes"),
    status: text(node, "status") || "active",
    updatedAt: "2026-05-13T00:00:00.000Z",
  }
}

function normalizeObservation(node: JsonObject): HookTrendObservation {
  const status = text(node, "status") || "parsed"
  return {
    id: text(node, "observation_id") || "",
    sourcePlatform: text(node, "source_platform") || "",
    observedCategory: text(node, "observed_category"),
    first5sSummary: text(node, "first_5s_summary") || "",
    detectedHookTypeJson: jsonText(node, "detected_hook_type", []),
    productRelationType: text(node, "product_relation_type"),
    narrativeFunction: text(node, "narrative_function"),
    emotionPath: text(node, "emotion_path"),
    dominantModality: text(node, "dominant_modality"),
    keyVisualEvent: text(node, "key_visual_event"),
    keyAudioEvent: text(node, "key_audio_event"),
    keyText: text(node, "key_text"),
    productAppearanceTime: asNumber(node, "product_appearance_time"),
    distilledPatternCandidate: text(node, "distilled_pattern_candidate"),
    sourceMetadataJson: jsonText(node, "source_metadata", {}),
    status,
    updatedAt: "2026-05-13T00:00:00.000Z",
    approvedAt: status === "approved" ? "2026-05-13T00:00:00.000Z" : null,
  }
}

function arrayText(node: JsonObject, key: string) {
  const value = node[key]
  return Array.isArray(value) ? value.map((item) => String(item ?? "").trim()).filter(Boolean) : []
}

function arrayFromUnknown(value: unknown) {
  return Array.isArray(value) ? value.map((item) => String(item ?? "").trim()).filter(Boolean) : []
}

function normalizeSymbolBorrowingPackage(value: unknown): CultureSymbolBorrowingPackage {
  const node = value && typeof value === "object" && !Array.isArray(value) ? value as JsonObject : {}
  return {
    visual: arrayFromUnknown(node.visual),
    style: arrayFromUnknown(node.style),
    motion: arrayFromUnknown(node.motion),
    audio: arrayFromUnknown(node.audio),
    verbal: arrayFromUnknown(node.verbal),
    narrative: arrayFromUnknown(node.narrative),
    productBridge: arrayFromUnknown(node.product_bridge ?? node.productBridge),
    firstFrame: arrayFromUnknown(node.first_frame ?? node.firstFrame),
    video: arrayFromUnknown(node.video),
  }
}

function normalizeProductDependency(value: string | null): CultureBorrowingTemplate["productDependency"] {
  if (value === "none" || value === "weak" || value === "medium" || value === "strong") return value
  return "weak"
}

function normalizeCultureScope(value: string | null): CultureBorrowingScope {
  if (value === "product_independent" || value === "product_related" || value === "culture_borrowing") return value
  return "culture_borrowing"
}

function normalizeProductAppearanceTiming(value: string | null): CultureBorrowingTemplate["requiredProductAppearanceTiming"] {
  if (value === "0-1s" || value === "1-3s" || value === "3-5s" || value === "late_glimpse" || value === "optional") return value
  return "optional"
}

function normalizeCultureSymbol(node: JsonObject): CultureSymbolEntry {
  const exampleScript = node.example_script && typeof node.example_script === "object"
    ? node.example_script as JsonObject
    : {}
  return {
    entryId: text(node, "entry_id") || "",
    nameCn: text(node, "name_cn") || "",
    categoryL1: text(node, "category_l1") || "",
    categoryL2: text(node, "category_l2") || "",
    symbolType: text(node, "symbol_type") || "",
    sourceFamily: text(node, "source_family") || "",
    borrowingLevel: text(node, "borrowing_level") || "",
    symbolizationRule: text(node, "symbolization_rule") || "",
    doNotUse: arrayText(node, "do_not_use"),
    visualSlots: arrayText(node, "visual_slots"),
    styleSlots: arrayText(node, "style_slots"),
    motionSlots: arrayText(node, "motion_slots"),
    audioSlots: arrayText(node, "audio_slots"),
    verbalSlots: arrayText(node, "verbal_slots"),
    hookMechanisms: arrayText(node, "hook_mechanisms"),
    stimulationLevel: Number(node.stimulation_level || 0),
    productDependency: normalizeProductDependency(text(node, "product_dependency")),
    bridgeType: text(node, "bridge_type") || "",
    firstFramePromptSlots: arrayText(node, "first_frame_prompt_slots"),
    videoPromptSlots: arrayText(node, "video_prompt_slots"),
    exampleScript: {
      voiceoverCn: text(exampleScript, "voiceover_cn") || undefined,
      overlayCn: arrayText(exampleScript, "overlay_cn"),
      soundEffectCn: arrayText(exampleScript, "sound_effect_cn"),
    },
    applicableCategories: arrayText(node, "applicable_categories"),
    applicableSellingPoints: arrayText(node, "applicable_selling_points"),
    tags: arrayText(node, "tags"),
  }
}

function normalizeCultureTemplate(node: JsonObject): CultureBorrowingTemplate {
  return {
    templateId: text(node, "template_id") || "",
    nameCn: text(node, "name_cn") || "",
    hookScope: normalizeCultureScope(text(node, "hook_scope")),
    cultureMechanism: arrayText(node, "culture_mechanism"),
    symbolEntryIds: arrayText(node, "symbol_entry_ids"),
    recommendedDurationSec: Number(node.recommended_duration_sec || 4),
    openingCapture: text(node, "opening_capture") || "",
    attentionEscalation: text(node, "attention_escalation") || "",
    productBridgeRule: text(node, "product_bridge_rule") || "",
    firstFrameFormula: text(node, "first_frame_formula") || "",
    finalVideoPromptFormulaCn: text(node, "final_video_prompt_formula_cn") || "",
    audioFormulaCn: text(node, "audio_formula_cn") || "",
    verbalFormulaCn: text(node, "verbal_formula_cn") || "",
    symbolBorrowing: normalizeSymbolBorrowingPackage(node.symbol_borrowing ?? node.symbolBorrowing),
    fusionDirectives: arrayText(node, "fusion_directives"),
    applicableCategories: arrayText(node, "applicable_categories"),
    productDependency: normalizeProductDependency(text(node, "product_dependency")),
    requiredProductAppearanceTiming: normalizeProductAppearanceTiming(text(node, "required_product_appearance_timing")),
    tags: arrayText(node, "tags"),
  }
}

function parseJsonArray(value?: string | null) {
  if (!value) return []
  try {
    const parsed = JSON.parse(value) as unknown
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function parseJsonRecord(value?: string | null) {
  if (!value) return {}
  try {
    const parsed = JSON.parse(value) as unknown
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : {}
  } catch {
    return {}
  }
}

function parseJsonValue(value?: string | null): unknown {
  if (!value) return null
  try {
    return JSON.parse(value) as unknown
  } catch {
    return value
  }
}

export function normalizeHookCategoryId(value?: string | number | boolean | null) {
  const raw = String(value ?? "").trim()
  if (!raw) return ""
  const normalized = raw.toLowerCase().replace(/\s+/g, "_")
  if (HOOK_CATEGORY_LABELS[normalized]) return normalized

  for (const [categoryId, aliases] of Object.entries(HOOK_CATEGORY_ALIASES)) {
    if (aliases.some((alias) => normalized.includes(alias.toLowerCase().replace(/\s+/g, "_")) || raw.includes(alias))) {
      return categoryId
    }
  }

  return ""
}

function hookCategoryLabel(categoryId?: string | null) {
  return categoryId ? HOOK_CATEGORY_LABELS[categoryId] || "通用品类" : "通用品类"
}

function hookTypeLabel(hookType?: string | null) {
  return hookType ? HOOK_TYPE_LABELS[hookType] || "注意力机制" : "注意力机制"
}

function hookSubTypeLabel(subType?: string | null) {
  return subType ? HOOK_SUBTYPE_LABELS[subType] || "钩子语法" : "钩子语法"
}

function hookMoodLabel(moodId?: string | null) {
  return moodId ? HOOK_MOOD_LABELS[moodId] || null : null
}

function hookRelationLabel(relation?: string | null) {
  return relation ? HOOK_RELATION_LABELS[relation] || "自然承接产品" : "自然承接产品"
}

function patternCategories(row: HookPatternCard) {
  return parseJsonArray(row.applicableCategoriesJson).map(String)
}

function displayCategoryForPattern(row: HookPatternCard, requestedCategory?: string | null) {
  const categories = patternCategories(row)
  const normalizedRequest = normalizeHookCategoryId(requestedCategory)
  if (normalizedRequest && categories.includes(normalizedRequest)) return normalizedRequest
  return categories[0] || normalizedRequest || "general"
}

function patternScore(row: HookPatternCard, request: HookRecommendationRequest = {}) {
  if (request.hookScope === "product_independent" || row.hookScope === "product_independent") {
    const historical = new Set([...(request.historicalPatternIds || []), ...(request.recentPatternIds || [])])
    const historyPenalty = historical.has(row.id) ? 0.32 : 0
    const nonce = String(request.nonce ?? "")
    const jitterSeed = `${nonce}:${row.id}`.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)
    const jitter = nonce ? (jitterSeed % 31) / 1000 : 0
    const stimulationBoost = row.stimulationLevel === "S2" ? 0.11 : row.stimulationLevel === "S1" ? 0.07 : 0.03
    const safeRecoveryBoost = row.productBridgeRule.includes("回收") || row.productBridgeRule.includes("结尾") || row.productBridgeRule.includes("3 秒") ? 0.08 : 0
    return Math.min(Math.max(0.74 + stimulationBoost + safeRecoveryBoost + jitter - historyPenalty, 0.01), 0.99)
  }

  const category = normalizeHookCategoryId(request.productCategory || "")
  const categories = patternCategories(row)
  const categoryFit = !category || categories.includes(category)
  const categoryWeight = Number(parseJsonRecord(row.categoryFitWeightJson)[category] || 0)
  const sellingPointTags = parseJsonArray(row.sellingPointFitJson).map((value) => String(value).toLowerCase())
  const sellingPointFit = (request.coreSellingPoints || []).some((point) => sellingPointTags.some((tag) => point.toLowerCase().includes(tag) || tag.includes(point.toLowerCase())))
  const audienceTags = parseJsonArray(row.audienceFitJson).map((value) => String(value).toLowerCase())
  const audienceFit = (request.targetAudience || []).some((audience) => audienceTags.some((tag) => audience.toLowerCase().includes(tag) || tag.includes(audience.toLowerCase())))
  const exactCategorySignal = category && categories.includes(category) ? 0.12 : 0
  const historical = new Set([...(request.historicalPatternIds || []), ...(request.recentPatternIds || [])])
  const historyPenalty = historical.has(row.id) ? 0.34 : 0
  const nonce = String(request.nonce ?? "")
  const jitterSeed = `${nonce}:${row.id}`.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)
  const jitter = nonce ? (jitterSeed % 23) / 1000 : 0

  return Math.min(
    Math.max((categoryWeight || (categoryFit ? 0.56 : 0.24)) + (sellingPointFit ? 0.08 : 0) + (audienceFit ? 0.04 : 0) + exactCategorySignal + jitter - historyPenalty, 0.01),
    0.99
  )
}

function patternToRecommendationCard(
  row: HookPatternCard,
  references: HookReferenceAsset[],
  request: HookRecommendationRequest = {},
): HookRecommendationCard {
  const categoryId = displayCategoryForPattern(row, request.productCategory)
  const categoryLabel = hookCategoryLabel(categoryId)
  const typeLabel = hookTypeLabel(row.hookType)
  const subTypeLabel = hookSubTypeLabel(row.subType)
  const moodLabel = hookMoodLabel(row.emotionalPath)
  const referenceVideoPatternIds = new Set(
    references
      .filter((asset) => asset.assetType === "video" && typeof asset.sourceUrl === "string" && /^https?:\/\//i.test(asset.sourceUrl))
      .flatMap((asset) => parseJsonArray(asset.linkedPatternCardsJson).map(String))
  )
  const score = patternScore(row, request)
  const requestCategory = normalizeHookCategoryId(request.productCategory || "")
  const categoryMatched = !!requestCategory && patternCategories(row).includes(requestCategory)
  const isPureHook = row.hookScope === "product_independent"
  const scopeLabel = HOOK_SCOPE_LABELS[row.hookScope]
  const attentionProfile = getHookAttentionProfile(row.hookType)
  const captureLabel = attentionProfile?.shortLabel || STIMULATION_LABELS[row.stimulationLevel] || "注意力拦截"
  const productFreedomLabel = attentionProfile?.productTiming || (isPureHook ? "商品可晚出现" : "商品 3 秒内回收")

  return {
    patternCardId: row.id,
    hookScope: row.hookScope,
    hookType: row.hookType,
    subType: row.subType,
    hookTypeLabel: typeLabel,
    subTypeLabel,
    categoryId,
    categoryLabel,
    moodLabel,
    patternName: row.patternName,
    audienceFit: parseJsonArray(row.audienceFitJson).map(String),
    scopeLabel,
    captureLabel,
    recoveryRuleLabel: productFreedomLabel,
    attentionObjectiveLabel: attentionProfile?.attentionObjective,
    openingSignalLabel: attentionProfile?.openingSignal,
    productFreedomLabel,
    displayName: isPureHook ? `${captureLabel} · ${subTypeLabel}` : `${typeLabel} · ${subTypeLabel}`,
    reason: isPureHook
      ? `${attentionProfile?.attentionObjective || `用「${subTypeLabel}」先抢停留`}；商品不必开场绑定，可以在结尾短暂回收。`
      : categoryMatched
      ? `匹配「${categoryLabel}」，但优先服务「${captureLabel}」这种注意力，不强行从商品讲起。`
      : `跨品类备选：用「${captureLabel}」建立独立停滑点，再决定是否回收到商品。`,
    exampleStructure: isPureHook
      ? `${attentionProfile?.openingSignal || `开场先给出「${subTypeLabel}」`}；${attentionProfile?.tensionEngine || "前半段维持好奇"}；${attentionProfile?.productRole || "结尾用商品或结果线索回收"}。`
      : `${attentionProfile?.openingSignal || `开场先给出「${subTypeLabel}」`}；${attentionProfile?.tensionEngine || `随后用${hookRelationLabel(row.productRelationType)}承接`}；${attentionProfile?.productRole || "再决定商品如何进入"}。`,
    recommendedReferenceMode: row.recommendedGenerationMode,
    productRelationType: row.productRelationType,
    emotionalPath: row.emotionalPath,
    stimulationLevel: row.stimulationLevel,
    hasReferenceVideo: referenceVideoPatternIds.has(row.id),
    timeStructure: parseJsonValue(row.timeStructureJson),
    visualCriteria: parseJsonArray(row.visualCriteriaJson),
    textCriteria: parseJsonArray(row.textCriteriaJson),
    productBridgeRule: row.productBridgeRule,
    score,
  }
}

function loadLibrary(): HookLibraryData {
  const signature = currentLibrarySignature()
  if (cachedLibrary && cachedLibrarySignature === signature) return cachedLibrary

  const patternRoot = path.join(RESOURCE_ROOT, "pattern_cards")
  const patterns = readdirSync(patternRoot)
    .filter((fileName) => fileName.endsWith(".jsonl"))
    .sort()
    .flatMap((fileName) => readJsonLines(path.join(patternRoot, fileName)).map(normalizePattern))
  const playbooks = readdirSync(path.join(RESOURCE_ROOT, "category_playbooks"))
    .filter((fileName) => fileName.endsWith(".json"))
    .map((fileName) => normalizePlaybook(readJson<JsonObject>(path.join(RESOURCE_ROOT, "category_playbooks", fileName))))
    .sort((a, b) => a.categoryId.localeCompare(b.categoryId))
  const referenceDictionary = readJson<JsonObject>(path.join(RESOURCE_ROOT, "reference_tag_dictionary.json"))
  const references = ((referenceDictionary.reference_assets as JsonObject[] | undefined) || []).map(normalizeReference)
  const observations = readJsonLines(path.join(RESOURCE_ROOT, "trend_observations", "v0_trend_observations.jsonl")).map(normalizeObservation)
  const cultureSymbols = readJsonLines(path.join(DATA_ROOT, "culture_symbol_entries.jsonl")).map(normalizeCultureSymbol)
  const cultureTemplates = readJsonLines(path.join(DATA_ROOT, "culture_hook_templates.jsonl")).map(normalizeCultureTemplate)
  const fewShotRoot = path.join(RESOURCE_ROOT, "few_shots")
  const fewShots = directoryFiles(fewShotRoot, ".json").flatMap((filePath) => {
    const payload = readJson<{ fewShots?: HookGenerationFewShot[] }>(filePath)
    return payload.fewShots ?? []
  })

  cachedLibrary = { patterns, playbooks, references, observations, cultureSymbols, cultureTemplates, fewShots }
  cachedLibrarySignature = signature
  return cachedLibrary
}

function matches(value: string | null | undefined, filter: string | number | boolean | null | undefined) {
  return !filter || value === String(filter)
}

function includesJsonArray(json: string | null | undefined, filter: string | number | boolean | null | undefined) {
  if (!filter) return true
  return parseJsonArray(json).some((value) => String(value) === String(filter))
}

export function paginate<T>(rows: T[], params: HookLibraryListParams = {}): PaginatedResponse<T> {
  const page = Math.max(Number(params.page ?? 0), 0)
  const size = Math.min(Math.max(Number(params.size ?? 50), 1), 200)
  const start = page * size
  return {
    items: rows.slice(start, start + size),
    page,
    size,
    total: rows.length,
    totalPages: Math.max(Math.ceil(rows.length / size), 1),
  }
}

export function listHookPatternCards(params: HookLibraryListParams = {}) {
  const normalizedCategory = normalizeHookCategoryId(params.category)
  const hookScope = params.hookScope === "product_independent" ? "product_independent" : params.hookScope === "product_related" ? "product_related" : null
  const rows = loadLibrary().patterns.filter((row) => {
    const category = normalizedCategory || params.category
    return (
      (!hookScope || row.hookScope === hookScope) &&
      matches(row.hookType, params.hookType) &&
      matches(row.productRelationType, params.productRelationType) &&
      matches(row.recommendedGenerationMode, params.generationMode) &&
      matches(row.status, params.status) &&
      (hookScope === "product_independent" ? true : includesJsonArray(row.applicableCategoriesJson, category))
    )
  })
  return paginate(rows, params)
}

export function listHookPatternRecommendationCards(params: HookLibraryListParams = {}) {
  const productCategory = normalizeHookCategoryId(params.productCategory || params.category) || String(params.productCategory || params.category || "")
  const hookScope = params.hookScope === "product_independent" ? "product_independent" : "product_related"
  const hookType = String(params.hookType || "")
  const request: HookRecommendationRequest = {
    productCategory,
    limit: Number(params.size ?? 200),
    hookScope,
  }
  const references = loadLibrary().references
  const rows = loadLibrary()
    .patterns
    .filter((row) => row.hookScope === hookScope && (!hookType || row.hookType === hookType))
    .map((row) => patternToRecommendationCard(row, references, request))
    .sort((a, b) => b.score - a.score)
  return paginate(rows, params)
}

const CULTURE_CATEGORY_LABELS = [
  "公共文化母题",
  "现代商业IP符号化",
  "视觉元素",
  "视觉风格",
  "动作剪辑语法",
  "音效声音语法",
  "口播字幕语法",
  "叙事关系脚本",
  "平台梗消费方式",
] as const

function cultureTemplateCategoryLabels(template: CultureBorrowingTemplate, symbols: CultureSymbolEntry[]) {
  const symbolCategories = symbols
    .filter((symbol) => template.symbolEntryIds.includes(symbol.entryId))
    .map((symbol) => symbol.categoryL1)
  const tagCategories = template.tags.filter((tag) => CULTURE_CATEGORY_LABELS.includes(tag as typeof CULTURE_CATEGORY_LABELS[number]))
  return Array.from(new Set([...symbolCategories, ...tagCategories])).filter(Boolean)
}

function cultureCategoryMatchScore(template: CultureBorrowingTemplate, productCategory?: string | null) {
  const normalizedRequest = normalizeHookCategoryId(productCategory || "")
  if (template.applicableCategories.includes("全品类")) return 0.12
  if (!normalizedRequest) return 0.04
  return template.applicableCategories.some((category) => normalizeHookCategoryId(category) === normalizedRequest || category === normalizedRequest)
    ? 0.16
    : 0
}

function cultureScopeScore(template: CultureBorrowingTemplate, hookScope?: "product_related" | "product_independent") {
  if (hookScope === "product_independent") {
    if (template.hookScope === "product_independent") return 0.16
    if (template.hookScope === "culture_borrowing") return 0.12
    return 0.02
  }
  if (template.hookScope === "product_related") return 0.14
  if (template.hookScope === "culture_borrowing") return 0.12
  return 0.04
}

function cultureTimingScore(template: CultureBorrowingTemplate, hookScope?: "product_related" | "product_independent") {
  if (hookScope === "product_independent") {
    return template.requiredProductAppearanceTiming === "late_glimpse" || template.requiredProductAppearanceTiming === "3-5s" || template.requiredProductAppearanceTiming === "optional" ? 0.12 : 0.04
  }
  return template.requiredProductAppearanceTiming === "0-1s" || template.requiredProductAppearanceTiming === "1-3s" ? 0.11 : 0.04
}

function cultureDurationScore(template: CultureBorrowingTemplate, durationSeconds?: number | null) {
  if (!durationSeconds) return 0.03
  const delta = Math.abs(template.recommendedDurationSec - durationSeconds)
  if (delta === 0) return 0.08
  if (delta <= 1) return 0.05
  return 0.01
}

function cultureHookMechanismScore(template: CultureBorrowingTemplate, selectedHook?: Partial<HookRecommendationCard> | null) {
  const source = [
    selectedHook?.hookType,
    selectedHook?.hookTypeLabel,
    selectedHook?.subType,
    selectedHook?.subTypeLabel,
    selectedHook?.displayName,
    ...template.cultureMechanism,
    ...template.tags,
    template.nameCn,
  ].filter(Boolean).join(" ")
  const hookType = selectedHook?.hookType
  if (hookType === "H1" && /(感官|泡泡|ASMR|声音|冲击|近响|色彩)/.test(source)) return 0.11
  if (hookType === "H2" && /(冲突|社死|冻结|倒计时|冲镜|静音|高能)/.test(source)) return 0.11
  if (hookType === "H3" && /(悬念|门缝|侦探|线索|任务|最后|揭示|好奇)/.test(source)) return 0.11
  if (hookType === "H4" && /(家庭|生活|共鸣|人群|用户|反问)/.test(source)) return 0.09
  if (hookType === "H5" && /(证据|证明|结果|血条|反馈|纪实)/.test(source)) return 0.09
  if (hookType === "H6" && /(评论|围观|转身|群体|社交|站队)/.test(source)) return 0.1
  if (hookType === "H7" && /(文化|公堂|醒狮|客栈|复古|民俗|神话|年代)/.test(source)) return 0.13
  return 0.03
}

function cultureSpecificityScore(template: CultureBorrowingTemplate) {
  const source = [
    template.templateId,
    template.nameCn,
    ...template.tags,
    ...template.cultureMechanism,
  ].join(" ")
  let score = 0
  if (template.templateId.startsWith("cb_template_public_")) score += 0.1
  if (template.templateId.startsWith("cb_template_symbolic_") || template.templateId.startsWith("cb_template_platform_")) score += 0.085
  if (/(西游|三国|白蛇|山海|木兰|水浒|红楼|包公|醒狮|龙舟|门神|聊斋|武侠|李白|嫦娥|龙凤|空城|桃园|照妖镜|龙宫|长安|灯谜|新闻|电视|演播室|现场连线|访谈|沙发|讲坛|讲台|消费调查|天气预报|财经|体育解说|民生热线|科教纪录片|节庆晚会|春晚|开门红|电视购物|鉴宝|美食纪录片|法治调解|公开课|田间采访|回访热线|海底童趣|万能道具|宫墙|家庭客厅|霓虹|时间循环|冰封|市井高手|侦探|开团|缩圈|盲选|短剧|直播|家庭群|像素|血条|任务墙|脱口秀|辩论|打工人|发疯文学|真香|公堂|综艺|游戏)/.test(source)) score += 0.05
  if (/(真实使用场景|视觉元素|动作剪辑语法)/.test(template.nameCn)) score -= 0.025
  return score
}

function cultureTemplateScore(template: CultureBorrowingTemplate, request: CultureBorrowingRecommendationRequest = {}) {
  const historyPenalty = request.recentTemplateIds?.includes(template.templateId) ? 0.28 : 0
  const nonce = String(request.nonce ?? "")
  const jitterSeed = `${nonce}:${template.templateId}`.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)
  const jitter = nonce ? (jitterSeed % 29) / 1000 : 0
  const productDependencyBoost = template.productDependency === "weak" || template.productDependency === "medium" ? 0.04 : 0.02
  return Math.min(Math.max(
    0.48
    + cultureCategoryMatchScore(template, request.productCategory)
    + cultureScopeScore(template, request.hookScope)
    + cultureTimingScore(template, request.hookScope)
    + cultureDurationScore(template, request.durationSeconds)
    + cultureHookMechanismScore(template, request.selectedHook)
    + cultureSpecificityScore(template)
    + productDependencyBoost
    + jitter
    - historyPenalty,
    0.01,
  ), 0.99)
}

function productTimingLabel(timing: CultureBorrowingTemplate["requiredProductAppearanceTiming"]) {
  if (timing === "0-1s") return "商品 0-1 秒出现"
  if (timing === "1-3s") return "商品 1-3 秒出现"
  if (timing === "3-5s") return "商品 3-5 秒出现"
  if (timing === "late_glimpse") return "结尾短暂露出商品"
  return "商品出现时机可调整"
}

function uniqueCompact(values: string[], limit = 10) {
  const seen = new Set<string>()
  const output: string[] = []
  for (const raw of values) {
    const value = chineseDisplayText(raw).trim()
    if (!value || seen.has(value)) continue
    seen.add(value)
    output.push(value)
    if (output.length >= limit) break
  }
  return output
}

function mergeCultureSymbolPackage(
  template: CultureBorrowingTemplate,
  symbols: CultureSymbolEntry[],
): CultureSymbolBorrowingPackage {
  const symbolById = new Map(symbols.map((symbol) => [symbol.entryId, symbol]))
  const matchedSymbols = template.symbolEntryIds.map((id) => symbolById.get(id)).filter((symbol): symbol is CultureSymbolEntry => Boolean(symbol))
  return {
    visual: uniqueCompact([...template.symbolBorrowing.visual, ...matchedSymbols.flatMap((symbol) => symbol.visualSlots)], 14),
    style: uniqueCompact([...template.symbolBorrowing.style, ...matchedSymbols.flatMap((symbol) => symbol.styleSlots)], 12),
    motion: uniqueCompact([...template.symbolBorrowing.motion, ...matchedSymbols.flatMap((symbol) => symbol.motionSlots)], 14),
    audio: uniqueCompact([...template.symbolBorrowing.audio, ...matchedSymbols.flatMap((symbol) => symbol.audioSlots), template.audioFormulaCn], 10),
    verbal: uniqueCompact([
      ...template.symbolBorrowing.verbal,
      ...matchedSymbols.flatMap((symbol) => symbol.verbalSlots),
      template.verbalFormulaCn,
    ], 10),
    narrative: uniqueCompact([
      ...template.symbolBorrowing.narrative,
      ...template.cultureMechanism,
      ...matchedSymbols.flatMap((symbol) => symbol.hookMechanisms),
      ...template.tags,
    ], 12),
    productBridge: uniqueCompact([
      ...template.symbolBorrowing.productBridge,
      template.productBridgeRule,
      ...matchedSymbols.map((symbol) => symbol.bridgeType),
    ], 8),
    firstFrame: uniqueCompact([
      ...template.symbolBorrowing.firstFrame,
      template.firstFrameFormula,
      ...matchedSymbols.flatMap((symbol) => symbol.firstFramePromptSlots),
    ], 8),
    video: uniqueCompact([
      ...template.symbolBorrowing.video,
      template.finalVideoPromptFormulaCn,
      ...matchedSymbols.flatMap((symbol) => symbol.videoPromptSlots),
    ], 8),
  }
}

function cultureFusionDirectives(template: CultureBorrowingTemplate, symbolPackage: CultureSymbolBorrowingPackage) {
  const defaults = [
    "钩子模式定义观众为什么停，文化借势定义观众看见、听见、感到什么而停。",
    `0-1 秒必须把「${symbolPackage.visual[0] || template.openingCapture}」和「${symbolPackage.motion[0] || "停滑动作"}」做成可见事件，不只是换画风。`,
    `1-2.5 秒用「${symbolPackage.narrative[0] || template.cultureMechanism[0] || "悬念升级"}」继续放大好奇或冲突。`,
    `商品承接沿用「${symbolPackage.productBridge[0] || template.productBridgeRule}」，让文化符号成为商品出现的理由。`,
    symbolPackage.audio[0] ? `音效优先使用「${symbolPackage.audio[0]}」制造注意力断点。` : "",
    symbolPackage.verbal[0] ? `口播或字幕元数据优先使用「${symbolPackage.verbal[0]}」作为文化语法提示。` : "",
  ]
  return uniqueCompact([...template.fusionDirectives, ...defaults], 8)
}

function enrichCultureTemplate(template: CultureBorrowingTemplate, symbols: CultureSymbolEntry[]): CultureBorrowingTemplate {
  const symbolBorrowing = mergeCultureSymbolPackage(template, symbols)
  return {
    ...template,
    symbolBorrowing,
    fusionDirectives: cultureFusionDirectives(template, symbolBorrowing),
  }
}

function previewSymbols(symbolPackage: CultureSymbolBorrowingPackage) {
  return {
    visual: symbolPackage.visual.slice(0, 3),
    motion: symbolPackage.motion.slice(0, 3),
    audio: symbolPackage.audio.slice(0, 3),
    verbal: symbolPackage.verbal.slice(0, 3),
  }
}

function chineseDisplayText(value: string) {
  return value
    .replace(/\bASMR\b/gi, "近听")
    .replace(/\bUGC\b/gi, "真实手机")
    .replace(/\bBoss\b/gi, "首领")
    .replace(/\bUI\b/gi, "界面")
    .replace(/\bIP\b/gi, "文化源")
    .replace(/\bwhoosh\b/gi, "转场声")
    .replace(/logo/gi, "标志")
}

function cultureTemplatePresentationSignature(template: CultureBorrowingTemplate) {
  const readableName = chineseDisplayText(template.nameCn)
  const coreName = readableName.split("·")[0] || readableName
  return coreName
    .replace(/\s+/g, "")
    .replace(/[，。！？、:：；;]/g, "")
    .trim() || template.templateId
}

function dedupeCultureRecommendationCards(cards: CultureBorrowingRecommendationCard[]) {
  const seen = new Set<string>()
  const output: CultureBorrowingRecommendationCard[] = []
  for (const card of cards) {
    const signature = card.presentationSignature || card.nameCn
    if (seen.has(signature)) continue
    seen.add(signature)
    output.push(card)
  }
  return output
}

function cultureTemplateToRecommendationCard(
  template: EnrichedCultureBorrowingTemplate,
  request: CultureBorrowingRecommendationRequest = {},
  symbols: CultureSymbolEntry[] = [],
): CultureBorrowingRecommendationCard {
  const enriched = enrichCultureTemplate(template, symbols)
  const motifFallback = getCultureBorrowingTemplateByMotifId(template.templateId)
  const hasTemplateBinding = motifFallback || template.cultureMotifId
  const identityTemplate = hasTemplateBinding
    ? {
      ...template,
      cultureMotifId: template.cultureMotifId ?? motifFallback?.cultureMotifId,
      visualRenderProfileId: template.visualRenderProfileId ?? motifFallback?.visualRenderProfileId,
      shotPrimitiveIds: template.shotPrimitiveIds ?? motifFallback?.shotPrimitiveIds,
    }
    : template

  const preview = previewSymbols(enriched.symbolBorrowing)
  const borrowableSymbols = [
    ...preview.visual.map((item) => `视觉：${item}`),
    ...preview.motion.map((item) => `动作：${item}`),
    ...preview.audio.slice(0, 2).map((item) => `声音：${item}`),
    ...preview.verbal.slice(0, 2).map((item) => `口播：${item}`),
  ].slice(0, 8)
  const templateIdentity = [
    identityTemplate.cultureMotifId ? `cultureMotifId=${identityTemplate.cultureMotifId}` : "",
    identityTemplate.visualRenderProfileId ? `visualRenderProfileId=${identityTemplate.visualRenderProfileId}` : "",
    identityTemplate.shotPrimitiveIds?.length ? `shotPrimitiveIds=${identityTemplate.shotPrimitiveIds.join(",")}` : "",
  ].filter(Boolean).join("；")
  return {
    templateId: enriched.templateId,
    nameCn: chineseDisplayText(enriched.nameCn),
    cultureMotifId: identityTemplate.cultureMotifId,
    visualRenderProfileId: identityTemplate.visualRenderProfileId,
    shotPrimitiveIds: identityTemplate.shotPrimitiveIds,
    presentationSignature: cultureTemplatePresentationSignature(enriched),
    hookScope: enriched.hookScope,
    categoryLabels: cultureTemplateCategoryLabels(enriched, symbols).map(chineseDisplayText),
    mechanismLabel: [templateIdentity, chineseDisplayText(enriched.cultureMechanism.join(" · ") || "文化语法")].filter(Boolean).join("；"),
    firstFrameIdea: [templateIdentity, chineseDisplayText(enriched.firstFrameFormula)].filter(Boolean).join("；"),
    productBridgeLabel: chineseDisplayText(enriched.productBridgeRule),
    audioLabel: chineseDisplayText(enriched.audioFormulaCn),
    verbalLabel: chineseDisplayText(enriched.verbalFormulaCn),
    productTimingLabel: productTimingLabel(enriched.requiredProductAppearanceTiming),
    borrowableSymbolsLabel: [templateIdentity, borrowableSymbols.join(" · ")].filter(Boolean).join(" · "),
    fusionLabel: templateIdentity
      ? `先满足身份行：[${templateIdentity}]；${enriched.fusionDirectives[0] || "钩子任务和文化符号必须在同一画面动作里融合。"}`
      : (enriched.fusionDirectives[0] || "钩子任务和文化符号必须在同一画面动作里融合。"),
    symbolPreview: preview,
    recommendedDurationSec: enriched.recommendedDurationSec,
    productDependency: enriched.productDependency,
    whySelected: motifFallback?.whySelected,
    score: cultureTemplateScore(identityTemplate, request),
  }
}

export function listCultureBorrowingTemplates(params: HookLibraryListParams = {}) {
  const hookScope = params.hookScope === "product_independent" ? "product_independent" : params.hookScope === "product_related" ? "product_related" : null
  const productCategory = String(params.productCategory || params.category || "")
  const cultureCategory = String(params.cultureCategory || params.categoryL1 || "")
  const data = loadLibrary()
  const rows = dedupeCultureRecommendationCards(data
    .cultureTemplates
    .filter((template) => {
      const scopeMatch = !hookScope || template.hookScope === hookScope || template.hookScope === "culture_borrowing"
      const categoryMatch = !productCategory
        || template.applicableCategories.includes("全品类")
        || template.applicableCategories.some((category) => normalizeHookCategoryId(category) === normalizeHookCategoryId(productCategory))
      const cultureCategoryMatch = !cultureCategory || cultureTemplateCategoryLabels(template, data.cultureSymbols).includes(cultureCategory)
      return scopeMatch && categoryMatch && cultureCategoryMatch
    })
    .map((template) => cultureTemplateToRecommendationCard(template, {
      productCategory,
      hookScope: hookScope ?? undefined,
      durationSeconds: Number(params.durationSeconds || 0) || undefined,
    }, data.cultureSymbols))
    .sort((a, b) => b.score - a.score))
  return paginate(rows, params)
}

export function getCultureBorrowingRecommendationCards(request: CultureBorrowingRecommendationRequest = {}) {
  const limit = Math.min(Math.max(request.limit ?? 5, 1), 12)
  const data = loadLibrary()
  return dedupeCultureRecommendationCards(data
    .cultureTemplates
    .map((template) => cultureTemplateToRecommendationCard(template, request, data.cultureSymbols))
    .sort((a, b) => b.score - a.score))
    .slice(0, limit)
}

export function getCultureBorrowingTemplate(templateId: string): SelectedCultureBorrowing | null {
  const data = loadLibrary()
  const template = data.cultureTemplates.find((row) => row.templateId === templateId)
  if (!template) {
    const fallbackBorrowing = getCultureBorrowingTemplateByMotifId(templateId)
    if (!fallbackBorrowing) return null
    return {
      ...fallbackBorrowing,
      matchedSymbolEntries: [],
    }
  }
  const matchedSymbolEntries = data.cultureSymbols.filter((symbol) => template.symbolEntryIds.includes(symbol.entryId))
  return {
    ...enrichCultureTemplate(template, data.cultureSymbols),
    matchedSymbolEntries,
  }
}

export function getCultureSymbolEntriesForTemplate(templateId: string) {
  return getCultureBorrowingTemplate(templateId)?.matchedSymbolEntries ?? []
}

export function listHookCategoryPlaybooks(params: HookLibraryListParams = {}) {
  const normalizedCategory = normalizeHookCategoryId(params.category)
  return loadLibrary().playbooks.filter((row) => matches(row.status, params.status) && matches(row.categoryId, normalizedCategory || params.category))
}

export function listHookCategories() {
  const { patterns, playbooks, references, observations } = loadLibrary()
  const patternCounts = countBy(patterns, (row) => patternCategories(row))
  const referenceCounts = countBy(references, (row) => parseJsonArray(row.categoryFitJson).map(String))
  const observationCounts = countBy(observations, (row) => [row.observedCategory || ""].filter(Boolean))
  const playbookIds = new Set(playbooks.map((row) => row.categoryId))
  return Object.entries(HOOK_CATEGORY_LABELS).map(([id, label]) => ({
    id,
    label,
    patternCards: patternCounts[id] || 0,
    referenceAssets: referenceCounts[id] || 0,
    trendObservations: observationCounts[id] || 0,
    hasPlaybook: playbookIds.has(id),
  }))
}

export function listHookReferenceAssets(params: HookLibraryListParams = {}) {
  const rows = loadLibrary().references.filter((row) => {
    return (
      includesJsonArray(row.hookTypeFitJson, params.hookType) &&
      includesJsonArray(row.categoryFitJson, params.category) &&
      includesJsonArray(row.generationModeFitJson, params.generationMode) &&
      matches(row.status, params.status)
    )
  })
  return paginate(rows, params)
}

export function listHookTrendObservations(params: HookLibraryListParams = {}) {
  const rows = loadLibrary().observations.filter((row) => {
    return (
      matches(row.status, params.status) &&
      matches(row.observedCategory, params.category) &&
      includesJsonArray(row.detectedHookTypeJson, params.hookType)
    )
  })
  return paginate(rows, params)
}

export function listHookGenerationFewShots(params: HookLibraryListParams = {}) {
  const normalizedCategory = normalizeHookCategoryId(params.category)
  const rows = loadLibrary().fewShots.filter((row) => {
    return (
      matches(row.hookType, params.hookType) &&
      matches(row.intentMode, params.intentMode) &&
      (!params.category || row.category === (normalizedCategory || String(params.category)))
    )
  })
  return paginate(rows, params)
}

export function getHookPatternCard(id: string) {
  return loadLibrary().patterns.find((row) => row.id === id) ?? null
}

export function getHookMoodDefinitions() {
  return readMoodLibrary()
}

export function getHookReferenceAssetsForPattern(patternCardId: string) {
  return loadLibrary().references.filter((row) =>
    parseJsonArray(row.linkedPatternCardsJson).some((id) => String(id) === patternCardId)
  )
}

export function getHookLibraryCoverage(): HookLibraryCoverage {
  const { patterns, playbooks } = loadLibrary()
  return {
    patternCards: patterns.length,
    productRelatedPatternCards: patterns.filter((row) => row.hookScope === "product_related").length,
    productIndependentPatternCards: patterns.filter((row) => row.hookScope === "product_independent").length,
    hookTypeCounts: patterns.reduce<Record<string, number>>((counts, row) => {
      counts[row.hookType] = (counts[row.hookType] || 0) + 1
      return counts
    }, {}),
    nonProductFirstCount: patterns.filter((row) => row.productRelationType !== "direct").length,
    conflictNarrativeCount: patterns.filter((row) => row.productRelationType.includes("conflict") || row.narrativeFunction?.includes("conflict")).length,
    highStimulationCount: patterns.filter((row) => row.stimulationLevel === "S2" || row.stimulationLevel === "S3").length,
    categoryPlaybookCount: playbooks.length,
  }
}

function countBy<T>(rows: T[], getValues: (row: T) => string[]) {
  return rows.reduce<Record<string, number>>((counts, row) => {
    getValues(row).forEach((value) => {
      counts[value] = (counts[value] || 0) + 1
    })
    return counts
  }, {})
}

function uniqueCount<T>(rows: T[], getValues: (row: T) => Array<string | null | undefined>) {
  const values = new Set<string>()
  rows.forEach((row) => {
    getValues(row).forEach((value) => {
      if (value) values.add(value)
    })
  })
  return values.size
}

function duplicateIds(rows: Array<{ id: string }>) {
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  rows.forEach((row) => {
    if (seen.has(row.id)) duplicates.add(row.id)
    seen.add(row.id)
  })
  return [...duplicates]
}

function check(
  id: string,
  label: string,
  passed: boolean,
  options: Omit<HookLibraryReviewCheck, "id" | "label" | "status"> = {},
): HookLibraryReviewCheck {
  return {
    id,
    label,
    status: passed ? "pass" : "fail",
    ...options,
  }
}

export function reviewHookLibraryResources(): HookLibraryReview {
  const { patterns, playbooks, references, observations } = loadLibrary()
  const catalog = readCatalog()
  const moodDefinitions = readMoodLibrary()
  const moodById = new Map(moodDefinitions.map((mood) => [mood.id, mood]))
  const expectedTargets = (catalog.coverage_targets || {}) as {
    pattern_cards?: number
    category_playbooks?: number
    reference_assets?: number
    trend_observations?: number
    hook_type_counts?: Record<string, number>
  }
  const catalogCategories = ((catalog.category_playbooks as string[] | undefined) || []).sort()
  const patternIds = new Set(patterns.map((row) => row.id))
  const playbookCategories = new Set(playbooks.map((row) => row.categoryId))
  const patternCategoryCounts = countBy(patterns, (row) => parseJsonArray(row.applicableCategoriesJson).map(String))
  const referenceCategoryCounts = countBy(references, (row) => parseJsonArray(row.categoryFitJson).map(String))
  const observationCategoryCounts = countBy(observations, (row) => [row.observedCategory || ""].filter(Boolean))
  const patternHookCounts = countBy(patterns, (row) => [row.hookType])
  const referenceHookCounts = countBy(references, (row) => parseJsonArray(row.hookTypeFitJson).map(String))
  const patternMoodCounts = countBy(patterns, (row) => [row.emotionalPath || ""])
  const observationMoodCounts = countBy(observations, (row) => [row.emotionPath || ""])

  const missingPlaybookCategories = catalogCategories.filter((category) => !playbookCategories.has(category))
  const missingPatternCategories = catalogCategories.filter((category) => (patternCategoryCounts[category] || 0) < 10)
  const missingReferenceCategories = catalogCategories.filter((category) => (referenceCategoryCounts[category] || 0) < 10)
  const missingObservationCategories = catalogCategories.filter((category) => (observationCategoryCounts[category] || 0) < 2)
  const brokenPlaybookPatternRefs = playbooks.flatMap((playbook) => {
    const groups = [
      parseJsonArray(playbook.recommendedHooksJson),
      parseJsonArray(playbook.exploratoryHooksJson),
      parseJsonArray(playbook.highArousalHooksJson),
      parseJsonArray(playbook.conflictNarrativeHooksJson),
      parseJsonArray(playbook.culturalHooksJson),
    ]
    return groups.flat().map(String).filter((id) => !patternIds.has(id)).map((id) => `${playbook.categoryId}:${id}`)
  })
  const brokenReferencePatternRefs = references.flatMap((reference) =>
    parseJsonArray(reference.linkedPatternCardsJson).map(String).filter((id) => !patternIds.has(id)).map((id) => `${reference.id}:${id}`),
  )
  const incompletePatterns = patterns
    .filter((row) => {
      return (
        !row.id ||
        !row.patternName ||
        !row.hookType ||
        !row.oneSentenceLogic ||
        parseJsonArray(row.applicableCategoriesJson).length === 0 ||
        Object.keys(parseJsonRecord(row.categoryFitWeightJson)).length === 0 ||
        parseJsonArray(row.visualCriteriaJson).length === 0 ||
        parseJsonArray(row.referenceRequirementsJson).length === 0 ||
        parseJsonArray(row.sampleConceptTemplatesJson).length === 0
      )
    })
    .map((row) => row.id || "(missing id)")

  const expectedHookTypeCounts = expectedTargets.hook_type_counts || {}
  const missingHookCounts = Object.entries(expectedHookTypeCounts)
    .filter(([hookType, expected]) => (patternHookCounts[hookType] || 0) < expected)
    .map(([hookType, expected]) => `${hookType}: ${patternHookCounts[hookType] || 0}/${expected}`)
  const missingReferenceHookTypes = Object.keys(expectedHookTypeCounts)
    .filter((hookType) => (referenceHookCounts[hookType] || 0) < 10)
    .map((hookType) => `${hookType}: ${referenceHookCounts[hookType] || 0}`)
  const missingMoodDefinitions = EXPECTED_EMOTIONAL_PATHS.filter((moodId) => !moodById.has(moodId))
  const moodDefinitionGaps = moodDefinitions
    .filter((mood) => {
      return (
        !mood.display_name ||
        !mood.definition ||
        !mood.commerce_role ||
        !mood.product_bridge_logic ||
        !mood.negative_boundary ||
        mood.common_categories.length < 3 ||
        mood.preferred_generation_modes.length < 2 ||
        mood.variants.length < 5 ||
        mood.variants.some((variant) => {
          return (
            !variant.id ||
            !variant.trigger ||
            !variant.modality ||
            !variant.narrative_function ||
            !variant.example_structure ||
            variant.reference_needs.length < 2
          )
        })
      )
    })
    .map((mood) => mood.id)
  const missingPatternMoodCoverage = EXPECTED_EMOTIONAL_PATHS
    .filter((moodId) => (patternMoodCounts[moodId] || 0) < 12)
    .map((moodId) => `${moodId}: ${patternMoodCounts[moodId] || 0}`)
  const missingObservationMoodCoverage = EXPECTED_EMOTIONAL_PATHS
    .filter((moodId) => (observationMoodCounts[moodId] || 0) < 2)
    .map((moodId) => `${moodId}: ${observationMoodCounts[moodId] || 0}`)
  const moodVarianceGaps = EXPECTED_EMOTIONAL_PATHS.flatMap((moodId) => {
    const rows = patterns.filter((row) => row.emotionalPath === moodId)
    const metrics = {
      hookTypes: uniqueCount(rows, (row) => [row.hookType]),
      subTypes: uniqueCount(rows, (row) => [row.subType]),
      categories: uniqueCount(rows, (row) => parseJsonArray(row.applicableCategoriesJson).map(String)),
      productRelations: uniqueCount(rows, (row) => [row.productRelationType]),
      narrativeFunctions: uniqueCount(rows, (row) => [row.narrativeFunction]),
      generationModes: uniqueCount(rows, (row) => [row.recommendedGenerationMode]),
      stimulationLevels: uniqueCount(rows, (row) => [row.stimulationLevel]),
    }
    const failed = [
      metrics.hookTypes < 5 ? "hookTypes" : "",
      metrics.subTypes < 8 ? "subTypes" : "",
      metrics.categories < 4 ? "categories" : "",
      metrics.productRelations < 3 ? "productRelations" : "",
      metrics.narrativeFunctions < 3 ? "narrativeFunctions" : "",
      metrics.generationModes < 2 ? "generationModes" : "",
      metrics.stimulationLevels < 2 ? "stimulationLevels" : "",
    ].filter(Boolean)
    return failed.length ? [`${moodId}: ${failed.join(",")}`] : []
  })

  const checks: HookLibraryReviewCheck[] = [
    check("pattern-count", "Pattern Cards 达到 catalog 目标", patterns.length >= (expectedTargets.pattern_cards || 0), {
      expected: String(expectedTargets.pattern_cards || 0),
      actual: patterns.length,
    }),
    check("playbook-count", "Category Playbooks 达到 catalog 目标", playbooks.length >= (expectedTargets.category_playbooks || 0), {
      expected: String(expectedTargets.category_playbooks || 0),
      actual: playbooks.length,
    }),
    check("reference-count", "Reference Assets 达到 catalog 目标", references.length >= (expectedTargets.reference_assets || 0), {
      expected: String(expectedTargets.reference_assets || 0),
      actual: references.length,
    }),
    check("observation-count", "Trend Observations 达到 catalog 目标", observations.length >= (expectedTargets.trend_observations || 0), {
      expected: String(expectedTargets.trend_observations || 0),
      actual: observations.length,
    }),
    check("hook-type-distribution", "Hook 类型分布达到 V0 目标", missingHookCounts.length === 0, {
      expected: JSON.stringify(expectedHookTypeCounts),
      actual: JSON.stringify(patternHookCounts),
      details: missingHookCounts,
    }),
    check("unique-ids", "四类资源 ID 没有重复", [...duplicateIds(patterns), ...duplicateIds(playbooks), ...duplicateIds(references), ...duplicateIds(observations)].length === 0),
    check("category-playbooks", "catalog 中每个品类都有 Playbook", missingPlaybookCategories.length === 0, { details: missingPlaybookCategories }),
    check("category-pattern-depth", "每个品类至少有 10 张 Pattern Card", missingPatternCategories.length === 0, { details: missingPatternCategories }),
    check("category-reference-depth", "每个品类至少有 10 个 Reference Asset", missingReferenceCategories.length === 0, { details: missingReferenceCategories }),
    check("category-observation-depth", "每个品类至少有 2 条 Trend Observation", missingObservationCategories.length === 0, { details: missingObservationCategories }),
    check("hook-reference-depth", "每个 Hook 类型至少有 10 个 Reference Asset", missingReferenceHookTypes.length === 0, { details: missingReferenceHookTypes }),
    check("pattern-required-fields", "Pattern Card 关键字段和数组资源完整", incompletePatterns.length === 0, { details: incompletePatterns.slice(0, 20) }),
    check("playbook-pattern-links", "Playbook 引用的 Pattern ID 都存在", brokenPlaybookPatternRefs.length === 0, { details: brokenPlaybookPatternRefs.slice(0, 20) }),
    check("reference-pattern-links", "Reference Asset 引用的 Pattern ID 都存在", brokenReferencePatternRefs.length === 0, { details: brokenReferencePatternRefs.slice(0, 20) }),
    check("mood-library-definitions", "Mood Library 定义了 PRD 的 8 条情绪路径", missingMoodDefinitions.length === 0, { details: missingMoodDefinitions }),
    check("mood-library-detail", "每个 Mood 有定义、桥接逻辑、边界和至少 5 个变体", moodDefinitionGaps.length === 0, { details: moodDefinitionGaps }),
    check("mood-pattern-depth", "每个 Mood 至少有 12 张 Pattern Card", missingPatternMoodCoverage.length === 0, { details: missingPatternMoodCoverage }),
    check("mood-observation-depth", "每个 Mood 至少有 2 条 Trend Observation", missingObservationMoodCoverage.length === 0, { details: missingObservationMoodCoverage }),
    check("mood-variance", "每个 Mood 内部具备机制、子类、品类、产品关系、叙事、生成路径和刺激强度 variance", moodVarianceGaps.length === 0, { details: moodVarianceGaps }),
  ]

  const hookTypes = Object.keys(expectedHookTypeCounts).sort()
  const moodCoverage = EXPECTED_EMOTIONAL_PATHS.map((moodId) => {
    const rows = patterns.filter((row) => row.emotionalPath === moodId)
    return {
      moodId,
      defined: moodById.has(moodId),
      patternCards: rows.length,
      trendObservations: observationMoodCounts[moodId] || 0,
      hookTypes: uniqueCount(rows, (row) => [row.hookType]),
      subTypes: uniqueCount(rows, (row) => [row.subType]),
      categories: uniqueCount(rows, (row) => parseJsonArray(row.applicableCategoriesJson).map(String)),
      productRelations: uniqueCount(rows, (row) => [row.productRelationType]),
      narrativeFunctions: uniqueCount(rows, (row) => [row.narrativeFunction]),
      generationModes: uniqueCount(rows, (row) => [row.recommendedGenerationMode]),
      stimulationLevels: uniqueCount(rows, (row) => [row.stimulationLevel]),
      variants: moodById.get(moodId)?.variants.length || 0,
    }
  })

  return {
    ok: checks.every((item) => item.status !== "fail"),
    generatedAt: nowIso(),
    resourceCounts: {
      patternCards: patterns.length,
      categoryPlaybooks: playbooks.length,
      referenceAssets: references.length,
      trendObservations: observations.length,
    },
    hookTypeCoverage: Object.fromEntries(
      hookTypes.map((hookType) => [hookType, { patternCards: patternHookCounts[hookType] || 0, referenceAssets: referenceHookCounts[hookType] || 0 }]),
    ),
    categoryCoverage: catalogCategories.map((categoryId) => ({
      categoryId,
      hasPlaybook: playbookCategories.has(categoryId),
      patternCards: patternCategoryCounts[categoryId] || 0,
      referenceAssets: referenceCategoryCounts[categoryId] || 0,
      trendObservations: observationCategoryCounts[categoryId] || 0,
    })),
    moodCoverage,
    checks,
  }
}

export function getHookLibrarySnapshot(): HookLibrarySnapshot {
  const { patterns, playbooks, references, observations } = loadLibrary()
  const coverage = getHookLibraryCoverage()
  const resourceJson = {
    generatedAt: nowIso(),
    coverage,
    topPatterns: patterns.slice(0, 12).map((row) => ({
      id: row.id,
      name: row.patternName,
      hookScope: row.hookScope,
      hookType: row.hookType,
      productRelationType: row.productRelationType,
      generationMode: row.recommendedGenerationMode,
    })),
  }

  return {
    id: "hook_library_snapshot_v0",
    snapshotKey: "hook-library-v0-next-local",
    patternCount: patterns.length,
    playbookCount: playbooks.length,
    referenceCount: references.length,
    observationCount: observations.length,
    generatedAt: nowIso(),
    resourceJson: JSON.stringify(resourceJson),
    resourceText: JSON.stringify(resourceJson, null, 2),
  }
}

function findById<T extends { id: string }>(rows: T[], id: string) {
  const row = rows.find((item) => item.id === id)
  if (!row) throw new Error(`Hook resource not found: ${id}`)
  return row
}

export function mutateHookResource(kind: string, id: string, action: string) {
  const data = loadLibrary()
  const sources: Record<string, Array<{ id: string; status: string; updatedAt?: string | null; approvedAt?: string | null }>> = {
    "pattern-cards": data.patterns,
    "category-playbooks": data.playbooks,
    "reference-assets": data.references,
    "trend-observations": data.observations,
  }
  const source = sources[kind]
  if (!source) throw new Error(`Unsupported hook resource kind: ${kind}`)

  const item = findById(source, id)
  if (action === "clone") return { ...item, id: `${item.id}_copy`, status: "draft", updatedAt: nowIso() }
  if (action === "discard") return { ...item, status: "discarded", updatedAt: nowIso() }
  if (action === "approve") return { ...item, status: kind === "trend-observations" ? "approved" : "active", updatedAt: nowIso(), approvedAt: nowIso() }
  throw new Error(`Unsupported hook action: ${action}`)
}

export function createPatternDraftFromObservation(id: string): HookPatternCard {
  const observation = findById(loadLibrary().observations, id)
  const detectedHookTypes = parseJsonArray(observation.detectedHookTypeJson)
  const hookType = String(detectedHookTypes[0] || "H1")
  return {
    id: `${observation.id}_pattern_draft`,
    hookScope: "product_related",
    patternName: observation.distilledPatternCandidate || observation.first5sSummary,
    hookType,
    subType: observation.narrativeFunction || "trend_distilled",
    productRelationType: observation.productRelationType || "problem_first",
    narrativeFunction: observation.narrativeFunction,
    oneSentenceLogic: observation.first5sSummary,
    applicableCategoriesJson: JSON.stringify([observation.observedCategory].filter(Boolean)),
    categoryFitWeightJson: JSON.stringify({ [observation.observedCategory || "general"]: 0.72 }),
    audienceFitJson: JSON.stringify(["conversion_viewers"]),
    sellingPointFitJson: JSON.stringify(["visible_result", "trust"]),
    emotionalPath: observation.emotionPath,
    stimulationLevel: "S1",
    timeStructureJson: JSON.stringify({ "0_1s": observation.keyVisualEvent, "1_3s": observation.keyText, "3_5s": "Bridge to product proof." }),
    visualCriteriaJson: JSON.stringify([observation.keyVisualEvent].filter(Boolean)),
    motionCriteriaJson: JSON.stringify([observation.dominantModality].filter(Boolean)),
    audioCriteriaJson: JSON.stringify([observation.keyAudioEvent].filter(Boolean)),
    textCriteriaJson: JSON.stringify([observation.keyText].filter(Boolean)),
    productBridgeRule: "Reconnect the observed stop cue to product value within 3-5 seconds.",
    referenceRequirementsJson: JSON.stringify(["first_frame_reference", "scene_reference", "product_reference"]),
    recommendedGenerationMode: "hybrid",
    modelFeasibility: "medium",
    promptSlotsJson: JSON.stringify({ product_name: "product name", scene: observation.observedCategory || "commerce scene" }),
    sampleConceptTemplatesJson: JSON.stringify([observation.distilledPatternCandidate || observation.first5sSummary]),
    sourceObservationsJson: JSON.stringify([observation.id]),
    sourceMetadataJson: observation.sourceMetadataJson,
    updateHistoryJson: JSON.stringify([{ date: "2026-05-13", change: "Created from trend observation in local Next integration." }]),
    status: "draft",
    createdAt: nowIso(),
    updatedAt: nowIso(),
    approvedAt: null,
  }
}

export function getHookRecommendationCards(request: HookRecommendationRequest): HookRecommendationCard[] {
  const limit = Math.min(Math.max(request.limit || 5, 3), 12)
  const normalizedRequest = {
    ...request,
    productCategory: normalizeHookCategoryId(request.productCategory || "") || request.productCategory || "",
    hookScope: request.hookScope === "product_independent" ? "product_independent" as const : "product_related" as const,
  }
  const references = loadLibrary().references
  const scored = loadLibrary()
    .patterns
    .filter((row) => row.hookScope === normalizedRequest.hookScope)
    .map((row) => patternToRecommendationCard(row, references, normalizedRequest))
    .sort((a, b) => b.score - a.score)

  const selected: HookRecommendationCard[] = []
  const usedHookTypes = new Set<string>()
  const usedSubTypes = new Set<string>()
  const usedMoods = new Set<string>()
  const targetHookTypeDiversity = Math.min(limit, normalizedRequest.hookScope === "product_independent" ? limit : 5)

  for (const candidate of scored) {
    if (selected.length >= targetHookTypeDiversity) break
    if (usedHookTypes.has(candidate.hookType)) continue
    selected.push(candidate)
    usedHookTypes.add(candidate.hookType)
    usedSubTypes.add(candidate.subType)
    if (candidate.emotionalPath) usedMoods.add(candidate.emotionalPath)
  }

  for (const candidate of scored) {
    if (selected.length >= limit) break
    if (selected.some((item) => item.patternCardId === candidate.patternCardId)) continue
    const duplicateShape =
      selected.length >= 2 &&
      usedHookTypes.has(candidate.hookType) &&
      usedSubTypes.has(candidate.subType) &&
      (candidate.emotionalPath ? usedMoods.has(candidate.emotionalPath) : false)
    if (duplicateShape) continue
    selected.push(candidate)
    usedHookTypes.add(candidate.hookType)
    usedSubTypes.add(candidate.subType)
    if (candidate.emotionalPath) usedMoods.add(candidate.emotionalPath)
  }

  for (const candidate of scored) {
    if (selected.length >= limit) break
    if (!selected.some((item) => item.patternCardId === candidate.patternCardId)) selected.push(candidate)
  }

  return selected
}

export function getHookSeedImportSummary() {
  const data = loadLibrary()
  return {
    patternCards: data.patterns.length,
    categoryPlaybooks: data.playbooks.length,
    referenceAssets: data.references.length,
    trendObservations: data.observations.length,
  }
}
