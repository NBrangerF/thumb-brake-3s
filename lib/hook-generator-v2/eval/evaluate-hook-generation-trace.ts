import type { HookNarrativeRole } from "@/lib/hook-one-shot"
import type { HookRunTraceDraft, HookVariantTraceDraft } from "@/lib/hook-generator-v2/traces/types"

import {
  HOOK_EVAL_FAILURE_TAXONOMY,
  type HookEvalFailureCode,
} from "./failure-taxonomy"
import type {
  HookResourceFamilyCoverage,
  HookTraceEvaluation,
  HookTraceEvaluationFailure,
  HookTraceEvaluationOptions,
  HookVariantTraceEvaluation,
} from "./types"

const REQUIRED_ROLES: HookNarrativeRole[] = ["intent-direct", "contrast", "culture-fused"]

export function evaluateHookGenerationTrace(
  trace: HookRunTraceDraft,
  options: HookTraceEvaluationOptions = {},
): HookTraceEvaluation {
  const expectedVariantCount = options.expectedVariantCount ?? 3
  const globalFailures: HookTraceEvaluationFailure[] = []

  if (trace.variants.length !== expectedVariantCount) {
    globalFailures.push(buildFailure("TRACE_VARIANT_COUNT_MISMATCH", {
      details: [`expected=${expectedVariantCount}`, `actual=${trace.variants.length}`],
    }))
  }

  const roleSet = new Set(trace.variants.map((variant) => variant.role))
  const missingRoles = REQUIRED_ROLES.filter((role) => !roleSet.has(role))
  if (missingRoles.length > 0) {
    globalFailures.push(buildFailure("TRACE_ROLE_DIVERSITY_MISSING", {
      details: missingRoles,
    }))
  }

  const variantResults = trace.variants.map((variant) =>
    evaluateVariantTrace(variant, options)
  )
  const failures = [
    ...globalFailures,
    ...variantResults.flatMap((result) => result.failures),
  ]

  return {
    ok: failures.length === 0,
    traceId: `${trace.requestId}:${trace.batchId}`,
    evaluatedAt: new Date().toISOString(),
    summary: {
      variantCount: trace.variants.length,
      expectedVariantCount,
      roleCount: roleSet.size,
      failureCount: failures.length,
    },
    variantResults,
    failures,
  }
}

function evaluateVariantTrace(
  variant: HookVariantTraceDraft,
  options: HookTraceEvaluationOptions,
): HookVariantTraceEvaluation {
  const failures: HookTraceEvaluationFailure[] = []
  const resourceCoverage = evaluateResourceCoverage(variant)

  if (!variant.selectedHookId || !variant.selectedHookType) {
    failures.push(buildFailure("TRACE_HOOK_SELECTION_MISSING", { variant }))
  }

  if (!variant.resourceBundleIds || !variant.resourceSummary) {
    failures.push(buildFailure("TRACE_RESOURCE_BUNDLE_MISSING", { variant }))
  } else if (!resourceCoverage.allRequiredFamiliesPresent) {
    failures.push(buildFailure("TRACE_RESOURCE_FAMILY_INCOMPLETE", {
      variant,
      details: missingResourceFamilies(resourceCoverage),
    }))
  }

  if (!variant.scriptAssetSummary) {
    failures.push(buildFailure("TRACE_SCRIPT_ASSET_MISSING", { variant }))
  } else {
    if (!variant.scriptAssetSummary.hasProductBridgeShot) {
      failures.push(buildFailure("TRACE_PRODUCT_BRIDGE_MISSING", { variant }))
    }
    if (
      variant.role === "culture-fused" &&
      (!variant.scriptAssetSummary.cultureFusionEnabled || !variant.scriptAssetSummary.cultureFusionNotJustStyle)
    ) {
      failures.push(buildFailure("TRACE_CULTURE_FUSION_MISSING", { variant }))
    }
  }

  if (variant.qualityGate?.status === "fail") {
    failures.push(buildFailure("TRACE_QUALITY_GATE_FAILED", {
      variant,
      details: variant.qualityGate.issueCodes,
    }))
  }

  if (!variant.compiler) {
    failures.push(buildFailure("TRACE_COMPILER_MISSING", { variant }))
  } else {
    if (!providerReferencesAreValid(variant)) {
      failures.push(buildFailure("TRACE_PROVIDER_REFERENCE_MISSING", {
        variant,
        details: variant.compiler.inputImageRoles,
      }))
    }
    if (!variant.compiler.promptReady || !variant.finalPromptReady) {
      failures.push(buildFailure("TRACE_FINAL_PROMPT_MISSING", { variant }))
    }
  }
  if (!variant.finalPromptReady && !failures.some((failure) => failure.code === "TRACE_FINAL_PROMPT_MISSING")) {
    failures.push(buildFailure("TRACE_FINAL_PROMPT_MISSING", { variant }))
  }

  if (options.requireVideoRunId && !variant.videoRunId) {
    failures.push(buildFailure("TRACE_VIDEO_RUN_MISSING", { variant }))
  }

  return {
    clientVideoId: variant.clientVideoId,
    role: variant.role,
    ok: failures.length === 0,
    resourceCoverage,
    failures,
  }
}

