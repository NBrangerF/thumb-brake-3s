import type { LlmConfig } from "@/lib/llm-config"
import { callLlm } from "@/lib/llm-client"
import type { HookRecommendationCard, SelectedCultureBorrowing } from "@/lib/hook-library"
import type { HookCreativeResourceBundle } from "@/lib/hook-generator-v2/resources/types"

import { parseNativeHookScriptAsset } from "./hook-script-asset-schema"
import type { HookScriptAsset, ScriptCreativeSpec } from "./types"

export type NativeHookScriptAssetShadowResult =
  | {
    ok: true
    source: "llm"
    scriptAsset: HookScriptAsset
    rawContent: string
  }
  | {
    ok: false
    source: "not_configured" | "llm_error" | "parse_error"
    error: string
    rawContent?: string
  }

export function buildNativeHookScriptAssetPrompt(input: {
  scriptCreativeSpec: ScriptCreativeSpec
  resourceBundle: HookCreativeResourceBundle
  selectedHook: HookRecommendationCard
  selectedCultureBorrowing?: SelectedCultureBorrowing | null
}) {
  return {
    systemPrompt: [
      "You are a short-video ecommerce hook Creative Director.",
      "Return strict JSON only, matching the HookScriptAsset schema.",
      "Do not output the final video prompt. Do not submit video. Do not change product identity, duration, selected hook, or culture template.",
      "Every timeline shot must be filmable: subject, scene, action, camera, sound.",
      "Write all creative content in Simplified Chinese. Do not use English video-direction prose.",
      "If speechMode is dialogue or voiceover, at least two timeline shots must include short natural Chinese dialogue or voiceover lines. Never replace dialogue with sound effects only.",
      "The hook must press tension: 0-1s visible pressure, 1-2.5s escalation, product bridge as resolution or redirect.",
      "If a culture motif exists, it must use the explicit cultureMotifId, visualRenderProfileId, and shotPrimitiveIds; style-only culture is a failure.",
      "Keep physical blocking simple: one main action per time slice, one camera move per time slice, no object penetration between hands, toothbrush, product, and face.",
    ].join("\n"),
    userPrompt: JSON.stringify({
      task: "Generate native HookScriptAsset for a short ecommerce hook.",
      scriptCreativeSpec: input.scriptCreativeSpec,
      selectedHook: input.selectedHook,
      resourceBundle: compactResourceBundle(input.resourceBundle),
      cultureMotif: input.resourceBundle.cultureMotif,
      selectedCultureBorrowing: input.selectedCultureBorrowing
        ? compactSelectedCultureBorrowing(input.selectedCultureBorrowing)
        : null,
      hardRules: [
        "0-1s must contain a concrete stop-scroll event, not a slogan.",
        "1-2.5s must escalate conflict, pressure, curiosity, or stimulus.",
        "If the product appears inside the hook, its bridge must change the previous action chain, not hard-cut to packshot.",
        "Keep or strengthen dialogueBeat: include at least two short Chinese spoken lines unless speechMode is no_voice.",
        "Use one camera move per time slice and one main contact action per time slice.",
        "Separate hands, toothbrush, product package, squeezed paste, and face with clear spatial blocking; avoid crossing through each other.",
        "Do not render subtitles, UI, watermarks, random text, logos, IP faces, exact lines, or original music.",
        "Use only the selected culture motif and matched symbol entries. Do not expand into broad culture borrowing or IP borrowing.",
        "For culture-fused variants, choose at least one concrete visible cultural object, one motion symbol, one audio symbol, and one product bridge symbol from cultureMotif or selectedCultureBorrowing.",
        "For culture-fused variants, timelineShots must follow the selected shotPrimitiveIds: opening action, tension action, then product bridge action.",
      ],
      softGuidance: [
        ...(input.scriptCreativeSpec.softRules ?? []),
        ...(input.scriptCreativeSpec.intentContract.userIntentExpansion ? [
          "If scriptCreativeSpec.intentContract.userIntentExpansion exists, ground at least one hookSignals item in the opening action, conflict source, or open-loop beat; do not treat inferred observable evidence as product facts.",
        ] : []),
        "The uploaded product image is an identity reference; it does not mean the product must be visible inside the hook.",
        "A product-free 4-second hook is valid when it creates meaningful stop-scroll pressure, 3-second retention, and a reason to keep watching.",
        "After a pain-evidence shot, prefer not to show the sales product as the immediate next clear image when that could make viewers think the product caused the problem.",
        "For short pain-first hooks, the sales product may be deferred after an explicit solution turn; old/generic items, an open-loop hand action, or an eye-line can carry the bridge if it is more natural.",
        "This is a creative judgment, not a schema hard rule: choose the safer option for the specific product, pain evidence, and shot sequence.",
      ],
      requiredOutputShape: {
        hookSummary: "string",
        audienceStopReason: "string",
        tensionPlan: {
          conflictType: "string",
          pressureSource: "string",
          firstSecondShock: "string",
          escalationBeat: "string",
          unresolvedQuestion: "string",
          emotionalPressure: "string",
          productResolutionRole: "string",
          riskIfTooSubtle: "string",
        },
        hookMechanism: {
          hookType: "string",
          microPatternId: "string",
          mechanismName: "string",
          stopSignal: "string",
          tensionEngine: "string",
          curiosityGap: "string",
          payoffStyle: "string",
        },
        productRole: {
          role: "string",
          entryTime: "string",
          entryAction: "string",
          whyItBelongs: "string",
          avoidHardSell: true,
          noFullClaim: true,
        },
        cultureFusionMechanism: input.resourceBundle.cultureMotif ? {
          enabled: true,
          motifId: "string",
          templateId: "string",
          borrowedSymbol: "string",
          concreteSymbol: "string",
          whereItAppears: ["string"],
          actionIntegration: "string",
          actionTranslation: "string",
          soundIntegration: "string",
          soundTranslation: "string",
          visualComposition: "string",
          productBridgeIntegration: "string",
          productBridgeSymbol: "string",
          appearsInShots: ["string"],
          forbiddenShallowUse: ["string"],
          notJustStyle: true,
        } : "omit when no culture borrowing is selected",
        timelineShots: [{
          time: "string",
          retentionPurpose: "choose exactly one enum: stop_scroll, build_tension, curiosity_gap, product_bridge, proof_hint, reaction, open_loop. Do not combine values with |, slash, comma, or spaces.",
          scene: "string",
          subject: "string",
          action: "string",
          eventPrimitiveId: "string optional",
          shotCardId: "string optional",
          camera: "string",
          sound: "string",
          dialogue: "short Chinese line optional, required when speechMode is dialogue or voiceover",
          productVisibility: "none | background_hint | partial | clear_but_not_packshot | hero_visible",
          mustShow: ["string"],
          mustAvoid: ["string"],
          transitionToNextShot: "string",
        }],
        soundDesign: {
          voiceoverAllowed: "boolean",
          speechMode: "voiceover | dialogue | no_voice",
          ambientSound: "string",
          musicOrSfx: "string",
        },
        textOverlay: ["metadata only, not rendered"],
        firstFrameIntent: {
          stopSignal: "string",
          composition: "string",
          emotion: "string",
          mustShow: ["string"],
          mustAvoid: ["string"],
          compatibilityPrompt: "string optional",
        },
        videoPromptHints: {
          visualMood: "string",
          cameraBehavior: "string",
          keyObjects: ["string"],
          motionPriorities: ["string"],
          avoid: ["string"],
        },
        riskFlags: ["string"],
        generationRecommendation: {
          preferredPath: "direct_video | first_frame | reference_video",
          reason: "string",
          availablePaths: ["direct_video", "first_frame"],
        },
      },
    }, null, 2),
  }
}

