import type { HookNarrativeRole } from "@/lib/hook-one-shot"

import type { HookEvalFailureCode, HookEvalFailureCategory, HookEvalFailureSeverity } from "./failure-taxonomy"

export type HookTraceEvaluationOptions = {
  expectedVariantCount?: number
  requireVideoRunId?: boolean
}

export type HookResourceFamilyCoverage = {
  attention: boolean
  audience: boolean
  event: boolean
  bridge: boolean
  proof: boolean
  shot: boolean
  constraint: boolean
  failureWarning: boolean
  example: boolean
  culture: boolean | "not_required"
  allRequiredFamiliesPresent: boolean
}

export type HookTraceEvaluationFailure = {
  code: HookEvalFailureCode
  category: HookEvalFailureCategory
  severity: HookEvalFailureSeverity
  message: string
  repairHint: string
  variantId?: string
  details?: string[]
}

export type HookVariantTraceEvaluation = {
  clientVideoId: string
  role: HookNarrativeRole
  ok: boolean
  resourceCoverage: HookResourceFamilyCoverage
  failures: HookTraceEvaluationFailure[]
}

export type HookTraceEvaluation = {
  ok: boolean
  traceId: string
  evaluatedAt: string
  summary: {
    variantCount: number
    expectedVariantCount: number
    roleCount: number
    failureCount: number
  }
  variantResults: HookVariantTraceEvaluation[]
  failures: HookTraceEvaluationFailure[]
}
