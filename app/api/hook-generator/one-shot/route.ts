import { NextResponse } from "next/server"
import { z } from "zod"

import { runHookOneShotGraph } from "@/lib/hook-generator-v2/graph/run-hook-one-shot-graph"
import type { HookOneShotRequest } from "@/lib/hook-generator-v2/graph/types"

export const dynamic = "force-dynamic"

const requestSchema = z.object({
  productImage: z.string().trim().optional().default(""),
  productTitle: z.string().trim().min(1).max(160),
  intent: z.enum(["audience_first", "pain_first", "creative_first", "offer_first"]),
  intentText: z.string().trim().max(500).optional().default(""),
  analysisHints: z.object({
    productCategory: z.string().trim().max(160).optional().nullable(),
    coreSellingPoints: z.array(z.string()).optional(),
    targetAudience: z.array(z.string()).optional(),
    painPoints: z.array(z.string()).optional(),
    visualFacts: z.array(z.string()).optional(),
    proofPoints: z.array(z.string()).optional(),
  }).optional(),
  videoDuration: z.number().int().min(4).max(9).optional(),
  videoRatio: z.enum(["9:16", "16:9"]).optional(),
  generateAudio: z.boolean().optional(),
})

function jsonError(error: string, code: string, status: number) {
  return NextResponse.json({ error, code }, { status })
}

function defaultIntentText() {
  return "基于商品理解自动选择切入角度"
}

export async function POST(request: Request) {
  let rawBody: unknown
  try {
    rawBody = await request.json()
  } catch {
    return jsonError("请求体格式错误", "INVALID_JSON", 400)
  }

  const parsed = requestSchema.safeParse(rawBody)
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "参数不合法", "INVALID_PARAMS", 400)
  }

  const input: HookOneShotRequest = {
    ...parsed.data,
    intentText: parsed.data.intentText.trim() || defaultIntentText(),
  }
  const result = await runHookOneShotGraph({ input })
  if (!result.ok) {
    return NextResponse.json({
      error: result.error,
      code: result.code,
      ...(result.details ?? {}),
    }, { status: result.status })
  }

  return NextResponse.json(
    {
      batchId: result.batchId,
      runs: result.runs.map((run) => ({
        clientVideoId: run.clientVideoId,
        status: run.status,
        currentStage: run.currentStage,
        progress: run.progress,
        card: run.card,
        script: run.script,
        selectedHook: run.selectedHook,
        selectedCultureBorrowing: run.selectedCultureBorrowing,
        futureVideoPrompt: run.futureVideoPrompt,
        firstFramePrompt: run.firstFramePrompt,
        source: run.source,
      })),
      trace: result.traceDraft,
    },
    { headers: { "Cache-Control": "no-store" } },
  )
}
