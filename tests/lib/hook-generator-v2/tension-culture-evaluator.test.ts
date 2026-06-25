import { describe, expect, it } from "vitest"

import { evaluateTensionAndCulture } from "@/lib/hook-generator-v2/eval/tension-culture-evaluator"
import type { HookOneShotRequest } from "@/lib/hook-generator-v2/graph/types"
import type { HookCreativeResourceBundle } from "@/lib/hook-generator-v2/resources/types"
import type { HookScriptAsset } from "@/lib/hook-generator-v2/script-asset/types"
import type { HookRecommendationCard, SelectedCultureBorrowing } from "@/lib/hook-library"

const request: HookOneShotRequest = {
  productImage: "https://oss.example.com/toothpaste.png",
  productTitle: "儿童低泡牙膏",
  intent: "creative_first",
  intentText: "睡前刷牙像闯关",
}

const selectedHook: HookRecommendationCard = {
  patternCardId: "H7_TEST",
  hookScope: "product_related",
  hookType: "H7",
  subType: "culture_task",
  displayName: "文化任务",
  reason: "用文化动作制造停滑",
  exampleStructure: "任务卡卡住，商品变成通关道具",
  recommendedReferenceMode: "direct_video",
  productRelationType: "problem_first",
  stimulationLevel: "S3",
  hasReferenceVideo: false,
  productBridgeRule: "商品必须改变动作走向",
  score: 0.92,
}

const selectedCultureBorrowing: SelectedCultureBorrowing = {
  templateId: "cb_template_public_xiyou_breakthrough",
  nameCn: "西游闯关破阵",
  hookScope: "culture_borrowing",
  cultureMechanism: ["闯关", "破阵"],
  symbolEntryIds: ["culture_symbol_public_xiyou_breakthrough"],
  recommendedDurationSec: 5,
  openingCapture: "睡前刷牙像闯关开场",
  attentionEscalation: "任务提示音后牙膏成为通关道具",
  productBridgeRule: "牙膏作为通关道具自然进入刷牙动作",
  firstFrameFormula: "牙膏、牙刷和任务卡同框",
  finalVideoPromptFormulaCn: "用闯关任务包装刷牙动作",
  audioFormulaCn: "鼓点加速和提示音",
  verbalFormulaCn: "今晚这一关是刷牙",
  symbolBorrowing: {
    visual: ["任务卡", "云路闯关"],
    style: ["轻快"],
    motion: ["递出通关道具"],
    audio: ["鼓点加速", "提示音"],
    verbal: ["闯关"],
    narrative: ["任务推进"],
    productBridge: ["牙膏是通关道具"],
    firstFrame: ["牙膏和任务卡同框"],
    video: ["刷牙动作完成通关"],
  },
  fusionDirectives: ["让文化符号改变刷牙动作链"],
  applicableCategories: ["toothpaste", "personal_care"],
  productDependency: "strong",
  requiredProductAppearanceTiming: "0-1s",
  tags: ["test"],
}

const resourceBundle = {
  productContract: {
    productName: "儿童低泡牙膏",
    productCategory: "personal_care",
    inferredSubCategory: "oral_care_toothpaste",
    visualAnchors: ["牙膏软管", "管盖"],
    packagingSignals: ["软管包装"],
    usageAnchors: ["挤牙膏", "刷牙"],
    typicalUseScenes: ["浴室"],
    allowedProductActions: ["挤出", "放在牙刷旁"],
    forbiddenVisualConfusions: ["精华液瓶", "香水瓶"],
    claimRiskTags: [],
    modelRiskTags: [],
    source: { productAnalysisUsed: true, fallbackCategoryRuleIds: ["p0_oral_care_toothpaste"] },
  },
  resourceIds: {
    audienceSituationIds: ["aud_parent_bedtime_routine"],
    attentionMicroPatternId: "H7_A_MYTH_CHARACTER_LOGIC",
    eventPrimitiveIds: ["EVT_CUL_001"],
    productBridgeRoleIds: ["BRIDGE_RITUAL_OBJECT"],
    proofVisualizationIds: ["PROOF_CONTEXT_FIT"],
    cultureMotifId: "cb_template_public_xiyou_breakthrough",
    shotCardIds: ["SHOT_RITUAL_HANDOFF"],
    constraintRuleIds: ["CONSTRAINT_PRODUCT_LOCK"],
    failureWarningIds: ["FAIL_PRODUCT_DRIFT"],
    exampleIds: [],
  },
  libraryRefs: { categoryPlaybookIds: [], referenceAssetIds: [], trendObservationIds: [] },
  cultureMotif: {
    id: "cb_template_public_xiyou_breakthrough",
    name: "西游闯关破阵",
    source: "selected_culture_borrowing",
    motifType: "selected_template",
    actionLogic: "把刷牙动作变成闯关任务",
    visualSymbols: ["任务卡", "云路闯关"],
    motionSymbols: ["递出通关道具"],
    audioSymbols: ["鼓点加速", "提示音"],
    productBridgeOptions: ["牙膏是通关道具"],
    compatibleIntentModes: ["creative_first"],
    compatibleCategories: ["toothpaste", "personal_care"],
    guardrails: ["让文化符号改变刷牙动作链"],
  },
} as unknown as HookCreativeResourceBundle

