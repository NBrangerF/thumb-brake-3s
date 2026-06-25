import { describe, expect, it } from "vitest"

import type { HookRunState } from "@/lib/hook-generator-v2/graph/types"
import {
  persistHookTraceBestEffort,
  serializeHookTraceRecords,
} from "@/lib/hook-generator-v2/traces/persist-hook-trace"
import type { HookRunTraceDraft } from "@/lib/hook-generator-v2/traces/types"

function state(): HookRunState {
  return {
    requestId: "request_1",
    batchId: "batch_1",
    input: {
      productImage: "https://oss.example.com/toothpaste.png",
      productTitle: "儿童低泡牙膏",
      intent: "creative_first",
      intentText: "睡前刷牙像闯关",
    },
    videoSettings: {
      videoProvider: "seedance",
      videoModel: "script-only",
      videoDuration: 5,
      videoRatio: "9:16",
      videoResolution: "720p",
      generateAudio: true,
      modelFamily: "seedance",
    },
    productBrief: {
      productName: "儿童低泡牙膏",
      productCategory: "toothpaste",
      productImage: "https://oss.example.com/toothpaste.png",
      productImages: ["https://oss.example.com/toothpaste.png"],
      marketingLogic: {
        coreSellingPoints: ["低泡不辣口"],
        targetAudience: ["亲子家庭"],
        painPoints: ["孩子不爱刷牙"],
        proofPoints: ["低泡"],
        forbiddenClaims: [],
      },
    },
    narrativeDraws: [],
    variants: {
      "hook-card-1": {
        clientVideoId: "hook-card-1",
        role: "culture-fused",
        selectedHook: {
          patternCardId: "H7_TEST",
          hookScope: "product_related",
          hookType: "H7",
          subType: "culture_task",
          displayName: "文化任务",
          reason: "测试 trace",
          exampleStructure: "任务卡卡住",
          recommendedReferenceMode: "direct_video",
          productRelationType: "problem_first",
          stimulationLevel: "S2",
          hasReferenceVideo: false,
          productBridgeRule: "商品进入动作链",
          score: 0.8,
        },
        selectedCultureBorrowing: null,
        repairAttempts: 0,
        repairHistory: [],
        status: "submitted",
      },
    },
    runPolicy: {
      qualityMode: "fast",
      maxRepairAttempts: 1,
      enableMechanismPlanner: false,
      enableCreativeEvaluator: false,
      enableFirstFrameOptimizer: false,
    },
    trace: [],
  }
}

function traceDraft(): HookRunTraceDraft {
  return {
    requestId: "request_1",
    batchId: "batch_1",
    createdAt: "2026-06-01T00:00:00.000Z",
    persistenceDecision: {
      phase: "phase_2",
      mode: "typed_object_and_db_best_effort",
      persistToDb: true,
    },
    variants: [{
      clientVideoId: "hook-card-1",
      role: "culture-fused",
      selectedHookId: "H7_TEST",
      selectedHookType: "H7",
      selectedCultureBorrowingId: null,
      selectedCultureBorrowingName: null,
      scriptSource: "fallback",
      finalPromptReady: true,
      videoRunId: null,
    }],
  }
}

describe("hook generator v2 trace persistence", () => {
  it("serializes trace records for review without requiring a database", () => {
    const records = serializeHookTraceRecords({ state: state(), traceDraft: traceDraft() })

    expect(records).toHaveLength(1)
    expect(records[0]).toMatchObject({
      requestId: "request_1",
      batchId: "batch_1",
      clientVideoId: "hook-card-1",
      videoRunId: null,
      selectedHookId: "H7_TEST",
      videoModel: "script-only",
    })
  })

  it("keeps persistence disabled in Fantastic Hook standalone v1", async () => {
    const result = await persistHookTraceBestEffort({ state: state(), traceDraft: traceDraft() })

    expect(result).toEqual({
      attempted: false,
      persisted: 0,
      errors: ["Persistence is disabled in Fantastic Hook standalone v1"],
    })
  })

  it("reports missing trace drafts", async () => {
    const result = await persistHookTraceBestEffort({ state: state(), traceDraft: null })

    expect(result).toEqual({
      attempted: false,
      persisted: 0,
      errors: ["traceDraft missing"],
    })
  })
})
