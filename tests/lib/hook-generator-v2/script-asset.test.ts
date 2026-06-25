import { describe, expect, it } from "vitest"

import type { HookProductBrief, HookScriptResult } from "@/lib/hook-generator"
import type { HookNarrativeDraw } from "@/lib/hook-one-shot"
import type { HookRecommendationCard, SelectedCultureBorrowing } from "@/lib/hook-library"
import type { UserIntentExpansion } from "@/lib/hook-generator-v2/intent-expansion/user-intent-expansion"
import { buildHookRunState } from "@/lib/hook-generator-v2/graph/build-hook-run-state"
import type { HookOneShotRequest, HookOneShotVideoSettings } from "@/lib/hook-generator-v2/graph/types"
import { injectResourcesForHookRunState } from "@/lib/hook-generator-v2/resources/resource-injector"
import { buildScriptCreativeSpec } from "@/lib/hook-generator-v2/script-asset/build-script-creative-spec"
import {
  buildHookScriptAssetFromLegacy,
  toLegacyHookScriptResult,
} from "@/lib/hook-generator-v2/script-asset/legacy-adapter"
import {
  parseHookScriptAsset,
  parseNativeHookScriptAsset,
} from "@/lib/hook-generator-v2/script-asset/hook-script-asset-schema"
import {
  buildNativeHookScriptAssetPrompt,
  generateNativeHookScriptAssetShadow,
} from "@/lib/hook-generator-v2/script-asset/native-creative-director"

function hookCard(id: string, hookType: string): HookRecommendationCard {
  return {
    patternCardId: id,
    hookScope: "product_related",
    hookType,
    subType: "test_subtype",
    displayName: `测试卡片 ${id}`,
    reason: "用于 HookScriptAsset 测试",
    exampleStructure: "先停滑，再承接商品",
    recommendedReferenceMode: "direct_video",
    productRelationType: "problem_first",
    stimulationLevel: "S1",
    hasReferenceVideo: false,
    productBridgeRule: "商品在关键动作里自然出现",
    score: 0.8,
  }
}

function cultureBorrowing(): SelectedCultureBorrowing {
  return {
    templateId: "cb_template_public_xiyou_breakthrough",
    nameCn: "西游闯关破阵",
    hookScope: "culture_borrowing",
    cultureMechanism: ["闯关", "破阵"],
    symbolEntryIds: ["culture_symbol_public_xiyou_breakthrough"],
    recommendedDurationSec: 5,
    openingCapture: "睡前刷牙像闯关开场",
    attentionEscalation: "孩子发现牙膏变成任务道具",
    productBridgeRule: "牙膏作为通关道具自然进入",
    firstFrameFormula: "儿童牙膏与闯关任务同框",
    finalVideoPromptFormulaCn: "用闯关任务包装刷牙动作",
    audioFormulaCn: "轻快提示音",
    verbalFormulaCn: "今晚这一关是刷牙",
    symbolBorrowing: {
      visual: ["云路闯关"],
      style: ["轻快"],
      motion: ["翻身跃入画面"],
      audio: ["鼓点加速"],
      verbal: ["闯关"],
      narrative: ["任务推进"],
      productBridge: ["牙膏是通关道具"],
      firstFrame: ["牙膏和任务卡同框"],
      video: ["刷牙动作完成通关"],
    },
    fusionDirectives: ["把刷牙拍成儿童闯关任务"],
    applicableCategories: ["toothpaste", "personal_care"],
    productDependency: "strong",
    requiredProductAppearanceTiming: "0-1s",
    tags: ["test"],
  }
}

