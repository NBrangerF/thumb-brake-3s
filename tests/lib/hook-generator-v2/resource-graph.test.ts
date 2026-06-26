import { describe, expect, it } from "vitest"

import { buildHookGeneratorV2ResourceGraph } from "@/lib/hook-generator-v2/resources/resource-graph"

describe("hook generator v2 resource graph", () => {
  it("indexes every P0 resource family with source documents and healthy cross-library links", () => {
    const graph = buildHookGeneratorV2ResourceGraph()

    expect(graph.ok).toBe(true)
    expect(graph.brokenEdges).toEqual([])
    expect(graph.sourceDocuments.map((source) => source.id)).toEqual([
      "runtime_product_contract_p0",
      "audience_situation_p0",
      "hook_attention_micro_pattern_event_primitive_library",
      "hook_product_bridge_and_concrete_cultural_motif_library",
      "culture_motif_resources",
      "hook_proof_visualization_and_shot_metadata_library",
      "constraint_failure_registry",
      "hook_studio_catalog",
    ])
    expect(graph.familyCounts).toMatchObject({
      category_rule: 14,
      audience_situation: 42,
      attention_micro_pattern: 36,
      event_primitive: 13,
      product_bridge_role: 9,
      culture_motif: 6,
      proof_visualization: 8,
      shot_card: 19,
      constraint_rule: 14,
      failure_mode: 14,
    })
    expect(graph.familyCounts.proof_mode).toBeGreaterThanOrEqual(12)
    expect(graph.familyCounts.hook_studio_category).toBeGreaterThanOrEqual(10)
    expect(graph.coverage.userResourceLibrarySourceIds).toEqual([
      "hook_attention_micro_pattern_event_primitive_library",
      "hook_product_bridge_and_concrete_cultural_motif_library",
      "culture_motif_resources",
      "hook_proof_visualization_and_shot_metadata_library",
    ])
    expect(graph.coverage.familiesMissingSourceDocuments).toEqual([])
    expect(graph.coverage.p0DecisionCategoryCount).toBe(12)
    expect(graph.coverage.p0DecisionCategoriesWithHookStudioRefs).toBe(12)
    expect(graph.edgeCounts.eventToMicroPattern).toBeGreaterThanOrEqual(12)
    expect(graph.edgeCounts.eventToBridgeRole).toBeGreaterThanOrEqual(20)
    expect(graph.edgeCounts.bridgeToShot).toBeGreaterThanOrEqual(20)
    expect(graph.edgeCounts.proofToShot).toBeGreaterThanOrEqual(12)
    expect(graph.edgeCounts.shotToBridgeRole).toBeGreaterThanOrEqual(20)
  })

  it("keeps important source-derived runtime paths visible in the graph", () => {
    const graph = buildHookGeneratorV2ResourceGraph()
    const edgeKeys = new Set(graph.edges.map((edge) => `${edge.from}->${edge.to}:${edge.kind}`))

    expect(edgeKeys.has("event_primitive:EVT_CUL_001->attention_micro_pattern:H7_A_MYTH_CHARACTER_LOGIC:compatible_micro_pattern")).toBe(true)
    expect(edgeKeys.has("event_primitive:EVT_CUL_001->product_bridge_role:unexpected_tool:recommended_bridge_role")).toBe(true)
    expect(edgeKeys.has("product_bridge_role:ritual_object->shot_card:SHOT_RITUAL_HANDOFF:recommended_shot")).toBe(true)
    expect(edgeKeys.has("proof_visualization:PROOF_VALUE_QUANTITY->shot_card:SHOT_TOP_DOWN_VALUE:recommended_shot")).toBe(true)
    expect(edgeKeys.has("shot_card:SHOT_CULTURAL_INSERT->product_bridge_role:unexpected_tool:compatible_bridge_role")).toBe(true)
  })
})
