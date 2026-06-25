import type { HookProductBrief } from "@/lib/hook-generator"
import type { HookNarrativeRole, HookOneShotIntent } from "@/lib/hook-one-shot"
import type { HookRecommendationCard } from "@/lib/hook-library"
import type { HookCreativeResourceBundle } from "@/lib/hook-generator-v2/resources/types"
import type { UserIntentExpansion } from "@/lib/hook-generator-v2/intent-expansion/user-intent-expansion"

import type { ScriptCreativeSpec } from "./types"

export function buildScriptCreativeSpec(input: {
  productBrief: HookProductBrief
  resourceBundle: HookCreativeResourceBundle
  intent: HookOneShotIntent
  intentText: string
  userIntentExpansion?: UserIntentExpansion | null
  variantRole: HookNarrativeRole
  selectedHook: HookRecommendationCard
  durationSeconds: number
}): ScriptCreativeSpec {
  const contract = input.resourceBundle.productContract
  const attention = input.resourceBundle.attentionMicroPattern
  const bridge = input.resourceBundle.bridgeCandidates[0]
  const event = input.resourceBundle.eventCandidates[0]
  const proof = input.resourceBundle.proofCandidates[0]
  const culture = input.resourceBundle.cultureMotif
  const shortPainHook = input.intent === "pain_first" && input.durationSeconds <= 4
  const attentionFirstProductRule = "用户上传的商品图是身份参考，不代表商品必须在 hook 内露出；如果不露出商品更能形成有意义的停滑，可以把商品留到 hook 之后再进入。"

  return {
    task: "generate_hook_script_asset",
    duration: input.durationSeconds,
    platform: "short_video_feed",
    productLock: {
      productName: contract.productName,
      category: contract.productCategory,
      inferredSubCategory: contract.inferredSubCategory,
      mustShowSignals: contract.visualAnchors,
      usageSignals: contract.usageAnchors,
      forbiddenConfusions: contract.forbiddenVisualConfusions,
      allowedProductActions: contract.allowedProductActions,
    },
    intentContract: {
      intentType: input.intent,
      userIntentText: input.intentText,
      variantRole: input.variantRole,
      creativeHypothesis: [
        `用户意图「${input.intentText}」要变成可见开场动作，而不是字幕解释。`,
        input.userIntentExpansion ? conciseExpansionHypothesis(input.userIntentExpansion) : null,
        `变体角色是 ${input.variantRole}，使用 ${input.selectedHook.hookType} / ${attention.name} 作为停滑机制。`,
        event ? `第一秒事件优先考虑：${event.name}。` : null,
        bridge ? `商品承接优先角色：${bridge.name}。` : null,
        proof ? `卖点证明优先方式：${proof.abstractClaim}。` : null,
        culture ? `文化母题必须进入动作链：${culture.name}。` : null,
      ].filter(Boolean).join(" "),
      ...(input.userIntentExpansion ? { userIntentExpansion: input.userIntentExpansion } : {}),
    },
    resourceIds: input.resourceBundle.resourceIds,
    hardRules: [
      ...input.resourceBundle.constraints
        .filter((rule) => rule.severity === "hard")
        .map((rule) => rule.rule),
      "用户中文意图必须进入开场动作、人物动机、冲突来源或后续承接线索，不能只复制成一句文案。",
      "timelineShots.action 必须是可拍摄的主体动作，不能写展示痛点、呈现卖点、体现高级感。",
      "如果商品在 hook 内出现，必须通过 Product Bridge role 改变前一个动作走向，不能硬切 packshot。",
    ],
    softRules: [
      attentionFirstProductRule,
      "4 秒 hook 的首要目标是停滑、3 秒留存和继续观看欲望；商品可以作为答案、证据或线索，也可以完全不在本段出现。",
      ...(shortPainHook ? [
      "痛点证据后一拍如果直接承接销售商品正面露出，可能让观众误解商品是导致问题的用品。",
      "由 LLM 根据具体镜头判断是否延后销售商品清晰露出；短痛点 hook 可以先保留痛点证据、人物反应、旧用品或开环动作，不强制在 4 秒内露出商品。",
      ] : []),
    ],
  }
}

function conciseExpansionHypothesis(expansion: UserIntentExpansion) {
  const evidence = expansion.hookSignals.painEvidence.slice(0, 3).join("、")
  return [
    `用户输入语义拆解：${expansion.frame.summary}`,
    expansion.hookSignals.openingAction ? `开场动作=${expansion.hookSignals.openingAction}` : null,
    expansion.hookSignals.conflictSource ? `冲突来源=${expansion.hookSignals.conflictSource}` : null,
    evidence ? `可拍证据=${evidence}` : null,
    expansion.hookSignals.openLoop ? `开环线索=${expansion.hookSignals.openLoop}` : null,
  ].filter(Boolean).join("；")
}