function evaluateResourceCoverage(variant: HookVariantTraceDraft): HookResourceFamilyCoverage {
  const ids = variant.resourceBundleIds
  const summary = variant.resourceSummary
  const cultureRequired = variant.role === "culture-fused"
  const coverage: HookResourceFamilyCoverage = {
    attention: Boolean(ids?.attentionMicroPatternId && summary?.hasAttentionMicroPattern),
    audience: Boolean((ids?.audienceSituationIds.length ?? 0) > 0 && (summary?.audienceSituationCount ?? 0) > 0),
    event: Boolean((ids?.eventPrimitiveIds.length ?? 0) > 0 && (summary?.eventPrimitiveCount ?? 0) > 0),
    bridge: Boolean((ids?.productBridgeRoleIds.length ?? 0) > 0 && (summary?.productBridgeRoleCount ?? 0) > 0),
    proof: Boolean((ids?.proofVisualizationIds.length ?? 0) > 0 && (summary?.proofVisualizationCount ?? 0) > 0),
    shot: Boolean((ids?.shotCardIds.length ?? 0) > 0 && (summary?.shotCardCount ?? 0) > 0),
    constraint: Boolean((ids?.constraintRuleIds.length ?? 0) > 0 && (summary?.constraintRuleCount ?? 0) > 0),
    failureWarning: Boolean((ids?.failureWarningIds.length ?? 0) > 0 && (summary?.failureWarningCount ?? 0) > 0),
    example: Boolean((ids?.exampleIds.length ?? 0) > 0 && (summary?.exampleCount ?? 0) > 0),
    culture: cultureRequired ? Boolean(ids?.cultureMotifId && summary?.hasCultureMotif) : "not_required",
    allRequiredFamiliesPresent: false,
  }
  coverage.allRequiredFamiliesPresent = [
    coverage.attention,
    coverage.audience,
    coverage.event,
    coverage.bridge,
    coverage.proof,
    coverage.shot,
    coverage.constraint,
    coverage.failureWarning,
    coverage.example,
    coverage.culture === "not_required" ? true : coverage.culture,
  ].every(Boolean)
  return coverage
}

function missingResourceFamilies(coverage: HookResourceFamilyCoverage) {
  return Object.entries(coverage)
    .filter(([key, value]) => key !== "allRequiredFamiliesPresent" && value === false)
    .map(([key]) => key)
}

function providerReferencesAreValid(variant: HookVariantTraceDraft) {
  if (!variant.compiler) return false
  const roles = new Set(variant.compiler.inputImageRoles)
  if (variant.compiler.modelFamily === "sora") return roles.has("product_front")
  if (variant.compiler.modelFamily === "veo") return roles.has("veo_product_reference")
  return roles.has("product_front")
}

function buildFailure(
  code: HookEvalFailureCode,
  input: {
    variant?: HookVariantTraceDraft
    details?: string[]
  } = {},
): HookTraceEvaluationFailure {
  const definition = HOOK_EVAL_FAILURE_TAXONOMY[code]
  return {
    code,
    category: definition.category,
    severity: definition.severity,
    message: definition.label,
    repairHint: definition.repairHint,
    ...(input.variant ? { variantId: input.variant.clientVideoId } : {}),
    ...(input.details && input.details.length > 0 ? { details: input.details } : {}),
  }
}
