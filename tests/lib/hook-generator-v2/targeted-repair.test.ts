import { describe, expect, it } from "vitest"

import type { HookValidationIssue } from "@/lib/hook-generator-v2/graph/types"
import type { HookCreativeResourceBundle } from "@/lib/hook-generator-v2/resources/types"
import type { HookScriptAsset, ScriptCreativeSpec } from "@/lib/hook-generator-v2/script-asset/types"
import { validateHookScriptAsset } from "@/lib/hook-generator-v2/quality/deterministic-validator"
import {
  repairHookScriptAsset,
  validateAndRepairHookScriptAsset,
} from "@/lib/hook-generator-v2/quality/targeted-repair"

function spec(): ScriptCreativeSpec {
  return {
    task: "generate_hook_script_asset",
    duration: 5,
    platform: "short_video_feed",
    productLock: {
      productName: "儿童低泡牙膏",
      category: "personal_care",
      inferredSubCategory: "oral_care_toothpaste",
      mustShowSignals: ["牙膏软管", "管盖", "挤出的膏体"],
      usageSignals: ["挤牙膏", "刷牙"],
      forbiddenConfusions: ["精华液瓶", "香水瓶"],
      allowedProductActions: ["挤出", "放在牙刷旁"],
    },
    intentContract: {
      intentType: "creative_first",
      userIntentText: "睡前刷牙像闯关",
      variantRole: "culture-fused",
      creativeHypothesis: "牙膏作为通关道具进入刷牙动作。",
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
      exampleIds: ["example_1"],
    },
    hardRules: ["商品必须参与动作链"],
  }
}

function bundle(): HookCreativeResourceBundle {
  return {
    productContract: {
      productName: "儿童低泡牙膏",
      productCategory: "personal_care",
      inferredSubCategory: "oral_care_toothpaste",
      visualAnchors: ["牙膏软管", "管盖", "挤出的膏体"],
      packagingSignals: ["口腔护理包装"],
      usageAnchors: ["挤牙膏", "刷牙"],
      typicalUseScenes: ["浴室"],
      allowedProductActions: ["挤出", "放在牙刷旁"],
      forbiddenVisualConfusions: ["精华液瓶", "香水瓶"],
      claimRiskTags: [],
      modelRiskTags: [],
      source: {
        productAnalysisUsed: true,
        fallbackCategoryRuleIds: ["p0_oral_care_toothpaste"],
      },
    },
    cultureMotif: {
      id: "cb_template_public_xiyou_breakthrough",
      name: "西游闯关破阵",
      source: "selected_culture_borrowing",
      motifType: "selected_template",
      cultureMotifId: "cb_template_public_xiyou_breakthrough",
      visualRenderProfileId: "visual_profile_xiyou_breakthrough_mobile",
      shotPrimitiveIds: [
        "shot_xiyou_breakthrough_opening",
        "shot_xiyou_breakthrough_tension",
        "shot_xiyou_breakthrough_product_bridge",
      ],
      actionLogic: "把刷牙动作变成闯关任务",
      visualSymbols: ["任务卡"],
      motionSymbols: ["递出道具"],
      audioSymbols: ["鼓点加速"],
      productBridgeOptions: ["ritual_object"],
      compatibleIntentModes: ["creative_first"],
      compatibleCategories: ["personal_care"],
      guardrails: ["商品必须参与动作链"],
    },
    audienceSituations: [],
    attentionMicroPattern: {} as HookCreativeResourceBundle["attentionMicroPattern"],
    eventCandidates: [],
    bridgeCandidates: [],
    proofCandidates: [],
    shotCandidates: [],
    constraints: [],
    failureWarnings: [],
    examples: [],
    resourceIds: {
      audienceSituationIds: ["aud_parent_bedtime_routine"],
      attentionMicroPatternId: "H7_A_MYTH_CHARACTER_LOGIC",
      eventPrimitiveIds: ["EVT_CUL_001"],
      productBridgeRoleIds: ["BRIDGE_RITUAL_OBJECT"],
      proofVisualizationIds: ["PROOF_CONTEXT_FIT"],
      cultureMotifId: "cb_template_public_xiyou_breakthrough",
      visualRenderProfileId: "visual_profile_xiyou_breakthrough_mobile",
      shotPrimitiveIds: [
        "shot_xiyou_breakthrough_opening",
        "shot_xiyou_breakthrough_tension",
        "shot_xiyou_breakthrough_product_bridge",
      ],
      shotCardIds: ["SHOT_RITUAL_HANDOFF"],
      constraintRuleIds: ["CONSTRAINT_PRODUCT_LOCK"],
      failureWarningIds: ["FAIL_PRODUCT_DRIFT"],
      exampleIds: ["example_1"],
    },
    libraryRefs: {
      categoryPlaybookIds: [],
      referenceAssetIds: [],
      trendObservationIds: [],
    },
    retrievalPolicy: {
      intent: "creative_first",
      role: "culture-fused",
      bounded: true,
    },
  } as HookCreativeResourceBundle
}

