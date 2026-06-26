# README Media Kit

This file defines the launch assets used by the GitHub README.

The goal is to make the repository homepage feel like a product page without hiding the developer details.

## Required assets

| Asset | Path | Recommended size | Purpose |
|---|---|---:|---|
| English banner | `public/readme/banner-en.png` | 2172×724 | Main banner for English and Spanish README pages |
| Chinese banner | `public/readme/banner-zh.png` | 2172×724 | Main banner for Chinese README page |
| Hero screenshot | `public/readme/hero.png` | 1464×1123 or similar desktop capture | First visual in README |
| Demo video | `public/readme/demo.mp4` | 30–60s, under 25 MB if possible | Walkthrough link |
| Video poster | `public/readme/demo-poster.png` | same ratio as video | Clickable preview if needed |
| Video cases | `public/readme/videos/case-01.mp4` through `case-06.mp4` | 4–8s each, under 5 MB each if possible | Public creative examples in README |
| Video case posters | `public/readme/video-posters/*.png` | same ratio as the source clip | Poster frames for inline README videos |
| Example hook cards | `public/readme/example-hooks.png` | 1400×900 | Shows output quality |
| API example image | `public/readme/api-example.png` | optional | Useful for developers |

## Hero screenshot guidance

The banner should communicate the product promise immediately:

- Thumb Brake 3s name
- 0-1s / 1-3s / 3-7s hook contract
- dark purple brand world
- short-video feed or thumb interaction metaphor
- no real API keys, private URLs, or customer material

The app hero screenshot should show the product value in one glance:

- product input on the left
- creative direction on the right
- three generated hook cards visible below
- a visible CTA: “Generate 3 thumb-stopping hooks” or equivalent
- a visible 0–1s / 1–3s / 3–7s structure

Use a polished demo product that is safe to publish. Avoid real brand logos unless you own the rights.

## Demo video structure

Recommended 45-second walkthrough:

1. 0–5s: show the problem — products get skipped in the first 3 seconds.
2. 5–15s: paste product title, category, and intent.
3. 15–25s: choose a creative direction and generate.
4. 25–35s: show three hook cards and the 3s structure.
5. 35–45s: copy script or future video prompt.

## Video case gallery

The README currently includes six short case examples:

| Case | Video | Poster | Creative mechanism |
|---|---|---|---|
| 01 | `public/readme/videos/case-01.mp4` | `public/readme/video-posters/case-01.mp4.png` | Urban interruption / shared reaction |
| 02 | `public/readme/videos/case-02.mp4` | `public/readme/video-posters/case-02.mp4.png` | Interface curiosity / digital object |
| 03 | `public/readme/videos/case-03.mp4` | `public/readme/video-posters/case-03.mp4.png` | Product-as-hero motion |
| 04 | `public/readme/videos/case-04.mp4` | `public/readme/video-posters/case-04.mp4.png` | Self-relevance routine |
| 05 | `public/readme/videos/case-05.mp4` | `public/readme/video-posters/case-05.mp4.png` | Cultural action bridge |
| 06 | `public/readme/videos/case-06.mp4` | `public/readme/video-posters/case-06.mp4.png` | Close-up behavior proof |

Keep these clips public-safe:

- no private customer footage
- no exposed provider keys or internal URLs
- no exact competitor ad copy
- no creator usernames or private transcripts
- no copyrighted character or brand assets unless licensed

The README files render these clips with inline HTML `<video>` tags plus an `Open MP4` fallback link. Use raw GitHub URLs for the `<video>` `src` and `poster` values so GitHub receives the actual MP4/PNG bytes instead of an HTML blob page:

```html
<video
  src="https://raw.githubusercontent.com/NBrangerF/thumb-brake-3s/main/public/readme/videos/case-01.mp4"
  poster="https://raw.githubusercontent.com/NBrangerF/thumb-brake-3s/main/public/readme/video-posters/case-01.mp4.png"
  controls
  muted
  playsinline
  preload="metadata"
  width="100%"
></video>
```

## README placement

The README currently references:

```md
./public/readme/banner-en.png
./public/readme/banner-zh.png
./public/readme/hero.png
./public/readme/videos/case-01.mp4
./public/readme/video-posters/case-01.mp4.png
```

Keep those paths stable so the README does not need to change when media assets are replaced.

## Alt text

Use descriptive alt text:

```md
![Thumb Brake 3s web UI showing product input, creative direction cards, and three generated hook cards](./public/readme/hero.png)
```

## Launch checklist

Before public launch:

- [x] Add final English and Chinese README banners.
- [ ] Replace placeholder app hero with final UI screenshot if needed.
- [ ] Add final walkthrough demo video if needed.
- [x] Add six short video case examples.
- [ ] Confirm README image paths render on GitHub.
- [ ] Confirm video link opens from GitHub.
- [ ] Confirm image file size is reasonable.
- [ ] Confirm no private product images, provider keys, internal URLs, or customer data appear in screenshots.
