import { describe, expect, it } from "vitest"

import {
  CULTURE_MOTIFS,
  MOTIF_SHOT_PRIMITIVES,
  PRODUCT_FIT_POLICIES,
  VISUAL_RENDER_PROFILES,
  rankCultureMotifs,
  selectCultureMotifBorrowing,
} from "@/lib/culture-motif-resources"

describe("culture motif system", () => {
  it("exposes a four-layer motif library with high-quality audited motif count", () => {
    expect(CULTURE_MOTIFS.length).toBeGreaterThanOrEqual(20)
    expect(CULTURE_MOTIFS.length).toBeLessThanOrEqual(30)

    for (const motif of CULTURE_MOTIFS) {
      expect(motif.cultureMotifId).toMatch(/^[A-Z0-9_]+$/)
      expect(motif.motifName).toBeTruthy()
      expect(motif.actionLogic).toBeTruthy()
      expect(motif.viewerStopReason).toBeTruthy()
      expect(motif.productBridgeRole).toBeTruthy()
      expect(motif.forbiddenShallowUse.join(" ")).toContain("不能只把文化当背景")

      const profiles = VISUAL_RENDER_PROFILES.filter((profile) => profile.cultureMotifId === motif.cultureMotifId)
      const shots = MOTIF_SHOT_PRIMITIVES.filter((shot) => shot.cultureMotifId === motif.cultureMotifId)
      const fit = PRODUCT_FIT_POLICIES.find((policy) => policy.cultureMotifId === motif.cultureMotifId)

      expect(profiles.length).toBeGreaterThanOrEqual(1)
      expect(profiles.length).toBeLessThanOrEqual(4)
      for (const profile of profiles) {
        expect(profile.palette).toBeTruthy()
        expect(profile.lighting).toBeTruthy()
        expect(profile.cameraGrammar).toBeTruthy()
        expect(profile.setDressing).toBeTruthy()
        expect(profile.texture).toBeTruthy()
        expect(profile.negativeStyle).toBeTruthy()
      }
      expect(shots.length).toBeGreaterThanOrEqual(3)
      expect(shots.some((shot) => shot.shotRole === "opening_action")).toBe(true)
      expect(shots.some((shot) => shot.shotRole === "tension_action")).toBe(true)
      expect(shots.some((shot) => shot.shotRole === "product_bridge_action")).toBe(true)
      for (const shot of shots) {
        expect(shot.action).toBeTruthy()
        expect(shot.audio).toBeTruthy()
        expect(shot.timeRange).toMatch(/s$/)
      }
      expect(fit).toBeTruthy()
      expect([
        ...fit!.exactCategoryIds,
        ...fit!.adjacentCategoryIds,
        ...fit!.fallbackCategoryIds,
      ].length).toBeGreaterThan(0)
    }
  })

  it("replays the toothpaste case with task evidence family motifs ahead of honglou garden detail", () => {
    const ranked = rankCultureMotifs({
      productCategory: "toothpaste",
      intent: "creative_first",
      hookScope: "product_related",
      selectedHook: {
        hookType: "H7",
        hookTypeLabel: "文化借势",
        displayName: "睡前刷牙像闯关",
        reason: "孩子不爱刷牙，任务卡让动作继续",
        exampleStructure: "孩子停住，牙膏作为任务道具入场",
      },
      nonce: "toothpaste-regression",
      recentTemplateIds: ["motif_garden_detail_reveal", "GARDEN_DETAIL_REVEAL"],
    })

    const topIds = ranked.slice(0, 5).map((item) => item.motif.cultureMotifId)
    expect(topIds).toEqual(expect.arrayContaining([
      "QUEST_BREAKTHROUGH",
      "PARENT_CHILD_RITUAL",
      "GAME_TASK_CARD",
      "FAIL_RESTART_LOOP",
      "TRIAL_EVIDENCE_TABLE",
    ]))
    expect(topIds).not.toContain("GARDEN_DETAIL_REVEAL")
    expect(ranked[0].score).toBeLessThan(0.99)
  })

  it("compiles selected culture borrowing with explicit motif profile primitives and selection trace", () => {
    const selected = selectCultureMotifBorrowing({
      productCategory: "牙膏",
      intent: "creative_first",
      hookScope: "product_related",
      selectedHook: {
        hookType: "H7",
        displayName: "孩子刷牙闯关",
        reason: "孩子不爱刷牙，任务卡和牙膏让动作继续",
      },
      nonce: "selected-toothpaste",
      recentTemplateIds: ["GARDEN_DETAIL_REVEAL", "motif_garden_detail_reveal"],
    }, () => 0)

    expect(selected).toBeTruthy()
    expect(selected?.cultureMotifId).toBeTruthy()
    expect(selected?.visualRenderProfileId).toBeTruthy()
    expect(selected?.shotPrimitiveIds?.length).toBeGreaterThanOrEqual(3)
    expect(selected?.whySelected?.join(" ")).toMatch(/精确类目匹配:oral_care/)
    expect(selected?.finalVideoPromptFormulaCn).toContain(`cultureMotifId=${selected?.cultureMotifId}`)
    expect(selected?.finalVideoPromptFormulaCn).toContain(`visualRenderProfileId=${selected?.visualRenderProfileId}`)
    expect(selected?.fusionDirectives.join(" ")).toContain("不能只写文化风格")
  })
})