function brokenAsset(): HookScriptAsset {
  return {
    hookSummary: "睡前刷牙像闯关",
    audienceStopReason: "熟悉睡前卡住场景",
    hookMechanism: {
      hookType: "H7",
      microPatternId: "H7_A_MYTH_CHARACTER_LOGIC",
      mechanismName: "神话角色动作逻辑",
      stopSignal: "刷牙被拍成闯关任务",
      tensionEngine: "任务卡住",
      curiosityGap: "商品如何成为道具",
      payoffStyle: "商品进入动作链",
    },
    productRole: {
      role: "ritual_object",
      entryTime: "1-2s",
      entryAction: "镜头只展示闯关背景",
      whyItBelongs: "背景风格更有趣",
      avoidHardSell: true,
      noFullClaim: true,
    },
    cultureFusionMechanism: {
      enabled: true,
      motifId: "cb_template_public_xiyou_breakthrough",
      borrowedSymbol: "任务卡",
      whereItAppears: ["任务卡"],
      actionIntegration: "只做背景风格",
      soundIntegration: "鼓点加速",
      productBridgeIntegration: "只做背景风格",
      notJustStyle: false,
    },
    timelineShots: [
      {
        time: "0-1.5s",
        retentionPurpose: "curiosity_gap",
        scene: "镜前拿起精华液瓶",
        subject: "精华液瓶",
        action: "展示痛点并呈现高级感",
        camera: "手部中近景",
        sound: "鼓点轻起",
        productVisibility: "hero_visible",
        mustShow: ["精华液瓶"],
        mustAvoid: ["精华液瓶", "香水瓶"],
        transitionToNextShot: "切到背景",
      },
    ],
    soundDesign: {
      voiceoverAllowed: true,
      speechMode: "voiceover",
      ambientSound: "浴室环境声",
      musicOrSfx: "鼓点加速",
    },
    textOverlay: ["今晚这一关"],
    firstFrameIntent: {
      stopSignal: "睡前刷牙像闯关",
      composition: "任务卡同框",
      emotion: "好奇",
      mustShow: ["任务卡"],
      mustAvoid: ["精华液瓶"],
    },
    videoPromptHints: {
      visualMood: "写实手机 UGC",
      cameraBehavior: "手部中近景",
      keyObjects: ["任务卡"],
      motionPriorities: ["背景风格"],
      avoid: ["精华液瓶", "香水瓶"],
    },
    riskFlags: [],
    generationRecommendation: {
      preferredPath: "direct_video",
      reason: "商品图可直接进入视频生成",
      availablePaths: ["direct_video"],
    },
  }
}

function audienceSceneSpec(): ScriptCreativeSpec {
  return {
    task: "generate_hook_script_asset",
    duration: 5,
    platform: "short_video_feed",
    productLock: {
      productName: "轻感腿部护理凝胶",
      category: "personal_care",
      inferredSubCategory: "general_ecommerce_product",
      mustShowSignals: ["凝胶软管", "透明凝胶"],
      usageSignals: ["涂抹", "放在包旁"],
      forbiddenConfusions: ["药品", "医疗器械"],
      allowedProductActions: ["涂抹", "放在包旁"],
    },
    intentContract: {
      intentType: "audience_first",
      userIntentText: "给每天久站的护士",
      variantRole: "intent-direct",
      creativeHypothesis: "场景化人群点名 Hook：0-1 秒点名人群，1-3 秒给场景证据。",
    },
    resourceIds: {
      audienceSituationIds: ["aud_nurse_long_shift"],
      attentionMicroPatternId: "H4_C_AUDIENCE_SCENE_CALLOUT",
      eventPrimitiveIds: ["EVT_AUD_001"],
      productBridgeRoleIds: ["BRIDGE_SOLUTION_CLUE"],
      proofVisualizationIds: ["PROOF_CONTEXT_FIT"],
      shotCardIds: ["SHOT_THRESHOLD_SCENE"],
      constraintRuleIds: ["CONSTRAINT_AUDIENCE_SCENE_EVIDENCE"],
      failureWarningIds: ["FAIL_AUDIENCE_LABEL_ONLY"],
      exampleIds: ["example_1"],
    },
    hardRules: ["人群点名 Hook 必须包含场景识别信号和产品承接"],
  }
}

