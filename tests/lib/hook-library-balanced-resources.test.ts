import { describe, expect, it } from "vitest"

import {
  getHookLibraryCoverage,
  getHookPatternCard,
  listHookGenerationFewShots,
} from "@/lib/hook-library"

const EXPECTED_PATTERN_COUNTS = {
  H1: 46,
  H2: 55,
  H3: 45,
  H4: 48,
  H5: 50,
  H6: 44,
  H7: 43,
}

describe("balanced V1 2026 hook resources", () => {
  it("loads the balanced pattern expansion through the project resource library", () => {
    const coverage = getHookLibraryCoverage()

    expect(coverage.patternCards).toBe(331)
    expect(coverage.hookTypeCounts).toMatchObject(EXPECTED_PATTERN_COUNTS)
    expect(getHookPatternCard("H1_COLOR_COLLISION_BAL_001")).toMatchObject({
      hookType: "H1",
      subType: "color_collision",
    })
    expect(getHookPatternCard("H4_AUDIENCE_SCENE_CALLOUT_BAL_169")).toMatchObject({
      hookType: "H4",
      subType: "audience_scene_callout",
    })
    expect(getHookPatternCard("H7_LOCAL_FLAVOUR_BAL_143")).toMatchObject({
      hookType: "H7",
      subType: "local_flavour",
    })
  })

  it("loads balanced few-shots for every H1-H7 hook type", () => {
    for (const hookType of Object.keys(EXPECTED_PATTERN_COUNTS)) {
      const fewShots = listHookGenerationFewShots({ hookType, size: 20 })

      expect(fewShots.total).toBe(6)
      expect(fewShots.items.every((item) => item.hookType === hookType)).toBe(true)
    }
  })
})
