import { beforeEach, describe, expect, it, vi } from "vitest"

const getSystemLlmConfig = vi.fn()
const isLlmConfigured = vi.fn()
const generateHookScriptWithLlm = vi.fn()
const generateUserIntentExpansion = vi.fn()

vi.mock("@/lib/llm-config", () => ({
  getSystemLlmConfig,
  isLlmConfigured,
}))

vi.mock("@/lib/hook-generator", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/hook-generator")>()
  return {
    ...actual,
    generateHookScriptWithLlm,
  }
})

vi.mock("@/lib/hook-generator-v2/intent-expansion/user-intent-expansion", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/hook-generator-v2/intent-expansion/user-intent-expansion")>()
  return {
    ...actual,
    generateUserIntentExpansion,
  }
})

describe("runHookOneShotGraph", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    getSystemLlmConfig.mockResolvedValue({
      apiKey: "test-key",
      baseUrl: "https://llm.example.com/v1",
      model: "test-model",
      visionModel: "test",
      apiFormat: "auto",
    })
    isLlmConfigured.mockReturnValue(true)
    generateUserIntentExpansion.mockResolvedValue({
      ok: false,
      error: "semantic expansion skipped in unit test",
    })
    generateHookScriptWithLlm.mockImplementation(async (input) => {
      const productName = input.product.productName
      const productCategory = input.product.productCategory ?? "商品"
      return {
      hookSummary: `第一秒用异常动作抓住${productName}的注意力。`,
      visualDescription: `真实生活场景里，用户动作突然停住，视线落到${productName}相关线索上。`,
      visualStyle: "写实手机 UGC，竖屏自然光，轻微手持感。",
      script: `等一下，${productName}的问题线索在这一步。`,
      soundDesign: "水声突然停住，轻微提示音，口播短促。",
      textOverlay: [`${productName}线索`, "先看这个动作", "换个方法"],
      shotTiming: [
        {
          timeRange: "0-1 秒",
          visual: `真实使用场景中，用户刚接触${productName}相关道具就停住。`,
          script: "等一下。",
          textOverlay: `${productName}线索`,
        },
        {
          timeRange: "1-2.5 秒",
          visual: `镜头推近${productName}的使用环境，露出一个具体可见的矛盾点。`,
          script: "不是没用，是用法里有一个小问题。",
          textOverlay: "先看这个动作",
        },
        {
          timeRange: "2.5-5 秒",
          visual: `手把${productName}推到画面边缘，留下换方法的动作开环。`,
          script: "下一步换个更顺手的方法。",
          textOverlay: "下一秒换方法",
        },
      ],
      productBridge: `用可见问题证据承接到${productName}的${productCategory}解决线索。`,
      videoPrompt: `${productName}真实使用场景里的短视频 hook。`,
      firstFramePrompt: `Realistic UGC first frame featuring ${productName} in context.`,
      generationRecommendation: {
        preferredPath: "direct_video",
        reason: "动作链清晰，适合直接生成短视频 prompt。",
        availablePaths: ["direct_video", "first_frame"],
      },
    }
    })
  })

  it("requires LLM configuration before creating hook runs", async () => {
    getSystemLlmConfig.mockResolvedValue({
      apiKey: "",
      baseUrl: "",
      model: "",
      visionModel: "",
      apiFormat: "auto",
    })
    isLlmConfigured.mockReturnValue(false)

    const { runHookOneShotGraph } = await import("@/lib/hook-generator-v2/graph/run-hook-one-shot-graph")
    const result = await runHookOneShotGraph({
      input: {
        productImage: "",
        productTitle: "儿童低泡牙膏",
        intent: "pain_first",
        intentText: "小孩儿不爱刷牙",
      },
    })

    expect(result.ok).toBe(false)
    if (result.ok) throw new Error("Expected missing LLM config to fail")
    expect(result.code).toBe("LLM_CONFIG_REQUIRED")
    expect(result.status).toBe(503)
    expect(result.details?.missingEnvVars).toEqual([
      "LLM_BASE_URL",
      "LLM_API_KEY",
      "LLM_MODEL",
    ])
    expect(generateHookScriptWithLlm).not.toHaveBeenCalled()
  })

  it("reports each missing LLM environment variable", async () => {
    const { runHookOneShotGraph } = await import("@/lib/hook-generator-v2/graph/run-hook-one-shot-graph")

    for (const missingKey of ["LLM_BASE_URL", "LLM_API_KEY", "LLM_MODEL"]) {
      getSystemLlmConfig.mockResolvedValue({
        apiKey: missingKey === "LLM_API_KEY" ? "" : "test-key",
        baseUrl: missingKey === "LLM_BASE_URL" ? "" : "https://llm.example.com/v1",
        model: missingKey === "LLM_MODEL" ? "" : "test-model",
        visionModel: "",
        apiFormat: "auto",
      })
      isLlmConfigured.mockReturnValue(false)

      const result = await runHookOneShotGraph({
        input: {
          productImage: "",
          productTitle: "儿童低泡牙膏",
          intent: "pain_first",
          intentText: "小孩儿不爱刷牙",
        },
      })

      expect(result.ok).toBe(false)
      if (result.ok) throw new Error("Expected missing LLM config to fail")
      expect(result.code).toBe("LLM_CONFIG_REQUIRED")
      expect(result.details?.missingEnvVars).toEqual([missingKey])
    }
  })

  it("creates three LLM script-only hook runs without video submission fields", async () => {
    const { runHookOneShotGraph } = await import("@/lib/hook-generator-v2/graph/run-hook-one-shot-graph")
    const result = await runHookOneShotGraph({
      input: {
        productImage: "https://oss.example.com/toothpaste.png",
        productTitle: "儿童低泡牙膏",
        intent: "pain_first",
        intentText: "小孩儿不爱刷牙",
        analysisHints: {
          productCategory: "toothpaste",
          coreSellingPoints: ["低泡不辣口"],
          targetAudience: ["亲子家庭"],
          painPoints: ["孩子刷牙敷衍"],
          visualFacts: ["牙膏软管", "浴室镜前"],
          proofPoints: ["孩子愿意试一下"],
        },
        videoDuration: 5,
        videoRatio: "9:16",
      },
    })

    expect(result.ok).toBe(true)
    if (!result.ok) throw new Error(result.error)
    expect(result.runs).toHaveLength(3)
    expect(result.traceDraft?.variants).toHaveLength(3)
    expect(result.state.trace).toHaveLength(3)
    for (const run of result.runs) {
      expect(run.status).toBe("completed")
      expect(run.currentStage).toBe("script_ready")
      expect(run.progress).toBe(100)
      expect(run.card.title).toBeTruthy()
      expect(run.script.hookSummary).toBeTruthy()
      expect(run.script.shotTiming.length).toBeGreaterThan(0)
      expect(run.futureVideoPrompt).toBeTruthy()
      expect(run.source).toBe("llm")
      expect("runId" in run).toBe(false)
    }
    expect(generateHookScriptWithLlm).toHaveBeenCalledTimes(3)
  })

  it("accepts an empty product image because v1 generates scripts only", async () => {
    const { runHookOneShotGraph } = await import("@/lib/hook-generator-v2/graph/run-hook-one-shot-graph")
    const result = await runHookOneShotGraph({
      input: {
        productImage: "",
        productTitle: "便携收纳盒",
        intent: "audience_first",
        intentText: "租房党桌面太乱",
      },
    })

    expect(result.ok).toBe(true)
    if (!result.ok) throw new Error(result.error)
    expect(result.state.productBrief.productImage).toContain("fantastic-hook-product-reference")
  })
})
