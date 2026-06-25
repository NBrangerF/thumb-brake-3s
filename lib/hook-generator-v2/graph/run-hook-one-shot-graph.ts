import { randomUUID } from "node:crypto"

import {
  generateHookScriptWithLlm,
  type HookScriptResult,
} from "@/lib/hook-generator"
import {
  buildOneShotProductBrief,
  drawHookNarrativesForIntent,
  type HookOneShotIntent,
} from "@/lib/hook-one-shot"
import { getHookPatternCard } from "@/lib/hook-library"
import { getSystemLlmConfig, isLlmConfigured, type LlmConfig } from "@/lib/llm-config"
import { compileHookVideoPrompt } from "@/lib/hook-generator-v2/compiler/compile-hook-video-prompt"
import type { CompiledHookVideoPrompt } from "@/lib/hook-generator-v2/compiler/types"
import {
  generateUserIntentExpansion,
  type UserIntentExpansion,
} from "@/lib/hook-generator-v2/intent-expansion/user-intent-expansion"
import { validateAndRepairHookScriptAsset } from "@/lib/hook-generator-v2/quality/targeted-repair"
import { injectResourcesForHookRunState } from "@/lib/hook-generator-v2/resources/resource-injector"
import { buildScriptCreativeSpec } from "@/lib/hook-generator-v2/script-asset/build-script-creative-spec"
import {
  buildHookScriptAssetFromLegacy,
  toLegacyHookScriptResult,
} from "@/lib/hook-generator-v2/script-asset/legacy-adapter"
import type { HookScriptAsset } from "@/lib/hook-generator-v2/script-asset/types"
import { buildHookTraceDraft } from "@/lib/hook-generator-v2/traces/build-hook-trace-draft"
import type { HookRunTraceDraft, HookScriptSource } from "@/lib/hook-generator-v2/traces/types"

import { buildHookRunState } from "./build-hook-run-state"
import type {
  HookOneShotRequest,
  HookOneShotVideoSettings,
  HookRunState,
  HookTraceTiming,
} from "./types"

const DEFAULT_DURATION_SECONDS = 5
const DEFAULT_PRODUCT_IMAGE = "https://example.com/fantastic-hook-product-reference.png"
const DEFAULT_VIDEO_MODEL = "script-only"
const LLM_CONFIG_REQUIRED_CODE = "LLM_CONFIG_REQUIRED"

export type HookOneShotRunResponse = {
  clientVideoId: string
  status: "completed"
  currentStage: "script_ready"
  progress: 100
  card: HookOneShotRunCard
  script: HookScriptResult
  selectedHook: HookRunState["variants"][string]["selectedHook"]
  selectedCultureBorrowing: HookRunState["variants"][string]["selectedCultureBorrowing"]
  futureVideoPrompt: string
  firstFramePrompt?: string
  compiledPrompt?: CompiledHookVideoPrompt
  source: HookScriptSource
}

export type HookOneShotRunCard = {
  title: string
  description: string
  strategyLabel: string
  summary?: string
  hookMechanism?: string
}

export type RunHookOneShotGraphResult =
  | {
    ok: true
    batchId: string
    runs: HookOneShotRunResponse[]
    state: HookRunState
    traceDraft: HookRunTraceDraft | null
  }
  | {
    ok: false
    error: string
    code: string
    status: number
    details?: Record<string, unknown>
  }

