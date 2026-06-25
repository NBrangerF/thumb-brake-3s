import type { LlmConfig } from "@/lib/llm-config"

export type LlmMessage = {
  role: "system" | "user" | "assistant"
  content: string
}

export type LlmResponse = {
  content: string
  model: string
  tokensUsed: number | null
}

export type CallLlmInput = {
  config: LlmConfig
  messages: LlmMessage[]
  model?: string
  temperature?: number
  maxTokens?: number
  timeoutMs?: number
  retries?: number
  retryDelayMs?: number
}

export type LlmRequest = Omit<CallLlmInput, "config">

function endpointFor(config: LlmConfig) {
  return `${config.baseUrl.replace(/\/$/, "")}/chat/completions`
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function callOnce(input: CallLlmInput): Promise<LlmResponse> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), input.timeoutMs ?? 90_000)
  try {
    const response = await fetch(endpointFor(input.config), {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${input.config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: input.model ?? input.config.model,
        messages: input.messages,
        temperature: input.temperature ?? 0.7,
        max_tokens: input.maxTokens ?? 2000,
      }),
      signal: controller.signal,
    })
    const payload = await response.json().catch(() => ({})) as Record<string, unknown>
    if (!response.ok) {
      const error = typeof payload.error === "object" && payload.error
        ? JSON.stringify(payload.error)
        : JSON.stringify(payload)
      throw new Error(`LLM request failed (${response.status}): ${error}`)
    }
    const choices = Array.isArray(payload.choices) ? payload.choices : []
    const first = choices[0] as Record<string, unknown> | undefined
    const message = first?.message as Record<string, unknown> | undefined
    const usage = payload.usage as Record<string, unknown> | undefined
    const content = String(message?.content ?? "").trim()
    if (!content) throw new Error("LLM returned empty content")
    return {
      content,
      model: String(payload.model ?? input.model ?? input.config.model),
      tokensUsed: typeof usage?.total_tokens === "number" ? usage.total_tokens : null,
    }
  } finally {
    clearTimeout(timeout)
  }
}

export function callLlm(input: CallLlmInput): Promise<LlmResponse>
export function callLlm(config: LlmConfig, request: LlmRequest): Promise<LlmResponse>
export async function callLlm(
  first: CallLlmInput | LlmConfig,
  second?: LlmRequest,
): Promise<LlmResponse> {
  const input: CallLlmInput = second
    ? { ...second, config: first as LlmConfig }
    : first as CallLlmInput
  const retries = Math.max(0, input.retries ?? 0)
  let lastError: unknown
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await callOnce(input)
    } catch (error) {
      lastError = error
      if (attempt < retries) await sleep(input.retryDelayMs ?? 1000)
    }
  }
  throw lastError
}