function audienceSceneBundle(): HookCreativeResourceBundle {
  return {
    ...bundle(),
    productContract: {
      productName: "轻感腿部护理凝胶",
      productCategory: "personal_care",
      inferredSubCategory: "general_ecommerce_product",
      visualAnchors: ["凝胶软管", "透明凝胶"],
      packagingSignals: ["个人护理包装"],
      usageAnchors: ["涂抹", "放在包旁"],
      typicalUseScenes: ["更衣区"],
      allowedProductActions: ["涂抹", "放在包旁"],
      forbiddenVisualConfusions: ["药品", "医疗器械"],
      claimRiskTags: [],
      modelRiskTags: [],
      source: {
        productAnalysisUsed: true,
        fallbackCategoryRuleIds: ["p0_general_ecommerce"],
      },
    },
    audienceSituations: [{
      id: "aud_nurse_long_shift",
      name: "久站护士下班瞬间",
      lifeState: "连续站立或走动一整班后，终于换鞋、坐下或整理工牌",
      emotionalTriggers: ["累但不能松垮"],
      hiddenDoubts: ["会不会太麻烦"],
      likelyScrollReasons: ["工牌/走廊/换鞋瞬间太具体"],
      recognitionSignals: ["工牌挂绳", "冷白走廊灯", "下班换鞋", "手扶小腿", "袜口压痕"],
      commonScenes: ["医院走廊", "更衣区"],
      compatibleIntentTypes: ["audience_first"],
      compatibleCategories: ["personal_care"],
      compatibleHookTypes: ["H4"],
      compatibleEventKinds: ["audience_scene_callout"],
      exampleAudienceInputs: ["每天久站的护士"],
    }],
    bridgeCandidates: [{
      id: "BRIDGE_SOLUTION_CLUE",
      role: "solution_clue",
      name: "解决线索",
      definition: "商品作为换一种方法的线索进入",
      bestForHookTypes: ["H4"],
      bestForIntentModes: ["audience_first"],
      bestForProductCategoryTags: ["personal_care"],
      entryTimingRules: [],
      requiredPreEntryTension: [],
      entryActionTemplates: [],
      compatibleEventKinds: ["audience_scene_callout"],
      compatibleProofTags: [],
      compatibleCulturalMotifTypes: [],
      recommendedShotIds: ["SHOT_THRESHOLD_SCENE"],
      textOverlaySyntaxHints: [],
      soundHints: [],
      avoidHardSellRules: [],
      validatorChecks: [],
    }],
    cultureMotif: null,
    resourceIds: {
      audienceSituationIds: ["aud_nurse_long_shift"],
      attentionMicroPatternId: "H4_C_AUDIENCE_SCENE_CALLOUT",
      eventPrimitiveIds: ["EVT_AUD_001"],
      productBridgeRoleIds: ["BRIDGE_SOLUTION_CLUE"],
      proofVisualizationIds: ["PROOF_CONTEXT_FIT"],
      shotCardIds: ["SHOT_THRESHOLD_SCENE"],
      constraintRuleIds: ["CONSTRAINT_AUDIENCE_SCENE_EVIDENCE"],
      failureWarningIds: ["FAIL_AUDIENCE_LABEL_ONLY"],
      exampleIds: ["example_1"],
    },
    retrievalPolicy: {
      intent: "audience_first",
      role: "intent-direct",
      bounded: true,
    },
  } as HookCreativeResourceBundle
}

function genericAudienceAsset(): HookScriptAsset {
  return {
    ...brokenAsset(),
    hookSummary: "给女生的好物",
    audienceStopReason: "女生会停下来看",
    hookMechanism: {
      hookType: "H4",
      microPatternId: "H4_C_AUDIENCE_SCENE_CALLOUT",
      mechanismName: "场景化人群点名",
      stopSignal: "给女生",
      tensionEngine: "人群点名",
      curiosityGap: "为什么适合她们",
      payoffStyle: "产品承接",
    },
    productRole: {
      role: "solution_clue",
      entryTime: "3-5s",
      entryAction: "稍后再说",
      whyItBelongs: "适合女生",
      avoidHardSell: true,
      noFullClaim: true,
    },
    cultureFusionMechanism: undefined,
    timelineShots: [{
      time: "0-1s",
      retentionPurpose: "stop_scroll",
      scene: "普通背景",
      subject: "女生",
      action: "看向镜头",
      camera: "中近景",
      sound: "轻音乐",
      textOverlay: "女生必备",
      productVisibility: "none",
      mustShow: ["女生"],
      mustAvoid: [],
      transitionToNextShot: "继续解释",
    }],
    textOverlay: ["女生必备"],
    firstFrameIntent: {
      stopSignal: "给女生",
      composition: "普通背景",
      emotion: "好奇",
      mustShow: ["女生"],
      mustAvoid: [],
    },
    videoPromptHints: {
      visualMood: "写实手机 UGC",
      cameraBehavior: "中近景",
      keyObjects: ["女生"],
      motionPriorities: ["看向镜头"],
      avoid: [],
    },
    riskFlags: [],
  }
}

