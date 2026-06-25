import { describe, expect, it } from "vitest"

import type { HookProductBrief } from "@/lib/hook-generator"
import type { HookNarrativeDraw, HookNarrativeRole } from "@/lib/hook-one-shot"
import type { HookRecommendationCard, SelectedCultureBorrowing } from "@/lib/hook-library"
import { compileHookVideoPrompt } from "@/lib/hook-generator-v2/compiler/compile-hook-video-prompt"
import { HOOK_GENERATOR_V2_GOLDEN_CASES } from "@/lib/hook-generator-v2/eval/golden-cases"
import { evaluateHookGenerationTrace } from "@/lib/hook-generator-v2/eval/evaluate-hook-generation-trace"
import { HOOK_EVAL_FAILURE_TAXONOMY } from "@/lib/hook-generator-v2/eval/failure-taxonomy"
import { buildHookRunState } from "@/lib/hook-generator-v2/graph/build-hook-run-state"
import type {
  HookOneShotRequest,
  HookOneShotVideoSettings,
  HookRunState,
} from "@/lib/hook-generator-v2/graph/types"
import { P0_CATEGORY_RULES } from "@/lib/hook-generator-v2/resources/p0-resource-library"
import { injectResourcesForHookRunState } from "@/lib/hook-generator-v2/resources/resource-injector"
import type { HookCreativeResourceBundle } from "@/lib/hook-generator-v2/resources/types"
import { buildScriptCreativeSpec } from "@/lib/hook-generator-v2/script-asset/build-script-creative-spec"
import type { HookScriptAsset, ScriptCreativeSpec } from "@/lib/hook-generator-v2/script-asset/types"
import { buildHookTraceDraft } from "@/lib/hook-generator-v2/traces/build-hook-trace-draft"

function hookCard(id: string, hookType: string): HookRecommendationCard {
  return {
    patternCardId: id,
    hookScope: "product_related",
    hookType,
    subType: "golden_trace_eval",
    displayName: `Golden ${hookType}`,
    reason: "trace eval golden case",
    exampleStructure: "visible event -> product bridge -> proof/reaction",
    recommendedReferenceMode: "direct_video",
    productRelationType: "problem_first",
    stimulationLevel: "S1",
    hasReferenceVideo: false,
    productBridgeRule: "商品必须改变动作链",
    score: 0.9,
  }
}

function cultureBorrowing(categoryHint: string): SelectedCultureBorrowing {
  return {
    templateId: `cb_trace_eval_${categoryHint}`,
    nameCn: "日常任务闯关",
    hookScope: "culture_borrowing",
    cultureMechanism: ["把日常动作拍成闯关任务"],
    symbolEntryIds: ["symbol_trace_eval"],
    recommendedDurationSec: 5,
    openingCapture: "日常动作像进入一关任务",
    attentionEscalation: "人物发现商品像任务道具",
    productBridgeRule: "商品在关键动作里成为通关道具",
    firstFrameFormula: "商品、任务线索和使用场景同框",
    finalVideoPromptFormulaCn: "用闯关任务包装一个真实商品动作",
    audioFormulaCn: "轻快提示音",
    verbalFormulaCn: "这一关先完成这个小动作",
    symbolBorrowing: {
      visual: ["任务卡"],
      style: ["轻快"],
      motion: ["解锁"],
      audio: ["提示音"],
      verbal: ["闯关"],
      narrative: ["任务推进"],
      productBridge: ["商品是通关道具"],
      firstFrame: ["商品和任务卡同框"],
      video: ["商品完成动作节点"],
    },
    fusionDirectives: ["文化符号必须改变动作链，不能只做风格滤镜"],
    applicableCategories: [categoryHint],
    productDependency: "strong",
    requiredProductAppearanceTiming: "1-3s",
    tags: ["trace_eval"],
  }
}

