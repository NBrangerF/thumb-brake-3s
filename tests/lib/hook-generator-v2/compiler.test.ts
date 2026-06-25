import { describe, expect, it } from "vitest"

import type { HookCreativeResourceIds } from "@/lib/hook-generator-v2/resources/types"
import type { UserIntentExpansion } from "@/lib/hook-generator-v2/intent-expansion/user-intent-expansion"
import type { HookScriptAsset, ScriptCreativeSpec } from "@/lib/hook-generator-v2/script-asset/types"
import {
  compileHookVideoPrompt,
  compileSeedanceAssetPromptShadow,
} from "@/lib/hook-generator-v2/compiler/compile-hook-video-prompt"
import { toLegacyHookScriptResult } from "@/lib/hook-generator-v2/script-asset/legacy-adapter"

const resourceIds: HookCreativeResourceIds = {
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
}

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
    resourceIds,
    hardRules: ["商品必须参与动作链"],
  }
}

function shortPainSpec(): ScriptCreativeSpec {
  return {
    ...spec(),
    duration: 4,
    intentContract: {
      ...spec().intentContract,
      intentType: "pain_first",
      userIntentText: "青少年刷牙敷衍",
      variantRole: "intent-direct",
      creativeHypothesis: "先拍刷牙敷衍和牙渍，销售商品延后到解决方案转折后。",
      userIntentExpansion: semanticExpansion(),
    },
    resourceIds: {
      ...spec().resourceIds,
      cultureMotifId: undefined,
      shotPrimitiveIds: [],
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
      observableEvidence: ["刷两下就停", "牙刷泡沫少", "牙齿仍有色差"],
      creativeUse: ["冲突来源", "开环证据"],
    }],
    hookSignals: {
      openingAction: "妈妈听到水声突然停，站在浴室门口皱眉看镜头。",
      conflictSource: "孩子不是没刷，而是刷得像没刷。",
      painEvidence: ["刷两下就停", "牙刷泡沫少", "牙齿仍有色差"],
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

function asset(): HookScriptAsset {
  return {
    hookSummary: "睡前刷牙像闯关",
    audienceStopReason: "家长看到熟悉的睡前卡住场景",
    tensionPlan: {
      conflictType: "睡前流程卡住",
      pressureSource: "孩子停在牙刷前不愿意继续",
      firstSecondShock: "任务卡和牙刷同框，孩子突然停住",
      escalationBeat: "鼓点加速后牙膏被当作通关道具递出",
      unresolvedQuestion: "牙膏为什么能让这一关继续",
      emotionalPressure: "家长催促和孩子抗拒同时存在",
      productResolutionRole: "牙膏作为通关道具回收前面的卡住动作",
      riskIfTooSubtle: "如果只拍牙膏，闯关张力会消失",
    },
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
      entryAction: "儿童低泡牙膏挤到牙刷旁",
      whyItBelongs: "牙膏是完成刷牙任务的通关道具",
      avoidHardSell: true,
      noFullClaim: true,
    },
    cultureFusionMechanism: {
      enabled: true,
      motifId: "cb_template_public_xiyou_breakthrough",
      templateId: "cb_template_public_xiyou_breakthrough",
      borrowedSymbol: "任务卡",
      concreteSymbol: "任务卡",
      whereItAppears: ["任务卡", "递出道具"],
      actionIntegration: "把刷牙动作变成闯关任务",
      actionTranslation: "家长递出牙膏像递出通关道具",
      soundIntegration: "鼓点加速",
      soundTranslation: "提示音和鼓点加速制造闯关压力",
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
      compatibilityPrompt: "Realistic vertical first frame, toothpaste tube and quest card visible.",
    },
    videoPromptHints: {
      visualMood: "写实手机 UGC",
      cameraBehavior: "手部中近景",
      keyObjects: ["儿童低泡牙膏", "牙刷", "任务卡"],
      motionPriorities: ["挤牙膏", "递出道具"],
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

describe("hook generator v2 provider compiler", () => {
  it("keeps Seedance prompt compatible with the legacy adapter", () => {
    const scriptAsset = asset()
    const compiled = compileHookVideoPrompt({
      scriptAsset,
      scriptCreativeSpec: spec(),
      modelFamily: "seedance",
      videoProvider: "seedance",
      productImage: "https://oss.example.com/toothpaste.png",
    })

    expect(compiled).toMatchObject({
      provider: "seedance",
      modelFamily: "seedance",
      prompt: toLegacyHookScriptResult(scriptAsset).videoPrompt,
      inputImages: [
        {
          source: "https://oss.example.com/toothpaste.png",
          declared_role: "product_front",
        },
      ],
    })
    expect(compiled.metadata.resourceIds).toEqual(resourceIds)
  })

  it("builds a Seedance asset compiler shadow prompt from asset, resources, and culture symbols", () => {
    const scriptAsset = asset()
    const compiled = compileSeedanceAssetPromptShadow({
      scriptAsset,
      scriptCreativeSpec: spec(),
      resourceBundle: {
        productContract: {
          productName: "儿童低泡牙膏",
          productCategory: "personal_care",
          inferredSubCategory: "oral_care_toothpaste",
          visualAnchors: ["牙膏软管", "管盖"],
          packagingSignals: ["软管包装"],
          usageAnchors: ["挤牙膏", "刷牙"],
          typicalUseScenes: ["浴室"],
          allowedProductActions: ["挤出"],
          forbiddenVisualConfusions: ["精华液瓶", "香水瓶"],
          claimRiskTags: [],
          modelRiskTags: ["tube_to_bottle_drift"],
          source: { productAnalysisUsed: true, fallbackCategoryRuleIds: ["p0_oral_care_toothpaste"] },
        },
        audienceSituations: [],
        attentionMicroPattern: {
          id: "H7_A_MYTH_CHARACTER_LOGIC",
          parentHookType: "H7",
          name: "文化任务动作",
          attentionJob: "用具体文化任务制造停滑",
          stopSignalLogic: "任务卡让刷牙停住",
          tensionEngine: "任务卡住",
          curiosityEngine: "牙膏为什么像道具",
          bestForIntentModes: ["creative_first"],
          compatibleProductRoles: ["ritual_object"],
          preferredProductEntryTiming: "middle",
          eventQueryTags: ["quest"],
          preferredShotFunctions: ["ritual_handoff"],
          preferredSoundFunctions: ["prompt_tone"],
          preferredOverlayFunctions: [],
          goodForProductTraits: [],
          weakForProductTraits: [],
          commonFailureModes: [],
          guardrailNotes: [],
        },
        eventCandidates: [],
        bridgeCandidates: [],
        proofCandidates: [],
        cultureMotif: null,
        shotCandidates: [],
        constraints: [{ id: "CONSTRAINT_PRODUCT_LOCK", severity: "hard", rule: "商品不能漂移", appliesTo: ["product"] }],
        failureWarnings: [{ id: "FAIL_PRODUCT_DRIFT", warning: "商品漂移", repairHint: "加强商品锚点", appliesTo: ["product"] }],
        examples: [],
        resourceIds,
        libraryRefs: { categoryPlaybookIds: [], referenceAssetIds: [], trendObservationIds: [] },
        retrievalPolicy: { intent: "creative_first", role: "culture-fused", bounded: true },
      },
      videoProvider: "seedance",
      productImage: "https://oss.example.com/toothpaste.png",
      selectedCultureBorrowing: null,
    })

    expect(compiled.prompt).toContain("张力推进")
    expect(compiled.prompt).toContain("文化母题")
    expect(compiled.prompt).toContain("任务卡")
    expect(compiled.sections?.tensionPlan).toContain("孩子突然停住")
    expect(compiled.sections?.cultureBorrowingLine).toContain("牙膏是通关道具")
    expect(compiled.sections?.negativeConstraints).toEqual(expect.arrayContaining(["精华液瓶", "商品漂移"]))
  })

  it("compiles the primary Seedance asset prompt as concise Chinese execution instructions with dialogue", () => {
    const scriptAsset = asset()
    scriptAsset.soundDesign.speechMode = "dialogue"
    scriptAsset.timelineShots[0].dialogue = "孩子小声说：“我不要刷。”"
    scriptAsset.timelineShots[0].scene = "Home bathroom before bedtime"
    scriptAsset.timelineShots[0].camera = "Handheld closeup"
    scriptAsset.timelineShots[0].sound = "Kid's soft huff of refusal"

    const compiled = compileSeedanceAssetPromptShadow({
      scriptAsset,
      scriptCreativeSpec: spec(),
      resourceBundle: {
        productContract: {
          productName: "儿童低泡牙膏",
          productCategory: "personal_care",
          inferredSubCategory: "oral_care_toothpaste",
          visualAnchors: ["牙膏软管", "管盖"],
          packagingSignals: ["软管包装"],
          usageAnchors: ["挤牙膏", "刷牙"],
          typicalUseScenes: ["浴室"],
          allowedProductActions: ["挤出"],
          forbiddenVisualConfusions: ["精华液瓶", "香水瓶"],
          claimRiskTags: [],
          modelRiskTags: ["tube_to_bottle_drift"],
          source: { productAnalysisUsed: true, fallbackCategoryRuleIds: ["p0_oral_care_toothpaste"] },
        },
        audienceSituations: [],
        attentionMicroPattern: {
          id: "H7_A_MYTH_CHARACTER_LOGIC",
          parentHookType: "H7",
          name: "文化任务动作",
          attentionJob: "用具体文化任务制造停滑",
          stopSignalLogic: "任务卡让刷牙停住",
          tensionEngine: "任务卡住",
          curiosityEngine: "牙膏为什么像道具",
          bestForIntentModes: ["creative_first"],
          compatibleProductRoles: ["ritual_object"],
          preferredProductEntryTiming: "middle",
          eventQueryTags: ["quest"],
          preferredShotFunctions: ["ritual_handoff"],
          preferredSoundFunctions: ["prompt_tone"],
          preferredOverlayFunctions: [],
          goodForProductTraits: [],
          weakForProductTraits: [],
          commonFailureModes: [],
          guardrailNotes: [],
        },
        eventCandidates: [],
        bridgeCandidates: [],
        proofCandidates: [],
        cultureMotif: null,
        shotCandidates: [],
        constraints: [],
        failureWarnings: [],
        examples: [],
        resourceIds,
        libraryRefs: { categoryPlaybookIds: [], referenceAssetIds: [], trendObservationIds: [] },
        retrievalPolicy: { intent: "creative_first", role: "culture-fused", bounded: true },
      },
      videoProvider: "seedance",
      productImage: "https://oss.example.com/toothpaste.png",
      selectedCultureBorrowing: null,
    })

    expect(compiled.prompt).toContain("对白：孩子小声说：“我不要刷。”")
    expect(compiled.prompt).toContain("家庭浴室")
    expect(compiled.prompt).not.toMatch(/钩子模式|钩子任务|变体边界|第一秒必须有可见事件/)
    expect(compiled.prompt).not.toMatch(/\bHome\b|\bHandheld\b|\bKid\b|\bpackshot\b/)
    expect(compiled.prompt).not.toMatch(/[A-Za-z]/)
  })

  it("follows Seedance skill structure with semantic @image mapping, one camera move, and anti-penetration constraints", () => {
    const scriptAsset = asset()
    scriptAsset.soundDesign.speechMode = "dialogue"
    scriptAsset.timelineShots[0].dialogue = "孩子小声说：“我不要刷。”"
    scriptAsset.timelineShots[1].dialogue = "家长低声说：“最后一关。”"

    const compiled = compileSeedanceAssetPromptShadow({
      scriptAsset,
      scriptCreativeSpec: spec(),
      resourceBundle: {
        productContract: {
          productName: "儿童低泡牙膏",
          productCategory: "personal_care",
          inferredSubCategory: "oral_care_toothpaste",
          visualAnchors: ["牙膏软管", "管盖"],
          packagingSignals: ["软管包装"],
          usageAnchors: ["挤牙膏", "刷牙"],
          typicalUseScenes: ["浴室"],
          allowedProductActions: ["挤出"],
          forbiddenVisualConfusions: ["精华液瓶", "香水瓶"],
          claimRiskTags: [],
          modelRiskTags: ["tube_to_bottle_drift"],
          source: { productAnalysisUsed: true, fallbackCategoryRuleIds: ["p0_oral_care_toothpaste"] },
        },
        audienceSituations: [],
        attentionMicroPattern: {
          id: "H7_A_MYTH_CHARACTER_LOGIC",
          parentHookType: "H7",
          name: "文化任务动作",
          attentionJob: "用具体文化任务制造停滑",
          stopSignalLogic: "任务卡让刷牙停住",
          tensionEngine: "任务卡住",
          curiosityEngine: "牙膏为什么像道具",
          bestForIntentModes: ["creative_first"],
          compatibleProductRoles: ["ritual_object"],
          preferredProductEntryTiming: "middle",
          eventQueryTags: ["quest"],
          preferredShotFunctions: ["ritual_handoff"],
          preferredSoundFunctions: ["prompt_tone"],
          preferredOverlayFunctions: [],
          goodForProductTraits: [],
          weakForProductTraits: [],
          commonFailureModes: [],
          guardrailNotes: [],
        },
        eventCandidates: [],
        bridgeCandidates: [],
        proofCandidates: [],
        cultureMotif: {
          id: "cb_template_public_xiyou_breakthrough",
          name: "西游闯关破阵",
          source: "selected_culture_borrowing",
          motifType: "selected_template",
          actionLogic: "把刷牙动作变成闯关任务",
          visualSymbols: ["小红旗", "通关小令牌"],
          motionSymbols: ["递出通关道具"],
          audioSymbols: ["轻铜锣提示音"],
          productBridgeOptions: ["牙膏是通关道具"],
          compatibleIntentModes: ["creative_first"],
          compatibleCategories: ["toothpaste"],
          guardrails: ["不出现具体角色脸"],
        },
        shotCandidates: [],
        constraints: [],
        failureWarnings: [],
        examples: [],
        resourceIds,
        libraryRefs: { categoryPlaybookIds: [], referenceAssetIds: [], trendObservationIds: [] },
        retrievalPolicy: { intent: "creative_first", role: "culture-fused", bounded: true },
      },
      videoProvider: "seedance",
      productImage: "https://oss.example.com/toothpaste.png",
      selectedCultureBorrowing: null,
    })

    expect(compiled.prompt).toContain("@图1（儿童低泡牙膏商品主图）")
    expect(compiled.prompt).toContain("全局基础设定：")
    expect(compiled.prompt).toContain("时间片分镜脚本：")
    expect(compiled.prompt).toContain("画质、风格与约束：")
    expect(compiled.prompt).toContain("每个时间片只使用一种镜头方式")
    expect(compiled.prompt).toContain("手、牙刷、商品和人物脸部要保持合理距离")
    expect(compiled.prompt).toContain("小红旗")
    expect(compiled.prompt).toContain("通关小令牌")
    expect(compiled.prompt).toContain("轻铜锣提示音")
    expect(compiled.prompt).not.toMatch(/文化借势|变体边界|用户输入要落在画面里/)
  })

  it("adds soft guidance for clear sales product reveal in short pain-first Seedance hooks", () => {
    const scriptAsset = asset()
    scriptAsset.cultureFusionMechanism = undefined
    scriptAsset.productRole = {
      role: "solution_clue",
      entryTime: "4秒后明确解决方案转折再出现",
      entryAction: "儿童低泡牙膏在后续解决方案转折中出现，不直接承接痛点证据镜头。",
      whyItBelongs: "先确认孩子刷牙敷衍和牙渍，再把牙膏作为后续解决方案引出，避免误解成导致问题的用品。",
      avoidHardSell: true,
      noFullClaim: true,
    }
    scriptAsset.timelineShots = [
      {
        ...scriptAsset.timelineShots[0],
        time: "0-1s",
        retentionPurpose: "stop_scroll",
        scene: "妈妈站在浴室门口皱眉直视手机镜头",
        subject: "妈妈",
        action: "妈妈看到孩子刷牙敷衍后突然停住",
        productVisibility: "none",
        mustShow: ["妈妈反应"],
        mustAvoid: ["销售商品正面特写"],
      },
      {
        ...scriptAsset.timelineShots[0],
        time: "1-2.5s",
        retentionPurpose: "build_tension",
        scene: "青少年在浴室镜前随便刷两下",
        subject: "孩子",
        action: "孩子拿出牙刷，牙齿表面有牙渍和色差",
        productVisibility: "none",
        mustShow: ["牙渍", "旧牙刷"],
        mustAvoid: ["儿童低泡牙膏正面包装"],
      },
      {
        ...scriptAsset.timelineShots[1],
        time: "2.5-4s",
        retentionPurpose: "open_loop",
        scene: "浴室镜前，孩子牙渍和妈妈反应还在画面里",
        subject: "妈妈、孩子和旧牙刷",
        action: "妈妈沉默看向孩子的牙渍，把旧牙刷轻轻拿开，手伸向洗手台边缘但不露出销售商品正面",
        productVisibility: "none",
        mustShow: ["孩子牙渍", "旧牙刷", "妈妈反应"],
        mustAvoid: ["儿童低泡牙膏", "儿童低泡牙膏正面包装", "销售商品正面特写"],
      },
    ]

    const compiled = compileSeedanceAssetPromptShadow({
      scriptAsset,
      scriptCreativeSpec: shortPainSpec(),
      resourceBundle: {
        productContract: {
          productName: "儿童低泡牙膏",
          productCategory: "personal_care",
          inferredSubCategory: "oral_care_toothpaste",
          visualAnchors: ["牙膏软管", "管盖"],
          packagingSignals: ["软管包装"],
          usageAnchors: ["挤牙膏", "刷牙"],
          typicalUseScenes: ["浴室"],
          allowedProductActions: ["挤出"],
          forbiddenVisualConfusions: ["精华液瓶", "香水瓶"],
          claimRiskTags: [],
          modelRiskTags: [],
          source: { productAnalysisUsed: true, fallbackCategoryRuleIds: ["p0_oral_care_toothpaste"] },
        },
        audienceSituations: [],
        attentionMicroPattern: {
          id: "H2_A_DAILY_ACTION_FAILURE",
          parentHookType: "H2",
          name: "日常动作失败",
          attentionJob: "用孩子刷牙敷衍制造停滑",
          stopSignalLogic: "熟悉动作突然失败",
          tensionEngine: "刷牙敷衍和牙渍暴露",
          curiosityEngine: "妈妈接下来会换什么方法",
          bestForIntentModes: ["pain_first"],
          compatibleProductRoles: ["solution_clue"],
          preferredProductEntryTiming: "deferred",
          eventQueryTags: ["repeated_failure"],
          preferredShotFunctions: ["reaction_closeup"],
          preferredSoundFunctions: ["silence"],
          preferredOverlayFunctions: [],
          goodForProductTraits: [],
          weakForProductTraits: [],
          commonFailureModes: ["product_blamed_for_problem"],
          guardrailNotes: ["痛点证据后不直接露出销售商品"],
        },
        eventCandidates: [],
        bridgeCandidates: [],
        proofCandidates: [],
        cultureMotif: null,
        shotCandidates: [],
        constraints: [],
        failureWarnings: [],
        examples: [],
        resourceIds: {
          ...resourceIds,
          attentionMicroPatternId: "H2_A_DAILY_ACTION_FAILURE",
          cultureMotifId: undefined,
          shotPrimitiveIds: [],
        },
        libraryRefs: { categoryPlaybookIds: [], referenceAssetIds: [], trendObservationIds: [] },
        retrievalPolicy: { intent: "pain_first", role: "intent-direct", bounded: true },
      },
      videoProvider: "seedance",
      productImage: "https://oss.example.com/toothpaste.png",
      selectedCultureBorrowing: null,
    })

    expect(compiled.prompt).toContain("商品安全承接判断")
    expect(compiled.prompt).toContain("用户输入语义拆解")
    expect(compiled.prompt).toContain("孩子不是没刷，而是刷得像没刷")
    expect(compiled.prompt).toContain("刷两下就停")
    expect(compiled.prompt).toContain("如果有误解风险")
    expect(compiled.prompt).toContain("优先停在“妈妈要换方法”的悬念处")
    expect(compiled.prompt).toContain("必须避免：儿童低泡牙膏、儿童低泡牙膏正面包装、销售商品正面特写")
    expect(compiled.prompt).not.toContain("必须看见牙膏软管")
    expect(compiled.prompt).not.toContain("必须看见：儿童低泡牙膏")
  })

  it("compiles Sora with first-frame semantics separated from the product reference", () => {
    const compiled = compileHookVideoPrompt({
      scriptAsset: asset(),
      scriptCreativeSpec: spec(),
      modelFamily: "sora",
      videoProvider: "wuyin",
      productImage: "https://oss.example.com/toothpaste.png",
      firstFrameUrl: "https://oss.example.com/sora-first-frame.png",
    })

    expect(compiled.provider).toBe("wuyin")
    expect(compiled.modelFamily).toBe("sora")
    expect(compiled.prompt).toContain("Style:")
    expect(compiled.prompt).toContain("Actions:")
    expect(compiled.prompt).not.toMatch(/睡前|牙膏是通关道具/)
    expect(compiled.firstFramePrompt).toContain("toothpaste tube and quest card")
    expect(compiled.inputImages).toEqual([
      {
        source: "https://oss.example.com/sora-first-frame.png",
        declared_role: "sora_opening_frame",
        user_caption: "Sora opening frame generated from HookScriptAsset.firstFrameIntent",
      },
      {
        source: "https://oss.example.com/toothpaste.png",
        declared_role: "product_front",
        user_caption: "Product reference image; preserve packaging and category identity",
      },
    ])
  })

  it("compiles Veo with product reference semantics instead of Sora opening-frame semantics", () => {
    const compiled = compileHookVideoPrompt({
      scriptAsset: asset(),
      scriptCreativeSpec: spec(),
      modelFamily: "veo",
      videoProvider: "wuyin",
      productImage: "https://oss.example.com/toothpaste.png",
    })

    expect(compiled.modelFamily).toBe("veo")
    expect(compiled.prompt).toContain("Veo 3.1")
    expect(compiled.prompt).toContain("Cinematography:")
    expect(compiled.prompt).toContain("Subject:")
    expect(compiled.prompt).not.toContain("sora_opening_frame")
    expect(compiled.inputImages).toEqual([
      {
        source: "https://oss.example.com/toothpaste.png",
        declared_role: "veo_product_reference",
        user_caption: "Veo product reference image; keep product identity and packaging stable",
      },
    ])
  })
})
