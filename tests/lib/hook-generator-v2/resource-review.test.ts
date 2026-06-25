import { describe, expect, it } from "vitest"

import { reviewHookGeneratorV2P0Resources } from "@/lib/hook-generator-v2/resources/resource-review"

describe("hook generator v2 P0 resource review", () => {
  it("proves the P0 resource system covers the locked categories and cross-library links", () => {
    const review = reviewHookGeneratorV2P0Resources()
    const failedChecks = review.checks.filter((check) => check.status === "fail")

    expect(failedChecks).toEqual([])
    expect(review.ok).toBe(true)
    expect(review.checks.every((check) => check.status === "pass")).toBe(true)
    expect(review.p0CategoryCoverage.map((item) => item.decisionCategory)).toEqual([
      "toothpaste/oral care",
      "cleanser/skincare",
      "fragrance",
      "cleaning products",
      "snacks/drinks",
      "cups/bottles",
      "small appliances",
      "storage/home organization",
      "pet products",
      "mother-and-baby",
      "fashion/shoes/bags",
      "digital accessories",
    ])
    expect(review.p0CategoryCoverage.every((item) => item.hasP0Rule)).toBe(true)
    expect(review.p0CategoryCoverage.every((item) => item.hasHookStudioRefs)).toBe(true)
    expect(review.resourceFamilyCounts).toMatchObject({
      p0CategoryRules: 14,
      attentionMicroPatterns: 7,
      eventPrimitives: expect.any(Number),
      productBridgeRoles: 9,
      cultureMotifCards: 6,
      proofVisualizationCards: expect.any(Number),
      shotCards: expect.any(Number),
      constraintRules: expect.any(Number),
      failureModes: expect.any(Number),
    })
    expect(review.resourceFamilyCounts.eventPrimitives).toBeGreaterThanOrEqual(12)
    expect(review.resourceFamilyCounts.proofVisualizationCards).toBeGreaterThanOrEqual(8)
    expect(review.resourceFamilyCounts.shotCards).toBeGreaterThanOrEqual(10)
    expect(review.resourceGraph.ok).toBe(true)
    expect(review.resourceGraph.brokenEdgeCount).toBe(0)
    expect(review.resourceGraph.sourceDocumentIds).toEqual([
      "runtime_product_contract_p0",
      "audience_situation_p0",
      "hook_attention_micro_pattern_event_primitive_library",
      "hook_product_bridge_and_concrete_cultural_motif_library",
      "culture_motif_resources",
      "hook_proof_visualization_and_shot_metadata_library",
      "constraint_failure_registry",
      "hook_studio_catalog",
    ])
    expect(review.requiredBridgeRoles).toEqual([
      "solution_clue",
      "evidence_object",
      "contrast_object",
      "unexpected_tool",
      "social_signal",
      "sensory_trigger",
      "ritual_object",
      "before_after_anchor",
      "reveal_anchor",
    ])
    expect(review.hookTypeCoverage).toEqual({
      H1: true,
      H2: true,
      H3: true,
      H4: true,
      H5: true,
      H6: true,
      H7: true,
    })
  })
})
