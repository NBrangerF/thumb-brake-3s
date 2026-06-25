import {
  listHookCategoryPlaybooks,
  listHookReferenceAssets,
  listHookTrendObservations,
} from "@/lib/hook-library"

import {
  ATTENTION_MICRO_PATTERNS,
  AUDIENCE_SITUATION_PATTERNS,
  CONSTRAINT_RULES,
  EVENT_PRIMITIVES,
  FAILURE_MODES,
  P0_CATEGORY_RULES,
  PRODUCT_BRIDGE_ROLES,
  PROOF_VISUALIZATION_CARDS,
  SHOT_CARDS,
} from "./p0-resource-library"
import { CULTURE_MOTIF_CARDS } from "@/lib/culture-motif-resources"
import { buildHookGeneratorV2ResourceGraph } from "./resource-graph"

type ResourceReviewCheck = {
  id: string
  label: string
  status: "pass" | "fail"
  details?: string[]
}

type P0CategoryDecision = {
  decisionCategory: string
  ruleId: string
}

export type HookGeneratorV2P0ResourceReview = {
  ok: boolean
  generatedAt: string
  resourceFamilyCounts: {
    p0CategoryRules: number
    audienceSituationPatterns: number
    attentionMicroPatterns: number
    eventPrimitives: number
    productBridgeRoles: number
    cultureMotifCards: number
    proofVisualizationCards: number
    shotCards: number
    constraintRules: number
    failureModes: number
  }
  requiredBridgeRoles: string[]
  hookTypeCoverage: Record<"H1" | "H2" | "H3" | "H4" | "H5" | "H6" | "H7", boolean>
  p0CategoryCoverage: Array<{
    decisionCategory: string
    ruleId: string
    canonicalCategory: string | null
    inferredSubCategory: string | null
    hookStudioCategory: string | null
    hasP0Rule: boolean
    hasHookStudioRefs: boolean
  }>
  sourceFamilyCoverage: Record<string, boolean>
  resourceGraph: {
    ok: boolean
    nodeCount: number
    edgeCount: number
    brokenEdgeCount: number
    sourceDocumentIds: string[]
    familiesMissingSourceDocuments: string[]
  }
  checks: ResourceReviewCheck[]
}

const P0_DECISION_CATEGORIES: P0CategoryDecision[] = [
  { decisionCategory: "toothpaste/oral care", ruleId: "p0_oral_care_toothpaste" },
  { decisionCategory: "cleanser/skincare", ruleId: "p0_cleanser_skincare" },
  { decisionCategory: "fragrance", ruleId: "p0_fragrance" },
  { decisionCategory: "cleaning products", ruleId: "p0_cleaning_products" },
  { decisionCategory: "snacks/drinks", ruleId: "p0_snacks_drinks" },
  { decisionCategory: "cups/bottles", ruleId: "p0_cups_bottles" },
  { decisionCategory: "small appliances", ruleId: "p0_small_appliances" },
  { decisionCategory: "storage/home organization", ruleId: "p0_storage_home" },
  { decisionCategory: "pet products", ruleId: "p0_pet_products" },
  { decisionCategory: "mother-and-baby", ruleId: "p0_mother_baby" },
  { decisionCategory: "fashion/shoes/bags", ruleId: "p0_fashion_shoes_bags" },
  { decisionCategory: "digital accessories", ruleId: "p0_digital_accessories" },
]

const REQUIRED_BRIDGE_ROLES = [
  "solution_clue",
  "evidence_object",
  "contrast_object",
  "unexpected_tool",
  "social_signal",
  "sensory_trigger",
  "ritual_object",
  "before_after_anchor",
  "reveal_anchor",
]

const EXPECTED_HOOK_TYPES = ["H1", "H2", "H3", "H4", "H5", "H6", "H7"] as const