export async function runHookOneShotGraph(input: {
  request?: Request
  userId?: string
  input: HookOneShotRequest
  requestId?: string
  batchId?: string
}): Promise<RunHookOneShotGraphResult> {
  try {
    const settings = resolveScriptOnlySettings(input.input)
    const batchId = input.batchId ?? `hook-batch-${randomUUID()}`
    const requestId = input.requestId ?? `hook-request-${randomUUID()}`
    const llmConfigResult = await resolveRequiredLlmConfig()
    if (!llmConfigResult.ok) return llmConfigResult
    const productImage = input.input.productImage?.trim() || DEFAULT_PRODUCT_IMAGE
    const product = buildOneShotProductBrief({
      productTitle: input.input.productTitle,
      productImage,
      intent: input.input.intent,
      intentText: input.input.intentText,
      analysisHints: input.input.analysisHints,
    })
    const draws = drawHookNarrativesForIntent({
      intent: input.input.intent,
      intentText: input.input.intentText,
      productCategory: input.input.analysisHints?.productCategory,
    })
    const state = injectResourcesForHookRunState(buildHookRunState({
      requestId,
      batchId,
      input: { ...input.input, productImage },
      videoSettings: settings,
      productBrief: product,
      narrativeDraws: draws,
    }))

    const runs: HookOneShotRunResponse[] = []
    for (const draw of draws) {
      const run = await buildOneShotScriptRun({
        batchId,
        productImage,
        intent: input.input.intent,
        intentText: input.input.intentText,
        settings,
        product,
        llmConfig: llmConfigResult.config,
        state,
        variant: state.variants[draw.clientVideoId],
      })
      state.variants[draw.clientVideoId] = {
        ...state.variants[draw.clientVideoId],
        scriptCreativeSpec: run.scriptCreativeSpec,
        scriptAssetDraft: run.scriptAsset,
        validationIssues: run.qualityGate.issues,
        repairAttempts: run.repairAttempts,
        repairHistory: run.repairHistory,
        finalScriptAsset: run.scriptAsset,
        compiledVideoPrompt: run.compiledPrompt,
        traceTimings: run.traceTimings,
        scriptAssetSource: "legacy_adapter",
        promptCompilerMode: "legacy_compiler",
        status: "submitted",
      }
      runs.push({
        clientVideoId: draw.clientVideoId,
        status: "completed",
        currentStage: "script_ready",
        progress: 100,
        card: buildOneShotRunCard(run.scriptAsset, input.input.intent),
        script: run.script,
        selectedHook: draw.selectedHook,
        selectedCultureBorrowing: draw.selectedCultureBorrowing,
        futureVideoPrompt: run.compiledPrompt.prompt,
        firstFramePrompt: run.compiledPrompt.firstFramePrompt,
        compiledPrompt: run.compiledPrompt,
        source: run.scriptSource,
      })
    }

    const traceDraft = buildTraceDraftBestEffort(state, runs)
    return { ok: true, batchId, runs, state, traceDraft }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Hook script generation failed",
      code: "HOOK_SCRIPT_GENERATION_FAILED",
      status: 500,
    }
  }
}

async function resolveRequiredLlmConfig(): Promise<
  | { ok: true; config: LlmConfig }
  | {
    ok: false
    error: string
    code: string
    status: number
    details: Record<string, unknown>
  }
> {
  const config = await getSystemLlmConfig()
  if (isLlmConfigured(config)) return { ok: true, config }

  const missingEnvVars = [
    config.baseUrl.trim() ? null : "LLM_BASE_URL",
    config.apiKey.trim() ? null : "LLM_API_KEY",
    config.model.trim() ? null : "LLM_MODEL",
  ].filter((value): value is string => Boolean(value))

  return {
    ok: false,
    error: `LLM configuration is required. Set ${missingEnvVars.join(", ")} in .env.local before generating Hook scripts.`,
    code: LLM_CONFIG_REQUIRED_CODE,
    status: 503,
    details: {
      missingEnvVars,
      setupHint: "Copy .env.example to .env.local and configure an OpenAI-compatible chat completions endpoint.",
    },
  }
}

function resolveScriptOnlySettings(input: HookOneShotRequest): HookOneShotVideoSettings {
  return {
    videoProvider: "seedance",
    videoModel: input.videoModel?.trim() || DEFAULT_VIDEO_MODEL,
    videoDuration: normalizeDuration(input.videoDuration),
    videoRatio: input.videoRatio ?? "9:16",
    videoResolution: input.videoResolution ?? "720p",
    generateAudio: input.generateAudio ?? true,
    modelFamily: "seedance",
  }
}

function normalizeDuration(value: unknown) {
  const numeric = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(numeric)) return DEFAULT_DURATION_SECONDS
  return Math.max(4, Math.min(9, Math.round(numeric)))
}