function strongAsset(): HookScriptAsset {
  return {
    hookSummary: "睡前刷牙像闯关",
    audienceStopReason: "家长看到孩子在牙刷前突然停住",
    tensionPlan: {
      conflictType: "睡前流程卡住",
      pressureSource: "孩子不愿意刷牙，家长催促也停在门口",
      firstSecondShock: "任务卡和牙刷同框，孩子突然停住",
      escalationBeat: "鼓点加速后牙膏像通关道具被递出",
      unresolvedQuestion: "这支牙膏为什么能让这一关继续",
      emotionalPressure: "家长急，孩子躲，刷牙动作被打断",
      productResolutionRole: "儿童低泡牙膏作为通关道具回收刷牙动作",
      riskIfTooSubtle: "如果没有停住动作，文化借势会变成普通包装",
    },
    hookMechanism: {
      hookType: "H7",
      microPatternId: "H7_A_MYTH_CHARACTER_LOGIC",
      mechanismName: "文化任务动作",
      stopSignal: "刷牙被任务卡卡住",
      tensionEngine: "任务卡住",
      curiosityGap: "牙膏为什么像通关道具",
      payoffStyle: "商品进入动作链",
    },
    productRole: {
      role: "ritual_object",
      entryTime: "1-2s",
      entryAction: "儿童低泡牙膏挤到牙刷旁",
      whyItBelongs: "儿童低泡牙膏是完成刷牙任务的通关道具",
      avoidHardSell: true,
      noFullClaim: true,
    },
    cultureFusionMechanism: {
      enabled: true,
      motifId: "cb_template_public_xiyou_breakthrough",
      templateId: "cb_template_public_xiyou_breakthrough",
      borrowedSymbol: "任务卡",
      concreteSymbol: "任务卡",
      whereItAppears: ["任务卡", "递出通关道具"],
      actionIntegration: "家长递出牙膏像递出通关道具",
      actionTranslation: "把刷牙动作变成闯关任务",
      soundIntegration: "鼓点加速",
      soundTranslation: "提示音和鼓点加速制造任务压力",
      visualComposition: "牙膏、牙刷和任务卡同框",
      productBridgeIntegration: "牙膏作为通关道具进入刷牙动作",
      productBridgeSymbol: "牙膏是通关道具",
      appearsInShots: ["0-1.5s", "1.5-3.5s"],
      forbiddenShallowUse: ["只写闯关风格但没有任务动作"],
      notJustStyle: true,
    },
    timelineShots: [
      {
        time: "0-1.5s",
        retentionPurpose: "stop_scroll",
        scene: "浴室灯关一半，孩子盯着任务卡停住",
        subject: "孩子",
        action: "看着任务卡停住，牙刷还没拿起",
        eventPrimitiveId: "EVT_CUL_001",
        shotCardId: "SHOT_RITUAL_HANDOFF",
        camera: "手部中近景推近",
        sound: "鼓点轻起",
        textOverlay: "今晚这一关",
        productVisibility: "background_hint",
        mustShow: ["任务卡", "牙刷"],
        mustAvoid: ["精华液瓶", "香水瓶"],
        transitionToNextShot: "切到牙膏进入动作",
      },
      {
        time: "1.5-3.5s",
        retentionPurpose: "product_bridge",
        scene: "家长把儿童低泡牙膏挤到牙刷旁",
        subject: "儿童低泡牙膏",
        action: "挤到牙刷旁，像通关道具一样被递出",
        eventPrimitiveId: "EVT_CUL_001",
        shotCardId: "SHOT_RITUAL_HANDOFF",
        camera: "手部中近景",
        sound: "提示音突然响起",
        textOverlay: "牙膏是通关道具",
        productVisibility: "clear_but_not_packshot",
        mustShow: ["儿童低泡牙膏", "牙膏软管", "管盖"],
        mustAvoid: ["精华液瓶", "香水瓶"],
        transitionToNextShot: "切到完成区",
      },
    ],
    soundDesign: {
      voiceoverAllowed: true,
      speechMode: "voiceover",
      ambientSound: "真实浴室环境声",
      musicOrSfx: "鼓点加速和提示音",
    },
    textOverlay: ["今晚这一关", "牙膏是通关道具"],
    firstFrameIntent: {
      stopSignal: "孩子在牙刷前停住",
      composition: "牙膏、牙刷和任务卡同框",
      emotion: "紧张好奇",
      mustShow: ["牙膏软管", "任务卡"],
      mustAvoid: ["精华液瓶"],
      compatibilityPrompt: "Realistic vertical first frame, toothpaste tube and quest card visible.",
    },
    videoPromptHints: {
      visualMood: "写实手机 UGC",
      cameraBehavior: "手部中近景",
      keyObjects: ["儿童低泡牙膏", "牙刷", "任务卡"],
      motionPriorities: ["挤牙膏", "递出通关道具"],
      avoid: ["精华液瓶", "香水瓶"],
      providerNeutralPrompt: "写实竖屏视频：浴室睡前闯关，儿童低泡牙膏作为通关道具进入刷牙动作。",
    },
    riskFlags: [],
    generationRecommendation: {
      preferredPath: "direct_video",
      reason: "商品图可直接进入视频生成",
      availablePaths: ["direct_video"],
    },
  }
}

