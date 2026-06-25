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

type ResourceGraphFamily =
  | "category_rule"
  | "audience_situation"
  | "attention_micro_pattern"
  | "event_primitive"
  | "product_bridge_role"
  | "culture_motif"
  | "proof_visualization"
  | "proof_mode"
  | "shot_card"
  | "constraint_rule"
  | "failure_mode"
  | "hook_studio_category"

type ResourceGraphSourceId =
  | "runtime_product_contract_p0"
  | "audience_situation_p0"
  | "hook_attention_micro_pattern_event_primitive_library"
  | "hook_product_bridge_and_concrete_cultural_motif_library"
  | "culture_motif_resources"
  | "hook_proof_visualization_and_shot_metadata_library"
  | "constraint_failure_registry"
  | "hook_studio_catalog"

type ResourceGraphNode = {
  id: string
  family: ResourceGraphFamily
  label: string
  sourceDocumentIds: ResourceGraphSourceId[]
}

type ResourceGraphEdge = {
  from: string
  to: string
  kind:
    | "hook_studio_category"
    | "compatible_micro_pattern"
    | "recommended_bridge_role"
    | "recommended_shot"
    | "compatible_bridge_role"
    | "proof_mode"
  status: "valid" | "broken"
}

type SourceDocument = {
  id: ResourceGraphSourceId
  label: string
  path: string | null
  role: string
}

type HookGeneratorV2ResourceGraph = {
  ok: boolean
  sourceDocuments: SourceDocument[]
  nodes: ResourceGraphNode[]
  edges: ResourceGraphEdge[]
  brokenEdges: ResourceGraphEdge[]
  familyCounts: Record<ResourceGraphFamily, number>
  edgeCounts: {
    categoryToHookStudio: number
    eventToMicroPattern: number
    eventToBridgeRole: number
    bridgeToShot: number
    proofToMicroPattern: number
    proofToBridgeRole: number
    proofToShot: number
    proofToProofMode: number
    shotToBridgeRole: number
  }
  coverage: {
    userResourceLibrarySourceIds: ResourceGraphSourceId[]
    familiesMissingSourceDocuments: ResourceGraphFamily[]
    p0DecisionCategoryCount: number
    p0DecisionCategoriesWithHookStudioRefs: number
  }
}

const SOURCE_DOCUMENTS: SourceDocument[] = [
  {
    id: "runtime_product_contract_p0",
    label: "Runtime Product Contract P0 rules",
    path: "lib/hook-generator-v2/resources/p0-resource-library.ts",
    role: "Product category identity, visual anchors, allowed actions, forbidden confusions",
  },
  {
    id: "audience_situation_p0",
    label: "Audience Situation P0 patterns",
    path: "lib/hook-generator-v2/resources/p0-resource-library.ts",
    role: "Audience-scene retrieval before attention/event selection",
  },
  {
    id: "hook_attention_micro_pattern_event_primitive_library",
    label: "Hook Attention Micro-pattern and Event Primitive Library",
    path: "resources/workbench-one-click-v3/hook resources/hook_attention_micro_pattern_event_primitive_library.md",
    role: "Attention mechanism and first-second visible event resources",
  },
  {
    id: "hook_product_bridge_and_concrete_cultural_motif_library",
    label: "Product Bridge and Concrete Cultural Motif Library",
    path: "resources/workbench-one-click-v3/hook resources/hook_product_bridge_and_concrete_cultural_motif_library.md",
    role: "Product bridge roles and culture-as-action guardrails",
  },
  {
    id: "culture_motif_resources",
    label: "Culture Motif Resources",
    path: "lib/culture-motif-resources/library.ts",
    role: "Standalone concrete culture motif cards shared by Hook Generator and one-click video",
  },
  {
    id: "hook_proof_visualization_and_shot_metadata_library",
    label: "Proof Visualization and Shot Metadata Library",
    path: "resources/workbench-one-click-v3/hook resources/hook_proof_visualization_and_shot_metadata_library.md",
    role: "Proof-mode cards and shot metadata links",
  },
  {
    id: "constraint_failure_registry",
    label: "Constraint and Failure Registry",
    path: "lib/hook-generator-v2/resources/p0-resource-library.ts",
    role: "Generation guardrails and repair warnings",
  },
  {
    id: "hook_studio_catalog",
    label: "Hook Studio catalog",
    path: "data/hook-studio/HOOK_RESOURCE_CATALOG.json",
    role: "Category playbooks, reference assets, trend observations, and examples",
  },
]

const P0_DECISION_RULE_IDS = [
  "p0_oral_care_toothpaste",
  "p0_cleanser_skincare",
  "p0_fragrance",
  "p0_cleaning_products",
  "p0_snacks_drinks",
  "p0_cups_bottles",
  "p0_small_appliances",
  "p0_storage_home",
  "p0_pet_products",
  "p0_mother_baby",
  "p0_fashion_shoes_bags",
  "p0_digital_accessories",
]

