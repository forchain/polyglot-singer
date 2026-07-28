# Polyglot Singer Context

This glossary defines the product and deployment terms used by Polyglot Singer.

## AI

**Token Plan Key**:
A MiniMax credential issued for a subscribed Token Plan and used only by the server when calling the MiniMax OpenAI-compatible API.
_Avoid_: API key in browser, client key

**AI Provider**:
The server-side model integration selected for lyric analysis, such as MiniMax, Kimi, or Doubao.
_Avoid_: frontend provider

## Deployment

**Application**:
The SvelteKit web service that serves the Polyglot Singer UI and API.
_Avoid_: app container when describing the deployed resource

**Backend Service**:
The PocketBase service that stores authentication and application data for the Compose deployment.
_Avoid_: database container

**Remote Server**:
The Coolify-managed `Ubuntu-24-8G` node where the production Compose resources run.
_Avoid_: localhost server, Coolify server
