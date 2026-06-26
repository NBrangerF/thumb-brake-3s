import { describe, expect, it } from "vitest"

import type { HookProductBrief } from "@/lib/hook-generator"
import type { HookNarrativeDraw } from "@/lib/hook-one-shot"
import type { HookRecommendationCard } from "@/lib/hook-library"
import { buildHookRunState } from "@/lib/hook-generator-v2/graph/build-hook-run-state"
import type { HookOneShotRequest, HookOneShotVideoSettings } from "@/lib/hook-generator-v2/graph/types"
import { injectResourcesForHookRunState } from "@/lib/hook-generator-v2/resources/resource-injector"
import { buildScriptCreativeSpec } from "@/lib/hook-generator-v2/script-asset/build-script-creative-spec"

function audienceSceneHook(): HookRecommendationCard {
  return {
    patternCardId: "H4_AUDIENCE_SCENE_NURSE_LONG_SHIFT",
    hookScope: "product_related",
    hookType: "H4",
    subType: "audience_scene_callout",
    hookTypeLabel: "自我相关",
    subTypeLabel: "场景化人群点名",
    displayName: "自我相关 · 场景化人群点名",
    reason: "用具体护士下班场景做自我识别",
    exampleStructure: "0-1 秒点名人群，1-3 秒给场景证据，3-5 秒承接产品。",
    recommendedReferenceMode: "hybrid",
    productRelationType: "problem_first",
    emotionalPath: "tension_to_relief",
    stimulationLevel: "S1",
    hasReferenceVideo: false,
    productBridgeRule: "从久站后的日常护理场景承接到商品下一步。",
    score: 0.92,
    audienceFit: ["护士", "每天久站的护士"],
  }
}

function buildAudienceSceneVariant() {
  const input: HookOneShotRequest = {
    productImage: "https://oss.example.com/body-care.png",
    productTitle: "轻感腿部护理凝胶",
    intent: "audience_first",
    intentText: "给每天久站的护士",
    analysisHints: {
      productCategory: "personal_care",
      coreSellingPoints: ["下班后顺手护理", "轻感不黏"],
      targetAudience: ["护士，12 小时班后换鞋"],
      painPoints: ["久站后只想快点坐下"],
      visualFacts: ["工牌", "换鞋", "手扶小腿"],
    },
  }
  const videoSettings: HookOneShotVideoSettings = {
    videoProvider: "seedance",
    videoModel: "script-only",
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
      proofPoints: [],
      forbiddenClaims: [],
    },
  }
  const narrativeDraws: HookNarrativeDraw[] = [{
    clientVideoId: "hook-card-audience",
    role: "intent-direct",
    selectedHook: audienceSceneHook(),
    selectedCultureBorrowing: null,
  }]

  const state = injectResourcesForHookRunState(buildHookRunState({
    requestId: "request-audience",
    batchId: "batch-audience",
    input,
    videoSettings,
    productBrief,
    narrativeDraws,
  }))

  return {
    input,
    productBrief,
    variant: state.variants["hook-card-audience"],
  }
}

describe("audience scene callout resources", () => {
  it("selects H4 audience-scene resources and writes the first-three-second contract", () => {
    const { input, productBrief, variant } = buildAudienceSceneVariant()
    expect(variant.resourceBundle?.attentionMicroPattern.id).toBe("H4_C_AUDIENCE_SCENE_CALLOUT")
    expect(variant.resourceBundle?.audienceSituations[0]?.id).toBe("aud_nurse_long_shift")
    expect(variant.resourceBundle?.resourceIds.eventPrimitiveIds).toContain("EVT_AUD_001")

    const spec = buildScriptCreativeSpec({
      productBrief,
      resourceBundle: variant.resourceBundle!,
      intent: input.intent,
      intentText: input.intentText,
      variantRole: variant.role,
      selectedHook: variant.selectedHook,
      durationSeconds: 5,
    })

    expect(spec.intentContract.creativeHypothesis).toContain("场景化人群点名 Hook")
    expect(spec.hardRules.join("\n")).toContain("前 3 秒")
    expect(spec.softRules?.join("\n")).toContain("工牌")
  })
})