export function reviewHookGeneratorV2P0Resources(): HookGeneratorV2P0ResourceReview {
  const resourceGraph = buildHookGeneratorV2ResourceGraph()
  const p0CategoryCoverage = P0_DECISION_CATEGORIES.map((category) => {
    const rule = P0_CATEGORY_RULES.find((item) => item.id === category.ruleId)
    const playbookCount = rule ? listHookCategoryPlaybooks({ category: rule.hookStudioCategory }).length : 0
    const referenceCount = rule ? listHookReferenceAssets({ category: rule.hookStudioCategory, size: 1 }).items.length : 0
    const observationCount = rule ? listHookTrendObservations({ category: rule.hookStudioCategory, size: 1 }).items.length : 0

    return {
      decisionCategory: category.decisionCategory,
      ruleId: category.ruleId,
      canonicalCategory: rule?.canonicalCategory ?? null,
      inferredSubCategory: rule?.inferredSubCategory ?? null,
      hookStudioCategory: rule?.hookStudioCategory ?? null,
      hasP0Rule: Boolean(rule),
      hasHookStudioRefs: playbookCount > 0 && referenceCount > 0 && observationCount > 0,
    }
  })

  const bridgeRoleSet = new Set(PRODUCT_BRIDGE_ROLES.map((item) => item.role))
  const microPatternIds = new Set(ATTENTION_MICRO_PATTERNS.map((item) => item.id))
  const shotIds = new Set(SHOT_CARDS.map((item) => item.id))
  const proofModes = new Set(PROOF_VISUALIZATION_CARDS.flatMap((item) => item.bestProofModes))
  const hookTypeCoverage = Object.fromEntries(
    EXPECTED_HOOK_TYPES.map((hookType) => [
      hookType,
      ATTENTION_MICRO_PATTERNS.some((item) => item.parentHookType === hookType),
    ]),
  ) as HookGeneratorV2P0ResourceReview["hookTypeCoverage"]

  const missingBridgeRoles = REQUIRED_BRIDGE_ROLES.filter((role) => !bridgeRoleSet.has(role))
  const brokenEventMicroPatternRefs = EVENT_PRIMITIVES.flatMap((event) =>
    event.compatibleMicroPatternIds
      .filter((id) => !microPatternIds.has(id))
      .map((id) => `${event.id}:${id}`),
  )
  const brokenEventBridgeRoleRefs = EVENT_PRIMITIVES.flatMap((event) =>
    event.recommendedProductRoles
      .filter((role) => !bridgeRoleSet.has(role))
      .map((role) => `${event.id}:${role}`),
  )
  const brokenBridgeShotRefs = PRODUCT_BRIDGE_ROLES.flatMap((bridge) =>
    bridge.recommendedShotIds
      .filter((shotId) => !shotIds.has(shotId))
      .map((shotId) => `${bridge.id}:${shotId}`),
  )
  const brokenProofMicroPatternRefs = PROOF_VISUALIZATION_CARDS.flatMap((proof) =>
    proof.compatibleMicroPatterns
      .filter((id) => !microPatternIds.has(id))
      .map((id) => `${proof.id}:${id}`),
  )
  const brokenProofBridgeRoleRefs = PROOF_VISUALIZATION_CARDS.flatMap((proof) =>
    proof.compatibleProductRoles
      .filter((role) => !bridgeRoleSet.has(role))
      .map((role) => `${proof.id}:${role}`),
  )
  const brokenProofShotRefs = PROOF_VISUALIZATION_CARDS.flatMap((proof) =>
    proof.recommendedShotIds
      .filter((shotId) => !shotIds.has(shotId))
      .map((shotId) => `${proof.id}:${shotId}`),
  )
  const brokenShotBridgeRoleRefs = SHOT_CARDS.flatMap((shot) =>
    shot.compatibleProductRoles
      .filter((role) => !bridgeRoleSet.has(role))
      .map((role) => `${shot.id}:${role}`),
  )
  const brokenShotProofModeRefs = SHOT_CARDS.flatMap((shot) =>
    shot.compatibleProofModes
      .filter((mode) => !proofModes.has(mode))
      .map((mode) => `${shot.id}:${mode}`),
  )
  const duplicateIds = [
    ...duplicates(P0_CATEGORY_RULES.map((item) => item.id)).map((id) => `category:${id}`),
    ...duplicates(AUDIENCE_SITUATION_PATTERNS.map((item) => item.id)).map((id) => `audience:${id}`),
    ...duplicates(ATTENTION_MICRO_PATTERNS.map((item) => item.id)).map((id) => `micro:${id}`),
    ...duplicates(EVENT_PRIMITIVES.map((item) => item.id)).map((id) => `event:${id}`),
    ...duplicates(PRODUCT_BRIDGE_ROLES.map((item) => item.id)).map((id) => `bridge:${id}`),
    ...duplicates(CULTURE_MOTIF_CARDS.map((item) => item.id)).map((id) => `culture:${id}`),
    ...duplicates(PROOF_VISUALIZATION_CARDS.map((item) => item.id)).map((id) => `proof:${id}`),
    ...duplicates(SHOT_CARDS.map((item) => item.id)).map((id) => `shot:${id}`),
    ...duplicates(CONSTRAINT_RULES.map((item) => item.id)).map((id) => `constraint:${id}`),
    ...duplicates(FAILURE_MODES.map((item) => item.id)).map((id) => `failure:${id}`),
  ]

  const sourceFamilyCoverage = {
    runtimeProductContractP0: P0_CATEGORY_RULES.length >= P0_DECISION_CATEGORIES.length,
    audienceSituationP0: AUDIENCE_SITUATION_PATTERNS.length > 0,
    attentionMicroPatternUserSpec: ATTENTION_MICRO_PATTERNS.length >= 7,
    eventPrimitiveUserSpec: EVENT_PRIMITIVES.length >= 12,
    productBridgeUserSpec: REQUIRED_BRIDGE_ROLES.every((role) => bridgeRoleSet.has(role)),
    concreteCulturalMotifHookStudio: CULTURE_MOTIF_CARDS.length >= 5 && p0CategoryCoverage.every((item) => item.hasHookStudioRefs),
    proofVisualizationUserSpec: PROOF_VISUALIZATION_CARDS.length >= 8,
    shotMetadataUserSpec: SHOT_CARDS.length >= 10,
    constraintGuardrailRegistry: CONSTRAINT_RULES.length >= 5,
    failureModeRegistry: FAILURE_MODES.length >= 5,
    hookStudioExamples: p0CategoryCoverage.every((item) => item.hasHookStudioRefs),
  }

  const checks = [
    check("p0-category-decisions", "All locked P0 decision categories have resource rules", p0CategoryCoverage.every((item) => item.hasP0Rule)),
    check("p0-hook-studio-refs", "Every P0 category can retrieve Hook Studio playbook, reference, and trend rows", p0CategoryCoverage.every((item) => item.hasHookStudioRefs)),
    check("resource-family-depth", "P0 resource families have enough seeded rows", (
      AUDIENCE_SITUATION_PATTERNS.length >= 5 &&
      ATTENTION_MICRO_PATTERNS.length >= 7 &&
      EVENT_PRIMITIVES.length >= 12 &&
      PRODUCT_BRIDGE_ROLES.length >= REQUIRED_BRIDGE_ROLES.length &&
      CULTURE_MOTIF_CARDS.length >= 5 &&
      PROOF_VISUALIZATION_CARDS.length >= 8 &&
      SHOT_CARDS.length >= 10 &&
      CONSTRAINT_RULES.length >= 5 &&
      FAILURE_MODES.length >= 5
    )),
    check("required-bridge-roles", "Product Bridge roles from the user resource schema are present", missingBridgeRoles.length === 0, missingBridgeRoles),
    check("hook-type-coverage", "Attention Micro-patterns cover H1-H7", Object.values(hookTypeCoverage).every(Boolean)),
    check("unique-resource-ids", "P0 resource ids are unique within each family", duplicateIds.length === 0, duplicateIds),
    check("event-links", "Event Primitive references point to existing micro-patterns and bridge roles", brokenEventMicroPatternRefs.length + brokenEventBridgeRoleRefs.length === 0, [
      ...brokenEventMicroPatternRefs,
      ...brokenEventBridgeRoleRefs,
    ]),
    check("bridge-shot-links", "Product Bridge recommended shots exist", brokenBridgeShotRefs.length === 0, brokenBridgeShotRefs),
    check("proof-links", "Proof cards reference existing micro-patterns, bridge roles, and shots", brokenProofMicroPatternRefs.length + brokenProofBridgeRoleRefs.length + brokenProofShotRefs.length === 0, [
      ...brokenProofMicroPatternRefs,
      ...brokenProofBridgeRoleRefs,
      ...brokenProofShotRefs,
    ]),
    check("shot-links", "Shot cards reference existing bridge roles and proof modes", brokenShotBridgeRoleRefs.length + brokenShotProofModeRefs.length === 0, [
      ...brokenShotBridgeRoleRefs,
      ...brokenShotProofModeRefs,
    ]),
    check("source-family-coverage", "Resource bundle sources cover product, audience, attention, event, bridge, culture, proof, shot, constraints, failure, and examples", Object.values(sourceFamilyCoverage).every(Boolean)),
    check("resource-graph", "Resource graph indexes source documents and cross-library links without broken edges", resourceGraph.ok, [
      ...resourceGraph.brokenEdges.map((edge) => `${edge.from}->${edge.to}:${edge.kind}`),
      ...resourceGraph.coverage.familiesMissingSourceDocuments.map((family) => `missing-source:${family}`),
    ]),
  ]

  return {
    ok: checks.every((item) => item.status === "pass"),
    generatedAt: new Date().toISOString(),
    resourceFamilyCounts: {
      p0CategoryRules: P0_CATEGORY_RULES.length,
      audienceSituationPatterns: AUDIENCE_SITUATION_PATTERNS.length,
      attentionMicroPatterns: ATTENTION_MICRO_PATTERNS.length,
      eventPrimitives: EVENT_PRIMITIVES.length,
      productBridgeRoles: PRODUCT_BRIDGE_ROLES.length,
      cultureMotifCards: CULTURE_MOTIF_CARDS.length,
      proofVisualizationCards: PROOF_VISUALIZATION_CARDS.length,
      shotCards: SHOT_CARDS.length,
      constraintRules: CONSTRAINT_RULES.length,
      failureModes: FAILURE_MODES.length,
    },
    requiredBridgeRoles: [...REQUIRED_BRIDGE_ROLES],
    hookTypeCoverage,
    p0CategoryCoverage,
    sourceFamilyCoverage,
    resourceGraph: {
      ok: resourceGraph.ok,
      nodeCount: resourceGraph.nodes.length,
      edgeCount: resourceGraph.edges.length,
      brokenEdgeCount: resourceGraph.brokenEdges.length,
      sourceDocumentIds: resourceGraph.sourceDocuments.map((source) => source.id),
      familiesMissingSourceDocuments: resourceGraph.coverage.familiesMissingSourceDocuments,
    },
    checks,
  }
}

function check(
  id: string,
  label: string,
  passed: boolean,
  details: string[] = [],
): ResourceReviewCheck {
  return {
    id,
    label,
    status: passed ? "pass" : "fail",
    ...(details.length > 0 ? { details: details.slice(0, 20) } : {}),
  }
}

function duplicates(values: string[]) {
  const seen = new Set<string>()
  const duplicated = new Set<string>()
  for (const value of values) {
    if (seen.has(value)) duplicated.add(value)
    seen.add(value)
  }
  return [...duplicated]
}
