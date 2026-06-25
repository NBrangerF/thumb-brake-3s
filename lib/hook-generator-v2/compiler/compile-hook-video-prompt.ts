import type { VideoProvider } from "@/lib/video-generation/model-capabilities"
import type { HookOneShotModelFamily } from "@/lib/hook-generator-v2/graph/types"
import type { HookCreativeResourceBundle } from "@/lib/hook-generator-v2/resources/types"
import type { HookScriptAsset, ScriptCreativeSpec } from "@/lib/hook-generator-v2/script-asset/types"
import { toLegacyHookScriptResult } from "@/lib/hook-generator-v2/script-asset/legacy-adapter"
import type { SelectedCultureBorrowing } from "@/lib/hook-library"

import type { CompiledHookVideoPrompt } from "./types"

export function compileHookVideoPrompt(input: {
  scriptAsset: HookScriptAsset
  scriptCreativeSpec: ScriptCreativeSpec
  modelFamily: HookOneShotModelFamily
  videoProvider: VideoProvider
  productImage: string
  firstFrameUrl?: string | null
}): CompiledHookVideoPrompt {
  if (input.modelFamily === "sora") return compileSoraPrompt(input)
  if (input.modelFamily === "veo") return compileVeoPrompt(input)
  return compileSeedancePrompt(input)
}

export function compileSeedanceAssetPromptShadow(input: {
  scriptAsset: HookScriptAsset
  scriptCreativeSpec: ScriptCreativeSpec
  resourceBundle: HookCreativeResourceBundle
  videoProvider: VideoProvider
  productImage: string
  selectedCultureBorrowing?: SelectedCultureBorrowing | null
}): CompiledHookVideoPrompt {
  const sections = buildSeedanceAssetPromptSections(input)
  return {
    ...baseCompiled({
      scriptCreativeSpec: input.scriptCreativeSpec,
      modelFamily: "seedance",
      videoProvider: input.videoProvider,
    }),
    prompt: flattenSections(sections),
    sections,
    inputImages: [{
      source: input.productImage,
      declared_role: "product_front",
      user_caption: "Hook 商品主图",
    }],
  }
}

export const compileSeedanceAssetPromptPrimary = compileSeedanceAssetPromptShadow

function compileSeedancePrompt(input: {
  scriptAsset: HookScriptAsset
  scriptCreativeSpec: ScriptCreativeSpec
  modelFamily: HookOneShotModelFamily
  videoProvider: VideoProvider
  productImage: string
}): CompiledHookVideoPrompt {
  return {
    ...baseCompiled(input),
    prompt: toLegacyHookScriptResult(input.scriptAsset).videoPrompt,
    inputImages: [{
      source: input.productImage,
      declared_role: "product_front",
      user_caption: "Hook 商品主图",
    }],
  }
}

