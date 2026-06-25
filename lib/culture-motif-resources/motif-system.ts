import type {
  CultureBorrowingScope,
  CultureSymbolBorrowingPackage,
  HookRecommendationCard,
  SelectedCultureBorrowing,
} from "@/lib/hook-library"
import type { HookOneShotIntent } from "@/lib/hook-one-shot"

export type CultureMotifResource = {
  cultureMotifId: string
  templateId: string
  motifFamily: string
  motifName: string
  hookScope: CultureBorrowingScope
  actionLogic: string
  viewerStopReason: string
  productBridgeRole: string
  forbiddenShallowUse: string[]
  compatibleIntentModes: HookOneShotIntent[]
  cultureMechanism: string[]
  renderProfileIds: string[]
  shotPrimitiveIds: string[]
}

export type VisualRenderProfile = {
  visualRenderProfileId: string
  cultureMotifId: string
  profileName: string
  palette: string
  lighting: string
  cameraGrammar: string
  setDressing: string
  texture: string
  negativeStyle: string
}

export type MotifShotPrimitive = {
  shotPrimitiveId: string
  cultureMotifId: string
  timeRange: "0-1s" | "1-2.5s" | "2.5-4s" | "3-5s"
  shotRole: "opening_action" | "tension_action" | "product_bridge_action" | "optional_payoff"
  action: string
  audio: string
  productVisibility: "none" | "partial" | "clear_but_not_packshot" | "hero_visible"
}

export type ProductFitPolicy = {
  cultureMotifId: string
  exactCategoryIds: string[]
  adjacentCategoryIds: string[]
  fallbackCategoryIds: string[]
  strongUseCases: string[]
  weakUseCases: string[]
}

export type CultureMotifSelectionTrace = {
  cultureMotifId: string
  visualRenderProfileId: string
  shotPrimitiveIds: string[]
  whySelected: string[]
  score: number
}

type MotifSeed = Omit<CultureMotifResource, "renderProfileIds" | "shotPrimitiveIds"> & {
  exact: string[]
  adjacent: string[]
  fallback: string[]
  strongUseCases: string[]
  weakUseCases: string[]
  profiles: Array<Omit<VisualRenderProfile, "cultureMotifId">>
  shots: Array<Omit<MotifShotPrimitive, "cultureMotifId">>
}

type CultureMotifSelectionRequest = {
  productCategory?: string | null
  intent: HookOneShotIntent
  hookScope?: "product_related" | "product_independent"
  selectedHook?: Partial<HookRecommendationCard> | null
  durationSeconds?: number | null
  recentTemplateIds?: string[]
  nonce?: string | number | null
  limit?: number
}

const CATEGORY_ALIASES: Record<string, string> = {
  "母婴": "mother_baby",
  "儿童": "mother_baby",
  "儿童产品": "mother_baby",
  "牙膏": "oral_care",
  "toothpaste": "oral_care",
  "oral care": "oral_care",
  "oral_care": "oral_care",
  "oral_care_toothpaste": "oral_care",
  "口腔护理": "oral_care",
  "个护": "personal_care",
  "个人护理": "personal_care",
  "美妆": "beauty",
  "美妆护肤": "beauty",
  "护肤": "beauty",
  "香氛": "fragrance",
  "食品饮料": "food_beverage",
  "茶饮": "tea",
  "家居": "home",
  "家居收纳": "storage_home",
  "清洁": "cleaning",
  "教育": "education",
  "AI工具": "ai_tools",
  "工具": "tools",
  "运动健身": "sports_fitness",
  "女装": "womenswear",
  "服饰": "womenswear",
  "礼品": "gifts",
  "礼盒": "gifts",
}