async function buildOneShotScriptRun(input: {
  batchId: string
  productImage: string
  intent: HookOneShotIntent
  intentText: string
  settings: HookOneShotVideoSettings
  product: ReturnType<typeof buildOneShotProductBrief>
  llmConfig: LlmConfig
  state: HookRunState
  variant: HookRunState["variants"][string]
}) {
  if (!input.variant.resourceBundle) {
    throw new Error("Hook resource bundle missing before script generation")
  }
  const resourceBundle = input.variant.resourceBundle
  const traceTimings: HookTraceTiming[] = []
  const userIntentExpansion = await timeNode(traceTimings, "user_intent_expansion", () => resolveUserIntentExpansion({
    intent: input.intent,
    intentText: input.intentText,
    product: input.product,
    config: input.llmConfig,
  }))
  const scriptCreativeSpec = timeNodeSync(traceTimings, "script_creative_spec", () => buildScriptCreativeSpec({
    productBrief: input.product,
    resourceBundle,
    intent: input.intent,
    intentText: input.intentText,
    userIntentExpansion,
    variantRole: input.variant.role,
    selectedHook: input.variant.selectedHook,
    durationSeconds: input.settings.videoDuration,
  }))
  const { script: legacyScript, scriptSource } = await timeNode(traceTimings, "llm_hook_script", () => buildHiddenScript({
    product: input.product,
    intent: input.intent,
    intentText: input.intentText,
    durationSeconds: input.settings.videoDuration,
    userIntentExpansion,
    config: input.llmConfig,
    selectedHook: input.variant.selectedHook,
    selectedCultureBorrowing: input.variant.selectedCultureBorrowing,
  }))
  const initialScriptAsset = timeNodeSync(traceTimings, "legacy_asset_adapter", () => buildHookScriptAssetFromLegacy({
    legacyScript,
    scriptCreativeSpec,
    resourceBundle,
    selectedHook: input.variant.selectedHook,
    selectedCultureBorrowing: input.variant.selectedCultureBorrowing,
  }))
  const repaired = timeNodeSync(traceTimings, "deterministic_validation_repair", () => validateAndRepairHookScriptAsset({
    scriptAsset: initialScriptAsset,
    scriptCreativeSpec,
    resourceBundle,
    maxRepairAttempts: input.state.runPolicy.maxRepairAttempts,
  }))
  if (repaired.qualityGate.status === "fail") {
    throw new Error(`HookScriptAsset quality gate failed: ${repaired.qualityGate.issues.map((issue) => issue.code).join(", ")}`)
  }
  const script = toLegacyHookScriptResult(repaired.scriptAsset)
  const compiledPrompt = timeNodeSync(traceTimings, "future_video_prompt_compiler", () => compileHookVideoPrompt({
    scriptAsset: repaired.scriptAsset,
    scriptCreativeSpec,
    modelFamily: input.settings.modelFamily,
    videoProvider: input.settings.videoProvider,
    productImage: input.productImage,
  }))

  return {
    scriptCreativeSpec,
    scriptAsset: repaired.scriptAsset,
    script,
    scriptSource,
    qualityGate: repaired.qualityGate,
    repairAttempts: repaired.repairAttempts,
    repairHistory: repaired.repairHistory,
    compiledPrompt,
    traceTimings,
  }
}

async function buildHiddenScript(input: {
  product: ReturnType<typeof buildOneShotProductBrief>
  intent: HookOneShotIntent
  intentText: string
  durationSeconds: number
  userIntentExpansion?: UserIntentExpansion | null
  config: LlmConfig
  selectedHook: ReturnType<typeof drawHookNarrativesForIntent>[number]["selectedHook"]
  selectedCultureBorrowing: ReturnType<typeof drawHookNarrativesForIntent>[number]["selectedCultureBorrowing"]
}) {
  const pattern = getHookPatternCard(input.selectedHook.patternCardId)
  if (!pattern) throw new Error("Hook Pattern 不存在")

  const buildInput = {
    product: input.product,
    selectedHook: input.selectedHook,
    selectedCultureBorrowing: input.selectedCultureBorrowing,
    includeVoiceover: true,
    durationSeconds: input.durationSeconds,
    intent: input.intent,
    intentText: input.intentText,
    userIntentExpansion: input.userIntentExpansion,
  }
  const scriptSource: HookScriptSource = "llm"
  const script = await generateHookScriptWithLlm(buildInput, pattern, input.config)
  return { pattern, script, scriptSource }
}

