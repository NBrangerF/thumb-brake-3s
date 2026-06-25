export type HookEvalFailureSeverity = "warning" | "error"

export type HookEvalFailureCategory =
  | "trace"
  | "resource"
  | "script"
  | "quality"
  | "compiler"
  | "execution"

export type HookEvalFailureCode =
  | "TRACE_VARIANT_COUNT_MISMATCH"
  | "TRACE_ROLE_DIVERSITY_MISSING"
  | "TRACE_HOOK_SELECTION_MISSING"
  | "TRACE_RESOURCE_BUNDLE_MISSING"
  | "TRACE_RESOURCE_FAMILY_INCOMPLETE"
  | "TRACE_SCRIPT_ASSET_MISSING"
  | "TRACE_PRODUCT_BRIDGE_MISSING"
  | "TRACE_QUALITY_GATE_FAILED"
  | "TRACE_COMPILER_MISSING"
  | "TRACE_PROVIDER_REFERENCE_MISSING"
  | "TRACE_FINAL_PROMPT_MISSING"
  | "TRACE_VIDEO_RUN_MISSING"
  | "TRACE_CULTURE_FUSION_MISSING"

export type HookEvalFailureDefinition = {
  code: HookEvalFailureCode
  category: HookEvalFailureCategory
  severity: HookEvalFailureSeverity
  label: string
  repairHint: string
}

export const HOOK_EVAL_FAILURE_TAXONOMY: Record<HookEvalFailureCode, HookEvalFailureDefinition> = {
  TRACE_VARIANT_COUNT_MISMATCH: {
    code: "TRACE_VARIANT_COUNT_MISMATCH",
    category: "trace",
    severity: "error",
    label: "Trace variant count does not match the one-shot contract",
    repairHint: "Confirm the runner creates exactly three variant states and trace rows.",
  },
  TRACE_ROLE_DIVERSITY_MISSING: {
    code: "TRACE_ROLE_DIVERSITY_MISSING",
    category: "trace",
    severity: "error",
    label: "Variant role diversity is missing",
    repairHint: "Ensure intent-direct, contrast, and culture-fused variants are all present.",
  },
  TRACE_HOOK_SELECTION_MISSING: {
    code: "TRACE_HOOK_SELECTION_MISSING",
    category: "trace",
    severity: "error",
    label: "Selected hook identity is missing",
    repairHint: "Record selectedHookId and selectedHookType before script generation.",
  },
  TRACE_RESOURCE_BUNDLE_MISSING: {
    code: "TRACE_RESOURCE_BUNDLE_MISSING",
    category: "resource",
    severity: "error",
    label: "Resource bundle ids or summary are missing",
    repairHint: "Run P0 resource injection before ScriptCreativeSpec generation.",
  },
  TRACE_RESOURCE_FAMILY_INCOMPLETE: {
    code: "TRACE_RESOURCE_FAMILY_INCOMPLETE",
    category: "resource",
    severity: "error",
    label: "One or more required resource families are absent",
    repairHint: "Inject attention, event, bridge, proof, shot, constraint, failure, and example resources for every variant.",
  },
  TRACE_SCRIPT_ASSET_MISSING: {
    code: "TRACE_SCRIPT_ASSET_MISSING",
    category: "script",
    severity: "error",
    label: "HookScriptAsset summary is missing",
    repairHint: "Store the final HookScriptAsset summary on the trace after validation/repair.",
  },
  TRACE_PRODUCT_BRIDGE_MISSING: {
    code: "TRACE_PRODUCT_BRIDGE_MISSING",
    category: "script",
    severity: "error",
    label: "Product bridge is missing from the script asset",
    repairHint: "Repair the script so one timeline shot has retentionPurpose=product_bridge and product visibility.",
  },
  TRACE_QUALITY_GATE_FAILED: {
    code: "TRACE_QUALITY_GATE_FAILED",
    category: "quality",
    severity: "error",
    label: "Quality gate failed",
    repairHint: "Run targeted repair or reject the variant before provider prompt compilation.",
  },
  TRACE_COMPILER_MISSING: {
    code: "TRACE_COMPILER_MISSING",
    category: "compiler",
    severity: "error",
    label: "Provider compiler summary is missing",
    repairHint: "Compile the validated HookScriptAsset through the provider-specific adapter and trace the result.",
  },
  TRACE_PROVIDER_REFERENCE_MISSING: {
    code: "TRACE_PROVIDER_REFERENCE_MISSING",
    category: "compiler",
    severity: "error",
    label: "Provider reference image semantics are missing",
    repairHint: "Ensure Seedance/Sora/Veo adapters declare the correct input image role.",
  },
  TRACE_FINAL_PROMPT_MISSING: {
    code: "TRACE_FINAL_PROMPT_MISSING",
    category: "compiler",
    severity: "error",
    label: "Final provider prompt is not ready",
    repairHint: "Do not submit a run until compiled prompt text is non-empty.",
  },
  TRACE_VIDEO_RUN_MISSING: {
    code: "TRACE_VIDEO_RUN_MISSING",
    category: "execution",
    severity: "error",
    label: "Submitted video run id is missing",
    repairHint: "Record the provider pipeline run id after successful submission.",
  },
  TRACE_CULTURE_FUSION_MISSING: {
    code: "TRACE_CULTURE_FUSION_MISSING",
    category: "script",
    severity: "error",
    label: "Culture-fused variant lacks concrete culture integration",
    repairHint: "For culture-fused variants, trace a culture motif and action-level culture integration.",
  },
}
