import { z } from "zod"

import { callLlm, type LlmResponse } from "@/lib/llm-client"
import type { LlmConfig } from "@/lib/llm-config"
import type { HookOneShotIntent } from "@/lib/hook-one-shot"

const conceptSchema = z.object({
  text: z.string().min(1),
  sourceSpan: z.string().min(1),
  semanticRole: z.string().min(1),
  relationToEvent: z.string().min(1),
  actionPrimitives: z.array(z.string().min(1)).optional(),
  observableEvidence: z.array(z.string().min(1)).default([]),
  creativeUse: z.array(z.string().min(1)).default([]),
})

const userIntentExpansionSchema = z.object({
  rawInput: z.string().min(1),
  frame: z.object({
    id: z.string().min(1),
    summary: z.string().min(1),
  }),
  concepts: z.array(conceptSchema).default([]),
  hookSignals: z.object({
    openingAction: z.string().min(1),
    conflictSource: z.string().min(1),
    painEvidence: z.array(z.string().min(1)).default([]),
    socialPressureSignals: z.array(z.string().min(1)).default([]),
    openLoop: z.string().min(1),
  }),
  productExposurePolicy: z.object({
    requiredInHook: z.boolean(),
    risk: z.string().min(1),
    recommendedTiming: z.string().min(1),
    saferBridge: z.string().min(1),
  }),
  groundingNotes: z.array(z.string().min(1)).default([]),
})

export type UserIntentExpansion = z.infer<typeof userIntentExpansionSchema>

export type UserIntentExpansionResult =
  | {
    ok: true
    source: "llm"
    expansion: UserIntentExpansion
    rawContent: string
  }
  | {
    ok: false
    source: "not_configured" | "empty_input" | "llm_error" | "parse_error"
    error: string
    rawContent?: string
  }

export function buildUserIntentExpansionPrompt(input: {
  intent: HookOneShotIntent
  intentText: string
  productName: string
  productCategory?: string | null
}) {
  return {
    systemPrompt: [
      "You analyze short Chinese ecommerce hook user intent.",
      "Use frame semantics: infer the everyday event frame evoked by the phrase.",
      "Use semantic roles: identify actor, core event, object/context, and manner/attribute modifiers.",
      "Turn colloquial adjectives and verbs into observable, filmable evidence.",
      "Do not invent product claims, efficacy, discounts, data, certifications, or product facts.",
      "The uploaded product can be absent from the hook. Decide exposure policy from attribution risk.",
      "Return strict JSON only. Do not include markdown.",
    ].join("\n"),
    userPrompt: JSON.stringify({
      task: "Expand a short Chinese hook user input into semantic roles and filmable hook signals.",
      input: {
        hookIntent: input.intent,
        rawIntentText: input.intentText,
        productName: input.productName,
        productCategory: input.productCategory ?? null,
      },
      analysisGuidance: [
        "Nouns usually become actor, object, audience, context, or observer.",
        "Verbs usually become the core event or action primitive.",
        "Colloquial adjectives/adverbs such as 敷衍、怕辣、拖延、油腻、显老 usually become manner, sensory resistance, visible state, or social-pressure evidence.",
        "For each concept, keep sourceSpan from the original user text and explain relationToEvent.",
        "observableEvidence must be visible or audible in a phone-shot video.",
        "hookSignals must help the next script stage place the expansion into opening action, conflict source, pain evidence, social pressure, or open loop.",
        "productExposurePolicy.requiredInHook can be false. If pain evidence followed by direct sales product reveal risks negative attribution, recommend deferred product timing.",
      ],
      requiredOutputShape: {
        rawInput: "string",
        frame: {
          id: "short_snake_case_frame_id",
          summary: "Chinese event-frame summary",
        },
        concepts: [{
          text: "concept text",
          sourceSpan: "substring from rawIntentText",
          semanticRole: "actor | core_event | manner_quality | object | context | attribute | observer | other",
          relationToEvent: "Chinese relation explanation",
          actionPrimitives: ["filmable action units, optional"],
          observableEvidence: ["visible or audible evidence"],
          creativeUse: ["opening action | conflict source | pain evidence | social signal | open loop"],
        }],
        hookSignals: {
          openingAction: "Chinese filmable opening action",
          conflictSource: "Chinese conflict source",
          painEvidence: ["Chinese evidence beats"],
          socialPressureSignals: ["Chinese social pressure or observer reactions"],
          openLoop: "Chinese open-loop handoff",
        },
        productExposurePolicy: {
          requiredInHook: false,
          risk: "Chinese attribution or clarity risk",
          recommendedTiming: "Chinese timing recommendation",
          saferBridge: "Chinese bridge without forcing sales product exposure",
        },
        groundingNotes: ["Distinguish inferred filmable evidence from product facts."],
      },
    }, null, 2),
  }
}

export async function generateUserIntentExpansion(input: {
  intent: HookOneShotIntent
  intentText: string
  productName: string
  productCategory?: string | null
  config: LlmConfig | null
  call?: (config: LlmConfig, request: Parameters<typeof callLlm>[1]) => Promise<LlmResponse>
}): Promise<UserIntentExpansionResult> {
  if (!input.intentText.trim()) {
    return {
      ok: false,
      source: "empty_input",
      error: "User intent expansion skipped because intentText is empty.",
    }
  }
  if (!input.config?.apiKey || !input.config.model) {
    return {
      ok: false,
      source: "not_configured",
      error: "User intent expansion skipped because LLM is not configured.",
    }
  }

  const prompt = buildUserIntentExpansionPrompt(input)
  let content = ""
  try {
    const response = await (input.call ?? callLlm)(input.config, {
      messages: [
        { role: "system", content: prompt.systemPrompt },
        { role: "user", content: prompt.userPrompt },
      ],
      model: input.config.model,
      temperature: 0.18,
      maxTokens: 1700,
      timeoutMs: 50_000,
      retries: 1,
      retryDelayMs: 1000,
    })
    content = response.content
  } catch (error) {
    return {
      ok: false,
      source: "llm_error",
      error: error instanceof Error ? error.message : "User intent expansion LLM failed.",
    }
  }

  try {
    return {
      ok: true,
      source: "llm",
      expansion: parseUserIntentExpansion(content),
      rawContent: content,
    }
  } catch (error) {
    return {
      ok: false,
      source: "parse_error",
      error: error instanceof Error ? error.message : "User intent expansion parse failed.",
      rawContent: content,
    }
  }
}

export function parseUserIntentExpansion(content: string): UserIntentExpansion {
  const cleaned = content.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim()
  const candidate = extractFirstJsonObject(cleaned)
  return userIntentExpansionSchema.parse(JSON.parse(candidate))
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
