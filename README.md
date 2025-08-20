# Open-Fiesta

<video controls poster="./public/osfiesta.png" width="800">
  <source src="./public/OSFiesta.mp4" type="video/mp4" />
  <a href="./public/OSFiesta.mp4">
    <img src="./public/osfiesta.png" alt="Open-Fiesta preview" />
  </a>
  Your browser does not support the video tag.
</video>

<!-- Fallback link for renderers that don't support <video> -->
[![Open-Fiesta](public/osfiesta.png)](public/OSFiesta.mp4)

An open-source, multi-model AI chat playground built with Next.js App Router. Switch between providers and models, compare outputs side-by-side, and use optional web search and image attachments.

## Features

- __Multiple providers__: Gemini, OpenRouter (DeepSeek R1, Llama 3.3, Qwen, Mistral, Moonshot, Reka, Sarvam, etc.)
- __Selectable model catalog__: choose up to 5 models to run
- __Web search toggle__ per message
- __Image attachment__ support (Gemini)
- __Clean UI__: keyboard submit, streaming-friendly API normalization

## Tech Stack

- Next.js 14 (App Router, TypeScript)
- Tailwind CSS
- API routes for provider calls

## Quick Start

1) Install deps
```bash
npm i
```

2) Configure environment
Create `.env.local` with the keys you plan to use:
```bash
# OpenRouter (recommended for most free models)
OPENROUTER_API_KEY=... 

# Gemini (for Gemini models and image input)
GOOGLE_GENERATIVE_AI_API_KEY=...
```

3) Run dev server
```bash
npm run dev
# open http://localhost:3000
```

## Environment Variables

- `OPENROUTER_API_KEY`: API key from https://openrouter.ai (required for OpenRouter models)
- `GOOGLE_GENERATIVE_AI_API_KEY`: API key from Google AI Studio (required for Gemini models)

You can also provide an API key at runtime in the UI’s Settings panel.

## Project Structure

- `app/` – UI and API routes
  - `api/openrouter/route.ts` – normalizes responses across OpenRouter models; strips reasoning, cleans up DeepSeek R1 to plain text
  - `api/gemini/route.ts`, `api/gemini-pro/route.ts`
- `components/` – UI components (chat box, model selector, etc.)
- `lib/` – model catalog and client helpers

## Notes on DeepSeek R1

Open-Fiesta post-processes DeepSeek R1 outputs to remove reasoning tags and convert Markdown to plain text for readability while preserving content.

## Contributing

We welcome contributions of all kinds: bug fixes, features, docs, and examples.

- **Set up**
  - Fork this repo and clone your fork.
  - Run `npm i` and create `.env.local` (see “Environment Variables”).
  - Start the dev server with `npm run dev`.

- **Branching**
  - Create a feature branch from `main`: `feat/<short-name>` or `fix/<short-name>`.

- **Coding standards**
  - TypeScript, Next.js App Router.
  - Run linters and build locally:
    - `npm run lint`
    - `npm run build`
  - Keep changes focused and small. Prefer clear names and minimal dependencies.

- **UI/UX**
  - Reuse components in `components/` where possible.
  - Keep props typed and avoid unnecessary state.

- **APIs & models**
  - OpenRouter logic lives in `app/api/openrouter/`.
  - Gemini logic lives in `app/api/gemini/` and `app/api/gemini-pro/`.
  - If adding models/providers, update `lib/models.ts` or `lib/customModels.ts` and ensure the UI reflects new options.

- **Commit & PR**
  - Write descriptive commits (imperative mood): `fix: …`, `feat: …`, `docs: …`.
  - Open a PR to `main` with:
    - What/why, screenshots if UI changes, and testing notes.
    - Checklist confirming `npm run lint` and `npm run build` pass.
  - Link related issues if any.

- **Issue reporting**
  - Use clear reproduction steps, expected vs. actual behavior, and environment info (OS/node/Next.js).

Thank you for helping improve Open‑Fiesta!

## License

This project is licensed under the MIT License. See `LICENSE` for details.

## Acknowledgements

- Model access via OpenRouter and Google
