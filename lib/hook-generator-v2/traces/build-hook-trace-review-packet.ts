export type HookTraceReviewRow = {
  id: string
  requestId: string
  batchId: string
  clientVideoId: string
  videoRunId: string | null
  variantRole: string
  selectedHookId: string
  selectedHookType: string
  selectedCultureBorrowingId: string | null
  selectedCultureBorrowingName: string | null
  scriptSource: string
  videoProvider: string
  videoModel: string
  traceJson: Record<string, unknown> | string
  createdAt: Date | string
}

export type HookTraceReviewPacket = {
  generatedAt: string
  selector: Record<string, string>
  count: number
  batchId: string | null
  variants: Array<{
    id: string
    clientVideoId: string
    videoRunId: string | null
    role: string
    hook: {
      id: string
      type: string
      displayName: string | null
    }
    culture: {
      templateId: string | null
      name: string | null
      symbolEntryIds: string[]
      symbolBorrowing: unknown
    }
    resources: {
      ids: unknown
      libraryRefs: unknown
    }
    prompts: {
      currentFinalPrompt: string | null
      assetCompilerShadowPrompt: string | null
      assetCompilerShadowSections: unknown
      scriptAssetSource: string | null
      promptCompilerMode: string | null
      evaluatorRewriteApplied: unknown
      evaluatorRewriteHistory: unknown
    }
    nativeAssetShadow: {
      hookSummary: string | null
      tensionPlan: unknown
      cultureFusionMechanism: unknown
      timelineShots: unknown
      error: string | null
      rawSnippet: string | null
    }
    evaluator: unknown
    videoJob: unknown
    createdAt: string
  }>
}

export function buildHookTraceReviewPacket(
  rows: HookTraceReviewRow[],
  selector: Record<string, string>,
): HookTraceReviewPacket {
  return {
    generatedAt: new Date().toISOString(),
    selector,
    count: rows.length,
    batchId: rows[0]?.batchId ?? null,
    variants: rows.map((row) => {
      const traceJson = parseTraceJson(row.traceJson)
      const selectedHook = objectValue(traceJson.selectedHook)
      const selectedCultureBorrowing = objectValue(traceJson.selectedCultureBorrowing)
      const nativeAsset = objectValue(traceJson.nativeScriptAssetShadow)
      return {
        id: row.id,
        clientVideoId: row.clientVideoId,
        videoRunId: row.videoRunId,
        role: row.variantRole,
        hook: {
          id: row.selectedHookId,
          type: row.selectedHookType,
          displayName: stringValue(selectedHook.displayName),
        },
        culture: {
          templateId: row.selectedCultureBorrowingId,
          name: row.selectedCultureBorrowingName,
          symbolEntryIds: arrayValue(selectedCultureBorrowing.symbolEntryIds),
          symbolBorrowing: selectedCultureBorrowing.symbolBorrowing ?? null,
        },
        resources: {
          ids: traceJson.resourceBundleIds ?? null,
          libraryRefs: traceJson.resourceLibraryRefs ?? null,
        },
        prompts: {
          currentFinalPrompt: stringValue(traceJson.currentFinalPrompt),
          assetCompilerShadowPrompt: stringValue(traceJson.assetCompilerShadowPrompt),
          assetCompilerShadowSections: traceJson.assetCompilerShadowSections ?? null,
          scriptAssetSource: stringValue(traceJson.scriptAssetSource),
          promptCompilerMode: stringValue(traceJson.promptCompilerMode),
          evaluatorRewriteApplied: traceJson.evaluatorRewriteApplied ?? null,
          evaluatorRewriteHistory: traceJson.evaluatorRewriteHistory ?? [],
        },
        nativeAssetShadow: {
          hookSummary: stringValue(nativeAsset.hookSummary),
          tensionPlan: nativeAsset.tensionPlan ?? null,
          cultureFusionMechanism: nativeAsset.cultureFusionMechanism ?? null,
          timelineShots: nativeAsset.timelineShots ?? null,
          error: stringValue(traceJson.nativeScriptAssetShadowError),
          rawSnippet: stringValue(traceJson.nativeScriptAssetShadowRawSnippet),
        },
        evaluator: traceJson.evaluatorScores ?? null,
        videoJob: traceJson.videoJob ?? null,
        createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
      }
    }),
  }
}

function parseTraceJson(value: HookTraceReviewRow["traceJson"]): Record<string, unknown> {
  if (typeof value !== "string") return value
  try {
    const parsed = JSON.parse(value)
    return objectValue(parsed)
  } catch {
    return {}
  }
}

function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {}
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null
}

function arrayValue(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []
}
