import { beforeEach, describe, expect, it, vi } from "vitest"

const runHookOneShotGraph = vi.fn()

vi.mock("@/lib/hook-generator-v2/graph/run-hook-one-shot-graph", () => ({
  runHookOneShotGraph,
}))

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/hook-generator/one-shot", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

describe("POST /api/hook-generator/one-shot", () => {
  beforeEach(() => {
    runHookOneShotGraph.mockReset()
  })

  it("returns LLM setup errors from the one-shot graph", async () => {
    runHookOneShotGraph.mockResolvedValue({
      ok: false,
      error: "LLM configuration is required.",
      code: "LLM_CONFIG_REQUIRED",
      status: 503,
      details: {
        missingEnvVars: ["LLM_API_KEY"],
        setupHint: "Copy .env.example to .env.local and configure an OpenAI-compatible chat completions endpoint.",
      },
    })

    const { POST } = await import("@/app/api/hook-generator/one-shot/route")
    const response = await POST(jsonRequest({
      productTitle: "儿童低泡牙膏",
      intent: "pain_first",
      intentText: "小孩不爱刷牙",
    }))
    const payload = await response.json()

    expect(response.status).toBe(503)
    expect(payload).toMatchObject({
      code: "LLM_CONFIG_REQUIRED",
      error: "LLM configuration is required.",
      missingEnvVars: ["LLM_API_KEY"],
    })
  })

  it("rejects invalid request bodies before running generation", async () => {
    const { POST } = await import("@/app/api/hook-generator/one-shot/route")
    const response = await POST(jsonRequest({
      productTitle: "",
      intent: "pain_first",
    }))
    const payload = await response.json()

    expect(response.status).toBe(400)
    expect(payload.code).toBe("INVALID_PARAMS")
    expect(runHookOneShotGraph).not.toHaveBeenCalled()
  })
})