const BASE_MOTIF_SEEDS: MotifSeed[] = [
  motif({
    id: "QUEST_BREAKTHROUGH",
    family: "quest",
    name: "任务闯关破局",
    scope: "culture_borrowing",
    mechanisms: ["闯关停滑", "任务缺口", "破局反差"],
    actionLogic: "把日常痛点变成一关未完成任务，商品作为过关道具入场。",
    viewerStopReason: "观众想知道这一关为什么卡住，以及商品怎么让动作继续。",
    bridge: "商品作为破关道具",
    intents: ["creative_first", "pain_first", "audience_first"],
    exact: ["mother_baby", "oral_care", "education", "ai_tools", "sports_fitness"],
    adjacent: ["personal_care", "tools", "food_beverage"],
    strong: ["孩子不配合", "流程卡住", "新手不会做", "任务感开场"],
    profiles: [
      profile("myth_quest_cloud_gate_light_fantasy", "青灰云雾 + 暖金道具光", "任务门背后冷光，商品入场时一束暖光扫过包装", "低角度轻推，门/卡/道具占前景，不做全景奇观", "云纹任务门、任务卡、完成区、无品牌关卡提示", "写实手机实拍混合轻奇幻颗粒", "不要现代影视西游造型、角色脸、武器复刻、游戏界面"),
      profile("game_show_task_card_bright_reality", "亮白任务卡 + 高饱和提示色", "顶部软灯和前景任务卡反光", "手持近景，任务卡翻面后镜头压到商品", "任务卡、倒计时牌、完成区、桌面道具", "真实综艺任务感，但无栏目名无标识", "不要真实节目舞台、Logo、主持人口播字幕"),
    ],
    shots: [
      shot("quest_open_task_gate", "0-1s", "opening_action", "任务门/任务卡突然打开，人物动作停在未完成节点。", "鼓点加速后短促提示音", "partial"),
      shot("quest_tension_countdown", "1-2.5s", "tension_action", "倒计时或完成区空着，手停在关键一步不敢继续。", "倒计时滴答 + 风声骤停", "partial"),
      shot("quest_product_bridge_tool", "2.5-4s", "product_bridge_action", "真实商品被推入完成区，上一拍卡住动作重新启动。", "道具落位声 + 轻快提示音", "clear_but_not_packshot"),
    ],
  }),
  motif({
    id: "TRIAL_EVIDENCE_TABLE",
    family: "evidence",
    name: "证据审判台",
    scope: "product_related",
    mechanisms: ["证据揭示", "声音断崖", "真假判断"],
    actionLogic: "把痛点和商品摆成证据，先让观众看见可验证细节再给判断。",
    viewerStopReason: "拍案静音和证据位让观众等下一秒的关键证据。",
    bridge: "商品作为关键证据",
    intents: ["pain_first", "offer_first", "audience_first"],
    exact: ["oral_care", "personal_care", "cleaning", "beauty", "mother_baby"],
    adjacent: ["food_beverage", "ai_tools", "home"],
    strong: ["牙渍", "脏污", "真假判断", "效果争议", "群体争论"],
    profiles: [
      profile("trial_table_high_contrast_spotlight", "深木色 + 冷白聚光 + 低饱和背景", "桌面中心硬聚光，周边压暗", "中轴近景，白手套/放大镜/资料夹引导视线", "深色证据台、无标识卷宗、白手套、放大镜", "证据桌面质感，高对比局部光", "不要具体法庭剧名、官服脸谱、伪检测报告"),
      profile("consumer_expose_clean_lightbox", "冷白灯箱 + 灰黑调查桌", "灯箱从暗到亮，商品包装细节被照亮", "轻微手持推近，红线或手指点到商品细节", "红线白板、无标识资料夹、灯箱、透明证据袋", "消费调查曝光台风格，但不出现机构标识", "不要新闻台标、报告编号、官方背书"),
    ],
    shots: [
      shot("trial_open_gavel_silence", "0-1s", "opening_action", "木案被拍响，全场半秒静音，镜头压到空证据位。", "拍案声 + 半秒静音", "partial"),
      shot("trial_tension_folder_reveal", "1-2.5s", "tension_action", "卷宗/证据袋掀开，只露出商品一角或痛点细节。", "纸张摩擦 + 低频停顿", "partial"),
      shot("trial_product_core_evidence", "2.5-4s", "product_bridge_action", "白手套把商品推到中心，包装和使用细节清楚。", "商品轻碰桌面声", "clear_but_not_packshot"),
    ],
  }),
  motif({
    id: "PARENT_CHILD_RITUAL",
    family: "family_ritual",
    name: "亲子仪式唤醒",
    scope: "product_related",
    mechanisms: ["亲子共鸣", "仪式启动", "抗拒转好奇"],
    actionLogic: "把亲子日常卡点改写成一个小仪式，商品是让孩子愿意参与的仪式物。",
    viewerStopReason: "家长熟悉的抗拒瞬间被仪式化重启，想看孩子会不会配合。",
    bridge: "商品作为亲子仪式物",
    intents: ["audience_first", "pain_first", "creative_first"],
    exact: ["mother_baby", "oral_care", "education"],
    adjacent: ["personal_care", "food_beverage", "home"],
    strong: ["孩子不爱刷牙", "睡前流程", "亲子互动", "不配合"],
    profiles: [
      profile("parent_child_bathroom_warm_ritual", "奶油白 + 浅蓝 + 暖黄台灯", "浴室镜前暖光，商品在台面有柔和反光", "近景固定，孩子表情和手部动作清晰", "浴室镜、儿童杯、任务贴纸、台面商品", "真实家庭日常，轻仪式感", "不要卡通 UI、夸张魔法特效、儿童脸部变形"),
      profile("bedtime_task_star_card", "夜灯暖黄 + 星星任务卡浅紫", "睡前小夜灯和任务卡边缘光", "桌面俯拍到中近景，任务卡与商品同框", "星星任务卡、刷牙完成格、儿童牙刷、商品软管", "亲子任务卡实拍质感", "不要真实动画角色、品牌化任务系统"),
    ],
    shots: [
      shot("ritual_open_child_refusal", "0-1s", "opening_action", "孩子挡开日常动作，任务卡停在未完成格。", "浴室环境声突然压低", "partial"),
      shot("ritual_tension_invite", "1-2.5s", "tension_action", "家长把任务卡/小道具递近，孩子从抗拒变成看一眼。", "轻快提示音 + 纸卡摩擦", "partial"),
      shot("ritual_product_bridge_continue", "2.5-4s", "product_bridge_action", "商品进入任务格，上一拍停住的动作继续。", "牙刷/道具轻碰声", "clear_but_not_packshot"),
    ],
  }),
  motif({
    id: "FAIL_RESTART_LOOP",
    family: "restart",
    name: "失败重启循环",
    scope: "product_related",
    mechanisms: ["失败重放", "重启停滑", "动作修复"],
    actionLogic: "重复失败动作两次，第三次由商品让动作成功继续。",
    viewerStopReason: "观众被失败重放吸引，等待第三次如何不一样。",
    bridge: "商品作为重启动作的修复线索",
    intents: ["pain_first", "creative_first"],
    exact: ["mother_baby", "oral_care", "cleaning", "tools", "sports_fitness"],
    adjacent: ["personal_care", "storage_home", "education"],
    strong: ["反复失败", "孩子不配合", "动作卡住", "省力"],
    profiles: [
      profile("time_loop_phone_realism", "真实生活色 + 一瞬间冷蓝重启光", "重启瞬间轻微闪白，其他保持自然光", "同一机位重复动作，切点清楚", "同一桌面/浴室/厨房，失败物体固定位置", "真实手机拍摄 + 快速重启剪辑", "不要科幻 UI、倒计时文字、复杂穿越特效"),
      profile("comedy_replay_freeze_frame", "高亮生活色 + 轻喜剧对比色", "失败瞬间局部高光，人物反应清晰", "固定近景，失败动作定格半拍", "失败物体、手部动作、商品入场路径", "轻喜剧短视频重放感", "不要字幕梗图、贴纸、夸张表情变形"),
    ],
    shots: [
      shot("restart_open_failed_action", "0-1s", "opening_action", "同一个日常动作第一次失败，人物停住。", "失败提示音", "none"),
      shot("restart_tension_second_fail", "1-2.5s", "tension_action", "动作第二次失败，镜头保持同机位让差异更明显。", "重启音 + 环境声断一下", "partial"),
      shot("restart_product_fix_action", "2.5-4s", "product_bridge_action", "商品进入动作路径，第三次动作顺利继续。", "轻快完成音 + 真实操作声", "clear_but_not_packshot"),
    ],
  }),
  motif({
    id: "GAME_TASK_CARD",
    family: "game",
    name: "游戏任务卡",
    scope: "culture_borrowing",
    mechanisms: ["任务提示", "关卡失败", "道具入场"],
    actionLogic: "用无品牌游戏任务语法把商品变成关键道具。",
    viewerStopReason: "任务失败和道具提示让观众自然等到商品入场。",
    bridge: "商品作为关键道具",
    intents: ["creative_first", "pain_first", "offer_first"],
    exact: ["mother_baby", "education", "ai_tools", "sports_fitness", "oral_care"],
    adjacent: ["tools", "personal_care", "food_beverage"],
    strong: ["游戏化", "任务道具", "挑战", "孩子参与"],
    profiles: [
      profile("game_card_no_ui_tabletop", "深灰桌面 + 任务卡荧光绿边", "任务卡边缘发光但不形成界面", "俯拍任务卡翻面，随后商品实拍入场", "纸质任务卡、完成格、无品牌道具槽", "游戏语法纸卡化，不用真实 UI", "不要血条 UI、游戏 Logo、角色皮肤"),
      profile("pixel_boss_physical_prop", "低像素色块灵感 + 真实纸板道具", "局部硬光打在纸板 boss 标记和商品上", "低角度近景，纸板道具遮挡后揭示商品", "纸板 boss 标记、失败印章、真实商品", "低像素流行文化语法的实物化", "不要真实游戏画面、Boss 名称、版权角色"),
    ],
    shots: [
      shot("game_open_task_fail", "0-1s", "opening_action", "纸质任务卡翻面显示失败格，手停住。", "无品牌任务提示音", "partial"),
      shot("game_tension_tool_slot", "1-2.5s", "tension_action", "道具槽空着，人物第二次尝试仍失败。", "滴答声 + 低频失败音", "partial"),
      shot("game_product_tool_reveal", "2.5-4s", "product_bridge_action", "真实商品放入道具槽，任务动作继续。", "道具落槽声 + 完成提示音", "clear_but_not_packshot"),
    ],
  }),
  motif({
    id: "GARDEN_DETAIL_REVEAL",
    family: "garden_detail",
    name: "园林细节慢揭示",
    scope: "product_related",
    mechanisms: ["细节停滑", "质感悬念", "慢揭示"],
    actionLogic: "用团扇、窗棂、落花遮挡商品细节，慢慢揭示包装质感。",
    viewerStopReason: "观众想看遮挡后露出的精致细节是什么。",
    bridge: "商品作为精致细节答案",
    intents: ["creative_first", "audience_first"],
    exact: ["beauty", "fragrance", "womenswear", "home", "tea", "gifts"],
    adjacent: ["personal_care", "storage_home"],
    strong: ["包装质感", "香氛", "审美", "礼赠", "精致细节"],
    weak: ["儿童刷牙", "强痛点", "高刺激冲突"],
    profiles: [
      profile("honglou_garden_low_saturation_moonlight", "低饱和青灰 + 桃粉落花 + 冷白月光", "窗棂侧光和桌面月光，商品边缘慢慢亮起来", "团扇/花影前景遮挡，慢推到包装细节", "团扇、窗棂、落花、木案、真实商品", "园林雅致、低饱和写实、包装质感优先", "不要古装人物脸、影视红楼服化道、纯背景滤镜"),
      profile("garden_lacquer_table_macro", "漆木深红 + 米白纸面 + 细金边", "局部柔光扫过包装材质", "微距固定，手移开前景道具后商品清楚", "漆木托盘、宣纸、花枝影、商品包装", "微距材质感，精致电商审美", "不要过度古风、不要让商品变成古董道具"),
    ],
    shots: [
      shot("garden_open_fan_cover", "0-1s", "opening_action", "团扇半遮关键细节，只露出商品或痛点一角。", "风铃轻响 + 花落声", "partial"),
      shot("garden_tension_slow_reveal", "1-2.5s", "tension_action", "团扇或花影慢慢移开，包装纹理/质感更清晰。", "衣料摩擦 + 轻鼓点停顿", "partial"),
      shot("garden_product_detail_answer", "2.5-4s", "product_bridge_action", "商品包装细节被推近，成为遮挡后的答案。", "轻微桌面滑动声", "clear_but_not_packshot"),
    ],
  }),
  motif({
    id: "STRATEGY_TABLE_BREAKTHROUGH",
    family: "strategy",
    name: "谋略沙盘一招破局",
    scope: "culture_borrowing",
    mechanisms: ["策略破局", "冷静压迫", "一招定局"],
    actionLogic: "把混乱选择收束到桌面关键一步，商品像决定走向的棋子。",
    viewerStopReason: "观众想知道这一步为什么能破局。",
    bridge: "商品作为关键一步",
    intents: ["creative_first", "pain_first", "offer_first"],
    exact: ["ai_tools", "education", "storage_home", "tools"],
    adjacent: ["sports_fitness", "home", "personal_care"],
    strong: ["选择困难", "复杂决策", "效率工具", "整理规划"],
    profiles: [
      profile("strategy_table_warm_candle_sandmap", "暖暗火烛 + 沙盘黄褐 + 冷黑背景", "火烛侧光照亮关键路线", "俯拍沙盘到桌面商品，棋子落点清楚", "沙盘、路线标记、棋子、卷轴边缘、商品", "写实策略桌面，不做古装广告", "不要具体历史人物、军旗 Logo、影视台词"),
      profile("modern_strategy_glass_board", "冷白玻璃板 + 蓝灰标记线", "桌面灯箱和玻璃反光", "手指沿路线停住，商品推入路线终点", "透明板、路线贴、便签、真实商品", "现代策略工作台，流行商业剧节奏", "不要真实公司 Logo、软件界面"),
    ],
    shots: [
      shot("strategy_open_route_chaos", "0-1s", "opening_action", "桌面路线混乱，手指突然停在没人看的位置。", "纸张摩擦 + 低频停顿", "partial"),
      shot("strategy_tension_piece_drop", "1-2.5s", "tension_action", "棋子/标记落桌，所有路线指向一个空位。", "棋子落桌声", "partial"),
      shot("strategy_product_key_step", "2.5-4s", "product_bridge_action", "商品被推到关键位置，混乱选择收束成一步。", "商品滑入声 + 轻定音", "clear_but_not_packshot"),
    ],
  }),
  motif({
    id: "RAIN_REVEAL",
    family: "rain_reveal",
    name: "烟雨慢揭示",
    scope: "product_related",
    mechanisms: ["柔性停滑", "水汽遮挡", "质感答案"],
    actionLogic: "用雨雾、伞缘和水汽慢揭示商品，商品承担质感答案。",
    viewerStopReason: "观众被水汽和伞缘遮挡吸引，等待答案露出。",
    bridge: "商品作为质感答案",
    intents: ["creative_first", "audience_first", "pain_first"],
    exact: ["beauty", "fragrance", "tea", "womenswear"],
    adjacent: ["personal_care", "food_beverage", "gifts"],
    strong: ["质感", "香氛", "护肤", "茶饮", "柔性审美"],
    profiles: [
      profile("rain_reveal_bluegreen_mist", "青白水汽 + 灰绿石面", "伞下柔光，商品从雾气边缘亮起", "伞缘前景慢转，镜头单一慢推", "纸伞边缘、水汽、湿润石面、商品局部", "烟雨写实质感，低饱和慢揭示", "不要具体白蛇桥段、角色脸、原音乐"),
      profile("rain_window_product_silhouette", "雨窗灰蓝 + 室内暖黄", "窗外冷光和室内暖光形成反差", "窗影遮挡，手把商品移到光里", "雨窗、木桌、水滴、真实商品", "都市雨夜质感，生活化", "不要恐怖化、不要纯氛围无动作"),
    ],
    shots: [
      shot("rain_open_umbrella_edge", "0-1s", "opening_action", "伞缘或水汽遮住关键物，只露出商品轮廓。", "细雨声 + 轻微水滴", "partial"),
      shot("rain_tension_mist_clears", "1-2.5s", "tension_action", "雾气散开一点，痛点或商品质感开始显形。", "答案前半秒静音", "partial"),
      shot("rain_product_answer_light", "2.5-4s", "product_bridge_action", "商品被移到光里，成为遮挡后的质感答案。", "水滴声 + 商品轻放声", "clear_but_not_packshot"),
    ],
  }),
  motif({
    id: "DETECTIVE_THREAD_BOARD",
    family: "detective",
    name: "侦探红线真相推近",
    scope: "culture_borrowing",
    mechanisms: ["线索拼接", "真相揭示", "局部证据"],
    actionLogic: "用线索板和红线把商品变成最后一条关键线索。",
    viewerStopReason: "红线指向商品前一刻，观众想确认真相。",
    bridge: "商品作为最后线索",
    intents: ["creative_first", "pain_first", "offer_first"],
    exact: ["cleaning", "personal_care", "beauty", "ai_tools", "tools"],
    adjacent: ["mother_baby", "education", "storage_home"],
    strong: ["隐藏问题", "真相揭示", "细节证据", "排查"],
    profiles: [
      profile("detective_red_thread_low_key", "暗灰墙面 + 红线 + 冷白照片纸", "单点台灯打在线索板和商品上", "手持近景沿红线移动到商品", "红线板、照片背面、无标识便签、真实商品", "悬疑侦探语法，写实道具", "不要真实剧集、案件名称、警徽"),
      profile("desktop_investigation_macro", "黑色桌面 + 米白卡片 + 红线点缀", "桌面低角度局部光", "微距推近线索卡和商品细节", "线索卡、放大镜、红线、商品包装", "桌面调查质感", "不要伪造检测报告"),
    ],
    shots: [
      shot("detective_open_thread_stop", "0-1s", "opening_action", "红线停在空白卡片前，手指悬停。", "低频悬疑音 + 纸张轻响", "none"),
      shot("detective_tension_clue_flip", "1-2.5s", "tension_action", "线索卡翻开，只露出商品一角或痛点局部。", "卡片翻面声", "partial"),
      shot("detective_product_final_clue", "2.5-4s", "product_bridge_action", "红线最终指向商品，包装细节清楚。", "红线轻弹声 + 定音", "clear_but_not_packshot"),
    ],
  }),
  motif({
    id: "FAMILY_GROUP_SOS",
    family: "family",
    name: "家庭群求救现场",
    scope: "product_related",
    mechanisms: ["家庭共鸣", "多人同时停住", "生活求救"],
    actionLogic: "把家庭日常小灾难拍成多人同时停住的求救现场，商品是能继续动作的答案。",
    viewerStopReason: "家庭成员同时看向问题点，观众想知道怎么收场。",
    bridge: "商品作为家庭求救答案",
    intents: ["audience_first", "pain_first"],
    exact: ["mother_baby", "cleaning", "storage_home", "food_beverage", "oral_care"],
    adjacent: ["personal_care", "home", "tools"],
    strong: ["家庭日常", "孩子问题", "收纳清洁", "临时救急"],
    profiles: [
      profile("family_living_room_warm_sos", "客厅暖白 + 生活杂色", "家用顶灯，问题物体处有局部亮点", "中近景固定，三个人视线同时停住", "客厅桌面、家庭用品、商品在边缘准备入场", "真实家庭轻喜剧", "不要群聊界面、表情包字幕"),
      profile("family_bathroom_mirror_sos", "浴室白蓝 + 暖黄镜灯", "镜前均匀光，商品包装保持可读", "镜面构图，家长和孩子动作错位停住", "浴室台面、儿童用品、商品软管/瓶身", "亲子生活现场", "不要夸张哭闹、不要儿童脸部扭曲"),
    ],
    shots: [
      shot("family_open_everyone_stops", "0-1s", "opening_action", "家庭成员同时停住看向问题点。", "环境声断一下 + 轻吸气", "partial"),
      shot("family_tension_wrong_attempt", "1-2.5s", "tension_action", "一个错误尝试让问题更明显，众人视线集中。", "轻微笑点音 + 物体摩擦", "partial"),
      shot("family_product_answer", "2.5-4s", "product_bridge_action", "商品进入问题点，动作能继续。", "商品落桌声 + 环境声恢复", "clear_but_not_packshot"),
    ],
  }),
  motif({
    id: "VARIETY_TASK_WALL",
    family: "variety",
    name: "综艺任务墙翻面",
    scope: "culture_borrowing",
    mechanisms: ["任务翻面", "倒吸气", "群体反应"],
    actionLogic: "用无品牌任务墙和群体反应制造停滑，商品是任务答案。",
    viewerStopReason: "任务墙翻面后的反应让观众想看答案是什么。",
    bridge: "商品作为任务答案",
    intents: ["creative_first", "audience_first", "offer_first"],
    exact: ["food_beverage", "mother_baby", "sports_fitness", "ai_tools", "education"],
    adjacent: ["personal_care", "gifts", "tools"],
    strong: ["挑战", "团体", "福利", "任务"],
    profiles: [
      profile("variety_task_wall_no_brand", "亮色任务墙 + 白色地面 + 点状聚光", "任务墙亮起但无品牌标志", "任务卡翻面后切到商品近景", "任务墙、无标识卡片、聚光灯、商品桌", "平台综艺语法，无品牌", "不要真实节目 Logo、主持人台词、观众席"),
      profile("blind_choice_turn_reaction", "舞台暗紫 + 白色追光", "转身瞬间追光落到商品", "先拍反应再拍商品，动作单一", "无品牌按钮、转身椅影、商品台", "盲选转身语法的实物化", "不要真实节目舞美、导师角色"),
    ],
    shots: [
      shot("variety_open_card_flip", "0-1s", "opening_action", "任务卡突然翻面，几个人倒吸气。", "任务提示音 + 倒吸气", "none"),
      shot("variety_tension_reaction", "1-2.5s", "tension_action", "镜头先拍反应再拍任务答案空位。", "环境声断掉", "partial"),
      shot("variety_product_answer", "2.5-4s", "product_bridge_action", "商品被推到答案位，任务成立。", "聚光落下声 + 完成音", "clear_but_not_packshot"),
    ],
  }),
  motif({
    id: "LIVE_COUNTDOWN_DROP",
    family: "live_countdown",
    name: "直播倒计时最后一下",
    scope: "product_related",
    mechanisms: ["倒计时", "抢点停滑", "价值揭示"],
    actionLogic: "用无界面倒计时和手部动作制造最后一秒压力，商品承担价值答案。",
    viewerStopReason: "倒计时最后一下让观众等待商品被揭示。",
    bridge: "商品作为限时答案",
    intents: ["offer_first", "audience_first"],
    exact: ["food_beverage", "beauty", "personal_care", "gifts", "mother_baby"],
    adjacent: ["cleaning", "womenswear", "home"],
    strong: ["优惠", "限时", "套装", "礼盒", "囤货"],
    profiles: [
      profile("live_table_countdown_no_ui", "红白桌面 + 暖色灯带", "倒计时牌反光，商品在光下清楚", "俯拍手揭开盖布/价签，不出现界面", "实体倒计时牌、商品台、手部动作", "直播间桌面语法但无平台 UI", "不要直播界面、弹幕、价格字幕"),
      profile("flash_sale_product_stage", "黑色桌面 + 红金边缘光", "红色边缘光扫过商品包装", "低角度推近，最后一秒停在商品", "商品台、红金小牌、无文字贴纸", "抢购紧张感实拍", "不要硬广 packshot、不要价格文字"),
    ],
    shots: [
      shot("live_open_countdown", "0-1s", "opening_action", "实体倒计时牌最后三下，手停在盖布边缘。", "滴答声加速", "partial"),
      shot("live_tension_final_pause", "1-2.5s", "tension_action", "最后一下前半秒静音，商品仍半遮。", "半秒静音 + 吸气声", "partial"),
      shot("live_product_value_reveal", "2.5-4s", "product_bridge_action", "盖布移开，商品作为限时答案出现但不渲染价格文字。", "揭布声 + 轻定音", "clear_but_not_packshot"),
    ],
  }),
  motif({
    id: "SHORT_DRAMA_DOOR_REVEAL",
    family: "short_drama",
    name: "短剧门开身份反转",
    scope: "culture_borrowing",
    mechanisms: ["身份反转", "门开揭示", "社交错位"],
    actionLogic: "用短剧门开和身份错位制造停滑，商品是反转线索。",
    viewerStopReason: "门开前的身份误判让观众想看真相。",
    bridge: "商品作为身份反转线索",
    intents: ["creative_first", "audience_first"],
    exact: ["womenswear", "beauty", "gifts", "personal_care"],
    adjacent: ["mother_baby", "food_beverage", "home"],
    strong: ["身份反转", "礼物", "穿搭", "社交尴尬"],
    profiles: [
      profile("short_drama_door_warm_backlight", "室内暖黄 + 门缝白光", "门缝逆光，商品在手里半露", "门缝慢开，先看反应后看线索", "门框、手持商品、生活化走廊", "竖屏短剧质感", "不要剧名字幕、夸张豪门场景"),
      profile("hallway_reveal_phone_realism", "走廊灰白 + 局部暖光", "手机实拍自然光", "手持轻晃，门开瞬间定住", "走廊、门把手、商品袋/包装", "真实手机短剧感", "不要文字标题、不要剧情台词烧录"),
    ],
    shots: [
      shot("drama_open_door_pause", "0-1s", "opening_action", "门把手转动，屋内人表情停住。", "门轴声 + 半秒静音", "partial"),
      shot("drama_tension_wrong_identity", "1-2.5s", "tension_action", "对方视线落到手中半露商品，误会升级。", "脚步停顿声", "partial"),
      shot("drama_product_reveal_clue", "2.5-4s", "product_bridge_action", "商品成为反转线索，解释刚才的停顿。", "包装轻响 + 环境声恢复", "clear_but_not_packshot"),
    ],
  }),
  motif({
    id: "NEWSROOM_BULLETIN",
    family: "newsroom",
    name: "严肃插播现场",
    scope: "culture_borrowing",
    mechanisms: ["严肃插播", "突发停顿", "重点圈出"],
    actionLogic: "把日常问题拍成严肃插播现场，商品是被重点圈出的解决线索。",
    viewerStopReason: "严肃语法和小问题错位，让观众想看重点是什么。",
    bridge: "商品作为重点线索",
    intents: ["pain_first", "offer_first", "audience_first"],
    exact: ["ai_tools", "education", "cleaning", "personal_care"],
    adjacent: ["mother_baby", "food_beverage", "home"],
    strong: ["严肃错位", "重点提醒", "避坑", "知识科普"],
    profiles: [
      profile("newsdesk_no_logo_clean_blue", "冷蓝灰 + 白色桌面光", "演播桌冷光，不出现台标", "中轴桌面近景，镜头切到商品重点", "无标识演播桌、资料卡、商品", "新闻插播语法的无品牌化", "不要台标、新闻字幕、真实频道名"),
      profile("field_report_handheld_closeup", "自然户外/家中光 + 灰白麦克风道具", "真实环境光，商品入场处轻微补光", "手持现场连线感，近景聚焦商品", "无标识麦克风、资料夹、现场物品", "现场报道节奏", "不要记者身份标识、真实媒体 Logo"),
    ],
    shots: [
      shot("news_open_serious_pause", "0-1s", "opening_action", "严肃桌面突然停顿，手指圈出问题点。", "插播提示音的实物化短音", "partial"),
      shot("news_tension_detail_point", "1-2.5s", "tension_action", "资料卡推近，重点仍被遮挡一半。", "纸张推近声 + 低频停顿", "partial"),
      shot("news_product_keyline", "2.5-4s", "product_bridge_action", "商品进入重点位置，成为插播要看的线索。", "商品轻放声", "clear_but_not_packshot"),
    ],
  }),
  motif({
    id: "INTERVIEW_SILENCE",
    family: "interview",
    name: "深度访谈一句沉默",
    scope: "product_independent",
    mechanisms: ["一句沉默", "追问停滑", "真相后置"],
    actionLogic: "用访谈追问后的沉默制造停滑，商品作为沉默原因或答案出现。",
    viewerStopReason: "观众想知道一句追问为什么让人停住。",
    bridge: "商品作为沉默答案",
    intents: ["audience_first", "pain_first"],
    exact: ["education", "ai_tools", "mother_baby", "personal_care"],
    adjacent: ["beauty", "sports_fitness", "tools"],
    strong: ["深度追问", "人群洞察", "真实困扰", "心理共鸣"],
    profiles: [
      profile("interview_sofa_soft_shadow", "灰米沙发 + 暖白局部光", "人物脸和手部柔光，商品桌面补光", "双人中近景到桌面商品，沉默半拍", "沙发、茶几、手部动作、商品", "访谈节目语法但无栏目包装", "不要节目名、下三分之一字幕"),
      profile("podcast_table_closeup", "深色桌面 + 暖色小灯", "桌面小灯照亮商品和手部", "固定近景，麦克风道具模糊前景", "无标识麦克风、茶杯、商品", "播客访谈质感", "不要品牌麦克风 Logo、字幕条"),
    ],
    shots: [
      shot("interview_open_question_pause", "0-1s", "opening_action", "追问后人物手停住，空气安静半拍。", "环境声压低 + 呼吸声", "none"),
      shot("interview_tension_hand_detail", "1-2.5s", "tension_action", "手指指向日常卡点，商品还在画面边缘。", "桌面轻敲声", "partial"),
      shot("interview_product_answer", "2.5-4s", "product_bridge_action", "商品被轻轻推近，成为刚才沉默的答案。", "商品滑近声", "clear_but_not_packshot"),
    ],
  }),
  motif({
    id: "LECTURE_BLACKBOARD",
    family: "education",
    name: "讲台黑板重点圈出",
    scope: "culture_borrowing",
    mechanisms: ["重点圈出", "一题讲透", "知识停滑"],
    actionLogic: "把商品/痛点放到讲台问题里，用圈重点让商品成为解题线索。",
    viewerStopReason: "观众想知道被圈出的重点为什么是它。",
    bridge: "商品作为解题线索",
    intents: ["audience_first", "pain_first", "creative_first"],
    exact: ["education", "ai_tools", "mother_baby"],
    adjacent: ["tools", "personal_care", "oral_care"],
    strong: ["孩子学习", "新手教学", "知识解释", "一题讲透"],
    profiles: [
      profile("greenboard_chalk_realism", "绿板深绿 + 粉笔白 + 桌面暖光", "黑板漫反射，商品在讲台桌补光", "粉笔圈出问题后镜头压到商品", "绿板、粉笔、讲台桌、真实商品", "公开课语法，真实教室质感", "不要真实学校 Logo、考试题文字"),
      profile("whiteboard_marker_workshop", "白板冷白 + 彩色便利贴", "会议室均匀光，商品在白板前清晰", "手写圈点动作，单一推近", "白板、便利贴、马克笔、商品", "工作坊教学感", "不要软件界面、品牌培训名"),
    ],
    shots: [
      shot("lecture_open_circle_problem", "0-1s", "opening_action", "粉笔/马克笔圈出一个日常问题，手停住。", "粉笔声/马克笔声", "partial"),
      shot("lecture_tension_wrong_answer", "1-2.5s", "tension_action", "错误答案被划掉，观众等待真正线索。", "轻敲黑板声", "partial"),
      shot("lecture_product_solution", "2.5-4s", "product_bridge_action", "商品放到讲台桌重点位置，成为解题线索。", "商品落桌声", "clear_but_not_packshot"),
    ],
  }),
  motif({
    id: "SPORTS_REPLAY_LAST_CM",
    family: "sports",
    name: "体育回放最后一厘米",
    scope: "product_independent",
    mechanisms: ["慢动作回放", "最后一厘米", "结果判定"],
    actionLogic: "把日常动作拍成体育回放，商品改变最后一厘米结果。",
    viewerStopReason: "观众等慢动作回放的结果判定。",
    bridge: "商品作为结果改变器",
    intents: ["creative_first", "offer_first", "pain_first"],
    exact: ["sports_fitness", "tools", "cleaning"],
    adjacent: ["mother_baby", "food_beverage", "personal_care", "oral_care"],
    strong: ["结果差一点", "动作对比", "运动", "完成度"],
    profiles: [
      profile("sports_replay_clean_motion", "球场冷白 + 高速快门感", "硬光突出动作轨迹，商品清晰", "慢动作回放角度，同一动作前后对比", "无品牌计分牌道具、动作轨迹、商品", "体育回放语法但不用真实赛事包装", "不要赛事 Logo、球队元素、字幕比分"),
      profile("last_centimeter_tabletop", "桌面灰白 + 轨迹线实物道具", "桌面局部硬光", "微距慢推到最后一厘米", "轨迹尺、标记线、商品", "桌面体育判定感", "不要图形 UI 轨迹"),
    ],
    shots: [
      shot("sports_open_near_miss", "0-1s", "opening_action", "日常动作差一厘米失败，镜头定住。", "哨声短音 + 环境声停顿", "none"),
      shot("sports_tension_replay", "1-2.5s", "tension_action", "慢动作回放失败点，手/物体轨迹清楚。", "慢放低频音", "partial"),
      shot("sports_product_changes_result", "2.5-4s", "product_bridge_action", "商品进入后同一动作完成，结果改变。", "完成提示音 + 真实动作声", "clear_but_not_packshot"),
    ],
  }),
  motif({
    id: "FOOD_DOCUMENTARY_MACRO",
    family: "food_doc",
    name: "美食纪录片案板一口前",
    scope: "product_related",
    mechanisms: ["微距质感", "一口前停顿", "感官证据"],
    actionLogic: "用美食纪录片微距把商品感官证据拍成答案。",
    viewerStopReason: "观众被一口前的微距质感抓住。",
    bridge: "商品作为感官证据",
    intents: ["offer_first", "creative_first", "audience_first"],
    exact: ["food_beverage", "tea", "gifts"],
    adjacent: ["beauty", "fragrance", "personal_care"],
    strong: ["口感", "香气", "质地", "礼盒", "饮品"],
    profiles: [
      profile("food_doc_cutting_board_macro", "木案暖棕 + 食物自然色", "侧逆光突出蒸汽/质地", "微距固定，一口前停顿", "案板、器皿、蒸汽、真实商品", "美食纪录片微距", "不要栏目名、旁白字幕、夸张摆拍"),
      profile("tea_steam_slow_closeup", "茶色暖光 + 米白背景", "蒸汽背光，商品包装边缘可读", "杯沿微距到商品", "茶盏、蒸汽、木桌、商品", "慢节奏茶饮质感", "不要古装人物、纯茶艺氛围无商品动作"),
    ],
    shots: [
      shot("food_open_before_bite", "0-1s", "opening_action", "一口/一倒之前停住，蒸汽或质地贴近镜头。", "近听环境声", "partial"),
      shot("food_tension_texture", "1-2.5s", "tension_action", "镜头贴近质地，答案仍未完全露出。", "切/倒/杯沿轻响", "partial"),
      shot("food_product_sensory_anchor", "2.5-4s", "product_bridge_action", "商品和感官证据同框，成为答案。", "商品轻放声 + 环境声", "clear_but_not_packshot"),
    ],
  }),
  motif({
    id: "TREASURE_APPRAISAL",
    family: "appraisal",
    name: "鉴宝白手套真伪一眼",
    scope: "product_related",
    mechanisms: ["真伪判断", "白手套鉴定", "细节定价"],
    actionLogic: "用鉴宝语法把商品细节变成值得停下看的判断点。",
    viewerStopReason: "白手套停在细节上，让观众等待真伪或价值判断。",
    bridge: "商品作为待鉴定细节",
    intents: ["offer_first", "pain_first", "audience_first"],
    exact: ["gifts", "beauty", "fragrance", "food_beverage", "personal_care"],
    adjacent: ["womenswear", "home", "tea"],
    strong: ["礼盒", "包装质感", "价值感", "真伪差异"],
    profiles: [
      profile("appraisal_white_glove_warm_table", "暖木桌 + 米白手套 + 局部金光", "局部柔光扫过包装边缘", "白手套拿起商品细节，固定近景", "白手套、绒布、放大镜、商品", "鉴宝桌面质感", "不要专家姓名、栏目名、估价字幕"),
      profile("luxury_detail_lightbox", "黑绒背景 + 冷白灯箱", "灯箱侧光突出材质", "微距缓慢推近商品材质", "绒布、灯箱、无标识卡片、商品", "精致细节鉴定感", "不要奢侈品 Logo 联想"),
    ],
    shots: [
      shot("appraisal_open_glove_pause", "0-1s", "opening_action", "白手套停在商品细节前一厘米。", "手套摩擦声 + 半秒静音", "partial"),
      shot("appraisal_tension_detail_check", "1-2.5s", "tension_action", "放大镜扫过包装/质地，观众等判断。", "放大镜轻碰桌声", "partial"),
      shot("appraisal_product_value_detail", "2.5-4s", "product_bridge_action", "商品细节被推近，成为价值/真伪答案。", "轻定音 + 商品转动声", "clear_but_not_packshot"),
    ],
  }),
  motif({
    id: "TALK_SHOW_ROAST",
    family: "talk_show",
    name: "脱口秀痛点爆梗",
    scope: "product_independent",
    mechanisms: ["痛点吐槽", "爆梗停顿", "态度反转"],
    actionLogic: "用脱口秀节奏把用户痛点变成一句停顿，再让商品承接反转。",
    viewerStopReason: "熟悉痛点被精准吐槽，观众等下一句反转。",
    bridge: "商品作为反转道具",
    intents: ["audience_first", "pain_first", "offer_first"],
    exact: ["personal_care", "mother_baby", "ai_tools", "cleaning", "storage_home"],
    adjacent: ["beauty", "tools", "education"],
    strong: ["吐槽", "打工人", "家庭痛点", "真香"],
    profiles: [
      profile("talk_show_small_stage_no_logo", "深色小舞台 + 暖黄追光", "单束追光打在桌面道具和手部", "先拍人物停顿，再切商品道具", "无品牌麦克风、圆凳、商品小桌", "小剧场脱口秀语法", "不要节目名、观众席、字幕梗"),
      profile("office_roast_desk_reality", "办公室白灰 + 台灯暖光", "台灯照亮问题物和商品", "工位近景，人物吐槽后手停住", "工位、杯子、便签、商品", "打工人吐槽现场", "不要公司 Logo、弹幕文字"),
    ],
    shots: [
      shot("roast_open_pain_pause", "0-1s", "opening_action", "人物说到痛点时停住，手指指向问题物。", "轻笑前的半秒静音", "none"),
      shot("roast_tension_second_beat", "1-2.5s", "tension_action", "第二个动作放大痛点，商品在边缘半露。", "桌面轻敲声", "partial"),
      shot("roast_product_reversal", "2.5-4s", "product_bridge_action", "商品被拿起成为反转道具，动作继续。", "轻笑声 + 商品轻碰声", "clear_but_not_packshot"),
    ],
  }),
  motif({
    id: "DEBATE_SPLIT",
    family: "debate",
    name: "辩论站队产品破题",
    scope: "product_independent",
    mechanisms: ["站队分裂", "观点冲突", "证据破题"],
    actionLogic: "用左右站队制造分歧，商品作为破题证据进入。",
    viewerStopReason: "观点冲突会让观众想看哪边被反转。",
    bridge: "商品作为破题证据",
    intents: ["audience_first", "offer_first", "pain_first"],
    exact: ["beauty", "personal_care", "mother_baby", "ai_tools", "food_beverage"],
    adjacent: ["cleaning", "education", "gifts"],
    strong: ["评论分裂", "宝妈争论", "选品分歧", "真香反转"],
    profiles: [
      profile("debate_table_split_light", "左右冷暖分色 + 中间白光", "左右人物各自侧光，中间商品亮起", "左右观点手势到中间商品", "圆桌、观点卡、商品中心位", "辩论桌面语法，无节目包装", "不要辩论节目 Logo、字幕条"),
      profile("comment_split_physical_cards", "白桌 + 红蓝观点卡", "观点卡阴影清晰，商品中心补光", "俯拍观点卡推到商品两侧", "观点卡、手势、商品", "评论区争议的实物化", "不要真实评论 UI"),
    ],
    shots: [
      shot("debate_open_split_cards", "0-1s", "opening_action", "左右观点卡同时拍到桌上，中间空着。", "两声桌面拍卡", "none"),
      shot("debate_tension_conflict", "1-2.5s", "tension_action", "两只手同时指向问题点，冲突升级。", "环境声压低", "partial"),
      shot("debate_product_breaks_tie", "2.5-4s", "product_bridge_action", "商品推到中间，成为破题证据。", "商品落中声 + 低频定音", "clear_but_not_packshot"),
    ],
  }),
  motif({
    id: "WORKPLACE_COLLAPSE",
    family: "workplace",
    name: "打工人工位续命道具",
    scope: "product_related",
    mechanisms: ["工位崩溃", "续命道具", "高频共鸣"],
    actionLogic: "把高频工位卡点拍成续命道具入场，商品解决一秒崩溃。",
    viewerStopReason: "打工人熟悉的崩溃瞬间会强识别。",
    bridge: "商品作为续命道具",
    intents: ["audience_first", "pain_first", "offer_first"],
    exact: ["ai_tools", "personal_care", "food_beverage", "storage_home", "tools"],
    adjacent: ["beauty", "cleaning", "education"],
    strong: ["打工人", "效率", "续命", "高频使用"],
    profiles: [
      profile("office_desk_overload", "工位灰白 + 屏幕冷光 + 台灯暖光", "屏幕冷光压迫，商品入场有暖光", "手持近景扫过混乱桌面到商品", "键盘、便签、杯子、商品", "真实工位崩溃感", "不要真实软件界面、公司 Logo"),
      profile("commute_rescue_closeup", "地铁/通勤灰蓝 + 手部暖光", "手部和商品局部补光", "拥挤近景，但商品包装保持清晰", "包、通勤小物、商品", "通勤救急语法", "不要车站品牌、公共交通标识特写"),
    ],
    shots: [
      shot("work_open_overload_stop", "0-1s", "opening_action", "工位/通勤动作突然卡住，人物手停在半空。", "通知声后静音", "partial"),
      shot("work_tension_failed_try", "1-2.5s", "tension_action", "错误尝试让混乱更明显，商品半露。", "桌面杂音", "partial"),
      shot("work_product_rescue", "2.5-4s", "product_bridge_action", "商品进入手边，动作恢复。", "商品轻放声 + 环境声恢复", "clear_but_not_packshot"),
    ],
  }),
  motif({
    id: "MAD_LITERATURE_SILENCE",
    family: "mad_literature",
    name: "发疯文学一秒安静",
    scope: "product_independent",
    mechanisms: ["情绪爆发", "一秒安静", "反差答案"],
    actionLogic: "先用生活化情绪爆发抓住视线，再用商品让画面安静下来。",
    viewerStopReason: "观众想知道为什么上一秒崩溃下一秒安静。",
    bridge: "商品作为情绪反差答案",
    intents: ["pain_first", "audience_first", "creative_first"],
    exact: ["mother_baby", "personal_care", "cleaning", "ai_tools", "storage_home"],
    adjacent: ["beauty", "food_beverage", "education"],
    strong: ["崩溃", "情绪", "家庭混乱", "一秒安静"],
    profiles: [
      profile("home_chaos_to_quiet", "混乱生活色 + 商品入场暖白", "前半段略乱，商品入场后光线稳定", "手持晃动到固定近景", "家庭桌面、问题物、商品", "真实生活崩溃反差", "不要大字报字幕、夸张发疯表情"),
      profile("desk_meltdown_static_reset", "工位冷光 + 台灯暖光", "商品入场时台灯成为主光", "固定机位，人物动作从乱到停", "工位杂物、商品", "短视频情绪梗实物化", "不要弹幕和贴纸"),
    ],
    shots: [
      shot("mad_open_meltdown", "0-1s", "opening_action", "人物或手部动作明显崩溃，画面还是真实生活。", "混乱环境声突然切断", "none"),
      shot("mad_tension_silence", "1-2.5s", "tension_action", "一秒安静，所有视线落到半露商品。", "半秒静音 + 呼吸声", "partial"),
      shot("mad_product_reset", "2.5-4s", "product_bridge_action", "商品进入动作链，让混乱动作恢复秩序。", "商品轻放声 + 轻快提示音", "clear_but_not_packshot"),
    ],
  }),
  motif({
    id: "CYBERPUNK_NEGOTIATION",
    family: "neon_negotiation",
    name: "霓虹谈判筹码",
    scope: "culture_borrowing",
    mechanisms: ["谈判筹码", "霓虹压迫", "桌面反转"],
    actionLogic: "用霓虹谈判桌把商品作为最后筹码推入。",
    viewerStopReason: "谈判桌上的沉默和筹码入场带来反转期待。",
    bridge: "商品作为谈判筹码",
    intents: ["creative_first", "offer_first"],
    exact: ["ai_tools", "tools", "beauty", "womenswear", "gifts"],
    adjacent: ["personal_care", "food_beverage", "sports_fitness"],
    strong: ["高价值", "反转", "潮流", "科技感"],
    profiles: [
      profile("neon_negotiation_table", "紫蓝霓虹 + 黑玻璃桌 + 红色边缘光", "霓虹侧光，商品边缘反光清楚", "低角度桌面推近，筹码滑入", "黑玻璃桌、无标识筹码、商品", "港风霓虹谈判感", "不要具体电影美术、帮派标志"),
      profile("future_counter_offer", "冷蓝金属 + 暖红警示小灯", "金属反光但商品包装不变形", "固定近景，手把商品推入桌面中心", "金属桌面、光带、商品", "轻科幻商业谈判", "不要全息 UI、文字面板"),
    ],
    shots: [
      shot("neon_open_silence", "0-1s", "opening_action", "谈判桌上所有手停住，中心位空着。", "低频嗡鸣 + 静音断点", "none"),
      shot("neon_tension_chip_slide", "1-2.5s", "tension_action", "筹码或道具滑到商品入场路径前。", "筹码滑动声", "partial"),
      shot("neon_product_counteroffer", "2.5-4s", "product_bridge_action", "商品被推到中心，成为反转筹码。", "商品滑入声 + 低频定音", "clear_but_not_packshot"),
    ],
  }),
  motif({
    id: "PUBLIC_MYTH_TOOL",
    family: "myth_tool",
    name: "公共神话道具入场",
    scope: "culture_borrowing",
    mechanisms: ["神话道具", "反命运停滑", "触发反转"],
    actionLogic: "只借公共神话的道具功能和动作结构，商品成为触发器。",
    viewerStopReason: "熟悉的神话动作被放进日常问题，观众想看反转。",
    bridge: "商品作为触发器",
    intents: ["creative_first", "pain_first"],
    exact: ["mother_baby", "sports_fitness", "food_beverage", "personal_care"],
    adjacent: ["beauty", "gifts", "tools"],
    strong: ["儿童产品", "高刺激", "反转", "挑战"],
    profiles: [
      profile("myth_tool_fire_ring_abstract", "暖橙火光 + 深蓝背景", "抽象圆形光影扫过商品，不出现角色", "近景冲镜后固定到商品", "抽象圆形道具、任务线、商品", "公共神话道具语法，轻奇幻", "不要现代动画造型、角色脸、武器复刻"),
      profile("folk_guardian_open_door", "红金门缝 + 暖白门后光", "门开瞬间暖光照到商品", "门缝慢开，商品从门后递出", "红金门口、门缝光、商品", "民俗守护仪式感", "不要具体门神画像脸、宗教化承诺"),
    ],
    shots: [
      shot("myth_open_trigger", "0-1s", "opening_action", "抽象道具/门缝光突然触发，日常动作停住。", "短促锣点 + 风声停顿", "partial"),
      shot("myth_tension_pressure", "1-2.5s", "tension_action", "光影或门缝压近，观众等待真正道具。", "鼓点加速", "partial"),
      shot("myth_product_trigger", "2.5-4s", "product_bridge_action", "商品作为触发器进入，让动作反转。", "触发提示音 + 商品落位声", "clear_but_not_packshot"),
    ],
  }),
  motif({
    id: "KPOP_STAGE_FLASH",
    family: "kpop_stage",
    name: "偶像舞台一拍重启",
    scope: "culture_borrowing",
    mechanisms: ["节拍停顿", "队形错位", "信号复位"],
    actionLogic: "用舞台节拍和队形错位制造停滞，商品作为复位信号继续动作。",
    viewerStopReason: "观众会盯着停在关键拍点的节拍错位，等下一下齐步。",
    bridge: "商品作为复位道具",
    intents: ["creative_first", "audience_first", "offer_first"],
    exact: ["beauty", "womenswear", "fragrance", "personal_care", "gifts"],
    adjacent: ["home", "mother_baby", "food_beverage"],
    strong: ["节拍感", "舞台", "同款动作", "统一转场"],
    profiles: [
      profile("kpop_stage_led_corner", "黑色舞台底色 + 彩色侧光", "舞台主灯 + 冷白边缘", "节奏点位追踪，镜头随节拍轻移", "舞台轨道灯、队形线、真实道具", "现场舞台感，动作线清晰", "不要真实艺人脸、现成舞台名、歌词文本"),
      profile("kpop_backup_room_realism", "镜面墙 + 暖白补光", "镜头停在商品手位，人物不抢占画面", "手持微移，动作节拍逐步清晰", "镜框、计拍卡、商品道具", "排练室风格，不要演唱会级灯光", "不要真实演出剧本照、舞台品牌元素"),
    ],
    shots: [
      shot("kpop_open_rhythm_hold", "0-1s", "opening_action", "节拍起拍，人物动作在同一拍点被打断。", "鼓点骤停 + 环境吸气", "partial"),
      shot("kpop_tension_beat_shift", "1-2.5s", "tension_action", "镜头围绕停顿动作转向，队形有偏差但不解说。", "风铃落花 + 短促拍板", "partial"),
      shot("kpop_product_restart", "2.5-4s", "product_bridge_action", "商品入场作为复位道具，动作重新齐拍。", "拍案静音后轻拍提示", "clear_but_not_packshot"),
    ],
  }),
  motif({
    id: "TIKTOK_DUET_REBOND",
    family: "short_duet",
    name: "短视频对拍错位续接",
    scope: "product_related",
    mechanisms: ["对拍反转", "错位延迟", "观点复位"],
    actionLogic: "用对拍画面对视形成错位，商品把节奏从“无解”改成“可复制”。",
    viewerStopReason: "观众会想看下一帧对拍到底补齐了什么。",
    bridge: "商品作为对拍线索",
    intents: ["audience_first", "creative_first", "pain_first"],
    exact: ["beauty", "personal_care", "mother_baby", "education", "tools"],
    adjacent: ["food_beverage", "gifts", "home"],
    strong: ["对拍", "家庭对话", "教程场景", "可复制动作"],
    profiles: [
      profile("duet_split_screen_real", "灰白室内 + 冷暖对照", "左右分屏，单向追焦", "先拍A手再切B手，第三拍拉近商品", "真实手机持拍道具、对拍标记卡", "分屏短视频感，动作逻辑优先", "不要真人平台UI、弹幕刷屏"),
      profile("duet_phone_woodboard", "中性木桌 + 主光从上", "固定三分之一构图，商品作为第三人", "木桌与双手交替入镜", "木桌、便签、商品", "低成本真实短视频实验感", "不要真实平台标签、真实网红口播"),
    ],
    shots: [
      shot("duet_open_sync_fail", "0-1s", "opening_action", "A、B画面同时停在同一动作缺口。", "两段同步拍框 + 环境静音", "partial"),
      shot("duet_tension_cross_answer", "1-2.5s", "tension_action", "对拍延迟出现，动作仍未打通。", "拍案静音 + 轻击桌面", "partial"),
      shot("duet_product_bridge", "2.5-4s", "product_bridge_action", "商品从第三视角进入，动作切换成功。", "轻快过门提示音", "clear_but_not_packshot"),
    ],
  }),
  motif({
    id: "GACHA_DRAW_CHAMBER",
    family: "gacha_draw",
    name: "盲盒抽签前后的反转瞬间",
    scope: "culture_borrowing",
    mechanisms: ["随机悬念", "抽签停顿", "结果反转"],
    actionLogic: "把用户疑问拍成抽签瞬间，商品作为结果触发继续。",
    viewerStopReason: "观众会等抽签结果是否与期待一致。",
    bridge: "商品作为开奖触发",
    intents: ["creative_first", "pain_first", "offer_first"],
    exact: ["beauty", "food_beverage", "personal_care", "gifts", "fragrance"],
    adjacent: ["womenswear", "mother_baby", "home"],
    strong: ["抽盒", "盲盒", "结果反转", "开箱"],
    profiles: [
      profile("gacha_pool_card_focus", "高饱和金属蓝 + 暖黄点缀", "卡盒开启灯从暗到亮", "低角度拉近抽签道具与手", "抽签盒、色卡、商品", "盲盒现场感，但不展示版权玩法", "不要真实游戏 IP、卡牌图案 IP"),
      profile("gacha_rigging_table_real", "木桌+暖白补光", "道具路径清晰，商品边界明亮", "停留三分之一拍再推进", "木桌、抽签纸条、透明箱", "居家抽签戏剧感", "不要赌博化标签、真实卡牌游戏商标"),
    ],
    shots: [
      shot("gacha_open_hold", "0-1s", "opening_action", "抽签前手指停在盒口，尚未揭开。", "轻轻风声 + 拍案静音", "partial"),
      shot("gacha_tension_spin", "1-2.5s", "tension_action", "结果慢慢揭开前一刻，结果被遮挡。", "鼓点骤停 + 风铃落花", "partial"),
      shot("gacha_product_reveal", "2.5-4s", "product_bridge_action", "商品入场作为抽签结论，动作有答案。", "棋子落桌 + 轻快提示音", "clear_but_not_packshot"),
    ],
  }),
  motif({
    id: "ANIME_PANEL_MASH",
    family: "anime_panel",
    name: "动漫分镜错位停帧",
    scope: "product_related",
    mechanisms: ["分镜停帧", "台词留白", "画面跳格"],
    actionLogic: "把日常过程按漫画分镜切段，商品作为下一格承接。",
    viewerStopReason: "分格留白会让人看完整格转场后答案。",
    bridge: "商品作为下一格承接点",
    intents: ["creative_first", "audience_first", "pain_first"],
    exact: ["beauty", "personal_care", "mother_baby", "education", "womenswear"],
    adjacent: ["home", "fragrance", "gifts"],
    strong: ["分格", "留白", "角色反应", "对比"],
    profiles: [
      profile("anime_panel_neon_linework", "白底黑线 + 青色边框", "画面边缘裁切感", "固定中景，面部与道具留白", "分镜板、线框、商品", "漫画书页分格风格，但保留实拍", "不要具体动漫角色、标志性台词"),
      profile("anime_panel_scratchboard", "米白纸纹 + 低饱和墨色", "台词卡从左上跳入", "每格停留 0.8 秒后切下一格", "分镜纸、铅笔痕、商品", "漫画化叙事质感，写实素材为主", "不要抄袭版权人物造型"),
    ],
    shots: [
      shot("anime_open_panel_cut", "0-1s", "opening_action", "人物动作被“第一格”卡住，画面出现分格边界。", "轻薄拍击声", "partial"),
      shot("anime_tension_empty_bubble", "1-2.5s", "tension_action", "第二格只留空白道具，信息被压住。", "棋子落桌 + 半秒静音", "partial"),
      shot("anime_product_bridge_panel", "2.5-4s", "product_bridge_action", "商品出现在下一格，动作顺利接续。", "鼓点骤停后轻落格音", "clear_but_not_packshot"),
    ],
  }),
  motif({
    id: "CITY_TRAVEL_TRANSITION",
    family: "travel_transition",
    name: "城市移步一秒倒叙",
    scope: "culture_borrowing",
    mechanisms: ["场景切片", "错位倒叙", "目标再起"],
    actionLogic: "用城市移动场景做“到站错位”，商品是下一站承接点。",
    viewerStopReason: "观众会在场景切换瞬间等到关键动作重启。",
    bridge: "商品作为转场站点",
    intents: ["creative_first", "offer_first", "audience_first"],
    exact: ["food_beverage", "beauty", "personal_care", "tools", "home"],
    adjacent: ["mother_baby", "fragrance", "gifts"],
    strong: ["都市", "转场", "场景切片", "停站"],
    profiles: [
      profile("travel_station_overhead", "霓虹黄绿 + 冷白天桥灯", "列车/地铁门处局部强对比", "前后景切换到同一构图", "门框、站台、行李/背包", "通勤地铁感，不带平台 UI", "不要真实地铁路线标识/真实站名"),
      profile("street_flash_vlog_cut", "街景暖白 + 阴影", "步行视角跟拍，短切入门", "转场前后同一动作延续", "街道路牌、杯、商品", "轻旅行Vlog语法", "不要品牌景点名、公交应用截图"),
    ],
    shots: [
      shot("travel_open_door_halt", "0-1s", "opening_action", "开门/过站时动作停住，目标未达成。", "车厢低频 + 半秒静音", "partial"),
      shot("travel_tension_transfer_wait", "1-2.5s", "tension_action", "转场前的最后一步失败，画面留白。", "环境音压低", "partial"),
      shot("travel_product_platform_bridge", "2.5-4s", "product_bridge_action", "商品递出，动作从停顿到继续。", "鼓点骤停 + 商品轻落桌", "clear_but_not_packshot"),
    ],
  }),
]

