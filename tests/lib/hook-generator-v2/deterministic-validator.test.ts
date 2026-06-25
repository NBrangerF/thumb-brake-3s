import { describe, expect, it } from "vitest"

import type { HookCreativeResourceBundle } from "@/lib/hook-generator-v2/resources/types"
import type { UserIntentExpansion } from "@/lib/hook-generator-v2/intent-expansion/user-intent-expansion"
import type { HookScriptAsset, ScriptCreativeSpec } from "@/lib/hook-generator-v2/script-asset/types"
import { validateHookScriptAsset } from "@/lib/hook-generator-v2/quality/deterministic-validator"

function scriptCreativeSpec(): ScriptCreativeSpec {
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
      creativeHypothesis: "把睡前刷牙拍成闯关任务，牙膏是通关道具。",
    },
    resourceIds: {
      audienceSituationIds: ["aud_parent_bedtime_routine"],
      attentionMicroPatternId: "H7_A_MYTH_CHARACTER_LOGIC",
      eventPrimitiveIds: ["EVT_CUL_001"],
      productBridgeRoleIds: ["BRIDGE_RITUAL_OBJECT"],
      proofVisualizationIds: ["PROOF_CONTEXT_FIT"],
      cultureMotifId: "cb_template_public_xiyou_breakthrough",
      visualRenderProfileId: "game_show_task_card_bright_reality",
      shotPrimitiveIds: ["quest_open_task_gate", "quest_tension_countdown", "quest_product_bridge_tool"],
      shotCardIds: ["SHOT_RITUAL_HANDOFF"],
      constraintRuleIds: ["CONSTRAINT_PRODUCT_LOCK"],
      failureWarningIds: ["FAIL_PRODUCT_DRIFT"],
      exampleIds: ["example_1"],
    },
    hardRules: ["商品外形、包装和使用动作不能被替换成其它品类"],
  }
}

function shortPainScriptCreativeSpec(): ScriptCreativeSpec {
  return {
    ...scriptCreativeSpec(),
    duration: 4,
    intentContract: {
      ...scriptCreativeSpec().intentContract,
      intentType: "pain_first",
      userIntentText: "青少年刷牙敷衍",
      variantRole: "intent-direct",
      creativeHypothesis: "先拍孩子刷牙敷衍和牙渍，不让销售商品直接承接痛点证据。",
    },
  }
}

function semanticExpansion(): UserIntentExpansion {
  return {
    rawInput: "青少年刷牙敷衍",
    frame: {
      id: "daily_routine_low_effort",
      summary: "青少年在刷牙这个日常动作中投入过低，被家长或镜头发现。",
    },
    concepts: [{
      text: "敷衍",
      sourceSpan: "敷衍",
      semanticRole: "manner_quality",
      relationToEvent: "修饰刷牙动作的低投入方式",
      observableEvidence: ["刷两下就停", "牙刷泡沫少"],
      creativeUse: ["冲突来源", "开环证据"],
    }],
    hookSignals: {
      openingAction: "妈妈听到水声突然停，站在浴室门口皱眉看镜头。",
      conflictSource: "孩子不是没刷，而是刷得像没刷。",
      painEvidence: ["刷两下就停", "牙刷泡沫少"],
      socialPressureSignals: ["妈妈直视镜头，像在点名观众"],
      openLoop: "妈妈把旧牙刷拿开，手停在洗手台边缘准备换方法。",
    },
    productExposurePolicy: {
      requiredInHook: false,
      risk: "痛点证据后直接露销售商品，可能让观众误解商品导致问题。",
      recommendedTiming: "钩子之后或明确解决方案转折之后。",
      saferBridge: "旧牙刷、妈妈反应、换方法的手部开环。",
    },
    groundingNotes: ["泡沫少是从敷衍刷牙推断出的可拍证据，不是商品卖点。"],
  }
}

function resourceBundle(): HookCreativeResourceBundle {
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
      modelRiskTags: ["tube_to_bottle_drift"],
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
      motifFamily: "quest",
      actionLogic: "把刷牙动作变成闯关任务",
      visualSymbols: ["任务卡"],
      motionSymbols: ["递出道具"],
      audioSymbols: ["鼓点加速"],
      productBridgeOptions: ["ritual_object"],
      compatibleIntentModes: ["creative_first"],
      compatibleCategories: ["personal_care"],
      guardrails: ["商品必须参与动作链"],
      cultureMotifId: "QUEST_BREAKTHROUGH",
      visualRenderProfileId: "game_show_task_card_bright_reality",
      shotPrimitiveIds: ["quest_open_task_gate", "quest_tension_countdown", "quest_product_bridge_tool"],
      whySelected: ["精确类目匹配:oral_care"],
    },
  } as unknown as HookCreativeResourceBundle
}