function buildSeedanceAssetPromptSections(input: {
  scriptAsset: HookScriptAsset
  scriptCreativeSpec: ScriptCreativeSpec
  resourceBundle: HookCreativeResourceBundle
  productImage: string
  selectedCultureBorrowing?: SelectedCultureBorrowing | null
}): NonNullable<CompiledHookVideoPrompt["sections"]> {
  const { scriptAsset, scriptCreativeSpec, resourceBundle } = input
  const productLock = scriptCreativeSpec.productLock
  const culture = scriptAsset.cultureFusionMechanism
  const userIntentExpansion = scriptCreativeSpec.intentContract.userIntentExpansion
  const deferSalesProductReveal = isShortPainHook(scriptCreativeSpec)
  const forbidden = unique([
    ...productLock.forbiddenConfusions,
    ...resourceBundle.failureWarnings.map((item) => item.warning),
    ...(culture?.forbiddenShallowUse ?? []),
    ...(resourceBundle.cultureMotif ? ["具体角色脸", "标志", "原台词", "原音乐", "平台界面", "随机文字"] : []),
  ])
  const coreConflict = chineseText(
    scriptAsset.tensionPlan?.pressureSource || scriptCreativeSpec.intentContract.userIntentText,
    `${scriptCreativeSpec.intentContract.userIntentText}带来的真实卡点`,
  )
  const firstShock = chineseText(
    scriptAsset.tensionPlan?.firstSecondShock,
    `第一秒让人物在${productLock.usageSignals[0] || "使用动作"}前停住`,
  )
  const escalation = chineseText(
    scriptAsset.tensionPlan?.escalationBeat,
    "第二拍让同一个动作再次失败，压力升级",
  )
  const question = chineseText(
    scriptAsset.tensionPlan?.unresolvedQuestion,
    "观众想知道这个卡住动作怎样继续",
  )
  const sections: NonNullable<CompiledHookVideoPrompt["sections"]> = {
    globalBaseSetting: [
      `生成${scriptCreativeSpec.duration}秒竖屏9:16短视频。`,
      "按“全局基础设定、时间片分镜脚本、画质风格与约束”的三段式执行。",
      "整体是写实手机近景，节奏快，画面只拍可执行动作。",
      "不要生成字幕、标题、界面、水印、贴纸或随机文字。",
    ],
    assetMappings: [
      `@图1（${productLock.productName}商品主图）作为产品外观参考，保留包装比例、品类形态、主色块和使用场景。`,
    ],
    productIdentityLock: [
      `商品是${productLock.productName}。`,
      deferSalesProductReveal
        ? `本条是${scriptCreativeSpec.duration}秒痛点钩子，商品主图用于销售商品身份锁定；如果判断痛点证据后直接清晰露出${productLock.productName}会造成“商品导致问题”的误解，可以把清晰商品露出延后到明确解决方案转折之后。`
        : productLock.mustShowSignals.length ? `商品主图用于身份锁定，不代表商品必须在本钩子内露出；如果出现${productLock.productName}，必须保留${productLock.mustShowSignals.map((item) => chineseText(item, item)).join("、")}。` : "",
      productLock.usageSignals.length ? `使用动作围绕${productLock.usageSignals.map((item) => chineseText(item, item)).join("、")}。` : "",
      productLock.forbiddenConfusions.length ? `不能变成${productLock.forbiddenConfusions.map((item) => chineseText(item, item)).join("、")}。` : "",
    ].filter(Boolean).join(" "),
    userInputContract: `用户需求：${chineseText(scriptCreativeSpec.intentContract.userIntentText, "日常使用卡住")}。`,
    userIntentExpansionLine: userIntentExpansion ? userIntentExpansionLine(userIntentExpansion) : undefined,
    hookTask: `核心冲突：${coreConflict}。`,
    attentionMechanism: `停滑方式：${chineseText(resourceBundle.attentionMicroPattern.stopSignalLogic, "熟悉动作突然失败")}。`,
    tensionPlan: scriptAsset.tensionPlan
      ? `张力推进：先拍${firstShock}；再拍${escalation}；留下问题：${question}。`
      : undefined,
    cultureBorrowingLine: culture
      ? [
        `文化母题：${chineseText(resourceBundle.cultureMotif?.name ?? culture.concreteSymbol ?? culture.borrowedSymbol, "具体文化母题")}。`,
        cultureIdentityLine(resourceBundle, input.selectedCultureBorrowing),
        input.selectedCultureBorrowing
          ? `借势模板：${chineseText(input.selectedCultureBorrowing.nameCn, "文化模板")}；开场捕获：${chineseText(input.selectedCultureBorrowing.openingCapture, "文化动作开场")}；商品承接规则：${chineseText(input.selectedCultureBorrowing.productBridgeRule, `${productLock.productName}作为文化动作里的道具进入`)}。`
          : "",
        cultureSymbolsLine(resourceBundle, culture),
        `只使用公共动作、构图和声音符号，不使用具体角色脸、原台词或原音乐。`,
        `动作转译：${chineseText(culture.actionTranslation ?? culture.actionIntegration, "用文化母题改变人物动作链")}。`,
        `声音转译：${chineseText(culture.soundTranslation ?? culture.soundIntegration, "短促动作音和停顿")}。`,
        `商品承接：${chineseText(culture.productBridgeSymbol ?? culture.productBridgeIntegration, `${productLock.productName}成为动作继续的线索`)}。`,
      ].filter(Boolean).join(" ")
      : undefined,
    productBridge: deferSalesProductReveal
      ? `商品安全承接判断：痛点证据后如果直接承接销售商品正面露出，可能让观众误解商品是导致问题的用品。请根据具体镜头判断；如果有误解风险，优先让${productLock.productName}延后到明确解决方案转折之后再清晰出现，本${scriptCreativeSpec.duration}秒钩子可以只保留痛点、人物反应、旧牙刷/普通洗漱用品或“妈妈准备换方法”的开环线索。`
      : `商品进入方式判断：如果本钩子内出现${productLock.productName}，用${chineseText(scriptAsset.productRole.entryAction, `${productLock.productName}进入真实使用动作`)}承接；${chineseText(scriptAsset.productRole.whyItBelongs, "它让前一拍卡住的动作继续")}。如果不出现商品更能停滑，可以只留下与用户需求相关的冲突、证据或开环线索。不要突然切成纯商品展示。`,
    visualStyle: `画面质感：${chineseText(scriptAsset.videoPromptHints.visualMood, "写实手机实拍感")}；镜头方式：${chineseText(scriptAsset.videoPromptHints.cameraBehavior, "手持近景，轻微推近")}。`,
    voiceAndSoundPolicy: [
      `声音：${chineseText(scriptAsset.soundDesign.ambientSound, "真实环境声")}；${chineseText(scriptAsset.soundDesign.musicOrSfx, "短促动作音")}。`,
      scriptAsset.soundDesign.speechMode === "no_voice"
        ? "无口播，只保留动作声和环境声。"
        : "必须生成中文短对白或中文口播音频，对白是画面声音，不是字幕，不要烧录文字。",
    ].join(""),
    shotTimingLines: scriptAsset.timelineShots.map((shot, index) => [
      `${normalizeTimeLabel(shot.time)}｜场景：${chineseText(shot.scene, defaultScene(index, productLock))}`,
      `主体：${chineseText(shot.subject, defaultSubject(index, productLock))}`,
      `动作：${chineseText(shot.action, defaultAction(index, scriptAsset, scriptCreativeSpec))}`,
      `镜头：${chineseText(shot.camera, "手持近景，动作清楚")}`,
      `声音：${chineseText(shot.sound, "真实环境声和短促动作音")}`,
      dialogueLineForShot(shot, index, scriptAsset, scriptCreativeSpec),
      shot.mustShow.length ? `必须看见：${shot.mustShow.map((item) => chineseText(item, item)).join("、")}` : "",
      shot.mustAvoid.length ? `必须避免：${shot.mustAvoid.map((item) => chineseText(item, item)).join("、")}` : "",
    ].filter(Boolean).join("；")),
    qualityAndConstraints: [
      "真实细节清楚，人物表情和手部稳定，商品包装不能变形。",
      "用户上传的商品不一定要出现在钩子当中；本段可以完全服务于有意义的停滑和继续观看欲望。",
      ...(deferSalesProductReveal ? [
        `如果痛点证据后直接切到${productLock.productName}正面、台面特写或包装展示会产生负向归因，优先改用旧牙刷、无品牌旧牙膏、模糊背景或手部开环动作。`,
        `如果结尾露出${productLock.productName}会过早结束悬念，优先停在“妈妈要换方法”的悬念处。`,
      ] : []),
      "手、牙刷、商品和人物脸部要保持合理距离，不能互相穿插。",
      "手递商品、挤牙膏、牙刷靠近嘴边这些动作必须分步发生，前后留出可见间隔，不能同一帧互相穿过。",
      "每个时间片只做一个主要动作，每个时间片只使用一种镜头方式，镜头不要同时追太多物体。",
      "如果出现孩子和家长，同一时间只让一个人主动移动，另一个人保持清晰反应姿态。",
      "不要在画面里渲染字幕、界面、水印、贴纸、随机文字或多余标志。",
    ],
    negativeConstraints: forbidden.map((item) => chineseText(item, item)).filter(Boolean),
  }
  return sections
}