function motif(input: {
  id: string
  family: string
  name: string
  scope: CultureBorrowingScope
  mechanisms: string[]
  actionLogic: string
  viewerStopReason: string
  bridge: string
  intents: HookOneShotIntent[]
  exact: string[]
  adjacent: string[]
  fallback?: string[]
  strong: string[]
  weak?: string[]
  profiles: Array<Omit<VisualRenderProfile, "cultureMotifId">>
  shots: Array<Omit<MotifShotPrimitive, "cultureMotifId">>
}): MotifSeed {
  return {
    cultureMotifId: input.id,
    templateId: `motif_${input.id.toLowerCase()}`,
    motifFamily: input.family,
    motifName: input.name,
    hookScope: input.scope,
    cultureMechanism: input.mechanisms,
    actionLogic: input.actionLogic,
    viewerStopReason: input.viewerStopReason,
    productBridgeRole: input.bridge,
    forbiddenShallowUse: [
      "不能只把文化当背景或滤镜",
      "必须有文化动作改变人物/商品动作链",
      "不能出现具体 IP、角色脸、Logo、原台词、原音乐或平台界面",
    ],
    compatibleIntentModes: input.intents,
    exact: input.exact,
    adjacent: input.adjacent,
    fallback: input.fallback ?? ["general"],
    strongUseCases: input.strong,
    weakUseCases: input.weak ?? [],
    profiles: input.profiles,
    shots: input.shots,
  }
}