export async function generateNativeHookScriptAssetShadow(input: {
  scriptCreativeSpec: ScriptCreativeSpec
  resourceBundle: HookCreativeResourceBundle
  selectedHook: HookRecommendationCard
  selectedCultureBorrowing?: SelectedCultureBorrowing | null
  config: LlmConfig | null
  call?: typeof callLlm
}): Promise<NativeHookScriptAssetShadowResult> {
  if (!input.config?.apiKey || !input.config.model) {
    return {
      ok: false,
      source: "not_configured",
      error: "Native HookScriptAsset shadow skipped because LLM is not configured.",
    }
  }
  const prompt = buildNativeHookScriptAssetPrompt(input)
  let content = ""
  try {
    const response = await (input.call ?? callLlm)(input.config, {
      messages: [
        { role: "system", content: prompt.systemPrompt },
        { role: "user", content: prompt.userPrompt },
      ],
      model: input.config.model,
      temperature: 0.62,
      maxTokens: 4200,
      timeoutMs: 140_000,
      retries: 1,
      retryDelayMs: 1500,
    })
    content = response.content
  } catch (error) {
    return {
      ok: false,
      source: "llm_error",
      error: error instanceof Error ? error.message : "Native HookScriptAsset LLM failed.",
    }
  }

  try {
    const raw = parseNativeJsonContent(content)
    return {
      ok: true,
      source: "llm",
      scriptAsset: parseNativeHookScriptAsset(raw),
      rawContent: content,
    }
  } catch (error) {
    return {
      ok: false,
      source: "parse_error",
      error: error instanceof Error ? error.message : "Native HookScriptAsset parse failed.",
      rawContent: content,
    }
  }
}