function flattenSections(sections: NonNullable<CompiledHookVideoPrompt["sections"]>) {
  return [
    "全局基础设定：",
    ...sections.globalBaseSetting,
    ...sections.assetMappings,
    sections.productIdentityLock,
    sections.userInputContract,
    sections.userIntentExpansionLine,
    sections.attentionMechanism,
    sections.hookTask,
    sections.tensionPlan,
    sections.cultureBorrowingLine,
    sections.productBridge,
    sections.visualStyle,
    sections.voiceAndSoundPolicy,
    "",
    "时间片分镜脚本：",
    ...sections.shotTimingLines,
    "",
    "画质、风格与约束：",
    ...sections.qualityAndConstraints,
    sections.negativeConstraints.length ? `避免：${sections.negativeConstraints.join("、")}。` : null,
  ].filter(Boolean).join("\n")
}

function userIntentExpansionLine(expansion: NonNullable<ScriptCreativeSpec["intentContract"]["userIntentExpansion"]>) {
  const concepts = expansion.concepts.slice(0, 4).map((concept) =>
    `${concept.text}/${concept.semanticRole}=${[
      concept.relationToEvent,
      ...safeArray(concept.observableEvidence).slice(0, 2),
      ...safeArray(concept.actionPrimitives).slice(0, 1),
    ].filter(Boolean).join("、")}`
  )
  return [
    `用户输入语义拆解：${chineseText(expansion.frame.summary, expansion.rawInput)}`,
    concepts.length ? `概念关系：${concepts.join("；")}。` : "",
    `开场动作：${chineseText(expansion.hookSignals.openingAction, "把用户输入拍成可见动作")}。`,
    `冲突来源：${chineseText(expansion.hookSignals.conflictSource, "用户动作卡住")}。`,
    expansion.hookSignals.painEvidence.length
      ? `可拍证据：${expansion.hookSignals.painEvidence.map((item) => chineseText(item, item)).slice(0, 4).join("、")}。`
      : "",
    expansion.hookSignals.openLoop
      ? `开环线索：${chineseText(expansion.hookSignals.openLoop, "留下下一步悬念")}。`
      : "",
    `商品露出策略：${expansion.productExposurePolicy.requiredInHook ? "本钩子内可以自然出现商品" : "商品不强制在本钩子内出现"}；${chineseText(expansion.productExposurePolicy.saferBridge, "先保留非商品开环线索")}。`,
  ].filter(Boolean).join(" ")
}