function profile(
  visualRenderProfileId: string,
  palette: string,
  lighting: string,
  cameraGrammar: string,
  setDressing: string,
  texture: string,
  negativeStyle: string,
): Omit<VisualRenderProfile, "cultureMotifId"> {
  return {
    visualRenderProfileId,
    profileName: visualRenderProfileId,
    palette,
    lighting,
    cameraGrammar,
    setDressing,
    texture,
    negativeStyle,
  }
}

function shot(
  shotPrimitiveId: string,
  timeRange: MotifShotPrimitive["timeRange"],
  shotRole: MotifShotPrimitive["shotRole"],
  action: string,
  audio: string,
  productVisibility: MotifShotPrimitive["productVisibility"],
): Omit<MotifShotPrimitive, "cultureMotifId"> {
  return { shotPrimitiveId, timeRange, shotRole, action, audio, productVisibility }
}

export const CULTURE_MOTIFS: CultureMotifResource[] = BASE_MOTIF_SEEDS.map((seed) => ({
  cultureMotifId: seed.cultureMotifId,
  templateId: seed.templateId,
  motifFamily: seed.motifFamily,
  motifName: seed.motifName,
  hookScope: seed.hookScope,
  actionLogic: seed.actionLogic,
  viewerStopReason: seed.viewerStopReason,
  productBridgeRole: seed.productBridgeRole,
  forbiddenShallowUse: seed.forbiddenShallowUse,
  compatibleIntentModes: seed.compatibleIntentModes,
  cultureMechanism: seed.cultureMechanism,
  renderProfileIds: seed.profiles.map((profile) => profile.visualRenderProfileId),
  shotPrimitiveIds: seed.shots.map((shot) => shot.shotPrimitiveId),
}))

