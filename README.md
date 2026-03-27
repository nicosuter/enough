# blacklist

Personal blacklist for companies and people.

This project is meant to integrate with agents over MCP and REST so they can store and check a personal blacklist before recommending products, services, vendors, or businesses.

If you've had enough of a company's business practices, your agent can record that here and check for matches later to help avoid future recommendations.

## Focus

The primary use case is companies.

Examples:
- companies with abusive pricing or billing practices
- companies with spammy sales behavior
- companies with poor customer support
- companies you simply never want to buy from again

People can also be stored, but the company workflow is the main focus.

## Interfaces

This repo exposes two local interfaces:
- REST API for CRUD and lookup
- MCP tools for agent-driven CRUD and lookup

MCP tools:
- `lookupEntry`
- `listEntries`
- `createEntry`
- `updateEntry`
- `deleteEntry`

## Record shape

Each blacklist entry supports:
- generated ID
- type: `company` or `person`
- name
- aliases
- reason
- tags
- evidence links
- severity: `watch`, `warn`, `blacklisted_temporary`, `blacklisted`
- `incidentDate`
- `createdAt`
- `updatedAt`
- optional `expiresAt` for temporary blacklisting

## Goal

Keep a simple personal sanctions database that an agent can consult before surfacing a company again.

## Local setup

```bash
npm install
npm run typecheck
npm test
```

## Run locally

REST server:

```bash
npm run dev:rest
```

MCP server:

```bash
npm run dev:mcp
```

Defaults:
- REST listens on `http://localhost:3000`
- SQLite database path is `./data/blacklist.sqlite`

Optional environment variables:
- `PORT`
- `BLACKLIST_DB_PATH`

## REST routes

- `POST /entries`
- `GET /entries`
- `GET /entries/:id`
- `PATCH /entries/:id`
- `DELETE /entries/:id`
- `GET /lookup?name=...`