export function buildHookGeneratorV2ResourceGraph(): HookGeneratorV2ResourceGraph {
  const nodes = [
    ...P0_CATEGORY_RULES.map((item): ResourceGraphNode => ({
      id: nodeId("category_rule", item.id),
      family: "category_rule",
      label: item.inferredSubCategory,
      sourceDocumentIds: ["runtime_product_contract_p0"],
    })),
    ...AUDIENCE_SITUATION_PATTERNS.map((item): ResourceGraphNode => ({
      id: nodeId("audience_situation", item.id),
      family: "audience_situation",
      label: item.name,
      sourceDocumentIds: ["audience_situation_p0"],
    })),
    ...ATTENTION_MICRO_PATTERNS.map((item): ResourceGraphNode => ({
      id: nodeId("attention_micro_pattern", item.id),
      family: "attention_micro_pattern",
      label: item.name,
      sourceDocumentIds: ["hook_attention_micro_pattern_event_primitive_library"],
    })),
    ...EVENT_PRIMITIVES.map((item): ResourceGraphNode => ({
      id: nodeId("event_primitive", item.id),
      family: "event_primitive",
      label: item.name,
      sourceDocumentIds: ["hook_attention_micro_pattern_event_primitive_library"],
    })),
    ...PRODUCT_BRIDGE_ROLES.map((item): ResourceGraphNode => ({
      id: nodeId("product_bridge_role", item.role),
      family: "product_bridge_role",
      label: item.name,
      sourceDocumentIds: ["hook_product_bridge_and_concrete_cultural_motif_library"],
    })),
    ...CULTURE_MOTIF_CARDS.map((item): ResourceGraphNode => ({
      id: nodeId("culture_motif", item.id),
      family: "culture_motif",
      label: item.name,
      sourceDocumentIds: ["culture_motif_resources"],
    })),
    ...PROOF_VISUALIZATION_CARDS.map((item): ResourceGraphNode => ({
      id: nodeId("proof_visualization", item.id),
      family: "proof_visualization",
      label: item.claimTag,
      sourceDocumentIds: ["hook_proof_visualization_and_shot_metadata_library"],
    })),
    ...listProofModeIds().map((id): ResourceGraphNode => ({
      id: nodeId("proof_mode", id),
      family: "proof_mode",
      label: id,
      sourceDocumentIds: ["hook_proof_visualization_and_shot_metadata_library"],
    })),
    ...SHOT_CARDS.map((item): ResourceGraphNode => ({
      id: nodeId("shot_card", item.id),
      family: "shot_card",
      label: item.name,
      sourceDocumentIds: ["hook_proof_visualization_and_shot_metadata_library"],
    })),
    ...CONSTRAINT_RULES.map((item): ResourceGraphNode => ({
      id: nodeId("constraint_rule", item.id),
      family: "constraint_rule",
      label: item.rule,
      sourceDocumentIds: ["constraint_failure_registry"],
    })),
    ...FAILURE_MODES.map((item): ResourceGraphNode => ({
      id: nodeId("failure_mode", item.id),
      family: "failure_mode",
      label: item.warning,
      sourceDocumentIds: ["constraint_failure_registry"],
    })),
    ...listHookStudioCategories().map((category): ResourceGraphNode => ({
      id: nodeId("hook_studio_category", category),
      family: "hook_studio_category",
      label: category,
      sourceDocumentIds: ["hook_studio_catalog"],
    })),
  ]
  const nodeIds = new Set(nodes.map((node) => node.id))
  const edges = buildEdges().map((edge) => ({
    ...edge,
    status: nodeIds.has(edge.to) ? "valid" as const : "broken" as const,
  }))
  const brokenEdges = edges.filter((edge) => edge.status === "broken")

  return {
    ok: brokenEdges.length === 0 && familiesMissingSourceDocuments(nodes).length === 0,
    sourceDocuments: SOURCE_DOCUMENTS,
    nodes,
    edges,
    brokenEdges,
    familyCounts: countFamilies(nodes),
    edgeCounts: countEdges(edges),
    coverage: {
      userResourceLibrarySourceIds: [
        "hook_attention_micro_pattern_event_primitive_library",
        "hook_product_bridge_and_concrete_cultural_motif_library",
        "culture_motif_resources",
        "hook_proof_visualization_and_shot_metadata_library",
      ],
      familiesMissingSourceDocuments: familiesMissingSourceDocuments(nodes),
      p0DecisionCategoryCount: P0_DECISION_RULE_IDS.length,
      p0DecisionCategoriesWithHookStudioRefs: countP0DecisionCategoriesWithHookStudioRefs(),
    },
  }
}