export const VISUAL_RENDER_PROFILES: VisualRenderProfile[] = BASE_MOTIF_SEEDS.flatMap((seed) =>
  seed.profiles.map((profile) => ({ ...profile, cultureMotifId: seed.cultureMotifId }))
)

export const MOTIF_SHOT_PRIMITIVES: MotifShotPrimitive[] = BASE_MOTIF_SEEDS.flatMap((seed) =>
  seed.shots.map((shot) => ({ ...shot, cultureMotifId: seed.cultureMotifId }))
)

export const PRODUCT_FIT_POLICIES: ProductFitPolicy[] = BASE_MOTIF_SEEDS.map((seed) => ({
  cultureMotifId: seed.cultureMotifId,
  exactCategoryIds: seed.exact,
  adjacentCategoryIds: seed.adjacent,
  fallbackCategoryIds: seed.fallback,
  strongUseCases: seed.strongUseCases,
  weakUseCases: seed.weakUseCases,
}))

export function selectCultureMotifBorrowing(
  request: CultureMotifSelectionRequest,
  random: () => number = Math.random,
): SelectedCultureBorrowing | null {
  const ranked = rankCultureMotifs(request)
  const limit = Math.min(Math.max(request.limit ?? 10, 3), 12)
  const pool = ranked.slice(0, limit)
  const picked = weightedPick(pool, (candidate) => Math.max(1, Math.round(candidate.score * 20)), random)
  return picked ? buildSelectedCultureBorrowing(picked) : null
}