function safeArray<T>(value: T[] | undefined | null) {
  return Array.isArray(value) ? value : []
}

function cultureSymbolsLine(
  resourceBundle: HookCreativeResourceBundle,
  culture: NonNullable<HookScriptAsset["cultureFusionMechanism"]>,
) {
  const visible = unique([
    culture.concreteSymbol,
    culture.borrowedSymbol,
    ...(culture.whereItAppears ?? []),
    ...(resourceBundle.cultureMotif?.visualSymbols ?? []),
  ].filter(Boolean) as string[]).slice(0, 4)
  const sound = unique([
    culture.soundIntegration,
    culture.soundTranslation,
    ...(resourceBundle.cultureMotif?.audioSymbols ?? []),
  ].filter(Boolean) as string[]).slice(0, 3)
  const motion = unique([
    culture.actionTranslation,
    culture.actionIntegration,
    ...(resourceBundle.cultureMotif?.motionSymbols ?? []),
  ].filter(Boolean) as string[]).slice(0, 3)
  return [
    visible.length ? `可见符号：${visible.map((item) => chineseText(item, item)).join("、")}。` : "",
    motion.length ? `动作符号：${motion.map((item) => chineseText(item, item)).join("、")}。` : "",
    sound.length ? `声音符号：${sound.map((item) => chineseText(item, item)).join("、")}。` : "",
  ].filter(Boolean).join(" ")
}

function cultureIdentityLine(
  resourceBundle: HookCreativeResourceBundle,
  selectedCultureBorrowing?: SelectedCultureBorrowing | null,
) {
  const cultureMotifId = selectedCultureBorrowing?.cultureMotifId ?? resourceBundle.cultureMotif?.cultureMotifId
  const visualRenderProfileId = selectedCultureBorrowing?.visualRenderProfileId ?? resourceBundle.cultureMotif?.visualRenderProfileId
  const shotPrimitiveIds = selectedCultureBorrowing?.shotPrimitiveIds ?? resourceBundle.cultureMotif?.shotPrimitiveIds
  return [
    cultureMotifId ? `cultureMotifId=${cultureMotifId}` : "",
    visualRenderProfileId ? `visualRenderProfileId=${visualRenderProfileId}` : "",
    shotPrimitiveIds?.length ? `shotPrimitiveIds=${shotPrimitiveIds.join(",")}` : "",
  ].filter(Boolean).join("；")
}

