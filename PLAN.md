# Plan

## Goal
Refactor Pile toward a more modular architecture and a more inclusive AI integration model without mixing volatile implementation details into contributor guidelines.

## Desired Direction
- Increase modularity across renderer, main-process handlers, and shared business logic.
- Break up large files and reduce logic concentration in contexts and page-level components.
- Introduce clearer boundaries between UI, orchestration, persistence, indexing, and AI provider layers.

## AI Provider Direction
- Move away from an OpenAI-shaped implementation toward a provider-agnostic architecture.
- Support multiple model providers such as OpenAI, Claude, Gemini, and compatible custom endpoints.
- Keep `baseUrl` overridable so compatible gateways and self-hosted services can be used.
- Remove Ollama-specific model handling from the long-term design.

## Architectural Expectations
- Provider selection should be dynamic and easy to extend.
- Model configuration should be abstracted behind stable interfaces rather than hardcoded assumptions.
- Prompting, completion, and embedding concerns should be separable.
- Search and retrieval infrastructure should remain compatible with future provider changes.

## Non-Goals for AGENTS.md
The evolving product and architecture targets above must stay out of `AGENTS.md` so repository guidelines remain stable and do not become misleading after future changes.
