import { describe, expect, it } from "vitest"

import type { HookProductBrief } from "@/lib/hook-generator"
import type { HookNarrativeDraw } from "@/lib/hook-one-shot"
import type { HookRecommendationCard, SelectedCultureBorrowing } from "@/lib/hook-library"
import { buildHookRunState } from "@/lib/hook-generator-v2/graph/build-hook-run-state"
import type { HookOneShotRequest, HookOneShotVideoSettings } from "@/lib/hook-generator-v2/graph/types"
import { buildHookTraceDraft } from "@/lib/hook-generator-v2/traces/build-hook-trace-draft"

function hookCard(id: string, hookType: string): HookRecommendationCard {
  return {
    patternCardId: id,
    hookScope: "product_related",
    hookType,
    subType: "test_subtype",
    displayName: `测试卡片 ${id}`,
    reason: "用于 trace draft 测试",
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
    templateId: "cb_template_test",
    nameCn: "测试文化母题",
    hookScope: "culture_borrowing",
    cultureMechanism: ["闯关"],
    symbolEntryIds: ["symbol_test"],
    recommendedDurationSec: 5,
    openingCapture: "睡前刷牙像闯关开场",
    attentionEscalation: "孩子发现牙膏变成任务道具",
    productBridgeRule: "牙膏在刷牙动作里自然出现",
    firstFrameFormula: "儿童牙膏与闯关道具同框",
    finalVideoPromptFormulaCn: "用闯关任务包装刷牙动作",
    audioFormulaCn: "轻快提示音",
    verbalFormulaCn: "今晚这一关是刷牙",
    symbolBorrowing: {
      visual: ["关卡"],
      style: ["轻快"],
      motion: ["解锁"],
      audio: ["提示音"],
      verbal: ["闯关"],
      narrative: ["任务推进"],
      productBridge: ["牙膏是通关道具"],
      firstFrame: ["牙膏和任务卡同框"],
      video: ["刷牙动作完成通关"],
    },
    fusionDirectives: ["把刷牙拍成儿童闯关任务"],
    applicableCategories: ["toothpaste"],
    productDependency: "strong",
    requiredProductAppearanceTiming: "0-1s",
    tags: ["test"],
    cultureMotifId: "QUEST_BREAKTHROUGH",
    motifFamily: "quest",
    visualRenderProfileId: "game_show_task_card_bright_reality",
    shotPrimitiveIds: ["quest_open_task_gate", "quest_tension_countdown", "quest_product_bridge_tool"],
    whySelected: ["精确类目匹配:oral_care", "意图匹配:creative_first"],
  }
}

describe("hook generator v2 trace draft", () => {
  it("summarizes all variant submissions without requiring persistence", () => {
    const input: HookOneShotRequest = {
      productImage: "https://oss.example.com/toothpaste.png",
      productTitle: "儿童低泡牙膏",
      intent: "creative_first",
      intentText: "睡前刷牙像闯关",
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
      productName: "儿童低泡牙膏",
      productCategory: "toothpaste",
      productImage: input.productImage,
      productImages: [input.productImage],
      marketingLogic: {
        coreSellingPoints: ["低泡不辣口"],
        targetAudience: [],
        painPoints: ["孩子不爱刷牙"],
        proofPoints: ["低泡不辣口"],
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
    const state = buildHookRunState({
      requestId: "request_1",
      batchId: "hook-batch-1",
      input,
      videoSettings,
      productBrief,
      narrativeDraws,
    })

    const trace = buildHookTraceDraft({
      state,
      submittedRuns: [
        {
          clientVideoId: "hook-card-1",
          scriptSource: "fallback",
          finalPromptReady: true,
          videoRunId: "run_1",
        },
        {
          clientVideoId: "hook-card-2",
          scriptSource: "llm",
          finalPromptReady: true,
          videoRunId: "run_2",
        },
        {
          clientVideoId: "hook-card-3",
          scriptSource: "fallback",
          finalPromptReady: true,
          videoRunId: "run_3",
        },
      ],
      createdAt: "2026-05-30T09:00:00.000Z",
    })

    expect(trace).toMatchObject({
      requestId: "request_1",
      batchId: "hook-batch-1",
      createdAt: "2026-05-30T09:00:00.000Z",
      persistenceDecision: {
        phase: "phase_2",
        mode: "typed_object_and_db_best_effort",
        persistToDb: true,
      },
      variants: [
        {
          clientVideoId: "hook-card-1",
          role: "intent-direct",
          selectedHookId: "H4_TEST",
          selectedHookType: "H4",
          selectedCultureBorrowingId: null,
          selectedCultureBorrowingName: null,
          scriptSource: "fallback",
          finalPromptReady: true,
          videoRunId: "run_1",
          product: {
            productName: "儿童低泡牙膏",
            productCategory: "toothpaste",
            inferredSubCategory: "toothpaste",
            visualAnchorCount: 1,
            usageAnchorCount: 0,
            forbiddenConfusionCount: 0,
          },
          qualityGate: {
            status: "pass",
            issueCodes: [],
            issueCount: 0,
            repairAttempts: 0,
            repairHistoryCount: 0,
          },
          shadow: {
            nativeScriptAssetReady: false,
            assetCompilerPromptReady: false,
          },
        },
        {
          clientVideoId: "hook-card-2",
          role: "contrast",
          selectedHookId: "H2_TEST",
          selectedHookType: "H2",
          selectedCultureBorrowingId: null,
          selectedCultureBorrowingName: null,
          scriptSource: "llm",
          finalPromptReady: true,
          videoRunId: "run_2",
          product: {
            productName: "儿童低泡牙膏",
            productCategory: "toothpaste",
            inferredSubCategory: "toothpaste",
            visualAnchorCount: 1,
            usageAnchorCount: 0,
            forbiddenConfusionCount: 0,
          },
          qualityGate: {
            status: "pass",
            issueCodes: [],
            issueCount: 0,
            repairAttempts: 0,
            repairHistoryCount: 0,
          },
          shadow: {
            nativeScriptAssetReady: false,
            assetCompilerPromptReady: false,
          },
        },
        {
          clientVideoId: "hook-card-3",
          role: "culture-fused",
          selectedHookId: "H7_TEST",
          selectedHookType: "H7",
          selectedCultureBorrowingId: "cb_template_test",
          selectedCultureBorrowingName: "测试文化母题",
          scriptSource: "fallback",
          finalPromptReady: true,
          videoRunId: "run_3",
          product: {
            productName: "儿童低泡牙膏",
            productCategory: "toothpaste",
            inferredSubCategory: "toothpaste",
            visualAnchorCount: 1,
            usageAnchorCount: 0,
            forbiddenConfusionCount: 0,
          },
          qualityGate: {
            status: "pass",
            issueCodes: [],
            issueCount: 0,
            repairAttempts: 0,
            repairHistoryCount: 0,
          },
          shadow: {
            nativeScriptAssetReady: false,
            assetCompilerPromptReady: false,
          },
        },
      ],
    })
    expect(trace.variants[2].culture).toEqual({
      cultureMotifId: "QUEST_BREAKTHROUGH",
      motifFamily: "quest",
      visualRenderProfileId: "game_show_task_card_bright_reality",
      shotPrimitiveIds: ["quest_open_task_gate", "quest_tension_countdown", "quest_product_bridge_tool"],
      whySelected: ["精确类目匹配:oral_care", "意图匹配:creative_first"],
    })
  })
})
