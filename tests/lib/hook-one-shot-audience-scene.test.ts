import { describe, expect, it } from "vitest"

import { hookPatternTicketWeight, type HookNarrativeRole, type HookOneShotIntent } from "@/lib/hook-one-shot"
import type { HookRecommendationCard } from "@/lib/hook-library"

function card(overrides: Partial<HookRecommendationCard> = {}): HookRecommendationCard {
  return {
    patternCardId: "H4_AUDIENCE_SCENE_NURSE_LONG_SHIFT",
    hookScope: "product_related",
    hookType: "H4",
    subType: "audience_scene_callout",
    hookTypeLabel: "自我相关",
    subTypeLabel: "场景化人群点名",
    displayName: "自我相关 · 场景化人群点名",
    reason: "用于测试 audience scene callout 权重",
    exampleStructure: "0-1 秒点名人群，1-3 秒给场景证据，3-5 秒承接产品。",
    recommendedReferenceMode: "hybrid",
    productRelationType: "problem_first",
    emotionalPath: "tension_to_relief",
    stimulationLevel: "S1",
    hasReferenceVideo: false,
    productBridgeRule: "必须从具体人群场景承接到产品下一步。",
    score: 0.9,
    audienceFit: ["给每天久站的护士", "护士", "久站人群"],
    ...overrides,
  }
}

function weight(input: {
  intent: HookOneShotIntent
  intentText: string
  targetAudience?: string[]
  role?: HookNarrativeRole
}) {
  return hookPatternTicketWeight({
    card: card(),
    intent: input.intent,
    role: input.role ?? "intent-direct",
    productCategory: "personal_care",
    intentText: input.intentText,
    targetAudience: input.targetAudience,
  })
}

describe("audience scene callout ticket weighting", () => {
  it("boosts specific audience plus scene signals for audience_first", () => {
    expect(weight({
      intent: "audience_first",
      intentText: "给每天久站的护士",
      targetAudience: ["护士，12 小时班后换鞋"],
    })).toBeGreaterThan(weight({
      intent: "audience_first",
      intentText: "给女生",
    }))
  })

  it("does not over-prioritize audience scene cards outside audience_first", () => {
    expect(weight({
      intent: "pain_first",
      intentText: "给每天久站的护士",
      targetAudience: ["护士，12 小时班后换鞋"],
    })).toBeLessThan(weight({
      intent: "audience_first",
      intentText: "给每天久站的护士",
      targetAudience: ["护士，12 小时班后换鞋"],
    }))
  })
})