function buildEdges(): ResourceGraphEdge[] {
  return [
    ...P0_CATEGORY_RULES.map((item) => edge(
      nodeId("category_rule", item.id),
      nodeId("hook_studio_category", item.hookStudioCategory),
      "hook_studio_category",
    )),
    ...EVENT_PRIMITIVES.flatMap((item) => [
      ...item.compatibleMicroPatternIds.map((microPatternId) => edge(
        nodeId("event_primitive", item.id),
        nodeId("attention_micro_pattern", microPatternId),
        "compatible_micro_pattern",
      )),
      ...item.recommendedProductRoles.map((role) => edge(
        nodeId("event_primitive", item.id),
        nodeId("product_bridge_role", role),
        "recommended_bridge_role",
      )),
    ]),
    ...PRODUCT_BRIDGE_ROLES.flatMap((item) =>
      item.recommendedShotIds.map((shotId) => edge(
        nodeId("product_bridge_role", item.role),
        nodeId("shot_card", shotId),
        "recommended_shot",
      ))
    ),
    ...PROOF_VISUALIZATION_CARDS.flatMap((item) => [
      ...item.compatibleMicroPatterns.map((microPatternId) => edge(
        nodeId("proof_visualization", item.id),
        nodeId("attention_micro_pattern", microPatternId),
        "compatible_micro_pattern",
      )),
      ...item.compatibleProductRoles.map((role) => edge(
        nodeId("proof_visualization", item.id),
        nodeId("product_bridge_role", role),
        "compatible_bridge_role",
      )),
      ...item.recommendedShotIds.map((shotId) => edge(
        nodeId("proof_visualization", item.id),
        nodeId("shot_card", shotId),
        "recommended_shot",
      )),
      ...item.bestProofModes.map((proofModeId) => edge(
        nodeId("proof_visualization", item.id),
        nodeId("proof_mode", proofModeId),
        "proof_mode",
      )),
    ]),
    ...SHOT_CARDS.flatMap((item) =>
      item.compatibleProductRoles.map((role) => edge(
        nodeId("shot_card", item.id),
        nodeId("product_bridge_role", role),
        "compatible_bridge_role",
      ))
    ),
  ]
}

function nodeId(family: ResourceGraphFamily, id: string) {
  return `${family}:${id}`
}

function edge(
  from: string,
  to: string,
  kind: ResourceGraphEdge["kind"],
): ResourceGraphEdge {
  return { from, to, kind, status: "valid" }
}

function listProofModeIds() {
  return unique(PROOF_VISUALIZATION_CARDS.flatMap((item) => item.bestProofModes))
}

function listHookStudioCategories() {
  return unique(P0_CATEGORY_RULES.map((rule) => rule.hookStudioCategory))
}

function countFamilies(nodes: ResourceGraphNode[]): Record<ResourceGraphFamily, number> {
  const families: ResourceGraphFamily[] = [
    "category_rule",
    "audience_situation",
    "attention_micro_pattern",
    "event_primitive",
    "product_bridge_role",
    "culture_motif",
    "proof_visualization",
    "proof_mode",
    "shot_card",
    "constraint_rule",
    "failure_mode",
    "hook_studio_category",
  ]
  return Object.fromEntries(
    families.map((family) => [family, nodes.filter((node) => node.family === family).length])
  ) as Record<ResourceGraphFamily, number>
}

function countEdges(edges: ResourceGraphEdge[]) {
  return {
    categoryToHookStudio: edges.filter((edge) => edge.from.startsWith("category_rule:") && edge.kind === "hook_studio_category").length,
    eventToMicroPattern: edges.filter((edge) => edge.from.startsWith("event_primitive:") && edge.kind === "compatible_micro_pattern").length,
    eventToBridgeRole: edges.filter((edge) => edge.from.startsWith("event_primitive:") && edge.kind === "recommended_bridge_role").length,
    bridgeToShot: edges.filter((edge) => edge.from.startsWith("product_bridge_role:") && edge.kind === "recommended_shot").length,
    proofToMicroPattern: edges.filter((edge) => edge.from.startsWith("proof_visualization:") && edge.kind === "compatible_micro_pattern").length,
    proofToBridgeRole: edges.filter((edge) => edge.from.startsWith("proof_visualization:") && edge.kind === "compatible_bridge_role").length,
    proofToShot: edges.filter((edge) => edge.from.startsWith("proof_visualization:") && edge.kind === "recommended_shot").length,
    proofToProofMode: edges.filter((edge) => edge.from.startsWith("proof_visualization:") && edge.kind === "proof_mode").length,
    shotToBridgeRole: edges.filter((edge) => edge.from.startsWith("shot_card:") && edge.kind === "compatible_bridge_role").length,
  }
}

function familiesMissingSourceDocuments(nodes: ResourceGraphNode[]) {
  return unique(nodes
    .filter((node) => node.sourceDocumentIds.length === 0)
    .map((node) => node.family))
}

function countP0DecisionCategoriesWithHookStudioRefs() {
  return P0_DECISION_RULE_IDS.filter((ruleId) => {
    const rule = P0_CATEGORY_RULES.find((item) => item.id === ruleId)
    if (!rule) return false
    return (
      listHookCategoryPlaybooks({ category: rule.hookStudioCategory }).length > 0 &&
      listHookReferenceAssets({ category: rule.hookStudioCategory, size: 1 }).items.length > 0 &&
      listHookTrendObservations({ category: rule.hookStudioCategory, size: 1 }).items.length > 0
    )
  }).length
}

function unique<T>(values: T[]) {
  return [...new Set(values)]
}