export function rankCultureMotifs(request: CultureMotifSelectionRequest) {
  const normalizedCategory = normalizeCategory(request.productCategory)
  const recentIds = (request.recentTemplateIds ?? []).slice(0, 5)
  const recentMotifIds = recentIds.map((id) => motifForAnyId(id)?.cultureMotifId).filter((id): id is string => Boolean(id))
  const recentFamilies = recentMotifIds
    .map((id) => CULTURE_MOTIFS.find((motif) => motif.cultureMotifId === id)?.motifFamily)
    .filter((family): family is string => Boolean(family))

  return CULTURE_MOTIFS
    .map((motif) => {
      const fit = PRODUCT_FIT_POLICIES.find((policy) => policy.cultureMotifId === motif.cultureMotifId)
      const profiles = VISUAL_RENDER_PROFILES.filter((profile) => profile.cultureMotifId === motif.cultureMotifId)
      const shots = MOTIF_SHOT_PRIMITIVES.filter((shot) => shot.cultureMotifId === motif.cultureMotifId)
      const selectedProfile = profiles[profileIndex(request.nonce, motif.cultureMotifId, profiles.length)] ?? profiles[0]
      const scoreParts = scoreMotif({
        motif,
        fit,
        normalizedCategory,
        request,
        recentMotifIds,
        recentFamilies,
      })
      return {
        motif,
        fit,
        visualProfile: selectedProfile,
        shots: shots.slice(0, 3),
        score: scoreParts.score,
        whySelected: scoreParts.why,
      }
    })
    .sort((a, b) => b.score - a.score)
}

