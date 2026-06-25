import { afterEach, describe, expect, it } from "vitest"

import {
  hookAssetPipelinePrimaryEnabled,
  hookNativeAssetShadowEnabled,
  hookSeedanceAssetCompilerShadowEnabled,
  hookTensionCultureEvaluatorEnabled,
  hookTracePersistenceEnabled,
} from "@/lib/hook-generator-v2/graph/feature-flags"

const OLD_ENV = { ...process.env }

afterEach(() => {
  process.env = { ...OLD_ENV }
})

describe("hook generator v2 feature flags", () => {
  it("keeps the new asset pipeline primary path opt-in", () => {
    delete process.env.HOOK_ASSET_PIPELINE_PRIMARY_ENABLED

    expect(hookAssetPipelinePrimaryEnabled()).toBe(false)

    process.env.HOOK_ASSET_PIPELINE_PRIMARY_ENABLED = "true"
    expect(hookAssetPipelinePrimaryEnabled()).toBe(true)

    process.env.HOOK_ASSET_PIPELINE_PRIMARY_ENABLED = "false"
    expect(hookAssetPipelinePrimaryEnabled()).toBe(false)
  })

  it("keeps shadow evaluators opt-in while trace remains enabled by default", () => {
    delete process.env.HOOK_NATIVE_ASSET_SHADOW_ENABLED
    delete process.env.HOOK_SEEDANCE_ASSET_COMPILER_SHADOW_ENABLED
    delete process.env.HOOK_TENSION_CULTURE_EVALUATOR_ENABLED
    delete process.env.HOOK_TRACE_PERSISTENCE_ENABLED

    expect(hookNativeAssetShadowEnabled()).toBe(false)
    expect(hookSeedanceAssetCompilerShadowEnabled()).toBe(false)
    expect(hookTensionCultureEvaluatorEnabled()).toBe(false)
    expect(hookTracePersistenceEnabled()).toBe(true)
  })
})
