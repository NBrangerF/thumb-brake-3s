"use client"

import { type ChangeEvent, useMemo, useState } from "react"
import {
  AlertCircle,
  BadgePercent,
  CheckCircle2,
  ChevronDown,
  Clipboard,
  Clock3,
  Film,
  ImagePlus,
  Loader2,
  MessageCircleQuestion,
  SlidersHorizontal,
  Sparkles,
  Tag,
  Upload,
  Users,
  Wand2,
  X,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"

type HookIntent = "pain_first" | "audience_first" | "creative_first" | "offer_first"

type HookScriptTiming = {
  timeRange: string
  visual: string
  script?: string
  textOverlay?: string
}

type HookScriptResult = {
  hookSummary: string
  visualDescription: string
  visualStyle: string
  script: string
  soundDesign: string
  textOverlay: string[]
  shotTiming: HookScriptTiming[]
  productBridge: string
  videoPrompt: string
  firstFramePrompt: string
}

type OneShotResponse = {
  batchId?: string
  runs?: Array<{
    clientVideoId: string
    status: string
    card: {
      title: string
      description: string
      strategyLabel: string
      summary?: string
      hookMechanism?: string
    }
    script: HookScriptResult
    selectedHook?: {
      hookType?: string
      subTypeLabel?: string
      displayName?: string
      reason?: string
      productBridgeRule?: string
    }
    selectedCultureBorrowing?: {
      nameCn?: string
      productBridgeRule?: string
      fusionDirectives?: string[]
    } | null
    futureVideoPrompt?: string
    firstFramePrompt?: string
    source?: "llm" | "fallback"
  }>
  error?: string
  message?: string
  code?: string
}

type AnalysisHints = {
  productCategory: string
}

const intentOptions: Array<{
  id: HookIntent
  label: string
  description: string
  placeholder: string
  icon: LucideIcon
}> = [
  {
    id: "pain_first",
    label: "痛点",
    description: "先戳中用户正在忍的小麻烦",
    placeholder: "例如：小孩不爱刷牙、厨房油污总擦不干净、健身坚持不了三天。",
    icon: MessageCircleQuestion,
  },
  {
    id: "audience_first",
    label: "人群",
    description: "先让目标用户感觉这条就是给他看",
    placeholder: "例如：新手妈妈、租房党、通勤上班族、轻熟护肤人群。",
    icon: Users,
  },
  {
    id: "creative_first",
    label: "剧情脑洞",
    description: "先给一个好拍、有记忆点的小场景",
    placeholder: "例如：睡前刷牙像闯关、便当盒像一个小型发布会。",
    icon: Film,
  },
  {
    id: "offer_first",
    label: "优惠",
    description: "先把利益点拍得更直接、更想点开",
    placeholder: "例如：第二件半价、试用装赠品、限时套装。",
    icon: BadgePercent,
  },
]

const defaultHints: AnalysisHints = {
  productCategory: "",
}

const durationOptions = [4, 5, 6, 7, 8, 9] as const
type DurationSeconds = (typeof durationOptions)[number]

type ProductImageUpload = {
  name: string
  size: number
  previewUrl: string
  reference: string
}

const maxUploadBytes = 6 * 1024 * 1024

const inputClassName =
  "liquid-control h-10 w-full rounded-lg px-3 text-sm font-semibold text-white outline-none transition placeholder:text-white/32 focus:border-[#b66dff] focus:ring-2 focus:ring-[#a855f7]/25"

const textareaClassName =
  "liquid-control h-28 w-full resize-none rounded-lg p-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/32 focus:border-[#b66dff] focus:ring-2 focus:ring-[#a855f7]/25"

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function uploadedImageReference(fileName: string) {
  const safeName = fileName.replace(/[^\w.-]+/g, "-").replace(/^-+|-+$/g, "") || "product-image"
  return `fantastic-hook-local-product-reference://${encodeURIComponent(safeName)}`
}

async function readJson<T>(response: Response): Promise<T> {
  return (await response.json().catch(() => ({}))) as T
}

function sourceLabel(source?: string) {
  if (source === "llm") return "LLM"
  return "本地兜底"
}

function buildVideoPromptText(run: NonNullable<OneShotResponse["runs"]>[number]) {
  return run.futureVideoPrompt ?? run.script.videoPrompt
}

export function HookGeneratorOneShotClient() {
  const [productTitle, setProductTitle] = useState("儿童低泡牙膏")
  const [uploadedImage, setUploadedImage] = useState<ProductImageUpload | null>(null)
  const [imageInputKey, setImageInputKey] = useState(0)
  const [imageError, setImageError] = useState<string | null>(null)
  const [intent, setIntent] = useState<HookIntent>("pain_first")
  const [intentText, setIntentText] = useState("小孩儿不爱刷牙")
  const [hints, setHints] = useState<AnalysisHints>({
    ...defaultHints,
    productCategory: "oral_care",
  })
  const [durationSeconds, setDurationSeconds] = useState<DurationSeconds>(5)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [runs, setRuns] = useState<NonNullable<OneShotResponse["runs"]>>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const selectedIntent = useMemo(
    () => intentOptions.find((item) => item.id === intent) ?? intentOptions[0],
    [intent],
  )
  const canGenerate = productTitle.trim().length > 0 && !busy

  function handleProductImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setImageError(null)

    if (!file.type.startsWith("image/")) {
      setUploadedImage(null)
      setImageInputKey((current) => current + 1)
      setImageError("请上传 PNG、JPG、WebP 等图片文件。")
      return
    }

    if (file.size > maxUploadBytes) {
      setUploadedImage(null)
      setImageInputKey((current) => current + 1)
      setImageError("图片不要超过 6MB。")
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setImageError("图片读取失败，请换一张图片。")
        return
      }
      setUploadedImage({
        name: file.name,
        size: file.size,
        previewUrl: reader.result,
        reference: uploadedImageReference(file.name),
      })
    }
    reader.onerror = () => setImageError("图片读取失败，请换一张图片。")
    reader.readAsDataURL(file)
  }

  function clearProductImage() {
    setUploadedImage(null)
    setImageError(null)
    setImageInputKey((current) => current + 1)
  }

  async function generateHooks() {
    setBusy(true)
    setError(null)
    setNotice(null)
    setCopiedId(null)
    try {
      const response = await fetch("/api/hook-generator/one-shot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productTitle,
          productImage: uploadedImage?.reference ?? "",
          intent,
          intentText,
          analysisHints: {
            productCategory: hints.productCategory || null,
          },
          videoDuration: durationSeconds,
          videoRatio: "9:16",
          generateAudio: true,
        }),
      })
      const data = await readJson<OneShotResponse>(response)
      if (!response.ok || !data.runs?.length) {
        throw new Error(data.error ?? data.message ?? "Hook 生成失败")
      }
      setRuns(data.runs)
      setNotice("已生成 3 条 Hook 脚本")
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setBusy(false)
    }
  }

  async function copyRun(run: NonNullable<OneShotResponse["runs"]>[number]) {
    await navigator.clipboard.writeText(buildVideoPromptText(run))
    setCopiedId(run.clientVideoId)
    window.setTimeout(() => setCopiedId(null), 1600)
  }

  return (
    <main aria-label="Thumb Brake 3s 工作区" className="hook-studio-shell min-h-[100dvh] px-4 py-6 text-white lg:px-8">
      <div className="mx-auto max-w-[1440px]">
        <header className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-bold text-[#c084fc]">Thumb Brake 3s</p>
            <h1 className="mt-2 text-[28px] font-bold leading-tight tracking-normal text-white md:text-[32px]">
              短视频商品 Hook 脚本生成器
            </h1>
            <p className="mt-2 text-sm leading-6 text-white/62">
              商品先被 AI 理解，再选择创意切入角度，生成 3 条可测试短视频开场脚本。
            </p>
          </div>

          <div className="relative">
            <button
              type="button"
              aria-expanded={settingsOpen}
              onClick={() => setSettingsOpen((current) => !current)}
              className="liquid-control inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold text-white/78 transition hover:-translate-y-0.5 hover:text-white"
            >
              <SlidersHorizontal className="h-4 w-4" />
              生成设置
              <span className="hidden text-white/46 md:inline">LLM · {durationSeconds}s · 9:16</span>
              <ChevronDown className={cn("h-4 w-4 text-white/38 transition-transform", settingsOpen ? "rotate-180" : "")} />
            </button>
            {settingsOpen ? (
              <div className="liquid-panel absolute right-0 z-20 mt-2 w-[312px] p-3 shadow-[0_24px_80px_rgba(0,0,0,0.44)]">
                <div className="divide-y divide-white/[0.08] rounded-lg border border-white/[0.08] bg-[#100c19]/70">
                  <SettingRow label="生成类型" value="Hook 脚本" />
                  <SettingRow label="画面比例" value="9:16" />
                </div>
                <div className="mt-3 rounded-lg border border-white/[0.08] bg-white/[0.035] p-3">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 text-xs font-semibold text-white/48">
                      <Clock3 className="h-3.5 w-3.5 text-[#c084fc]" />
                      生成时长
                    </span>
                    <span className="text-sm font-bold text-[#d8b4fe]">{durationSeconds}s</span>
                  </div>
                  <DurationSelector value={durationSeconds} onChange={setDurationSeconds} />
                </div>
                <div className="mt-3 rounded-lg border border-[#a855f7]/18 bg-[#a855f7]/8 px-3 py-3 text-xs leading-5 text-white/52">
                  只返回脚本与未来视频 prompt，不提交视频任务。
                </div>
              </div>
            ) : null}
          </div>
        </header>

        <div className="liquid-panel mb-5 px-4 py-3 shadow-[0_18px_60px_rgba(0,0,0,0.26)]">
          <ol className="grid gap-3 text-sm font-semibold text-white/62 md:grid-cols-[1fr_1fr_1fr]">
            {["商品", "创意方向", "生成"].map((label, index) => (
              <li key={label} className="flex items-center gap-3">
                <span
                  className={cn(
                    "grid h-7 w-7 place-items-center rounded-full border text-xs",
                    index === 0
                      ? "border-[#c084fc] bg-[#c084fc] text-[#08040d] shadow-[0_0_22px_rgba(192,132,252,0.34)]"
                      : "border-white/12 bg-white/[0.04] text-white/62",
                  )}
                >
                  {index + 1}
                </span>
                <span>{label}</span>
                {index < 2 ? <span className="hidden h-px flex-1 bg-white/[0.08] md:block" /> : null}
              </li>
            ))}
          </ol>
        </div>

        {error ? (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        ) : null}
        {notice ? (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
            <CheckCircle2 className="h-4 w-4" />
            {notice}
          </div>
        ) : null}

        <section className="grid gap-5 xl:grid-cols-[minmax(280px,0.85fr)_minmax(560px,1.45fr)]">
          <div className="liquid-panel p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
            <h2 className="text-lg font-bold tracking-normal text-white">商品素材</h2>
            <div className="mt-4">
              <Field label="商品标题">
                <input
                  value={productTitle}
                  onChange={(event) => setProductTitle(event.target.value)}
                  className={inputClassName}
                  placeholder="输入产品名称"
                />
              </Field>
            </div>
            <div className="mt-3">
              <Field label="类目">
                <input
                  value={hints.productCategory}
                  onChange={(event) => setHints((current) => ({ ...current, productCategory: event.target.value }))}
                  className={inputClassName}
                  placeholder="oral_care / beauty / food_beverage..."
                />
              </Field>
            </div>

            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-white/82">商品图片</span>
                {uploadedImage ? (
                  <button
                    type="button"
                    onClick={clearProductImage}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 text-xs font-semibold text-white/64 transition hover:border-[#c084fc]/40 hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                    移除
                  </button>
                ) : null}
              </div>

              <label className="liquid-dropzone group relative block overflow-hidden rounded-lg border border-dashed border-[#a855f7]/28 bg-white/[0.035] transition hover:border-[#c084fc]/58 hover:bg-[#a855f7]/8">
                <input
                  key={imageInputKey}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif,image/avif,image/*"
                  onChange={handleProductImageUpload}
                  className="absolute inset-0 z-10 cursor-pointer opacity-0"
                  aria-label="上传商品图片"
                />
                {uploadedImage ? (
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element -- Local object preview is browser-only and not served by Next Image. */}
                    <img src={uploadedImage.previewUrl} alt="商品图预览" className="aspect-square w-full object-contain p-4" />
                    <div className="absolute inset-x-3 bottom-3 rounded-lg border border-white/10 bg-black/50 px-3 py-2 backdrop-blur-xl">
                      <div className="truncate text-xs font-bold text-white">{uploadedImage.name}</div>
                      <div className="mt-0.5 text-[11px] text-white/48">{formatBytes(uploadedImage.size)}</div>
                    </div>
                  </div>
                ) : (
                  <div className="grid aspect-square place-items-center px-6 text-center">
                    <span className="grid justify-items-center gap-3 text-sm text-white/54">
                      <span className="grid h-12 w-12 place-items-center rounded-full bg-[#a855f7]/18 text-[#d8b4fe] shadow-[0_0_32px_rgba(168,85,247,0.22)]">
                        <ImagePlus className="h-6 w-6" />
                      </span>
                      <span className="font-semibold text-white/72">点击上传本地商品图</span>
                      <span className="text-xs leading-5 text-white/42">PNG / JPG / WebP，最多 6MB</span>
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#d8b4fe]">
                        <Upload className="h-3.5 w-3.5" />
                        选择图片
                      </span>
                    </span>
                  </div>
                )}
              </label>
              {imageError ? (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-red-200">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {imageError}
                </p>
              ) : (
                <p className="mt-2 text-xs leading-5 text-white/40">上传图会作为商品参考，不会写入仓库或本地文件系统。</p>
              )}
            </div>
          </div>

          <div className="liquid-panel p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
            <div>
              <h2 className="text-lg font-bold tracking-normal text-white">这次想从哪个角度抓住用户？</h2>
              <p className="mt-1 text-sm text-white/58">选择一个切入角度，AI 会围绕商品理解生成 3 条可测试方向。</p>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-4">
              {intentOptions.map((option) => {
                const Icon = option.icon
                const active = intent === option.id
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-label={option.label}
                    aria-pressed={active}
                    onClick={() => setIntent(option.id)}
                    className={cn(
                      "glass-option relative min-h-[128px] rounded-lg border p-4 text-left transition",
                      active
                        ? "border-[#c084fc] bg-[#a855f7]/16 text-white shadow-[0_0_0_1px_rgba(192,132,252,0.18),0_18px_44px_rgba(88,28,135,0.26)]"
                        : "border-white/[0.08] bg-[#120d1b]/72 text-white/72 hover:border-[#c084fc]/35 hover:bg-[#a855f7]/8",
                    )}
                  >
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-white/[0.06] text-[#d8b4fe]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="mt-4 block text-base font-bold">{option.label}</span>
                    <span className="mt-2 block text-xs leading-5 text-white/56">{option.description}</span>
                  </button>
                )
              })}
            </div>

            <label className="mt-5 block">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-white/82">{selectedIntent.label}意图</span>
                <span className="text-xs font-medium text-white/42">{intentText.length}/500</span>
              </div>
              <textarea
                value={intentText}
                aria-label={`${selectedIntent.label}意图`}
                maxLength={500}
                onChange={(event) => setIntentText(event.target.value)}
                className={textareaClassName}
                placeholder={selectedIntent.placeholder}
              />
            </label>

            <div className="mt-5 border-t border-white/[0.08] pt-4">
              <div className="mb-3 flex items-center justify-center gap-2 text-xs font-semibold text-white/42">
                <Clock3 className="h-3.5 w-3.5 text-[#c084fc]" />
                当前设置：{durationSeconds}s · 9:16
              </div>
              <button
                type="button"
                disabled={!canGenerate}
                title={!productTitle.trim() ? "请先输入商品标题" : undefined}
                onClick={() => void generateHooks()}
                className="liquid-primary-button inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg px-6 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                {busy ? "正在生成 Hook 脚本..." : "生成 3 条 Hook 脚本"}
              </button>
              <p className="mt-2 text-center text-sm text-white/42">
                {!productTitle.trim() ? "请先输入商品标题" : "不提交视频任务，只返回脚本与未来视频 prompt"}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-5">
          {runs.length ? (
            <div className="grid gap-4 lg:grid-cols-3">
              {runs.map((run, index) => (
                <ScriptSlotCard
                  key={run.clientVideoId}
                  run={run}
                  index={index}
                  copied={copiedId === run.clientVideoId}
                  onCopy={() => void copyRun(run)}
                />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-3">
              {[0, 1, 2].map((index) => (
                <ResultSkeleton key={index} index={index} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

function DurationSelector({
  value,
  onChange,
}: {
  value: DurationSeconds
  onChange: (value: DurationSeconds) => void
}) {
  return (
    <div className="grid grid-cols-6 gap-1">
      {durationOptions.map((duration) => (
        <button
          key={duration}
          type="button"
          aria-pressed={duration === value}
          onClick={() => onChange(duration)}
          className={cn(
            "h-9 rounded-md border text-xs font-bold transition",
            duration === value
              ? "border-[#d8b4fe] bg-[#a855f7] text-white shadow-[0_0_20px_rgba(168,85,247,0.34)]"
              : "border-white/[0.08] bg-white/[0.035] text-white/54 hover:border-[#c084fc]/36 hover:text-white",
          )}
        >
          {duration}s
        </button>
      ))}
    </div>
  )
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-h-14 items-center justify-between gap-4 px-3 py-3">
      <span className="text-xs font-semibold text-white/42">{label}</span>
      <span className="inline-flex items-center gap-2 text-sm font-bold text-white/78">
        {value}
      </span>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-white/82">{label}</span>
      {children}
    </label>
  )
}

function ResultSkeleton({ index }: { index: number }) {
  return (
    <article aria-label={`第 ${index + 1} 条结果占位`} className="liquid-panel p-4 shadow-[0_18px_60px_rgba(0,0,0,0.20)]">
      <div className="grid aspect-[16/9] min-h-[160px] place-items-center rounded-lg border border-dashed border-[#a855f7]/18 bg-white/[0.035] px-6 text-center sm:min-h-[210px]">
        <span className="grid justify-items-center gap-3 text-sm leading-6 text-white/52">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-[#a855f7]/16 text-[#d8b4fe]">
            <Sparkles className="h-6 w-6" />
          </span>
          第 {index + 1} 条 Hook 会显示在这里
        </span>
      </div>
      <div className="mt-4 space-y-3">
        <div className="h-4 w-20 rounded-full bg-white/[0.06]" />
        <div className="h-5 w-4/5 rounded-full bg-white/[0.05]" />
        <div className="h-4 w-3/5 rounded-full bg-white/[0.04]" />
        <div className="flex gap-2 pt-2">
          <div className="h-9 flex-1 rounded-lg bg-white/[0.035]" />
          <div className="h-9 w-24 rounded-lg bg-white/[0.035]" />
        </div>
      </div>
    </article>
  )
}

function ScriptSlotCard({
  run,
  index,
  copied,
  onCopy,
}: {
  run: NonNullable<OneShotResponse["runs"]>[number]
  index: number
  copied: boolean
  onCopy: () => void
}) {
  const title = shortCardTitle(run.card, index)

  return (
    <article className="liquid-panel overflow-hidden shadow-[0_18px_60px_rgba(0,0,0,0.22)]">
      <div className="grid aspect-[16/9] min-h-[160px] place-items-center border-b border-white/[0.06] bg-[#0b0611]/72 px-4 text-center text-sm leading-6 text-white/62 sm:min-h-[210px]">
        <div className="max-w-sm">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#a855f7]/16 px-3 py-1 text-xs font-bold text-[#d8b4fe]">
            <Tag className="h-3.5 w-3.5" />
            第 {index + 1} 条 · {run.card.strategyLabel}
          </span>
          <h3 className="mt-4 text-xl font-bold leading-7 tracking-normal text-white">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-white/56">{run.script.hookSummary}</p>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold text-white/42">{sourceLabel(run.source)}</span>
          <button
            type="button"
            onClick={onCopy}
            className="liquid-control inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-white/72 transition hover:text-white"
          >
            {copied ? <CheckCircle2 className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
            {copied ? "已复制" : "复制 prompt"}
          </button>
        </div>

        <ResultBlock title="开场画面" body={run.script.visualDescription} />
        <ResultBlock title="口播脚本" body={run.script.script || "无口播，靠画面动作和声音停滑。"} />
        <ResultBlock title="声音设计" body={run.script.soundDesign} />
        <ResultBlock title="产品承接" body={run.script.productBridge} />

        <details className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-3">
          <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-white/78">
            分镜节奏
            <ChevronDown className="h-4 w-4 text-white/42" />
          </summary>
          <div className="mt-3 space-y-2">
            {run.script.shotTiming.map((shot, shotIndex) => (
              <div key={`${run.clientVideoId}-${shotIndex}`} className="rounded-lg bg-black/[0.22] p-3 text-sm leading-6 text-white/70">
                <div className="text-xs font-bold text-[#d8b4fe]">{shot.timeRange}</div>
                <p className="mt-1">{shot.visual}</p>
                {shot.script ? <p className="mt-1 text-white/52">{shot.script}</p> : null}
                {shot.textOverlay ? <p className="mt-1 text-[#d8b4fe]/82">字幕：{shot.textOverlay}</p> : null}
              </div>
            ))}
          </div>
        </details>

        <details className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-3">
          <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-white/78">
            Future video prompt
            <ChevronDown className="h-4 w-4 text-white/42" />
          </summary>
          <pre className="mt-3 max-h-[260px] overflow-auto whitespace-pre-wrap text-xs leading-5 text-white/58">
            {run.futureVideoPrompt ?? run.script.videoPrompt}
          </pre>
        </details>
      </div>
    </article>
  )
}

function ResultBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-3">
      <div className="text-xs font-bold uppercase tracking-[0.18em] text-white/42">{title}</div>
      <p className="mt-2 text-sm leading-6 text-white/72">{body}</p>
    </div>
  )
}

function shortCardTitle(card: NonNullable<OneShotResponse["runs"]>[number]["card"], index: number) {
  const rawTitle = card.hookMechanism || card.title || card.summary || `第 ${index + 1} 条钩子方向`
  const normalized = rawTitle.replace(/\s+/g, " ").trim()
  if (!normalized) return `第 ${index + 1} 条钩子方向`
  return normalized.length > 24 ? `${normalized.slice(0, 24)}...` : normalized
}
