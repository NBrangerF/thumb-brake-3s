export type LlmConfig = {
  provider?: "openai-compatible"
  apiKey: string
  baseUrl: string
  model: string
  visionModel?: string
  apiFormat: "openai" | "auto"
}

export async function getSystemLlmConfig(): Promise<LlmConfig> {
  return {
    provider: "openai-compatible",
    apiKey: process.env.LLM_API_KEY ?? "",
    baseUrl: process.env.LLM_BASE_URL ?? "",
    model: process.env.LLM_MODEL ?? "",
    visionModel: process.env.LLM_VISION_MODEL,
    apiFormat: "openai",
  }
}

export function isLlmConfigured(config: Pick<LlmConfig, "apiKey" | "baseUrl" | "model"> | null | undefined) {
  return Boolean(config?.apiKey?.trim() && config?.baseUrl?.trim() && config?.model?.trim())
}
