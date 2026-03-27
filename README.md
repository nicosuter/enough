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

## Intended interface

This repo is being built around two local interfaces:
- REST API for CRUD and lookup
- MCP tools for agent-driven CRUD and lookup

Planned MCP tools:
- `lookupEntry`
- `listEntries`
- `createEntry`
- `updateEntry`
- `deleteEntry`

## Planned record shape

Each blacklist entry is intended to support:
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
