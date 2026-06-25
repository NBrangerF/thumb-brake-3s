import { describe, expect, it } from "vitest"

import type { HookProductBrief } from "@/lib/hook-generator"
import type { HookNarrativeDraw } from "@/lib/hook-one-shot"
import type { HookRecommendationCard, SelectedCultureBorrowing } from "@/lib/hook-library"
import { buildHookRunState } from "@/lib/hook-generator-v2/graph/build-hook-run-state"
import type { HookOneShotRequest, HookOneShotVideoSettings } from "@/lib/hook-generator-v2/graph/types"
import { injectResourcesForHookRunState } from "@/lib/hook-generator-v2/resources/resource-injector"

function hookCard(id: string, hookType: string): HookRecommendationCard {
  return {
    patternCardId: id,
    hookScope: "product_related",
    hookType,
    subType: "test_subtype",
    hookTypeLabel: "测试钩子",
    subTypeLabel: "测试子类",
    displayName: `测试卡片 ${id}`,
    reason: "用于 resource injector 测试",
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
    cultureMotifId: "QUEST_BREAKTHROUGH",
    motifFamily: "quest",
    visualRenderProfileId: "game_show_task_card_bright_reality",
    shotPrimitiveIds: ["quest_open_task_gate", "quest_tension_countdown", "quest_product_bridge_tool"],
    whySelected: ["精确类目匹配:oral_care"],
    matchedSymbolEntries: [{
      entryId: "cb_public_xiyou_sunwukong_breakthrough",
      nameCn: "西游记闯关 · 反叛猴英雄 · 破阵",
      categoryL1: "公共文化母题",
      categoryL2: "西游记闯关",
      symbolType: "archetype",
      sourceFamily: "classical_literature",
      borrowingLevel: "跨源重组",
      symbolizationRule: "可借云路闯关、山石任务门和师徒任务，不复刻现代影视造型。",
      doNotUse: ["角色脸", "原台词", "原音乐"],
      visualSlots: ["山石任务门", "翻腾云纹", "真实商品像破关道具"],
      styleSlots: ["中式神话冒险"],
      motionSlots: ["任务门突然打开", "手把商品当通关道具推入"],
      audioSlots: ["鼓点加速", "风声骤停"],
      verbalSlots: ["这一关先别划走"],
      hookMechanisms: ["闯关停滑"],
      stimulationLevel: 5,
      productDependency: "weak",
      bridgeType: "破关道具",
      firstFramePromptSlots: ["山石任务门压到近景，真实商品半露。"],
      videoPromptSlots: ["0-1秒任务门突然打开，2-4秒商品像破关道具进入。"],
      exampleScript: {
        voiceoverCn: "这一关先别划走。",
        overlayCn: ["破局只差这个"],
        soundEffectCn: ["鼓点加速"],
      },
      applicableCategories: ["全品类"],
      applicableSellingPoints: ["新手友好"],
      tags: ["西游记", "闯关"],
    }],
  }
}

function buildTestState(inputOverride: Partial<HookOneShotRequest> = {}) {
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
    ...inputOverride,
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
      targetAudience: input.analysisHints?.targetAudience ?? [],
      painPoints: input.analysisHints?.painPoints ?? [],
      proofPoints: input.analysisHints?.coreSellingPoints ?? [],
      forbiddenClaims: [],
    },
  }
  const narrativeDraws: HookNarrativeDraw[] = [
    {
      clientVideoId: "hook-card-1",
      role: "intent-direct",
      selectedHook: hookCard("H4_TEST", "H4"),
      selectedCultureBorrowing: null,
    },
    {
      clientVideoId: "hook-card-2",
      role: "contrast",
      selectedHook: hookCard("H2_TEST", "H2"),
      selectedCultureBorrowing: null,
    },
    {
      clientVideoId: "hook-card-3",
      role: "culture-fused",
      selectedHook: hookCard("H7_TEST", "H7"),
      selectedCultureBorrowing: cultureBorrowing(),
    },
  ]

  return buildHookRunState({
    requestId: "request_1",
    batchId: "hook-batch-1",
    input,
    videoSettings,
    productBrief,
    narrativeDraws,
  })
}