function legacyScript(): HookScriptResult {
  return {
    hookSummary: "睡前刷牙被拍成闯关任务",
    visualDescription: "浴室灯关一半，孩子手里拿着任务卡，儿童低泡牙膏在牙刷旁出现。",
    visualStyle: "写实手机 UGC，轻快闯关语法，商品包装可读。",
    script: "今晚这一关，是刷牙。",
    soundDesign: "轻快提示音、鼓点加速、真实浴室环境声。",
    textOverlay: ["今晚这一关", "牙膏是通关道具"],
    shotTiming: [
      {
        timeRange: "0-1.5s",
        visual: "浴室灯关一半，孩子看着任务卡停住，牙刷还没拿起。",
        script: "今晚这一关",
        textOverlay: "今晚这一关",
      },
      {
        timeRange: "1.5-3.5s",
        visual: "家长把儿童低泡牙膏挤到牙刷旁，孩子像收到通关道具一样伸手接过。",
        script: "是刷牙。",
        textOverlay: "牙膏是通关道具",
      },
      {
        timeRange: "3.5-5s",
        visual: "牙膏、牙刷和完成区同框，孩子把任务卡翻到下一关。",
      },
    ],
    productBridge: "牙膏作为通关道具自然进入刷牙动作。",
    videoPrompt: "写实竖屏视频：浴室睡前闯关，儿童低泡牙膏作为通关道具进入刷牙动作。",
    firstFramePrompt: "Realistic vertical first frame, child bedtime bathroom, toothpaste tube and quest card visible.",
    generationRecommendation: {
      preferredPath: "direct_video",
      reason: "商品图可直接进入视频生成",
      availablePaths: ["direct_video", "first_frame"],
    },
  }
}

