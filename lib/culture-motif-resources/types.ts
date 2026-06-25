import type { HookOneShotIntent } from "@/lib/hook-one-shot"

export type ConcreteCulturalMotif = {
  id: string
  name: string
  source: "selected_culture_borrowing" | "p0_motif_library"
  motifType: string
  motifFamily?: string
  actionLogic: string
  visualSymbols: string[]
  motionSymbols: string[]
  audioSymbols: string[]
  productBridgeOptions: string[]
  compatibleIntentModes: HookOneShotIntent[]
  compatibleCategories: string[]
  guardrails: string[]
  cultureMotifId?: string
  visualRenderProfileId?: string
  shotPrimitiveIds?: string[]
  whySelected?: string[]
}