describe("hook generator v2 resource injector", () => {
  it("injects bounded P0 bundles across all resource families", () => {
    const state = injectResourcesForHookRunState(buildTestState())

    expect(state.productContract).toMatchObject({
      productName: "儿童低泡牙膏",
      productCategory: "personal_care",
      inferredSubCategory: "oral_care_toothpaste",
    })
    expect(state.productContract?.source.fallbackCategoryRuleIds).toContain("p0_oral_care_toothpaste")

    for (const variant of Object.values(state.variants)) {
      expect(variant.status).toBe("resource_ready")
      expect(variant.resourceBundle).toBeTruthy()
      const bundle = variant.resourceBundle!
      expect(bundle.productContract).toBe(state.productContract)
      expect(bundle.audienceSituations.length).toBeGreaterThanOrEqual(1)
      expect(bundle.audienceSituations.length).toBeLessThanOrEqual(3)
      expect(bundle.attentionMicroPattern.id).toMatch(/^H[1-7]_/)
      expect(bundle.eventCandidates.length).toBeGreaterThanOrEqual(3)
      expect(bundle.eventCandidates.length).toBeLessThanOrEqual(5)
      expect(bundle.bridgeCandidates.length).toBeGreaterThanOrEqual(2)
      expect(bundle.bridgeCandidates.length).toBeLessThanOrEqual(3)
      expect(bundle.proofCandidates.length).toBeLessThanOrEqual(3)
      expect(bundle.shotCandidates.length).toBeGreaterThanOrEqual(3)
      expect(bundle.shotCandidates.length).toBeLessThanOrEqual(6)
      expect(bundle.constraints.length).toBeGreaterThanOrEqual(5)
      expect(bundle.constraints.length).toBeLessThanOrEqual(8)
      expect(bundle.failureWarnings.length).toBeGreaterThanOrEqual(2)
      expect(bundle.failureWarnings.length).toBeLessThanOrEqual(3)
      expect(bundle.examples.length).toBeGreaterThanOrEqual(1)
      expect(bundle.examples.length).toBeLessThanOrEqual(2)
      expect(bundle.resourceIds.attentionMicroPatternId).toBe(bundle.attentionMicroPattern.id)
      expect(bundle.resourceIds.eventPrimitiveIds).toEqual(bundle.eventCandidates.map((item) => item.id))
      expect(bundle.resourceIds.productBridgeRoleIds).toEqual(bundle.bridgeCandidates.map((item) => item.id))
      expect(bundle.resourceIds.shotCardIds).toEqual(bundle.shotCandidates.map((item) => item.id))
      expect(bundle.libraryRefs.categoryPlaybookIds.length).toBeGreaterThanOrEqual(1)
      expect(bundle.libraryRefs.referenceAssetIds.length).toBeGreaterThanOrEqual(1)
      expect(bundle.libraryRefs.trendObservationIds.length).toBeGreaterThanOrEqual(1)
    }

    expect(state.variants["hook-card-3"].resourceBundle?.cultureMotif).toMatchObject({
      id: "cb_template_public_xiyou_breakthrough",
      source: "selected_culture_borrowing",
      cultureMotifId: "QUEST_BREAKTHROUGH",
      visualRenderProfileId: "game_show_task_card_bright_reality",
      shotPrimitiveIds: ["quest_open_task_gate", "quest_tension_countdown", "quest_product_bridge_tool"],
    })
    expect(state.variants["hook-card-3"].resourceBundle?.resourceIds).toMatchObject({
      cultureMotifId: "QUEST_BREAKTHROUGH",
      visualRenderProfileId: "game_show_task_card_bright_reality",
      shotPrimitiveIds: ["quest_open_task_gate", "quest_tension_countdown", "quest_product_bridge_tool"],
    })
    expect(state.variants["hook-card-3"].resourceBundle?.cultureMotif?.visualSymbols.slice(0, 4)).toEqual(expect.arrayContaining([
      "西游记闯关 · 反叛猴英雄 · 破阵",
      "山石任务门",
      "翻腾云纹",
    ]))
    expect(state.variants["hook-card-3"].resourceBundle?.cultureMotif?.audioSymbols.slice(0, 3)).toEqual(expect.arrayContaining([
      "鼓点加速",
      "风声骤停",
    ]))
    expect(state.variants["hook-card-3"].resourceBundle?.cultureMotif?.productBridgeOptions[0]).toBe("牙膏作为通关道具自然进入")
  })

  it("falls back safely when the category is not in the P0 list", () => {
    const state = injectResourcesForHookRunState(buildTestState({
      productTitle: "未知新品",
      intent: "pain_first",
      intentText: "用户不知道怎么用",
      analysisHints: {
        productCategory: "unknown_new_category",
        coreSellingPoints: ["容易上手"],
        painPoints: ["第一次使用很困惑"],
      },
    }))

    expect(state.productContract).toMatchObject({
      productCategory: "general",
      inferredSubCategory: "general_ecommerce_product",
    })
    expect(state.productContract?.source.fallbackCategoryRuleIds).toContain("p0_general_ecommerce")
    expect(Object.values(state.variants).every((variant) => variant.resourceBundle)).toBe(true)
  })
})