function unique(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))]
}

function normalizeTimeLabel(value: string) {
  return value
    .replace(/s\b/gi, "秒")
    .replace(/\s+/g, "")
    .replace(/-/g, "-")
}

function isShortPainHook(scriptCreativeSpec: ScriptCreativeSpec) {
  return scriptCreativeSpec.intentContract.intentType === "pain_first" && scriptCreativeSpec.duration <= 4
}

function defaultScene(index: number, productLock: ScriptCreativeSpec["productLock"]) {
  if (index === 0) return "真实家庭使用场景"
  if (index === 1) return "同一场景继续，压力升级"
  return `${productLock.productName}进入使用动作`
}

function defaultSubject(index: number, productLock: ScriptCreativeSpec["productLock"]) {
  return index < 2 ? "人物和手部动作" : productLock.productName
}

function defaultAction(
  index: number,
  asset: HookScriptAsset,
  spec: ScriptCreativeSpec,
) {
  const productName = spec.productLock.productName
  if (index === 0) return asset.tensionPlan?.firstSecondShock || "人物伸手挡住正在进行的使用动作，动作停住"
  if (index === 1) return asset.tensionPlan?.escalationBeat || "第二次尝试仍然失败，人物后退或躲开"
  return asset.productRole.entryAction || `${productName}进入真实使用动作`
}

function dialogueLineForShot(
  shot: HookScriptAsset["timelineShots"][number],
  index: number,
  asset: HookScriptAsset,
  spec: ScriptCreativeSpec,
) {
  if (asset.soundDesign.speechMode === "no_voice") return ""
  const dialogue = chineseText(shot.dialogue, fallbackDialogue(index, spec))
  return dialogue ? `对白：${dialogue}` : ""
}

function fallbackDialogue(index: number, spec: ScriptCreativeSpec) {
  const userIntent = spec.intentContract.userIntentText
  if (/刷牙|牙刷|牙膏|不爱|不愿|拒绝/.test(userIntent)) {
    if (index === 0) return "孩子小声说：“我不要刷牙。”"
    if (index === 1) return "家长低声说：“再试一次，很快就好。”"
    return "孩子小声说：“这个是什么？”"
  }
  if (index === 0) return "人物小声说：“怎么又卡住了？”"
  if (index === 1) return "旁边的人说：“再试一次。”"
  return "人物小声说：“等一下，这个可以。”"
}

function chineseText(value: string | undefined | null, fallback: string) {
  const translated = translateKnownEnglish(value ?? "")
    .replace(/[A-Za-z][A-Za-z0-9_./-]*/g, "")
    .replace(/\s+/g, "")
    .replace(/[,;]+/g, "，")
    .replace(/[|]+/g, "，")
    .replace(/，{2,}/g, "，")
    .replace(/^[，。；、]+|[，。；、]+$/g, "")
    .trim()
  return /[\u4e00-\u9fff]/.test(translated) ? translated : fallback
}