function buildResourceReadyVariant() {
  const input: HookOneShotRequest = {
    productImage: "https://oss.example.com/toothpaste.png",
    productTitle: "儿童低泡牙膏",
    intent: "creative_first",
    intentText: "睡前刷牙像闯关",
    analysisHints: {
      productCategory: "toothpaste",
      coreSellingPoints: ["低泡不辣口"],
      painPoints: ["孩子不爱刷牙"],
    },
  }
  const videoSettings: HookOneShotVideoSettings = {
    videoProvider: "seedance",
    videoModel: "doubao-seedance-2-0-260128",
    videoDuration: 5,
    videoRatio: "9:16",
    videoResolution: "720p",
    generateAudio: true,
    modelFamily: "seedance",
  }
  const productBrief: HookProductBrief = {
    productName: input.productTitle,
    productCategory: input.analysisHints?.productCategory ?? null,
    productImage: input.productImage,
    productImages: [input.productImage],
    marketingLogic: {
      coreSellingPoints: input.analysisHints?.coreSellingPoints ?? [],
      targetAudience: [],
      painPoints: input.analysisHints?.painPoints ?? [],
      proofPoints: input.analysisHints?.coreSellingPoints ?? [],
      forbiddenClaims: [],
    },
  }
  const narrativeDraws: HookNarrativeDraw[] = [
    {
      clientVideoId: "hook-card-1",
      role: "culture-fused",
      selectedHook: hookCard("H7_TEST", "H7"),
      selectedCultureBorrowing: cultureBorrowing(),
    },
  ]
  const state = injectResourcesForHookRunState(buildHookRunState({
    requestId: "request_1",
    batchId: "hook-batch-1",
    input,
    videoSettings,
    productBrief,
    narrativeDraws,
  }))

  return {
    state,
    variant: state.variants["hook-card-1"],
    resourceBundle: state.variants["hook-card-1"].resourceBundle!,
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
      observableEvidence: ["刷两下就拿出牙刷", "牙刷泡沫少"],
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

describe("hook generator v2 script asset", () => {
  it("builds a ScriptCreativeSpec from product, intent, and injected resources", () => {
    const { state, variant, resourceBundle } = buildResourceReadyVariant()

    const spec = buildScriptCreativeSpec({
      productBrief: state.productBrief,
      resourceBundle,
      intent: state.input.intent,
      intentText: state.input.intentText,
      variantRole: variant.role,
      selectedHook: variant.selectedHook,
      durationSeconds: state.videoSettings.videoDuration,
    })

    expect(spec).toMatchObject({
      task: "generate_hook_script_asset",
      duration: 5,
      platform: "short_video_feed",
      productLock: {
        productName: "儿童低泡牙膏",
        category: "personal_care",
        inferredSubCategory: "oral_care_toothpaste",
      },
      intentContract: {
        intentType: "creative_first",
        userIntentText: "睡前刷牙像闯关",
        variantRole: "culture-fused",
      },
    })
    expect(spec.intentContract.creativeHypothesis).toContain("睡前刷牙像闯关")
    expect(spec.resourceIds).toEqual(expect.objectContaining(resourceBundle.resourceIds))
    expect(spec.hardRules).toEqual(expect.arrayContaining([
      expect.stringContaining("商品外形"),
      expect.stringContaining("用户中文意图"),
    ]))
    expect(spec.softRules).toEqual(expect.arrayContaining([
      expect.stringContaining("商品图是身份参考"),
      expect.stringContaining("商品可以作为答案、证据或线索，也可以完全不在本段出现"),
    ]))
  })

  it("keeps pain-evidence sales product sequencing as a soft rule", () => {
    const { state, variant, resourceBundle } = buildResourceReadyVariant()

    const spec = buildScriptCreativeSpec({
      productBrief: state.productBrief,
      resourceBundle,
      intent: "pain_first",
      intentText: "青少年刷牙敷衍",
      variantRole: variant.role,
      selectedHook: variant.selectedHook,
      durationSeconds: 4,
    })

    expect(spec.hardRules.join("\n")).not.toContain("痛点证据后一拍如果直接承接销售商品正面露出")
    expect(spec.softRules).toEqual(expect.arrayContaining([
      expect.stringContaining("痛点证据后一拍如果直接承接销售商品正面露出"),
      expect.stringContaining("不强制在 4 秒内露出商品"),
    ]))

    const prompt = buildNativeHookScriptAssetPrompt({
      scriptCreativeSpec: spec,
      resourceBundle,
      selectedHook: variant.selectedHook,
      selectedCultureBorrowing: variant.selectedCultureBorrowing,
    })
    const nativePromptPayload = JSON.parse(prompt.userPrompt)
    expect(nativePromptPayload.hardRules.join("\n")).not.toContain("痛点证据后一拍如果直接承接销售商品正面露出")
    expect(nativePromptPayload.softGuidance).toEqual(expect.arrayContaining([
      expect.stringContaining("痛点证据后一拍如果直接承接销售商品正面露出"),
      expect.stringContaining("creative judgment"),
    ]))
  })

  it("carries user intent semantic expansion into the ScriptCreativeSpec intent contract", () => {
    const { state, variant, resourceBundle } = buildResourceReadyVariant()

    const spec = buildScriptCreativeSpec({
      productBrief: state.productBrief,
      resourceBundle,
      intent: "pain_first",
      intentText: "青少年刷牙敷衍",
      userIntentExpansion: semanticExpansion(),
      variantRole: variant.role,
      selectedHook: variant.selectedHook,
      durationSeconds: 4,
    })

    expect(spec.intentContract.userIntentExpansion).toMatchObject({
      rawInput: "青少年刷牙敷衍",
      hookSignals: {
        openingAction: expect.stringContaining("水声突然停"),
        conflictSource: expect.stringContaining("刷得像没刷"),
        openLoop: expect.stringContaining("旧牙刷"),
      },
      productExposurePolicy: {
        requiredInHook: false,
      },
    })
    expect(spec.intentContract.creativeHypothesis).toContain("刷两下就停")
  })

  it("wraps current legacy script output into HookScriptAsset and adapts it back", () => {
    const { state, variant, resourceBundle } = buildResourceReadyVariant()
    const spec = buildScriptCreativeSpec({
      productBrief: state.productBrief,
      resourceBundle,
      intent: state.input.intent,
      intentText: state.input.intentText,
      variantRole: variant.role,
      selectedHook: variant.selectedHook,
      durationSeconds: state.videoSettings.videoDuration,
    })

    const asset = buildHookScriptAssetFromLegacy({
      legacyScript: legacyScript(),
      scriptCreativeSpec: spec,
      resourceBundle,
      selectedHook: variant.selectedHook,
      selectedCultureBorrowing: variant.selectedCultureBorrowing,
    })
    const legacy = toLegacyHookScriptResult(asset)

    expect(asset.hookMechanism.microPatternId).toBe(resourceBundle.resourceIds.attentionMicroPatternId)
    expect(asset.productRole.role).toBe(resourceBundle.bridgeCandidates[0].role)
    expect(asset.cultureFusionMechanism).toMatchObject({
      enabled: true,
      motifId: "cb_template_public_xiyou_breakthrough",
      notJustStyle: true,
    })
    expect(asset.timelineShots).toHaveLength(3)
    expect(asset.timelineShots.every((shot) => shot.action.length > 0)).toBe(true)
    expect(legacy).toMatchObject({
      hookSummary: "睡前刷牙被拍成闯关任务",
      productBridge: expect.stringContaining("牙膏"),
      videoPrompt: expect.stringContaining("儿童低泡牙膏"),
      firstFramePrompt: expect.stringContaining("toothpaste"),
    })
    expect(legacy.shotTiming).toHaveLength(3)
  })

  it("builds a native Creative Director prompt from existing resources and parses native asset output", async () => {
    const { state, variant, resourceBundle } = buildResourceReadyVariant()
    const spec = buildScriptCreativeSpec({
      productBrief: state.productBrief,
      resourceBundle,
      intent: state.input.intent,
      intentText: state.input.intentText,
      variantRole: variant.role,
      selectedHook: variant.selectedHook,
      durationSeconds: state.videoSettings.videoDuration,
    })
    const prompt = buildNativeHookScriptAssetPrompt({
      scriptCreativeSpec: spec,
      resourceBundle,
      selectedHook: variant.selectedHook,
      selectedCultureBorrowing: variant.selectedCultureBorrowing,
    })
    const nativeAsset = {
      ...buildHookScriptAssetFromLegacy({
        legacyScript: legacyScript(),
        scriptCreativeSpec: spec,
        resourceBundle,
        selectedHook: variant.selectedHook,
        selectedCultureBorrowing: variant.selectedCultureBorrowing,
      }),
      tensionPlan: {
        conflictType: "睡前流程卡住",
        pressureSource: "孩子不愿意刷牙，牙刷举在半空",
        firstSecondShock: "孩子盯着牙刷停住，家长手也停住",
        escalationBeat: "任务提示音后牙膏像通关道具进入",
        unresolvedQuestion: "这支牙膏为什么能让任务继续",
        emotionalPressure: "家长急，孩子躲",
        productResolutionRole: "牙膏作为通关道具回收刷牙动作",
        riskIfTooSubtle: "如果没有停住动作，观众只会看到普通刷牙",
      },
    }
    const result = await generateNativeHookScriptAssetShadow({
      scriptCreativeSpec: spec,
      resourceBundle,
      selectedHook: variant.selectedHook,
      selectedCultureBorrowing: variant.selectedCultureBorrowing,
      config: { apiKey: "key", baseUrl: "https://llm.example.com", model: "test", visionModel: "test", apiFormat: "auto" },
      call: async () => ({ content: JSON.stringify(nativeAsset), model: "test", tokensUsed: null }),
    })

    expect(prompt.userPrompt).toContain("resourceBundle")
    expect(prompt.userPrompt).toContain("cultureMotif")
    expect(prompt.userPrompt).not.toContain("symbolBorrowing")
    if (!result.ok) throw new Error(result.error)
    expect(parseNativeHookScriptAsset(result.scriptAsset).tensionPlan.firstSecondShock).toContain("停住")
    expect(result.scriptAsset.cultureFusionMechanism).toMatchObject({
      enabled: true,
      notJustStyle: true,
    })
  })

  it("repairs common native LLM JSON syntax slips before schema parsing", async () => {
    const { state, variant, resourceBundle } = buildResourceReadyVariant()
    const spec = buildScriptCreativeSpec({
      productBrief: state.productBrief,
      resourceBundle,
      intent: state.input.intent,
      intentText: state.input.intentText,
      variantRole: variant.role,
      selectedHook: variant.selectedHook,
      durationSeconds: state.videoSettings.videoDuration,
    })
    const nativeAsset = buildHookScriptAssetFromLegacy({
      legacyScript: legacyScript(),
      scriptCreativeSpec: spec,
      resourceBundle,
      selectedHook: variant.selectedHook,
      selectedCultureBorrowing: variant.selectedCultureBorrowing,
    })
    nativeAsset.tensionPlan = {
      conflictType: "睡前流程卡住",
      pressureSource: "孩子停在牙刷前",
      firstSecondShock: "孩子突然停住",
      escalationBeat: "家长递出牙膏后任务继续",
      unresolvedQuestion: "牙膏为什么能让任务继续",
      emotionalPressure: "家长催促，孩子躲开",
      productResolutionRole: "牙膏回收刷牙动作",
      riskIfTooSubtle: "如果没有停住动作就像普通展示",
    }
    const brokenJson = JSON.stringify(nativeAsset, null, 2)
      .replace(/"scene": "[^"]+"/, "\"scene\": \"浴室灯关一半，孩子看着任务卡停住\",整体环境偏暗\"")

    const result = await generateNativeHookScriptAssetShadow({
      scriptCreativeSpec: spec,
      resourceBundle,
      selectedHook: variant.selectedHook,
      selectedCultureBorrowing: variant.selectedCultureBorrowing,
      config: { apiKey: "key", baseUrl: "https://llm.example.com", model: "test", visionModel: "test", apiFormat: "auto" },
      call: async () => ({ content: brokenJson, model: "test", tokensUsed: null }),
    })

    if (!result.ok) throw new Error(result.error)
    expect(result.scriptAsset.timelineShots[0].scene).toContain("整体环境偏暗")
  })

  it("normalizes common native LLM schema slips for non-culture assets", () => {
    const { state, variant, resourceBundle } = buildResourceReadyVariant()
    const spec = buildScriptCreativeSpec({
      productBrief: state.productBrief,
      resourceBundle,
      intent: state.input.intent,
      intentText: state.input.intentText,
      variantRole: variant.role,
      selectedHook: variant.selectedHook,
      durationSeconds: state.videoSettings.videoDuration,
    })
    const nativeAsset = {
      ...buildHookScriptAssetFromLegacy({
        legacyScript: legacyScript(),
        scriptCreativeSpec: spec,
        resourceBundle,
        selectedHook: variant.selectedHook,
        selectedCultureBorrowing: null,
      }),
      cultureFusionMechanism: null,
      tensionPlan: {
        conflictType: "睡前流程卡住",
        pressureSource: "孩子停在牙刷前",
        firstSecondShock: "孩子突然停住",
        escalationBeat: "家长递出牙膏后任务继续",
        unresolvedQuestion: "牙膏为什么能让任务继续",
        emotionalPressure: "家长催促，孩子躲开",
        productResolutionRole: "牙膏回收刷牙动作",
        riskIfTooSubtle: "如果没有停住动作就像普通展示",
      },
      timelineShots: [
        {
          ...buildHookScriptAssetFromLegacy({
            legacyScript: legacyScript(),
            scriptCreativeSpec: spec,
            resourceBundle,
            selectedHook: variant.selectedHook,
            selectedCultureBorrowing: null,
          }).timelineShots[0],
          retentionPurpose: "proof_hint | open_loop",
          productVisibility: "clear",
          transitionToNextShot: undefined,
          transitionToNext: "切到孩子拿起牙刷",
        },
      ],
    }

    const parsed = parseNativeHookScriptAsset(nativeAsset)

    expect(parsed.cultureFusionMechanism).toBeUndefined()
    expect(parsed.timelineShots[0]).toMatchObject({
      retentionPurpose: "open_loop",
      productVisibility: "clear_but_not_packshot",
      transitionToNextShot: "切到孩子拿起牙刷",
    })
  })

  it("rejects abstract timeline shot actions that cannot be filmed", () => {
    const { state, variant, resourceBundle } = buildResourceReadyVariant()
    const spec = buildScriptCreativeSpec({
      productBrief: state.productBrief,
      resourceBundle,
      intent: state.input.intent,
      intentText: state.input.intentText,
      variantRole: variant.role,
      selectedHook: variant.selectedHook,
      durationSeconds: state.videoSettings.videoDuration,
    })
    const validAsset = buildHookScriptAssetFromLegacy({
      legacyScript: legacyScript(),
      scriptCreativeSpec: spec,
      resourceBundle,
      selectedHook: variant.selectedHook,
      selectedCultureBorrowing: variant.selectedCultureBorrowing,
    })

    expect(() => parseHookScriptAsset({
      ...validAsset,
      timelineShots: [
        {
          ...validAsset.timelineShots[0],
          action: "展示痛点并呈现高级感",
        },
      ],
    })).toThrow(/不可拍|abstract/i)
  })
})