function parseNativeJsonContent(content: string) {
  const cleaned = content.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim()
  const candidate = extractFirstJsonObject(cleaned)
  try {
    return JSON.parse(candidate)
  } catch (firstError) {
    const repaired = repairCommonNativeJsonSyntax(candidate)
    try {
      return JSON.parse(repaired)
    } catch {
      throw firstError
    }
  }
}

function extractFirstJsonObject(value: string) {
  const start = value.indexOf("{")
  if (start < 0) return value
  let depth = 0
  let inString = false
  let escaped = false
  for (let index = start; index < value.length; index += 1) {
    const char = value[index]
    if (escaped) {
      escaped = false
      continue
    }
    if (char === "\\") {
      escaped = true
      continue
    }
    if (char === "\"") {
      inString = !inString
      continue
    }
    if (inString) continue
    if (char === "{") depth += 1
    if (char === "}") {
      depth -= 1
      if (depth === 0) return value.slice(start, index + 1)
    }
  }
  return value.slice(start)
}

function repairCommonNativeJsonSyntax(value: string) {
  return value
    .replace(/[“”]/g, "\"")
    .replace(/[‘’]/g, "'")
    .replace(/:\s*"([^"\n]*)"\s*,\s*([^"\n{}[\]:,]+)"\s*([,}\]])/g, (_match, quoted: string, dangling: string, tail: string) =>
      `: "${quoted}，${dangling.trim()}"${tail}`
    )
    .replace(/,\s*([}\]])/g, "$1")
}

function compactResourceBundle(bundle: HookCreativeResourceBundle) {
  return {
    productContract: bundle.productContract,
    audienceSituations: bundle.audienceSituations.map((item) => ({
      id: item.id,
      name: item.name,
      lifeState: item.lifeState,
      emotionalTriggers: item.emotionalTriggers,
      recognitionSignals: item.recognitionSignals,
      commonScenes: item.commonScenes,
    })),
    attentionMicroPattern: bundle.attentionMicroPattern,
    eventCandidates: bundle.eventCandidates,
    bridgeCandidates: bundle.bridgeCandidates,
    proofCandidates: bundle.proofCandidates,
    cultureMotif: bundle.cultureMotif,
    shotCandidates: bundle.shotCandidates,
    constraints: bundle.constraints,
    failureWarnings: bundle.failureWarnings,
    examples: bundle.examples,
    resourceIds: bundle.resourceIds,
    libraryRefs: bundle.libraryRefs,
  }
}

function compactSelectedCultureBorrowing(culture: SelectedCultureBorrowing) {
  return {
    templateId: culture.templateId,
    nameCn: culture.nameCn,
    cultureMotifId: culture.cultureMotifId,
    motifFamily: culture.motifFamily,
    visualRenderProfileId: culture.visualRenderProfileId,
    shotPrimitiveIds: culture.shotPrimitiveIds,
    whySelected: culture.whySelected,
    cultureMechanism: culture.cultureMechanism,
    openingCapture: culture.openingCapture,
    attentionEscalation: culture.attentionEscalation,
    productBridgeRule: culture.productBridgeRule,
    firstFrameFormula: culture.firstFrameFormula,
    finalVideoPromptFormulaCn: culture.finalVideoPromptFormulaCn,
    audioFormulaCn: culture.audioFormulaCn,
    verbalFormulaCn: culture.verbalFormulaCn,
    requiredProductAppearanceTiming: culture.requiredProductAppearanceTiming,
    fusionDirectives: culture.fusionDirectives,
    matchedSymbolEntries: culture.matchedSymbolEntries?.map((symbol) => ({
      entryId: symbol.entryId,
      nameCn: symbol.nameCn,
      symbolizationRule: symbol.symbolizationRule,
      doNotUse: symbol.doNotUse,
      visualSlots: symbol.visualSlots,
      motionSlots: symbol.motionSlots,
      audioSlots: symbol.audioSlots,
      verbalSlots: symbol.verbalSlots,
      bridgeType: symbol.bridgeType,
      videoPromptSlots: symbol.videoPromptSlots,
    })) ?? [],
  }
}
