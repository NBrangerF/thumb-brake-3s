export type VideoProvider = "seedance" | "kling" | "wuyin"
export type VideoModelFamily = "seedance" | "kling" | "sora" | "veo" | "unknown"

export type VideoModelCapability = {
  family: VideoModelFamily
  provider: VideoProvider
  businessModel: string
  providerModel: string
  allowedDurations: number[]
  maxIngredientImages: number | null
  promptLanguage: "english"
  dialogueLanguage: "zh-CN"
  noTextOverlay: boolean
  ingredientMode: boolean
  referenceInputMode: "sora_input_reference" | "veo_ingredients" | "provider_references"
  veoAutoExtend?: {
    totalDurationSeconds: number
    baseDurationSeconds: number
    extensionSeconds: number
  }
}

export type VideoModelValidationInput = {
  videoProvider?: string | null
  videoModel?: string | null
  videoDuration?: number | null
  videoResolution?: string | null
}

function normalize(value: string | null | undefined) {
  return String(value ?? "").trim().toLowerCase()
}

export function isSoraModel(videoModel: string | null | undefined) {
  const model = normalize(videoModel)
  return model === "sora" || model === "sora2" || model.startsWith("sora2") || model.startsWith("sora-2")
}

export function isSora2ProModel(videoModel: string | null | undefined) {
  return isSoraModel(videoModel)
}

export function isVeo31Model(videoModel: string | null | undefined) {
  const model = normalize(videoModel)
  return model === "veo3.1_pro" || model === "veo3.1-pro" || model === "veo-3.1-pro" ||
    model === "veo3.1-pro-4k" || model === "veo-3.1-generate-preview" || model === "veo-3.1-generate-001" ||
    model.startsWith("veo3.1") || model.startsWith("veo-3.1")
}

export function isSoraOrVeoModel(videoModel: string | null | undefined) {
  return isSora2ProModel(videoModel) || isVeo31Model(videoModel)
}

export function resolveVideoModelCapability(input: Pick<VideoModelValidationInput, "videoProvider" | "videoModel">): VideoModelCapability | null {
  if (isSora2ProModel(input.videoModel)) {
    return {
      family: "sora",
      provider: "wuyin",
      businessModel: "sora-2-pro-all",
      providerModel: "sora2-new",
      allowedDurations: [4, 8, 12],
      maxIngredientImages: null,
      promptLanguage: "english",
      dialogueLanguage: "zh-CN",
      noTextOverlay: true,
      ingredientMode: false,
      referenceInputMode: "sora_input_reference",
    }
  }

  if (isVeo31Model(input.videoModel)) {
    return {
      family: "veo",
      provider: "wuyin",
      businessModel: "veo3.1-pro-4k",
      providerModel: "veo3.1-pro-4k",
      allowedDurations: [8, 15],
      maxIngredientImages: 3,
      promptLanguage: "english",
      dialogueLanguage: "zh-CN",
      noTextOverlay: true,
      ingredientMode: true,
      referenceInputMode: "veo_ingredients",
      veoAutoExtend: {
        totalDurationSeconds: 15,
        baseDurationSeconds: 8,
        extensionSeconds: 7,
      },
    }
  }

  return null
}

export function validateVideoModelCapability(input: VideoModelValidationInput): string | null {
  const capability = resolveVideoModelCapability(input)
  if (!capability) return null
  if (typeof input.videoDuration !== "number" || !Number.isFinite(input.videoDuration)) {
    return "videoDuration 参数不合法"
  }
  if (!capability.allowedDurations.includes(input.videoDuration)) {
    return `${capability.businessModel} 仅支持 ${capability.allowedDurations.join(" / ")} 秒`
  }
  return null
}

export function videoModelManifest(capability: VideoModelCapability, durationSeconds: number) {
  const autoExtend = capability.family === "veo" && durationSeconds === capability.veoAutoExtend?.totalDurationSeconds
    ? {
        enabled: true,
        base_duration_seconds: capability.veoAutoExtend.baseDurationSeconds,
        extension_seconds: capability.veoAutoExtend.extensionSeconds,
        prompt_parts: ["initial_0_8s", "extend_8_15s"],
      }
    : { enabled: false }

  return {
    family: capability.family,
    provider: capability.provider,
    business_model: capability.businessModel,
    provider_model: capability.providerModel,
    prompt_language: capability.promptLanguage,
    dialogue_language: capability.dialogueLanguage,
    no_text_overlay: capability.noTextOverlay,
    ingredient_mode: capability.ingredientMode,
    reference_input_mode: capability.referenceInputMode,
    max_ingredient_images: capability.maxIngredientImages,
    allowed_durations_seconds: capability.allowedDurations,
    requested_duration_seconds: durationSeconds,
    veo_auto_extend: autoExtend,
  }
}
