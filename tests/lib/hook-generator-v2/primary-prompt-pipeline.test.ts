import { describe, expect, it } from "vitest"

import type { HookOneShotRequest, HookOneShotVideoSettings } from "@/lib/hook-generator-v2/graph/types"
import type { HookCreativeResourceBundle } from "@/lib/hook-generator-v2/resources/types"
import type { HookScriptAsset, ScriptCreativeSpec } from "@/lib/hook-generator-v2/script-asset/types"
import { toLegacyHookScriptResult } from "@/lib/hook-generator-v2/script-asset/legacy-adapter"
import type { HookRecommendationCard } from "@/lib/hook-library"
import { buildPrimaryHookPromptArtifacts } from "@/lib/hook-generator-v2/graph/primary-prompt-pipeline"

const request: HookOneShotRequest = {
  productImage: "https://oss.example.com/toothpaste.png",
  productTitle: "儿童魔法牙膏",
  intent: "pain_first",
  intentText: "小孩儿不爱刷牙",
}

const settings: HookOneShotVideoSettings = {
  videoProvider: "seedance",
  videoModel: "doubao-seedance-2-0-260128",
  videoDuration: 4,
  videoRatio: "9:16",
  videoResolution: "720p",
  generateAudio: true,
  modelFamily: "seedance",
}

const selectedHook: HookRecommendationCard = {
  patternCardId: "H2_TEST",
  hookScope: "product_related",
  hookType: "H2",
  subType: "pain_anticipation",
  displayName: "高刺激冲突",
  reason: "测试主路径",
  exampleStructure: "开场冲突，商品承接",
  recommendedReferenceMode: "direct_video",
  productRelationType: "problem_first",
  stimulationLevel: "S2",
  hasReferenceVideo: false,
  productBridgeRule: "商品必须改变前一拍动作走向",
  score: 0.9,
}

function spec(): ScriptCreativeSpec {
  return {
    task: "generate_hook_script_asset",
    duration: 4,
    platform: "short_video_feed",
    productLock: {
      productName: "儿童魔法牙膏",
      category: "toothpaste",
      inferredSubCategory: "oral_care_toothpaste",
      mustShowSignals: ["牙膏软管", "管盖", "牙刷"],
      usageSignals: ["挤牙膏", "刷牙"],
      forbiddenConfusions: ["精华液瓶", "面霜罐"],
      allowedProductActions: ["挤到牙刷上"],
    },
    intentContract: {
      intentType: "pain_first",
      userIntentText: "小孩儿不爱刷牙",
      variantRole: "contrast",
      creativeHypothesis: "用孩子拒绝刷牙的动作制造停滑。",
    },
    resourceIds: resourceBundle.resourceIds,
    hardRules: ["商品必须改变上一拍动作走向", "不能硬切 packshot"],
  }
}

const resourceBundle = {
  productContract: {
    productName: "儿童魔法牙膏",
    productCategory: "toothpaste",
    inferredSubCategory: "oral_care_toothpaste",
    visualAnchors: ["牙膏软管", "管盖"],
    packagingSignals: ["软管包装"],
    usageAnchors: ["挤牙膏", "刷牙"],
    typicalUseScenes: ["浴室镜前"],
    allowedProductActions: ["挤到牙刷上"],
    forbiddenVisualConfusions: ["精华液瓶", "面霜罐"],
    claimRiskTags: [],
    modelRiskTags: [],
    source: { productAnalysisUsed: true, fallbackCategoryRuleIds: ["p0_oral_care_toothpaste"] },
  },
  audienceSituations: [],
  attentionMicroPattern: {
    id: "H2_A_DAILY_ACTION_FAILURE",
    parentHookType: "H2",
    name: "日常动作失败",
    attentionJob: "用孩子拒绝刷牙制造停滑",
    stopSignalLogic: "第一秒看到拒绝动作",
    tensionEngine: "睡前流程卡住",
    curiosityEngine: "为什么这次愿意看牙刷",
    bestForIntentModes: ["pain_first"],
    compatibleProductRoles: ["solution_clue"],
    preferredProductEntryTiming: "middle",
    eventQueryTags: [],
    preferredShotFunctions: [],
    preferredSoundFunctions: [],
    preferredOverlayFunctions: [],
    goodForProductTraits: [],
    weakForProductTraits: [],
    commonFailureModes: [],
    guardrailNotes: [],
  },
  eventCandidates: [],
  bridgeCandidates: [{ id: "BRIDGE_SOLUTION_CLUE", name: "解决线索" }],
  proofCandidates: [],
  cultureMotif: null,
  shotCandidates: [],
  constraints: [],
  failureWarnings: [],
  examples: [],
  resourceIds: {
    audienceSituationIds: ["aud_parent_bedtime_routine"],
    attentionMicroPatternId: "H2_A_DAILY_ACTION_FAILURE",
    eventPrimitiveIds: ["EVT_RPF_001"],
    productBridgeRoleIds: ["BRIDGE_SOLUTION_CLUE"],
    proofVisualizationIds: [],
    cultureMotifId: null,
    shotCardIds: ["SHOT_REACTION_CUT"],
    constraintRuleIds: [],
    failureWarningIds: [],
    exampleIds: [],
  },
  libraryRefs: { categoryPlaybookIds: ["p0_oral_care_toothpaste"], referenceAssetIds: [], trendObservationIds: [] },
  retrievalPolicy: { intent: "pain_first", role: "contrast", bounded: true },
} as unknown as HookCreativeResourceBundle