export function getCultureBorrowingTemplateByMotifId(templateOrMotifId: string): SelectedCultureBorrowing | null {
  const motif = motifForAnyId(templateOrMotifId)
  if (!motif) return null
  const visualProfile = VISUAL_RENDER_PROFILES.find((profile) => profile.cultureMotifId === motif.cultureMotifId)
  const shots = MOTIF_SHOT_PRIMITIVES.filter((shot) => shot.cultureMotifId === motif.cultureMotifId).slice(0, 3)
  if (!visualProfile || shots.length < 3) return null

  return buildSelectedCultureBorrowing({
    motif,
    fit: PRODUCT_FIT_POLICIES.find((policy) => policy.cultureMotifId === motif.cultureMotifId),
    visualProfile,
    shots,
    score: 0,
    whySelected: ["motif 备份模板回退"],
  })
}

function scoreMotif(input: {
  motif: CultureMotifResource
  fit?: ProductFitPolicy
  normalizedCategory: string
  request: CultureMotifSelectionRequest
  recentMotifIds: string[]
  recentFamilies: string[]
}) {
  const why: string[] = []
  let score = 0.2
  const category = input.normalizedCategory
  const fit = input.fit
  if (category && fit?.exactCategoryIds.includes(category)) {
    score += 0.42
    why.push(`精确类目匹配:${category}`)
  } else if (category && fit?.adjacentCategoryIds.includes(category)) {
    score += 0.24
    why.push(`近似类目匹配:${category}`)
  } else if (!category) {
    score += 0.08
    why.push("无类目时保守可用")
  } else if (fit?.fallbackCategoryIds.includes("general")) {
    score += 0.035
    why.push("全品类 fallback，仅低权重")
  }

  if (input.motif.compatibleIntentModes.includes(input.request.intent)) {
    score += 0.13
    why.push(`意图匹配:${input.request.intent}`)
  }
  if (scopeMatches(input.motif.hookScope, input.request.hookScope)) {
    score += 0.08
    why.push("hook scope 匹配")
  }
  if (hookTextMatches(input.motif, input.request.selectedHook)) {
    score += 0.09
    why.push("hook 类型/文案匹配")
  }
  if (strongUseCaseMatches(fit, input.request.selectedHook, input.request.productCategory)) {
    score += 0.08
    why.push("强使用场景命中")
  }

  if (input.recentMotifIds.includes(input.motif.cultureMotifId)) {
    score -= 0.35
    why.push("最近模板重复降权")
  }
  const recentFamilyCount = input.recentFamilies.filter((family) => family === input.motif.motifFamily).length
  if (recentFamilyCount >= 2) {
    score -= 0.5
    why.push("最近 5 次同 motifFamily 已达 2 次，强降权")
  } else if (recentFamilyCount === 1) {
    score -= 0.08
    why.push("最近同 motifFamily 轻度降权")
  }

  const jitter = seededJitter(`${input.request.nonce ?? ""}:${input.motif.cultureMotifId}`)
  score += jitter
  const finalScore = normalizeScore(score)
  why.push(`score=${finalScore.toFixed(3)}`)
  return { score: finalScore, why }
}