async function resolveUserIntentExpansion(input: {
  intent: HookOneShotIntent
  intentText: string
  product: ReturnType<typeof buildOneShotProductBrief>
  config: LlmConfig
}): Promise<UserIntentExpansion | null> {
  if (!input.intentText.trim()) return null
  try {
    const result = await generateUserIntentExpansion({
      intent: input.intent,
      intentText: input.intentText,
      productName: input.product.productName,
      productCategory: input.product.productCategory,
      config: input.config,
    })
    if (result.ok) return result.expansion
    return null
  } catch {
    return null
  }
}

function buildOneShotRunCard(scriptAsset: HookScriptAsset, intent: HookOneShotIntent): HookOneShotRunCard {
  const mechanism = firstNonEmpty([
    scriptAsset.hookMechanism?.mechanismName,
    scriptAsset.hookMechanism?.tensionEngine,
    scriptAsset.hookMechanism?.curiosityGap,
  ])
  return {
    title: firstNonEmpty([
      scriptAsset.hookSummary,
      scriptAsset.firstFrameIntent?.stopSignal,
      scriptAsset.timelineShots?.[0]?.scene,
    ]) || "第 1 秒抓住注意力",
    description: firstNonEmpty([
      scriptAsset.audienceStopReason,
      scriptAsset.hookMechanism?.tensionEngine,
      scriptAsset.hookMechanism?.curiosityGap,
      scriptAsset.timelineShots?.[0]?.retentionPurpose,
    ]) || "围绕商品理解生成的可测试开场方向",
    strategyLabel: intentLabel(intent),
    summary: firstNonEmpty([scriptAsset.audienceStopReason, scriptAsset.hookSummary]) || undefined,
    hookMechanism: mechanism || undefined,
  }
}

function firstNonEmpty(values: Array<string | null | undefined>) {
  return values
    .map((value) => String(value ?? "").replace(/\s+/g, " ").trim())
    .find(Boolean)
}

function intentLabel(intent: HookOneShotIntent) {
  if (intent === "pain_first") return "痛点"
  if (intent === "audience_first") return "人群"
  if (intent === "creative_first") return "剧情脑洞"
  return "优惠"
}

function buildTraceDraftBestEffort(
  state: HookRunState,
  runs: HookOneShotRunResponse[],
) {
  try {
    const traceDraft = buildHookTraceDraft({
      state,
      submittedRuns: runs.map((run) => ({
        clientVideoId: run.clientVideoId,
        scriptSource: run.source,
        finalPromptReady: Boolean(run.futureVideoPrompt.trim()),
        videoRunId: null,
      })),
    })
    state.trace = traceDraft.variants.map((variant) => ({
      event: "script_variant_ready",
      at: traceDraft.createdAt,
      variantId: variant.clientVideoId,
      details: {
        role: variant.role,
        selectedHookId: variant.selectedHookId,
        selectedCultureBorrowingId: variant.selectedCultureBorrowingId,
        resourceBundleIds: variant.resourceBundleIds,
        scriptSource: variant.scriptSource,
        finalPromptReady: variant.finalPromptReady,
      },
    }))
    return traceDraft
  } catch {
    return null
  }
}

async function timeNode<T>(
  timings: HookTraceTiming[],
  node: string,
  run: () => Promise<T>,
): Promise<T> {
  const started = Date.now()
  const startedAt = new Date(started).toISOString()
  try {
    const value = await run()
    const ended = Date.now()
    timings.push({
      node,
      startedAt,
      endedAt: new Date(ended).toISOString(),
      durationMs: ended - started,
      status: "ok",
    })
    return value
  } catch (error) {
    const ended = Date.now()
    timings.push({
      node,
      startedAt,
      endedAt: new Date(ended).toISOString(),
      durationMs: ended - started,
      status: "error",
      details: { error: error instanceof Error ? error.message : String(error) },
    })
    throw error
  }
}

function timeNodeSync<T>(
  timings: HookTraceTiming[],
  node: string,
  run: () => T,
): T {
  const started = Date.now()
  const startedAt = new Date(started).toISOString()
  try {
    const value = run()
    const ended = Date.now()
    timings.push({
      node,
      startedAt,
      endedAt: new Date(ended).toISOString(),
      durationMs: ended - started,
      status: "ok",
    })
    return value
  } catch (error) {
    const ended = Date.now()
    timings.push({
      node,
      startedAt,
      endedAt: new Date(ended).toISOString(),
      durationMs: ended - started,
      status: "error",
      details: { error: error instanceof Error ? error.message : String(error) },
    })
    throw error
  }
}