function weakLegacyAsset(): HookScriptAsset {
  return {
    hookSummary: "孩子不爱刷牙",
    audienceStopReason: "家长看到痛点",
    tensionPlan: {
      conflictType: "刷牙抗拒",
      pressureSource: "睡前流程卡住",
      firstSecondShock: "展示痛点",
      escalationBeat: "展示卖点",
      unresolvedQuestion: "怎么解决",
      emotionalPressure: "家长着急",
      productResolutionRole: "牙膏解决",
      riskIfTooSubtle: "像普通展示",
    },
    hookMechanism: {
      hookType: "H2",
      microPatternId: "H2_A_DAILY_ACTION_FAILURE",
      mechanismName: "日常动作失败",
      stopSignal: "小孩不刷牙",
      tensionEngine: "抗拒",
      curiosityGap: "如何解决",
      payoffStyle: "商品出现",
    },
    productRole: {
      role: "solution_clue",
      entryTime: "2s",
      entryAction: "儿童魔法牙膏出现",
      whyItBelongs: "解决不刷牙",
      avoidHardSell: true,
      noFullClaim: true,
    },
    timelineShots: [
      {
        time: "0-1s",
        retentionPurpose: "stop_scroll",
        scene: "浴室",
        subject: "孩子",
        action: "展示痛点",
        camera: "近景",
        sound: "环境声",
        productVisibility: "none",
        mustShow: ["孩子"],
        mustAvoid: ["精华液瓶"],
        transitionToNextShot: "切到商品",
      },
      {
        time: "1-2.5s",
        retentionPurpose: "build_tension",
        scene: "浴室",
        subject: "家长",
        action: "展示卖点",
        camera: "近景",
        sound: "环境声",
        productVisibility: "background_hint",
        mustShow: ["牙刷"],
        mustAvoid: ["精华液瓶"],
        transitionToNextShot: "切到商品",
      },
    ],
    soundDesign: { voiceoverAllowed: true, speechMode: "dialogue", ambientSound: "浴室环境声", musicOrSfx: "停顿" },
    textOverlay: [],
    firstFrameIntent: {
      stopSignal: "孩子拒绝刷牙",
      composition: "孩子和牙刷同框",
      emotion: "抗拒",
      mustShow: ["牙刷"],
      mustAvoid: ["精华液瓶"],
    },
    videoPromptHints: {
      visualMood: "写实手机 UGC",
      cameraBehavior: "近景",
      keyObjects: ["牙刷"],
      motionPriorities: ["拒绝"],
      avoid: ["精华液瓶"],
    },
    riskFlags: [],
    generationRecommendation: { preferredPath: "direct_video", reason: "测试", availablePaths: ["direct_video"] },
  }
}

describe("primary hook prompt pipeline", () => {
  it("uses native asset plus evaluator rewrite and compiles Seedance prompt as the production prompt", () => {
    const initial = weakLegacyAsset()
    const native = weakLegacyAsset()
    native.timelineShots[0].action = "孩子把牙刷推开，嘴巴紧闭，动作停住"
    native.timelineShots[1].action = "家长第二次递牙刷又被躲开，时间压力升级"
    native.timelineShots.push({
      time: "2.5-4s",
      retentionPurpose: "product_bridge",
      scene: "浴室洗手台",
      subject: "儿童魔法牙膏",
      action: "牙膏摆到镜头中心",
      camera: "手部中近景",
      sound: "管盖轻响",
      productVisibility: "clear_but_not_packshot",
      mustShow: ["儿童魔法牙膏", "牙膏软管", "管盖"],
      mustAvoid: ["精华液瓶"],
      transitionToNextShot: "停在商品上",
    })

    const result = buildPrimaryHookPromptArtifacts({
      request,
      settings,
      scriptCreativeSpec: spec(),
      resourceBundle,
      selectedHook,
      selectedCultureBorrowing: null,
      initialScriptAsset: initial,
      nativeScriptAsset: native,
      productImage: request.productImage,
      maxRepairAttempts: 1,
      primaryEnabled: true,
    })

    expect(result.scriptAssetSource).toBe("native_asset")
    expect(result.promptCompilerMode).toBe("asset_compiler_primary")
    expect(result.evaluatorRewriteApplied).toBe(true)
    expect(result.compiledVideoPrompt.prompt).toContain("时间片分镜脚本")
    expect(result.compiledVideoPrompt.prompt).toContain("张力推进")
    expect(result.compiledVideoPrompt.prompt).toContain("对白：")
    expect(result.compiledVideoPrompt.prompt).toContain("儿童魔法牙膏")
    expect(result.compiledVideoPrompt.prompt).not.toMatch(/钩子模式|钩子任务|变体边界|第一秒必须有可见事件/)
    expect(result.scriptAsset.timelineShots.some((shot) => Boolean(shot.dialogue))).toBe(true)
    expect(result.scriptAsset.timelineShots[0]?.action).not.toContain("把刷牙动作突然打断")
    expect(result.compiledVideoPrompt.prompt).not.toBe(toLegacyHookScriptResult(native).videoPrompt)
    expect(result.creativeScore.decision).not.toBe("fallback_recommended")
    expect(result.traceTimings.some((timing) => timing.node === "seedance_asset_compiler")).toBe(true)
  })
})