function normalizeScore(score: number) {
  if (score <= 0.9) return Math.max(0.01, Number(score.toFixed(3)))
  const compressed = 0.9 + (score - 0.9) * 0.18
  return Math.max(0.01, Math.min(0.98, Number(compressed.toFixed(3))))
}

function buildSelectedCultureBorrowing(input: ReturnType<typeof rankCultureMotifs>[number]): SelectedCultureBorrowing {
  const { motif, visualProfile, shots, whySelected } = input
  const symbolBorrowing = buildSymbolBorrowing(motif, visualProfile, shots)
  const duration = shots.some((shot) => shot.timeRange === "3-5s") ? 5 : 4
  return {
    templateId: motif.templateId,
    nameCn: motif.motifName,
    hookScope: motif.hookScope,
    cultureMechanism: motif.cultureMechanism,
    symbolEntryIds: [motif.cultureMotifId, visualProfile.visualRenderProfileId, ...shots.map((shot) => shot.shotPrimitiveId)],
    recommendedDurationSec: duration,
    openingCapture: shots[0]?.action ?? motif.actionLogic,
    attentionEscalation: shots[1]?.action ?? motif.viewerStopReason,
    productBridgeRule: motif.productBridgeRole,
    firstFrameFormula: `竖屏9:16，${visualProfile.palette}，${visualProfile.lighting}；${visualProfile.setDressing}；首秒执行：${shots[0]?.action ?? motif.actionLogic}。`,
    finalVideoPromptFormulaCn: [
      `生成${duration}秒竖屏短视频，cultureMotifId=${motif.cultureMotifId}，visualRenderProfileId=${visualProfile.visualRenderProfileId}。`,
      `视觉渲染：palette=${visualProfile.palette}；lighting=${visualProfile.lighting}；camera=${visualProfile.cameraGrammar}；set=${visualProfile.setDressing}；texture=${visualProfile.texture}。`,
      ...shots.map((shot) => `${shot.timeRange} ${shot.action} 声音=${shot.audio}`),
      `商品承接：${motif.productBridgeRole}。`,
      `避免：${visualProfile.negativeStyle}；${motif.forbiddenShallowUse.join("；")}。`,
    ].join(" "),
    audioFormulaCn: shots.map((shot) => shot.audio).join("；"),
    verbalFormulaCn: `口播元数据围绕「${motif.viewerStopReason}」，不烧录文字。`,
    symbolBorrowing,
    fusionDirectives: [
      `必须先执行 cultureMotifId=${motif.cultureMotifId}，不能只写文化风格。`,
      `必须使用 visualRenderProfileId=${visualProfile.visualRenderProfileId}：${visualProfile.palette}；${visualProfile.lighting}；${visualProfile.cameraGrammar}。`,
      `必须按 shotPrimitiveIds=${shots.map((shot) => shot.shotPrimitiveId).join(",")} 驱动动作链。`,
      `商品承接必须是「${motif.productBridgeRole}」，成为文化动作继续的理由。`,
      ...motif.forbiddenShallowUse,
    ],
    applicableCategories: [
      ...(input.fit?.exactCategoryIds ?? []),
      ...(input.fit?.adjacentCategoryIds ?? []),
      "general_fallback_low_weight",
    ],
    productDependency: motif.hookScope === "product_independent" ? "medium" : "strong",
    requiredProductAppearanceTiming: shots[2]?.timeRange === "3-5s" ? "3-5s" : "1-3s",
    tags: [motif.cultureMotifId, motif.motifFamily, visualProfile.visualRenderProfileId, ...motif.cultureMechanism],
    cultureMotifId: motif.cultureMotifId,
    motifFamily: motif.motifFamily,
    visualRenderProfileId: visualProfile.visualRenderProfileId,
    shotPrimitiveIds: shots.map((shot) => shot.shotPrimitiveId),
    whySelected,
  }
}

function buildSymbolBorrowing(
  motif: CultureMotifResource,
  profile: VisualRenderProfile,
  shots: MotifShotPrimitive[],
): CultureSymbolBorrowingPackage {
  return {
    visual: unique([
      `cultureMotifId=${motif.cultureMotifId}`,
      `visualRenderProfileId=${profile.visualRenderProfileId}`,
      profile.palette,
      profile.lighting,
      profile.setDressing,
      profile.texture,
    ]),
    style: unique([profile.profileName, profile.palette, profile.lighting, profile.texture, profile.negativeStyle]),
    motion: unique([motif.actionLogic, ...shots.map((shot) => shot.action)]),
    audio: unique(shots.map((shot) => shot.audio)),
    verbal: unique([motif.viewerStopReason, "不烧录字幕，只作为口播/对白/节奏提示"]),
    narrative: unique([motif.viewerStopReason, ...motif.cultureMechanism]),
    productBridge: unique([motif.productBridgeRole, ...shots.filter((shot) => shot.shotRole === "product_bridge_action").map((shot) => shot.action)]),
    firstFrame: unique([`首帧必须出现 ${profile.setDressing}`, shots[0]?.action ?? motif.actionLogic, profile.cameraGrammar]),
    video: unique([motif.actionLogic, ...shots.map((shot) => `${shot.timeRange} ${shot.action}`)]),
  }
}

function weightedPick<T>(items: T[], weight: (item: T) => number, random: () => number) {
  const weighted = items.map((item) => ({ item, weight: Math.max(1, Math.floor(weight(item))) }))
  const total = weighted.reduce((sum, item) => sum + item.weight, 0)
  let cursor = random() * total
  for (const item of weighted) {
    cursor -= item.weight
    if (cursor <= 0) return item.item
  }
  return weighted.at(-1)?.item ?? items[0]
}

function normalizeCategory(value?: string | null) {
  const raw = String(value ?? "").trim()
  if (!raw) return ""
  return CATEGORY_ALIASES[raw] ?? raw.toLowerCase().replace(/\s+/g, "_")
}

function scopeMatches(motifScope: CultureBorrowingScope, requestScope?: "product_related" | "product_independent") {
  if (!requestScope) return true
  return motifScope === requestScope || motifScope === "culture_borrowing"
}

function hookTextMatches(motif: CultureMotifResource, hook?: Partial<HookRecommendationCard> | null) {
  const text = [
    hook?.hookType,
    hook?.hookTypeLabel,
    hook?.subType,
    hook?.subTypeLabel,
    hook?.displayName,
    hook?.reason,
    motif.motifName,
    motif.actionLogic,
    motif.viewerStopReason,
    motif.productBridgeRole,
  ].filter(Boolean).join(" ")
  if (hook?.hookType === "H7" && /(文化|任务|证据|神话|游戏|综艺|短剧|访谈|讲台|新闻)/.test(text)) return true
  if (hook?.hookType === "H3" && /(悬念|线索|揭示|门|任务|倒计时)/.test(text)) return true
  if (hook?.hookType === "H2" && /(冲突|失败|崩溃|静音|反转)/.test(text)) return true
  if (hook?.hookType === "H5" && /(证据|结果|价值|鉴定|回放)/.test(text)) return true
  if (hook?.hookType === "H6" && /(群体|站队|家庭|综艺|围观|辩论)/.test(text)) return true
  return false
}

function strongUseCaseMatches(
  fit: ProductFitPolicy | undefined,
  hook?: Partial<HookRecommendationCard> | null,
  productCategory?: string | null,
) {
  const text = [
    productCategory,
    hook?.displayName,
    hook?.reason,
    hook?.exampleStructure,
  ].filter(Boolean).join(" ")
  return (fit?.strongUseCases ?? []).some((useCase) => text.includes(useCase))
}

function motifForAnyId(id: string) {
  return CULTURE_MOTIFS.find((motif) => motif.templateId === id || motif.cultureMotifId === id)
}

function profileIndex(nonce: string | number | null | undefined, motifId: string, length: number) {
  if (length <= 1) return 0
  const seed = `${nonce ?? ""}:${motifId}`.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return seed % length
}

function seededJitter(seed: string) {
  if (!seed.trim()) return 0
  const value = seed.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return (value % 31) / 1000
}

function unique(values: Array<string | undefined | null>) {
  return [...new Set(values.map((value) => String(value ?? "").trim()).filter(Boolean))]
}