describe("hook generator v2 targeted repair", () => {
  it("repairs deterministic quality failures into a passing script asset", () => {
    const scriptCreativeSpec = spec()
    const resourceBundle = bundle()
    const before = validateHookScriptAsset({
      scriptAsset: brokenAsset(),
      scriptCreativeSpec,
      resourceBundle,
    })

    const repaired = repairHookScriptAsset({
      scriptAsset: brokenAsset(),
      scriptCreativeSpec,
      resourceBundle,
      issues: before.issues,
      attempt: 1,
      repairedAt: "2026-05-30T10:00:00.000Z",
    })
    const after = validateHookScriptAsset({
      scriptAsset: repaired.scriptAsset,
      scriptCreativeSpec,
      resourceBundle,
    })

    expect(before.status).toBe("fail")
    expect(repaired.repairRecord).not.toBeNull()
    if (!repaired.repairRecord) throw new Error("expected repair record")
    expect(repaired.repairRecord).toMatchObject({
      attempt: 1,
      repairedAt: "2026-05-30T10:00:00.000Z",
    })
    expect(repaired.repairRecord.reason).toContain("PRODUCT_IDENTITY_DRIFT")
    expect(after.status).toBe("pass")
    expect(repaired.scriptAsset.productRole.entryAction).toContain("儿童低泡牙膏")
    expect(repaired.scriptAsset.cultureFusionMechanism?.notJustStyle).toBe(true)
    expect(repaired.scriptAsset.timelineShots[0].action).not.toMatch(/展示痛点|高级感/)
  })

  it("does not repair when the next attempt would exceed policy", () => {
    const scriptCreativeSpec = spec()
    const resourceBundle = bundle()
    const issues: HookValidationIssue[] = [{
      code: "PRODUCT_IDENTITY_DRIFT",
      message: "bad product",
      severity: "error",
    }]

    const repaired = repairHookScriptAsset({
      scriptAsset: brokenAsset(),
      scriptCreativeSpec,
      resourceBundle,
      issues,
      attempt: 2,
      maxRepairAttempts: 1,
      repairedAt: "2026-05-30T10:00:00.000Z",
    })

    expect(repaired.repaired).toBe(false)
    expect(repaired.repairRecord).toBeNull()
    expect(repaired.scriptAsset).toEqual(brokenAsset())
  })

  it("runs a bounded validate-repair loop", () => {
    const result = validateAndRepairHookScriptAsset({
      scriptAsset: brokenAsset(),
      scriptCreativeSpec: spec(),
      resourceBundle: bundle(),
      maxRepairAttempts: 1,
    })

    expect(result.qualityGate.status).toBe("pass")
    expect(result.repairAttempts).toBe(1)
    expect(result.repairHistory).toHaveLength(1)
    expect(result.repairHistory[0].attempt).toBe(1)
  })

  it("repairs generic audience labels into scene-backed audience callouts", () => {
    const scriptCreativeSpec = audienceSceneSpec()
    const resourceBundle = audienceSceneBundle()
    const before = validateHookScriptAsset({
      scriptAsset: genericAudienceAsset(),
      scriptCreativeSpec,
      resourceBundle,
    })

    expect(before.status).toBe("fail")
    expect(before.issues.map((issue) => issue.code)).toEqual(expect.arrayContaining([
      "GENERIC_AUDIENCE_LABEL",
      "AUDIENCE_LABEL_WITHOUT_SCENE",
      "AUDIENCE_CALLOUT_NO_BRIDGE",
    ]))

    const result = validateAndRepairHookScriptAsset({
      scriptAsset: genericAudienceAsset(),
      scriptCreativeSpec,
      resourceBundle,
      maxRepairAttempts: 1,
    })

    expect(result.qualityGate.status).toBe("pass")
    expect(result.scriptAsset.timelineShots[0].mustShow).toEqual(expect.arrayContaining([
      "工牌挂绳",
      "冷白走廊灯",
    ]))
    expect(result.scriptAsset.productRole.entryAction).toContain("轻感腿部护理凝胶")
  })
})