function validAsset(): HookScriptAsset {
  return {
    hookSummary: "睡前刷牙像闯关",
    audienceStopReason: "家长看到熟悉的睡前卡住场景",
    hookMechanism: {
      hookType: "H7",
      microPatternId: "H7_A_MYTH_CHARACTER_LOGIC",
      mechanismName: "神话角色动作逻辑",
      stopSignal: "刷牙被拍成闯关任务",
      tensionEngine: "任务卡住",
      curiosityGap: "牙膏为什么像通关道具",
      payoffStyle: "商品进入动作链",
    },
    productRole: {
      role: "ritual_object",
      entryTime: "1-2s",
      entryAction: "家长把儿童低泡牙膏挤到牙刷旁",
      whyItBelongs: "牙膏是完成刷牙任务的通关道具",
      avoidHardSell: true,
      noFullClaim: true,
    },
    cultureFusionMechanism: {
      enabled: true,
      motifId: "cb_template_public_xiyou_breakthrough",
      borrowedSymbol: "任务卡",
      whereItAppears: ["任务卡", "递出道具"],
      actionIntegration: "把刷牙动作变成闯关任务",
      soundIntegration: "鼓点加速",
      productBridgeIntegration: "牙膏作为通关道具进入刷牙动作",
      notJustStyle: true,
    },
    timelineShots: [
      {
        time: "0-1.5s",
        retentionPurpose: "stop_scroll",
        scene: "浴室灯关一半，孩子看着任务卡停住",
        subject: "孩子",
        action: "看着任务卡停住，牙刷还没拿起",
        eventPrimitiveId: "EVT_CUL_001",
        shotCardId: "SHOT_RITUAL_HANDOFF",
        camera: "手部中近景",
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
        sound: "提示音",
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
      ambientSound: "浴室环境声",
      musicOrSfx: "鼓点加速",
    },
    textOverlay: ["今晚这一关", "牙膏是通关道具"],
    firstFrameIntent: {
      stopSignal: "睡前刷牙像闯关",
      composition: "牙膏、牙刷和任务卡同框",
      emotion: "好奇",
      mustShow: ["牙膏软管", "任务卡"],
      mustAvoid: ["精华液瓶"],
    },
    videoPromptHints: {
      visualMood: "写实手机 UGC",
      cameraBehavior: "手部中近景",
      keyObjects: ["儿童低泡牙膏", "牙刷", "任务卡"],
      motionPriorities: ["挤牙膏", "递出道具"],
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

describe("hook generator v2 deterministic validator", () => {
  it("passes a filmable script asset with product lock, bridge, and culture action", () => {
    const result = validateHookScriptAsset({
      scriptAsset: validAsset(),
      scriptCreativeSpec: scriptCreativeSpec(),
      resourceBundle: resourceBundle(),
    })

    expect(result.status).toBe("pass")
    expect(result.issues).toEqual([])
  })

  it("catches product identity drift before prompt compilation", () => {
    const asset = validAsset()
    asset.timelineShots[1] = {
      ...asset.timelineShots[1],
      scene: "镜前拿起精华液瓶",
      subject: "精华液瓶",
      action: "拿起精华液瓶靠近脸部",
      mustShow: ["精华液瓶"],
    }

    const result = validateHookScriptAsset({
      scriptAsset: asset,
      scriptCreativeSpec: scriptCreativeSpec(),
      resourceBundle: resourceBundle(),
    })

    expect(result.status).toBe("fail")
    expect(result.issues.map((issue) => issue.code)).toContain("PRODUCT_IDENTITY_DRIFT")
  })

  it("catches culture-as-style-only failures without forcing product bridge", () => {
    const asset = validAsset()
    asset.productRole = {
      ...asset.productRole,
      entryAction: "镜头只展示闯关背景",
      whyItBelongs: "背景风格更有趣",
    }
    asset.cultureFusionMechanism = {
      ...asset.cultureFusionMechanism!,
      actionIntegration: "只做背景风格",
      productBridgeIntegration: "只做背景风格",
      notJustStyle: false,
    }
    asset.timelineShots = asset.timelineShots.map((shot) => ({
      ...shot,
      retentionPurpose: "curiosity_gap",
      productVisibility: "none",
      mustShow: ["任务卡"],
    }))

    const result = validateHookScriptAsset({
      scriptAsset: asset,
      scriptCreativeSpec: scriptCreativeSpec(),
      resourceBundle: resourceBundle(),
    })

    expect(result.status).toBe("fail")
    expect(result.issues.map((issue) => issue.code)).toEqual(expect.arrayContaining([
      "CULTURE_STYLE_ONLY",
    ]))
    expect(result.issues.map((issue) => issue.code)).not.toContain("MISSING_PRODUCT_BRIDGE")
  })

  it("passes product-free hooks when the opening conflict and open loop are meaningful", () => {
    const asset = validAsset()
    asset.cultureFusionMechanism = undefined
    asset.productRole = {
      ...asset.productRole,
      entryTime: "后续解决方案转折",
      entryAction: "本段只保留妈妈看向洗手台的开环，不直接露出销售商品。",
      whyItBelongs: "先确认青少年刷牙敷衍和牙渍，商品可留到后续作为解决方案线索。",
    }
    asset.timelineShots = [
      {
        ...asset.timelineShots[0],
        time: "0-1s",
        retentionPurpose: "stop_scroll",
        scene: "妈妈站在浴室门口皱眉直视手机镜头",
        subject: "妈妈",
        action: "妈妈看到孩子刷牙敷衍后突然停住",
        productVisibility: "none",
        mustShow: ["妈妈反应"],
        transitionToNextShot: "摇到孩子牙齿",
      },
      {
        ...asset.timelineShots[0],
        time: "1-2.5s",
        retentionPurpose: "build_tension",
        scene: "青少年在浴室镜前随便刷两下",
        subject: "孩子",
        action: "孩子拿出牙刷，牙齿表面有牙渍和色差",
        productVisibility: "none",
        mustShow: ["牙渍", "旧牙刷"],
        transitionToNextShot: "切到妈妈反应",
      },
      {
        ...asset.timelineShots[0],
        time: "2.5-4s",
        retentionPurpose: "open_loop",
        scene: "妈妈沉默看向洗手台边缘但不露出销售商品",
        subject: "妈妈和旧牙刷",
        action: "妈妈把旧牙刷拿开，手停在洗手台边缘留下要换方法的悬念",
        productVisibility: "none",
        mustShow: ["旧牙刷", "妈妈反应"],
        transitionToNextShot: "留下下一段解决方案悬念",
      },
    ]

    const result = validateHookScriptAsset({
      scriptAsset: asset,
      scriptCreativeSpec: shortPainScriptCreativeSpec(),
      resourceBundle: { ...resourceBundle(), cultureMotif: null },
    })

    expect(result.status).toBe("pass")
    expect(result.issues.map((issue) => issue.code)).not.toContain("MISSING_PRODUCT_BRIDGE")
  })

  it("allows sales product reveal after pain evidence because this is a creative judgment", () => {
    const asset = validAsset()
    asset.cultureFusionMechanism = undefined
    asset.timelineShots = [
      {
        ...asset.timelineShots[0],
        time: "0-1s",
        retentionPurpose: "stop_scroll",
        scene: "妈妈站在浴室门口皱眉直视镜头",
        subject: "妈妈",
        action: "妈妈看到孩子刷牙敷衍后突然停住",
        productVisibility: "none",
        mustShow: ["妈妈反应"],
        transitionToNextShot: "摇到孩子牙齿",
      },
      {
        ...asset.timelineShots[0],
        time: "1-2.5s",
        retentionPurpose: "build_tension",
        scene: "青少年在浴室镜前随便刷两下",
        subject: "孩子",
        action: "孩子拿出牙刷，牙齿表面有牙渍和色差",
        productVisibility: "none",
        mustShow: ["牙渍", "旧牙刷"],
        transitionToNextShot: "切到洗手台",
      },
      {
        ...asset.timelineShots[1],
        time: "2.5-4s",
        retentionPurpose: "product_bridge",
        scene: "洗手台台面特写，儿童低泡牙膏软管正面露出",
        subject: "儿童低泡牙膏",
        action: "儿童低泡牙膏放在牙刷旁做清晰包装展示",
        camera: "台面固定特写",
        productVisibility: "clear_but_not_packshot",
        mustShow: ["儿童低泡牙膏", "牙膏软管", "管盖"],
      },
    ]
    asset.productRole = {
      ...asset.productRole,
      entryTime: "2.5-4s",
      entryAction: "儿童低泡牙膏放在牙刷旁做清晰包装展示",
      whyItBelongs: "牙膏作为解决线索出现",
    }

    const result = validateHookScriptAsset({
      scriptAsset: asset,
      scriptCreativeSpec: shortPainScriptCreativeSpec(),
      resourceBundle: { ...resourceBundle(), cultureMotif: null },
    })

    expect(result.status).toBe("pass")
    expect(result.issues.map((issue) => issue.code)).not.toContain("SALES_PRODUCT_AFTER_PAIN_EVIDENCE")
  })

  it("warns but does not fail when semantic expansion is not grounded in opening, conflict, or open loop", () => {
    const spec = {
      ...shortPainScriptCreativeSpec(),
      intentContract: {
        ...shortPainScriptCreativeSpec().intentContract,
        userIntentExpansion: semanticExpansion(),
      },
    }
    const asset = validAsset()
    asset.cultureFusionMechanism = undefined
    asset.timelineShots = asset.timelineShots.map((shot) => ({
      ...shot,
      scene: "浴室里有人正常整理台面",
      action: "人物把毛巾摆正，没有出现刷牙敷衍证据",
      productVisibility: "none",
      mustShow: ["毛巾"],
    }))
    asset.productRole = {
      ...asset.productRole,
      entryTime: "后续",
      entryAction: "商品留到后续解决方案转折",
      whyItBelongs: "本段只保留普通开环",
    }

    const result = validateHookScriptAsset({
      scriptAsset: asset,
      scriptCreativeSpec: spec,
      resourceBundle: { ...resourceBundle(), cultureMotif: null },
    })

    expect(result.status).toBe("pass")
    expect(result.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: "USER_INTENT_EXPANSION_NOT_GROUNDED",
        severity: "warning",
      }),
    ]))
  })

  it("does not warn when semantic expansion lands in a visible opening or open-loop beat", () => {
    const spec = {
      ...shortPainScriptCreativeSpec(),
      intentContract: {
        ...shortPainScriptCreativeSpec().intentContract,
        userIntentExpansion: semanticExpansion(),
      },
    }
    const asset = validAsset()
    asset.cultureFusionMechanism = undefined
    asset.timelineShots = [
      {
        ...asset.timelineShots[0],
        retentionPurpose: "stop_scroll",
        scene: "妈妈听到水声突然停，站在浴室门口皱眉看镜头",
        action: "孩子刷两下就停，牙刷泡沫少",
        productVisibility: "none",
        mustShow: ["妈妈反应", "牙刷泡沫少"],
      },
      {
        ...asset.timelineShots[0],
        retentionPurpose: "open_loop",
        scene: "妈妈把旧牙刷拿开，手停在洗手台边缘准备换方法",
        action: "留下下一秒换方法的悬念",
        productVisibility: "none",
        mustShow: ["旧牙刷"],
      },
    ]

    const result = validateHookScriptAsset({
      scriptAsset: asset,
      scriptCreativeSpec: spec,
      resourceBundle: { ...resourceBundle(), cultureMotif: null },
    })

    expect(result.status).toBe("pass")
    expect(result.issues.map((issue) => issue.code)).not.toContain("USER_INTENT_EXPANSION_NOT_GROUNDED")
  })

  it("fails culture-fused assets without explicit motif profile and shot primitive bindings", () => {
    const bundle = resourceBundle()
    bundle.resourceIds = {
      ...bundle.resourceIds,
      cultureMotifId: undefined,
      visualRenderProfileId: undefined,
      shotPrimitiveIds: [],
    }
    bundle.cultureMotif = {
      ...bundle.cultureMotif!,
      cultureMotifId: undefined,
      visualRenderProfileId: undefined,
      shotPrimitiveIds: [],
    }

    const result = validateHookScriptAsset({
      scriptAsset: validAsset(),
      scriptCreativeSpec: scriptCreativeSpec(),
      resourceBundle: bundle,
    })

    expect(result.status).toBe("fail")
    expect(result.issues.map((issue) => issue.code)).toEqual(expect.arrayContaining([
      "MISSING_VISUAL_RENDER_PROFILE",
      "MISSING_MOTIF_SHOT_PRIMITIVES",
    ]))
  })

  it("surfaces parser failures for abstract shot actions", () => {
    const asset = validAsset()
    asset.timelineShots[0] = {
      ...asset.timelineShots[0],
      action: "展示痛点并呈现高级感",
    }

    const result = validateHookScriptAsset({
      scriptAsset: asset,
      scriptCreativeSpec: scriptCreativeSpec(),
      resourceBundle: resourceBundle(),
    })

    expect(result.status).toBe("fail")
    expect(result.issues.map((issue) => issue.code)).toContain("NON_FILMABLE_ACTION")
  })
})
