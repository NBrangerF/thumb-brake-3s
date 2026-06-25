"use client"

import { useMemo, useState } from "react"
import {
  AlertCircle,
  BadgePercent,
  CheckCircle2,
  Clipboard,
  Film,
  Loader2,
  MessageCircleQuestion,
  Sparkles,
  Tag,
  Users,
  Wand2,
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
    source?: "llm"
  }>
  error?: string
  message?: string
  code?: string
}

type AnalysisHints = {
  productCategory: string
  coreSellingPoints: string
  targetAudience: string
  painPoints: string
  visualFacts: string
  proofPoints: string
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
  coreSellingPoints: "",
  targetAudience: "",
  painPoints: "",
  visualFacts: "",
  proofPoints: "",
}

function splitLines(value: string) {
  return value.split(/[\n,，]/).map((item) => item.trim()).filter(Boolean)
}

async function readJson<T>(response: Response): Promise<T> {
  return (await response.json().catch(() => ({}))) as T
}

function buildCopyText(run: NonNullable<OneShotResponse["runs"]>[number]) {
  const timing = run.script.shotTiming
    .map((shot) => `${shot.timeRange} ${shot.visual}${shot.script ? ` / ${shot.script}` : ""}`)
    .join("\n")
  return [
    `# ${run.card.title}`,
    "",
    `Hook: ${run.script.hookSummary}`,
    `机制: ${run.card.hookMechanism ?? run.card.description}`,
    "",
    "## 分镜",
    timing,
    "",
    "## 口播",
    run.script.script || "无口播",
    "",
    "## 声音",
    run.script.soundDesign,
    "",
    "## 产品承接",
    run.script.productBridge,
    "",
    "## Future video prompt",
    run.futureVideoPrompt ?? run.script.videoPrompt,
  ].join("\n")
}

