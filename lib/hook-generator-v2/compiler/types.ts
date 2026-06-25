import type { VideoProvider } from "@/lib/video-generation/model-capabilities"
import type { HookNarrativeRole, HookOneShotIntent } from "@/lib/hook-one-shot"
import type { HookCreativeResourceIds } from "@/lib/hook-generator-v2/resources/types"
import type { HookOneShotModelFamily } from "@/lib/hook-generator-v2/graph/types"

export type CompiledHookVideoPrompt = {
  provider: VideoProvider
  modelFamily: HookOneShotModelFamily
  prompt: string
  sections?: {
    globalBaseSetting: string[]
    assetMappings: string[]
    productIdentityLock: string
    userInputContract: string
    userIntentExpansionLine?: string
    hookTask: string
    attentionMechanism?: string
    tensionPlan?: string
    cultureBorrowingLine?: string
    productBridge: string
    visualStyle: string
    voiceAndSoundPolicy: string
    shotTimingLines: string[]
    qualityAndConstraints: string[]
    negativeConstraints: string[]
  }
  negativePrompt?: string
  firstFramePrompt?: string
  inputImages: Array<{
    source: string
    declared_role: string
    user_caption?: string
  }>
  metadata: {
    productName: string
    productCategory: string
    hookMode: HookOneShotIntent
    variantRole: HookNarrativeRole
    resourceIds: HookCreativeResourceIds
  }
}