function buildTraceForGoldenCase(caseIndex: number) {
  const goldenCase = HOOK_GENERATOR_V2_GOLDEN_CASES[caseIndex]
  const rule = P0_CATEGORY_RULES.find((item) => item.id === goldenCase.expectedCategoryRuleId)
  if (!rule) throw new Error(`Missing P0 rule ${goldenCase.expectedCategoryRuleId}`)

  const input: HookOneShotRequest = {
    productImage: `https://oss.example.com/${goldenCase.id}.png`,
    productTitle: goldenCase.productTitle,
    intent: goldenCase.intent,
    intentText: goldenCase.intentText,
    analysisHints: {
      productCategory: goldenCase.categoryHint,
      coreSellingPoints: goldenCase.sellingPoints,
      painPoints: goldenCase.painPoints,
      targetAudience: goldenCase.targetAudience,
    },
  }
  const videoSettings: HookOneShotVideoSettings = {
    videoProvider: "seedance",
    videoModel: "doubao-seedance-2-0-260128",
    videoDuration: 5,
    videoRatio: "9:16",
    videoResolution: "720p",
    generateAudio: true,
    modelFamily: "seedance",
  }
  const productBrief: HookProductBrief = {
    productName: goldenCase.productTitle,
    productCategory: goldenCase.categoryHint,
    productImage: input.productImage,
    productImages: [input.productImage],
    marketingLogic: {
      coreSellingPoints: goldenCase.sellingPoints,
      targetAudience: goldenCase.targetAudience,
      painPoints: goldenCase.painPoints,
      proofPoints: goldenCase.sellingPoints,
      forbiddenClaims: [],
    },
  }
  const narrativeDraws: HookNarrativeDraw[] = [
    {
      clientVideoId: `${goldenCase.id}-intent`,
      role: "intent-direct",
      selectedHook: hookCard(`${goldenCase.id}_H4`, "H4"),
      selectedCultureBorrowing: null,
    },
    {
      clientVideoId: `${goldenCase.id}-contrast`,
      role: "contrast",
      selectedHook: hookCard(`${goldenCase.id}_H2`, "H2"),
      selectedCultureBorrowing: null,
    },
    {
      clientVideoId: `${goldenCase.id}-culture`,
      role: "culture-fused",
      selectedHook: hookCard(`${goldenCase.id}_H7`, "H7"),
      selectedCultureBorrowing: cultureBorrowing(goldenCase.categoryHint),
    },
  ]

  let state = injectResourcesForHookRunState(buildHookRunState({
    requestId: `request_${goldenCase.id}`,
    batchId: `batch_${goldenCase.id}`,
    input,
    videoSettings,
    productBrief,
    narrativeDraws,
  }))

  state = attachSuccessfulVariantArtifacts(state)

  const trace = buildHookTraceDraft({
    state,
    submittedRuns: narrativeDraws.map((draw) => ({
      clientVideoId: draw.clientVideoId,
      scriptSource: "fallback",
      finalPromptReady: true,
      videoRunId: `run_${draw.clientVideoId}`,
    })),
    createdAt: "2026-05-30T10:00:00.000Z",
  })

  return { goldenCase, trace, state }
}

function attachSuccessfulVariantArtifacts(state: HookRunState): HookRunState {
  for (const variant of Object.values(state.variants)) {
    if (!variant.resourceBundle) throw new Error("resource bundle missing")
    const scriptCreativeSpec = buildScriptCreativeSpec({
      productBrief: state.productBrief,
      resourceBundle: variant.resourceBundle,
      intent: state.input.intent,
      intentText: state.input.intentText,
      variantRole: variant.role,
      selectedHook: variant.selectedHook,
      durationSeconds: state.videoSettings.videoDuration,
    })
    const scriptAsset = buildScriptAsset({
      spec: scriptCreativeSpec,
      bundle: variant.resourceBundle,
      role: variant.role,
    })
    const compiledVideoPrompt = compileHookVideoPrompt({
      scriptAsset,
      scriptCreativeSpec,
      modelFamily: state.videoSettings.modelFamily,
      videoProvider: state.videoSettings.videoProvider,
      productImage: state.input.productImage,
    })

    state.variants[variant.clientVideoId] = {
      ...variant,
      scriptCreativeSpec,
      scriptAssetDraft: scriptAsset,
      finalScriptAsset: scriptAsset,
      validationIssues: [],
      compiledVideoPrompt,
      status: "submitted",
      videoJob: {
        runId: `run_${variant.clientVideoId}`,
        status: "pending",
        currentStage: "queued",
        progress: 0,
      },
    }
  }
  return state
}

