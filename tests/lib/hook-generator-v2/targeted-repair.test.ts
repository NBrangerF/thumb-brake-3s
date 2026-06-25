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
})
