export function hookTracePersistenceEnabled() {
  return process.env.HOOK_TRACE_PERSISTENCE_ENABLED !== "false"
}

export function hookNativeAssetShadowEnabled() {
  return process.env.HOOK_NATIVE_ASSET_SHADOW_ENABLED === "true"
}

export function hookAssetPipelinePrimaryEnabled() {
  return process.env.HOOK_ASSET_PIPELINE_PRIMARY_ENABLED === "true"
}

export function hookSeedanceAssetCompilerShadowEnabled() {
  return process.env.HOOK_SEEDANCE_ASSET_COMPILER_SHADOW_ENABLED === "true"
}

export function hookTensionCultureEvaluatorEnabled() {
  return process.env.HOOK_TENSION_CULTURE_EVALUATOR_ENABLED === "true"
}