function buildScriptAsset(input: {
  spec: ScriptCreativeSpec
  bundle: HookCreativeResourceBundle
  role: HookNarrativeRole
}): HookScriptAsset {
  const productName = input.spec.productLock.productName
  const mustShow = input.spec.productLock.mustShowSignals.slice(0, 3)
  const mustAvoid = input.spec.productLock.forbiddenConfusions.slice(0, 3)
  const bridge = input.bundle.bridgeCandidates[0]
  const event = input.bundle.eventCandidates[0]
  const shot = input.bundle.shotCandidates[0]
  const cultureMotif = input.bundle.cultureMotif

  return {
    hookSummary: `${productName} 进入一个真实动作节点`,
    audienceStopReason: "用户看到熟悉场景被一个具体动作打断",
    hookMechanism: {
      hookType: input.bundle.attentionMicroPattern.parentHookType,
      microPatternId: input.bundle.attentionMicroPattern.id,
      mechanismName: input.bundle.attentionMicroPattern.name,
      stopSignal: input.bundle.attentionMicroPattern.stopSignalLogic,
      tensionEngine: input.bundle.attentionMicroPattern.tensionEngine,
      curiosityGap: input.bundle.attentionMicroPattern.curiosityEngine,
      payoffStyle: "商品用一个动作回收前面的停顿",
    },
    productRole: {
      role: bridge.role,
      entryTime: "1.5-3s",
      entryAction: `${productName} 被拿到问题现场并完成一个可见动作`,
      whyItBelongs: `${productName} 是让前面动作继续推进的关键道具`,
      avoidHardSell: true,
      noFullClaim: true,
    },
    ...(cultureMotif ? {
      cultureFusionMechanism: {
        enabled: true,
        motifId: cultureMotif.id,
        borrowedSymbol: cultureMotif.visualSymbols[0] ?? "任务线索",
        whereItAppears: ["开场线索", "商品承接动作"],
        actionIntegration: cultureMotif.actionLogic,
        soundIntegration: cultureMotif.audioSymbols[0] ?? "轻提示音",
        productBridgeIntegration: `${productName} 作为文化动作链里的道具进入`,
        notJustStyle: true,
      },
    } : {}),
    timelineShots: [
      {
        time: "0-1.5s",
        retentionPurpose: "stop_scroll",
        scene: input.bundle.eventCandidates[0]?.eventTemplate ?? "日常动作突然停住",
        subject: "使用者",
        action: "在熟悉场景里停住并看向问题现场",
        eventPrimitiveId: event?.id,
        shotCardId: shot?.id,
        camera: shot?.camera ?? "手持近景",
        sound: "轻提示音",
        textOverlay: "这一秒先别划走",
        productVisibility: "background_hint",
        mustShow: mustShow.slice(0, 1),
        mustAvoid,
        transitionToNextShot: "切到商品进入动作",
      },
      {
        time: "1.5-3.5s",
        retentionPurpose: "product_bridge",
        scene: `${productName} 和问题现场同框`,
        subject: productName,
        action: `${productName} 被拿起并完成 ${input.spec.productLock.allowedProductActions[0] ?? "一个真实使用动作"}`,
        eventPrimitiveId: event?.id,
        shotCardId: shot?.id,
        camera: shot?.camera ?? "手部近景",
        sound: "动作声",
        textOverlay: "商品进入动作链",
        productVisibility: "clear_but_not_packshot",
        mustShow: [productName, ...mustShow],
        mustAvoid,
        transitionToNextShot: "切到一个小证据或反应",
      },
      {
        time: "3.5-5s",
        retentionPurpose: "proof_hint",
        scene: "动作完成后的局部结果",
        subject: productName,
        action: "停留半秒展示动作后的结果边界",
        shotCardId: input.bundle.shotCandidates[1]?.id ?? shot?.id,
        camera: input.bundle.shotCandidates[1]?.camera ?? "微距",
        sound: "环境声收束",
        productVisibility: "partial",
        mustShow: [productName, ...mustShow],
        mustAvoid,
        transitionToNextShot: "结束",
      },
    ],
    soundDesign: {
      voiceoverAllowed: true,
      speechMode: "voiceover",
      ambientSound: "真实场景环境声",
      musicOrSfx: "轻提示音和动作声",
    },
    textOverlay: ["这一秒先别划走", "商品进入动作链"],
    firstFrameIntent: {
      stopSignal: "熟悉场景里的动作停顿",
      composition: `${productName}、手部动作和问题现场同框`,
      emotion: "好奇",
      mustShow,
      mustAvoid,
      compatibilityPrompt: `Realistic vertical first frame. ${productName} visible with a hand action in a real usage scene.`,
    },
    videoPromptHints: {
      visualMood: "写实手机 UGC",
      cameraBehavior: shot?.camera ?? "手持近景",
      keyObjects: [productName, ...mustShow],
      motionPriorities: input.spec.productLock.allowedProductActions,
      avoid: mustAvoid,
      providerNeutralPrompt: `${productName} 在真实日常动作中自然承接前一秒停顿。`,
    },
    riskFlags: [],
    generationRecommendation: {
      preferredPath: "direct_video",
      reason: "商品图可直接进入视频生成",
      availablePaths: ["direct_video"],
    },
  }
}