describe("hook generator v2 tension and culture evaluator", () => {
  it("passes concrete tension with culture motif as action, sound, and product bridge", () => {
    const score = evaluateTensionAndCulture({
      request,
      selectedHook,
      selectedCultureBorrowing,
      resourceBundle,
      scriptAsset: strongAsset(),
      currentFinalPrompt: "任务卡、鼓点加速、儿童低泡牙膏作为通关道具进入刷牙动作。",
      assetCompilerShadowPrompt: "张力设计：孩子停住，牙膏递出后任务继续。",
    })

    expect(score.decision).toBe("pass")
    expect(score.rewriteTargets).toHaveLength(0)
    expect(score.cultureConcreteSymbolUse).toBeGreaterThanOrEqual(8)
    expect(score.cultureProductBridgeIntegration).toBeGreaterThanOrEqual(8)
  })

  it("requests rewrite when culture is only style without treating missing product bridge as fatal", () => {
    const weak = strongAsset()
    weak.cultureFusionMechanism = {
      enabled: true,
      motifId: "cb_template_public_xiyou_breakthrough",
      borrowedSymbol: "西游风格",
      whereItAppears: ["背景"],
      actionIntegration: "",
      soundIntegration: "",
      productBridgeIntegration: "",
      notJustStyle: false,
    }
    weak.timelineShots = weak.timelineShots.map((shot) => ({ ...shot, retentionPurpose: "stop_scroll" }))

    const score = evaluateTensionAndCulture({
      request,
      selectedHook,
      selectedCultureBorrowing,
      resourceBundle,
      scriptAsset: weak,
    })

    expect(score.decision).toBe("fallback_recommended")
    expect(score.fatalIssues).toEqual(expect.arrayContaining(["culture_style_only"]))
    expect(score.fatalIssues).not.toContain("missing_product_bridge_shot")
    expect(score.rewriteTargets.some((target) => target.field === "cultureFusionMechanism.actionIntegration")).toBe(true)
  })

  it("does not pass a culture variant when concrete culture symbols are too weak", () => {
    const weak = strongAsset()
    weak.cultureFusionMechanism = {
      enabled: true,
      motifId: "cb_template_public_xiyou_breakthrough",
      templateId: "cb_template_public_xiyou_breakthrough",
      borrowedSymbol: "闯关风格",
      concreteSymbol: "",
      whereItAppears: [],
      actionIntegration: "把刷牙包装成闯关",
      actionTranslation: "把刷牙包装成闯关",
      soundIntegration: "提示音",
      soundTranslation: "提示音",
      visualComposition: "轻快风格",
      productBridgeIntegration: "牙膏进入动作",
      productBridgeSymbol: "牙膏进入动作",
      appearsInShots: ["0-1.5s"],
      forbiddenShallowUse: ["只写风格"],
      notJustStyle: true,
    }
    weak.timelineShots = weak.timelineShots.map((shot) => ({
      ...shot,
      scene: shot.scene.replace(/任务卡/g, "轻快背景"),
      action: shot.action.replace(/任务卡|通关道具/g, "轻快动作"),
      sound: shot.sound.replace(/鼓点|提示音/g, "轻快声音"),
      mustShow: shot.mustShow.filter((item) => item !== "任务卡"),
    }))

    const score = evaluateTensionAndCulture({
      request,
      selectedHook,
      selectedCultureBorrowing,
      resourceBundle,
      scriptAsset: weak,
      currentFinalPrompt: "轻快风格里，儿童低泡牙膏进入刷牙动作。",
    })

    expect(score.decision).not.toBe("pass")
    expect(score.cultureConcreteSymbolUse).toBeLessThan(7)
    expect(score.rewriteTargets.some((target) => target.field === "cultureFusionMechanism.concreteSymbol")).toBe(true)
  })
})
