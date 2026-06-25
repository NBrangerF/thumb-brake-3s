import { describe, expect, it } from "vitest"

import {
  buildUserIntentExpansionPrompt,
  generateUserIntentExpansion,
} from "@/lib/hook-generator-v2/intent-expansion/user-intent-expansion"

const config = {
  apiKey: "test-key",
  baseUrl: "https://llm.example.com",
  model: "test-model",
  visionModel: "test-vision",
  apiFormat: "auto" as const,
}

describe("user intent semantic expansion", () => {
  it("builds an LLM prompt that asks for semantic roles, observable evidence, and product exposure policy", () => {
    const prompt = buildUserIntentExpansionPrompt({
      intent: "pain_first",
      intentText: "青少年刷牙敷衍",
      productName: "小杨同学青少年牙膏",
      productCategory: "toothpaste",
    })

    expect(prompt.systemPrompt).toContain("frame semantics")
    expect(prompt.systemPrompt).toContain("semantic roles")
    expect(prompt.userPrompt).toContain("青少年刷牙敷衍")
    expect(prompt.userPrompt).toContain("敷衍")
    expect(prompt.userPrompt).toContain("observableEvidence")
    expect(prompt.userPrompt).toContain("sourceSpan")
    expect(prompt.userPrompt).toContain("productExposurePolicy")
  })

  it("parses structured LLM output without turning inferred evidence into product facts", async () => {
    const result = await generateUserIntentExpansion({
      intent: "pain_first",
      intentText: "青少年刷牙敷衍",
      productName: "小杨同学青少年牙膏",
      productCategory: "toothpaste",
      config,
      call: async () => ({
        model: "test-model",
        tokensUsed: null,
        content: JSON.stringify({
          rawInput: "青少年刷牙敷衍",
          frame: {
            id: "daily_routine_low_effort",
            summary: "青少年在刷牙这个日常动作中投入过低，被家长或镜头发现。",
          },
          concepts: [
            {
              text: "青少年",
              sourceSpan: "青少年",
              semanticRole: "actor",
              relationToEvent: "执行刷牙动作的人",
              observableEvidence: ["站在浴室镜前", "被家长看见"],
              creativeUse: ["被观察对象"],
            },
            {
              text: "刷牙",
              sourceSpan: "刷牙",
              semanticRole: "core_event",
              relationToEvent: "被敷衍修饰的动作",
              actionPrimitives: ["牙刷进嘴", "刷两下就停"],
              observableEvidence: ["水声很快停止", "牙刷泡沫少"],
              creativeUse: ["痛点证据镜头"],
            },
            {
              text: "敷衍",
              sourceSpan: "敷衍",
              semanticRole: "manner_quality",
              relationToEvent: "修饰刷牙动作的低投入方式",
              observableEvidence: ["刷两下就拿出牙刷", "没刷到后牙", "牙齿仍有色差"],
              creativeUse: ["冲突来源", "开环证据"],
            },
          ],
          hookSignals: {
            openingAction: "妈妈听到水声突然停，站在浴室门口皱眉看镜头。",
            conflictSource: "孩子不是没刷，而是刷得像没刷。",
            painEvidence: ["刷两下就停", "牙刷泡沫少", "牙齿仍有色差"],
            socialPressureSignals: ["妈妈直视镜头，像在点名观众"],
            openLoop: "妈妈把旧牙刷拿开，手停在洗手台边缘准备换方法。",
          },
          productExposurePolicy: {
            requiredInHook: false,
            risk: "痛点证据后直接露销售商品，可能让观众误解商品导致问题。",
            recommendedTiming: "钩子之后或明确解决方案转折之后。",
            saferBridge: "旧牙刷、妈妈反应、换方法的手部开环。",
          },
          groundingNotes: ["泡沫少是从敷衍刷牙推断出的可拍证据，不是商品卖点。"],
        }),
      }),
    })

    if (!result.ok) throw new Error(result.error)
    expect(result.expansion.concepts.find((concept) => concept.text === "敷衍")).toMatchObject({
      semanticRole: "manner_quality",
      relationToEvent: expect.stringContaining("刷牙"),
    })
    expect(result.expansion.hookSignals.painEvidence).toContain("刷两下就停")
    expect(result.expansion.productExposurePolicy.requiredInHook).toBe(false)
    expect(result.expansion.groundingNotes.join("\n")).toContain("不是商品卖点")
  })
})