describe("hook generator v2 trace eval loop", () => {
  it("records eval-ready trace summaries for resource, script, quality, and compiler artifacts", () => {
    const { trace } = buildTraceForGoldenCase(0)
    const variant = trace.variants[0]

    expect(trace.persistenceDecision).toEqual({
      phase: "phase_2",
      mode: "typed_object_and_db_best_effort",
      persistToDb: true,
    })
    expect(variant.resourceSummary).toMatchObject({
      hasAttentionMicroPattern: true,
      eventPrimitiveCount: expect.any(Number),
      productBridgeRoleCount: expect.any(Number),
      proofVisualizationCount: expect.any(Number),
      shotCardCount: expect.any(Number),
      constraintRuleCount: expect.any(Number),
      failureWarningCount: expect.any(Number),
      exampleCount: expect.any(Number),
    })
    expect(variant.resourceSummary?.productBridgeRoleCount).toBeGreaterThan(0)
    expect(variant.resourceSummary?.shotCardCount).toBeGreaterThan(0)
    expect(variant.scriptAssetSummary).toMatchObject({
      hookSummary: expect.any(String),
      productRole: expect.any(String),
      timelineShotCount: 3,
      hasProductBridgeShot: true,
    })
    expect(variant.qualityGate).toEqual({
      status: "pass",
      issueCodes: [],
      issueCount: 0,
      repairAttempts: 0,
      repairHistoryCount: 0,
    })
    expect(variant.compiler).toMatchObject({
      provider: "seedance",
      modelFamily: "seedance",
      promptReady: true,
      inputImageRoles: ["product_front"],
    })
  })

  it("runs the P0 golden eval set across all locked category decisions", () => {
    expect(HOOK_GENERATOR_V2_GOLDEN_CASES.map((item) => item.decisionCategory)).toEqual([
      "toothpaste/oral care",
      "cleanser/skincare",
      "fragrance",
      "cleaning products",
      "snacks/drinks",
      "cups/bottles",
      "small appliances",
      "storage/home organization",
      "pet products",
      "mother-and-baby",
      "fashion/shoes/bags",
      "digital accessories",
    ])

    for (let index = 0; index < HOOK_GENERATOR_V2_GOLDEN_CASES.length; index += 1) {
      const { trace } = buildTraceForGoldenCase(index)
      const evaluation = evaluateHookGenerationTrace(trace, {
        expectedVariantCount: 3,
        requireVideoRunId: true,
      })

      expect(evaluation.ok, `${HOOK_GENERATOR_V2_GOLDEN_CASES[index].id}: ${evaluation.failures.map((failure) => failure.code).join(", ")}`).toBe(true)
      expect(evaluation.failures).toEqual([])
      expect(evaluation.variantResults).toHaveLength(3)
      expect(evaluation.variantResults.every((result) => result.ok)).toBe(true)
      expect(evaluation.variantResults.every((result) => result.resourceCoverage.allRequiredFamiliesPresent)).toBe(true)
    }
  })

  it("classifies weak traces with stable failure taxonomy codes", () => {
    const { trace } = buildTraceForGoldenCase(0)
    const weakTrace = structuredClone(trace)
    weakTrace.variants[0] = {
      ...weakTrace.variants[0],
      resourceBundleIds: undefined,
      resourceSummary: undefined,
      scriptAssetSummary: undefined,
    }
    weakTrace.variants[1] = {
      ...weakTrace.variants[1],
      finalPromptReady: false,
      compiler: undefined,
      videoRunId: null,
    }

    const evaluation = evaluateHookGenerationTrace(weakTrace, {
      expectedVariantCount: 3,
      requireVideoRunId: true,
    })

    expect(evaluation.ok).toBe(false)
    expect(evaluation.failures.map((failure) => failure.code)).toEqual(expect.arrayContaining([
      "TRACE_RESOURCE_BUNDLE_MISSING",
      "TRACE_SCRIPT_ASSET_MISSING",
      "TRACE_COMPILER_MISSING",
      "TRACE_FINAL_PROMPT_MISSING",
      "TRACE_VIDEO_RUN_MISSING",
    ]))
    expect(HOOK_EVAL_FAILURE_TAXONOMY.TRACE_RESOURCE_BUNDLE_MISSING).toMatchObject({
      severity: "error",
      category: "resource",
    })
  })
})