export function HookGeneratorOneShotClient() {
  const [productTitle, setProductTitle] = useState("儿童低泡牙膏")
  const [productImage, setProductImage] = useState("")
  const [intent, setIntent] = useState<HookIntent>("pain_first")
  const [intentText, setIntentText] = useState("小孩儿不爱刷牙")
  const [hints, setHints] = useState<AnalysisHints>({
    ...defaultHints,
    productCategory: "oral_care",
    coreSellingPoints: "低泡不辣口, 儿童更愿意配合",
    targetAudience: "亲子家庭, 睡前刷牙困难的家长",
    painPoints: "孩子刷牙敷衍, 家长每天催到崩溃",
    visualFacts: "牙膏软管, 儿童牙刷, 浴室镜前",
    proofPoints: "刷牙动作更顺, 孩子从抗拒到愿意试一下",
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [runs, setRuns] = useState<NonNullable<OneShotResponse["runs"]>>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const selectedIntent = useMemo(
    () => intentOptions.find((item) => item.id === intent) ?? intentOptions[0],
    [intent],
  )

  async function generateHooks() {
    setBusy(true)
    setError(null)
    setCopiedId(null)
    try {
      const response = await fetch("/api/hook-generator/one-shot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productTitle,
          productImage,
          intent,
          intentText,
          analysisHints: {
            productCategory: hints.productCategory || null,
            coreSellingPoints: splitLines(hints.coreSellingPoints),
            targetAudience: splitLines(hints.targetAudience),
            painPoints: splitLines(hints.painPoints),
            visualFacts: splitLines(hints.visualFacts),
            proofPoints: splitLines(hints.proofPoints),
          },
          videoDuration: 5,
          videoRatio: "9:16",
          generateAudio: true,
        }),
      })
      const data = await readJson<OneShotResponse>(response)
      if (!response.ok || !data.runs?.length) {
        const message = data.code === "LLM_CONFIG_REQUIRED"
          ? "请先在 .env.local 配置 LLM_BASE_URL、LLM_API_KEY 和 LLM_MODEL，然后重启开发服务。"
          : data.error ?? data.message ?? "Hook 生成失败"
        throw new Error(message)
      }
      setRuns(data.runs)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setBusy(false)
    }
  }

  async function copyRun(run: NonNullable<OneShotResponse["runs"]>[number]) {
    await navigator.clipboard.writeText(buildCopyText(run))
    setCopiedId(run.clientVideoId)
    window.setTimeout(() => setCopiedId(null), 1600)
  }

  return (
    <main className="min-h-screen px-5 py-6 text-white md:px-8 md:py-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[430px_minmax(0,1fr)]">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/30 backdrop-blur md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-200">
                <Sparkles className="h-4 w-4" />
                Fantastic Hook
              </div>
              <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight md:text-4xl">
                短视频商品 Hook 脚本生成器
              </h1>
              <p className="mt-3 text-sm leading-6 text-white/62">
                输入商品和切入意图，生成三条差异化开场脚本。第一版只生成 hook 脚本和未来视频 prompt，不提交视频任务。
              </p>
            </div>
            <div className="rounded-2xl border border-amber-200/25 bg-amber-200/10 p-3 text-amber-100">
              <Wand2 className="h-6 w-6" />
            </div>
          </div>

          <div className="mt-7 space-y-5">
            <Field label="商品名称">
              <input
                value={productTitle}
                onChange={(event) => setProductTitle(event.target.value)}
                className="h-11 w-full rounded-xl border border-white/12 bg-black/24 px-3 text-sm font-semibold text-white outline-none transition focus:border-amber-200/70"
                placeholder="例如：儿童低泡牙膏"
              />
            </Field>

            <Field label="商品图 URL（可选）">
              <input
                value={productImage}
                onChange={(event) => setProductImage(event.target.value)}
                className="h-11 w-full rounded-xl border border-white/12 bg-black/24 px-3 text-sm text-white outline-none transition focus:border-amber-200/70"
                placeholder="https://..."
              />
            </Field>

            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-bold text-white/88">
                <Tag className="h-4 w-4 text-amber-200" />
                Hook 切入方式
              </div>
              <div className="grid grid-cols-2 gap-2">
                {intentOptions.map((option) => {
                  const Icon = option.icon
                  const active = option.id === intent
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setIntent(option.id)}
                      className={cn(
                        "min-h-[96px] rounded-2xl border p-3 text-left transition",
                        active
                          ? "border-amber-200/70 bg-amber-200/14 text-white"
                          : "border-white/10 bg-white/[0.04] text-white/70 hover:border-white/24 hover:bg-white/[0.07]",
                      )}
                    >
                      <Icon className={cn("h-4 w-4", active ? "text-amber-200" : "text-white/48")} />
                      <span className="mt-3 block text-sm font-black">{option.label}</span>
                      <span className="mt-1 block text-xs leading-5">{option.description}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <Field label={`${selectedIntent.label}意图`}>
              <textarea
                value={intentText}
                onChange={(event) => setIntentText(event.target.value.slice(0, 500))}
                className="min-h-[92px] w-full resize-none rounded-xl border border-white/12 bg-black/24 px-3 py-3 text-sm leading-6 text-white outline-none transition focus:border-amber-200/70"
                placeholder={selectedIntent.placeholder}
              />
            </Field>

            <div className="grid gap-3">
              <Field label="品类">
                <input
                  value={hints.productCategory}
                  onChange={(event) => setHints((current) => ({ ...current, productCategory: event.target.value }))}
                  className="h-10 w-full rounded-xl border border-white/12 bg-black/24 px-3 text-sm text-white outline-none focus:border-amber-200/70"
                  placeholder="oral_care / beauty / food_beverage..."
                />
              </Field>
              <Field label="卖点">
                <textarea value={hints.coreSellingPoints} onChange={(event) => setHints((current) => ({ ...current, coreSellingPoints: event.target.value }))} className="min-h-[72px] w-full resize-none rounded-xl border border-white/12 bg-black/24 px-3 py-2 text-sm leading-6 text-white outline-none focus:border-amber-200/70" />
              </Field>
              <Field label="目标人群">
                <textarea value={hints.targetAudience} onChange={(event) => setHints((current) => ({ ...current, targetAudience: event.target.value }))} className="min-h-[72px] w-full resize-none rounded-xl border border-white/12 bg-black/24 px-3 py-2 text-sm leading-6 text-white outline-none focus:border-amber-200/70" />
              </Field>
              <Field label="痛点 / 证据 / 视觉事实">
                <textarea
                  value={[hints.painPoints, hints.proofPoints, hints.visualFacts].filter(Boolean).join("\n")}
                  onChange={(event) => {
                    const [painPoints = "", proofPoints = "", visualFacts = ""] = event.target.value.split(/\n/)
                    setHints((current) => ({ ...current, painPoints, proofPoints, visualFacts }))
                  }}
                  className="min-h-[108px] w-full resize-none rounded-xl border border-white/12 bg-black/24 px-3 py-2 text-sm leading-6 text-white outline-none focus:border-amber-200/70"
                />
              </Field>
            </div>

            {error ? (
              <div className="flex gap-2 rounded-xl border border-red-300/25 bg-red-400/10 p-3 text-sm leading-6 text-red-100">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => void generateHooks()}
              disabled={busy || !productTitle.trim()}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-amber-200 text-sm font-black text-black transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-55"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              {busy ? "正在生成 hook 脚本" : "生成 3 条 Hook 脚本"}
            </button>
          </div>
        </section>

        <section className="min-h-[720px] rounded-[2rem] border border-white/10 bg-black/18 p-4 shadow-2xl shadow-black/20 backdrop-blur md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white/52">Script Lab</p>
              <h2 className="mt-1 text-2xl font-black tracking-tight">生成结果</h2>
            </div>
            <div className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-bold text-white/58">
              LLM required
            </div>
          </div>

          {runs.length ? (
            <div className="mt-5 grid gap-4">
              {runs.map((run, index) => (
                <article key={run.clientVideoId} className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-amber-200 px-2.5 py-1 text-xs font-black text-black">#{index + 1}</span>
                        <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs font-bold text-white/60">{run.card.strategyLabel}</span>
                        <span className="rounded-full border border-emerald-200/20 bg-emerald-200/10 px-2.5 py-1 text-xs font-bold text-emerald-100">LLM</span>
                      </div>
                      <h3 className="mt-3 text-xl font-black leading-snug text-white">{run.card.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-white/66">{run.card.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void copyRun(run)}
                      className="flex h-10 items-center gap-2 rounded-xl border border-white/12 px-3 text-xs font-bold text-white/70 transition hover:border-amber-200/50 hover:text-amber-100"
                    >
                      {copiedId === run.clientVideoId ? <CheckCircle2 className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                      {copiedId === run.clientVideoId ? "已复制" : "复制"}
                    </button>
                  </div>

                  <div className="mt-4 grid gap-3 xl:grid-cols-2">
                    <ResultBlock title="开场画面" body={run.script.visualDescription} />
                    <ResultBlock title="产品承接" body={run.script.productBridge} />
                    <ResultBlock title="口播脚本" body={run.script.script || "无口播，靠画面动作和声音停滑。"} />
                    <ResultBlock title="声音设计" body={run.script.soundDesign} />
                  </div>

                  <div className="mt-4 rounded-2xl border border-white/8 bg-black/22 p-3">
                    <div className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-white/42">Shot timing</div>
                    <div className="space-y-2">
                      {run.script.shotTiming.map((shot, shotIndex) => (
                        <div key={`${run.clientVideoId}-${shotIndex}`} className="grid gap-2 rounded-xl bg-white/[0.04] p-3 md:grid-cols-[90px_minmax(0,1fr)]">
                          <div className="text-xs font-black text-amber-100">{shot.timeRange}</div>
                          <div className="text-sm leading-6 text-white/76">
                            <p>{shot.visual}</p>
                            {shot.script ? <p className="mt-1 text-white/54">{shot.script}</p> : null}
                            {shot.textOverlay ? <p className="mt-1 text-amber-100/80">字幕：{shot.textOverlay}</p> : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <details className="mt-4 rounded-2xl border border-white/8 bg-black/22 p-3">
                    <summary className="cursor-pointer text-sm font-black text-white/78">Future video prompt</summary>
                    <pre className="mt-3 max-h-[280px] overflow-auto whitespace-pre-wrap text-xs leading-5 text-white/58">{run.futureVideoPrompt ?? run.script.videoPrompt}</pre>
                  </details>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-24 flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-dashed border-white/12 bg-white/[0.025] p-8 text-center">
              <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
                <Sparkles className="h-8 w-8 text-amber-200" />
              </div>
              <h3 className="mt-5 text-2xl font-black">等待生成第一组 Hook</h3>
              <p className="mt-3 max-w-md text-sm leading-6 text-white/54">
                结果会以三条差异化脚本卡呈现，每条都包含停滑机制、分镜、口播、声音和产品承接。
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-white/82">{label}</span>
      {children}
    </label>
  )
}

function ResultBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-black/22 p-3">
      <div className="text-xs font-black uppercase tracking-[0.18em] text-white/42">{title}</div>
      <p className="mt-2 text-sm leading-6 text-white/72">{body}</p>
    </div>
  )
}