function translateKnownEnglish(value: string) {
  return value
    .replace(/Home bathroom/gi, "家庭浴室")
    .replace(/Same home bathroom/gi, "同一个家庭浴室")
    .replace(/bedtime routine/gi, "睡前流程")
    .replace(/before bedtime/gi, "睡前")
    .replace(/in front of mirror/gi, "镜前")
    .replace(/Mom's hand/gi, "妈妈的手")
    .replace(/mom's hand/gi, "妈妈的手")
    .replace(/\bMom\b/gi, "妈妈")
    .replace(/\byoung kid\b/gi, "孩子")
    .replace(/\bKid\b/g, "孩子")
    .replace(/\bkid\b/g, "孩子")
    .replace(/\bchild\b/gi, "孩子")
    .replace(/\bhand\b/gi, "手")
    .replace(/\bholding\b/gi, "拿着")
    .replace(/\bplain toothbrush\b/gi, "普通牙刷")
    .replace(/\btoothbrush\b/gi, "牙刷")
    .replace(/\bbathroom mirror background\b/gi, "浴室镜子背景")
    .replace(/\brepeated refusal actions\b/gi, "重复拒绝动作")
    .replace(/\bthree total failed attempts\b/gi, "三次尝试失败")
    .replace(/\bBedroom lamp half turned off\b/gi, "卧室灯已经半关")
    .replace(/Handheld closeup/gi, "手持近景")
    .replace(/Medium handheld closeup/gi, "手持中近景")
    .replace(/Closeup push-in/gi, "近景推近")
    .replace(/Fixed closeup/gi, "固定近景")
    .replace(/Macro close-up/gi, "微距特写")
    .replace(/fixed center frame/gi, "中心固定构图")
    .replace(/Slow push macro/gi, "微距慢推")
    .replace(/Kid's soft huff of refusal/gi, "孩子轻轻抗拒的哼声")
    .replace(/Mom's quiet sigh/gi, "妈妈轻轻叹气")
    .replace(/soft clock ticking/gi, "轻微钟表声")
    .replace(/Cap click/gi, "开盖轻响")
    .replace(/soft squeeze sound/gi, "轻微挤压声")
    .replace(/Soft surprised pause/gi, "短暂停顿")
    .replace(/Soft upbeat chime cue/gi, "轻快提示音")
    .replace(/wooden gavel pat sound/gi, "木槌拍击声")
    .replace(/half second silence/gi, "半秒静音")
    .replace(/paper friction sound/gi, "纸张摩擦声")
    .replace(/low frequency background hum/gi, "低频环境声")
    .replace(/squeeze paste ASMR sound/gi, "挤膏体的细小声音")
    .replace(/packshot/gi, "纯商品展示")
    .replace(/Logo/g, "标志")
    .replace(/\bIP\b/g, "角色")
    .replace(/UI/g, "界面")
    .replace(/UGC/g, "手机实拍感")
}

function compileSoraPrompt(input: {
  scriptAsset: HookScriptAsset
  scriptCreativeSpec: ScriptCreativeSpec
  modelFamily: HookOneShotModelFamily
  videoProvider: VideoProvider
  productImage: string
  firstFrameUrl?: string | null
}): CompiledHookVideoPrompt {
  const english = englishPromptParts(input.scriptAsset, input.scriptCreativeSpec)
  return {
    ...baseCompiled(input),
    prompt: [
      "Style:",
      "Realistic vertical mobile ecommerce video, natural indoor light, no readable on-screen text.",
      "",
      "Scene:",
      english.scene,
      "",
      "Cinematography:",
      `Camera shot: ${english.camera}.`,
      "Lens / focus: close handheld product-and-action framing, shallow but stable focus.",
      "Camera movement: one simple push-in or handoff move per beat.",
      "Lighting + palette: practical room lighting, warm neutral palette, product packaging remains readable.",
      "",
      "Actions:",
      ...english.actions.map((action) => `- ${action}`),
      "",
      "Dialogue:",
      input.scriptAsset.soundDesign.speechMode === "no_voice" ? "No dialogue." : "Short natural voiceover only if needed; keep it secondary to visible action.",
      "",
      "Background sound:",
      english.audio,
      "",
      "Continuity / constraints:",
      `${english.productLabel} is a reference identity, not a required on-screen object. If it appears, preserve packaging shape and category. Avoid ${english.avoid}.`,
    ].join("\n"),
    firstFramePrompt: buildSoraFirstFramePrompt(input.scriptAsset, input.scriptCreativeSpec),
    inputImages: [
      ...(input.firstFrameUrl ? [{
        source: input.firstFrameUrl,
        declared_role: "sora_opening_frame",
        user_caption: "Sora opening frame generated from HookScriptAsset.firstFrameIntent",
      }] : []),
      {
        source: input.productImage,
        declared_role: "product_front",
        user_caption: "Product reference image; preserve packaging and category identity",
      },
    ],
  }
}

function compileVeoPrompt(input: {
  scriptAsset: HookScriptAsset
  scriptCreativeSpec: ScriptCreativeSpec
  modelFamily: HookOneShotModelFamily
  videoProvider: VideoProvider
  productImage: string
}): CompiledHookVideoPrompt {
  const english = englishPromptParts(input.scriptAsset, input.scriptCreativeSpec)
  return {
    ...baseCompiled(input),
    prompt: [
      `Veo 3.1 / ${input.scriptCreativeSpec.duration}s / 9:16`,
      "",
      "Cinematography:",
      `${english.camera}. Keep hand action readable; if the product appears, keep it readable. Use one camera move per beat.`,
      "",
      "Subject:",
      `${english.productLabel} may be absent from this hook; preserve identity only if visible.`,
      "",
      "Action:",
      english.actions.join(" "),
      "",
      "Context:",
      english.scene,
      "",
      "Style & ambiance:",
      "Realistic ecommerce UGC, natural indoor light, concrete product action, no abstract benefit montage.",
      "",
      "Audio:",
      "Dialogue: short voiceover only if necessary.",
      `SFX: ${english.audio}.`,
      "Ambient: natural room ambience.",
      "Music: no dominant music.",
      "",
      "Exclusions:",
      `No visible logos, no readable overlay text, no substitute product category, avoid ${english.avoid}.`,
    ].join("\n"),
    firstFramePrompt: buildSoraFirstFramePrompt(input.scriptAsset, input.scriptCreativeSpec),
    inputImages: [{
      source: input.productImage,
      declared_role: "veo_product_reference",
      user_caption: "Veo product reference image; keep product identity and packaging stable",
    }],
  }
}

function baseCompiled(input: {
  scriptCreativeSpec: ScriptCreativeSpec
  modelFamily: HookOneShotModelFamily
  videoProvider: VideoProvider
}): Omit<CompiledHookVideoPrompt, "prompt" | "inputImages"> {
  return {
    provider: input.videoProvider,
    modelFamily: input.modelFamily,
    metadata: {
      productName: input.scriptCreativeSpec.productLock.productName,
      productCategory: input.scriptCreativeSpec.productLock.category,
      hookMode: input.scriptCreativeSpec.intentContract.intentType,
      variantRole: input.scriptCreativeSpec.intentContract.variantRole,
      resourceIds: input.scriptCreativeSpec.resourceIds,
    },
  }
}

function englishPromptParts(
  asset: HookScriptAsset,
  spec: ScriptCreativeSpec,
) {
  const productLabel = englishProductLabel(spec)
  const actions = asset.timelineShots.map((shot) =>
    `${englishRetentionPurpose(shot.retentionPurpose)}: the subject performs a clear action in the scene; ${productLabel} appears only if the shot explicitly calls for it.`
  )
  return {
    productLabel,
    scene: `A bedtime bathroom hook scene built around a quest-like routine; ${productLabel} is the product identity reference if the product appears.`,
    camera: asset.videoPromptHints.cameraBehavior || "handheld close shot",
    actions,
    audio: asset.soundDesign.musicOrSfx || asset.soundDesign.ambientSound || "diegetic ambience and small action sounds",
    avoid: spec.productLock.forbiddenConfusions.join(", ") || "unrelated products",
  }
}

function buildSoraFirstFramePrompt(
  asset: HookScriptAsset,
  spec: ScriptCreativeSpec,
) {
  if (asset.firstFrameIntent.compatibilityPrompt?.trim()) return asset.firstFrameIntent.compatibilityPrompt.trim()
  return [
    "Realistic vertical first frame.",
    `Opening composition: ${asset.firstFrameIntent.composition}.`,
    `${englishProductLabel(spec)} may be absent. If visible, preserve: ${spec.productLock.mustShowSignals.join(", ")}.`,
    `Must avoid: ${spec.productLock.forbiddenConfusions.join(", ")}.`,
  ].join(" ")
}

function englishProductLabel(spec: ScriptCreativeSpec) {
  if (spec.productLock.inferredSubCategory.includes("toothpaste")) return "the children's low-foam toothpaste tube"
  if (spec.productLock.inferredSubCategory.includes("cleanser")) return "the cleanser product package"
  if (spec.productLock.inferredSubCategory.includes("fragrance")) return "the fragrance bottle"
  return `the exact ecommerce product named ${spec.productLock.productName}`
}

function englishRetentionPurpose(purpose: HookScriptAsset["timelineShots"][number]["retentionPurpose"]) {
  return purpose.replace(/_/g, " ")
}
