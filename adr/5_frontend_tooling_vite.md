# Frontend Tooling - Vite

## Status

Try

## Context

For local development a frontend tooling should be used that is capable of serving the application and reacting to file changes.

## Decision

Try [Vite](https://vitejs.dev/)

## Consequences

Pros:
* TypeScript support out of the box (overcomes cons from [ADR - Programming Language - TypeSecript](./1_language_ts.md))
* built-in support for Sass (provided styles are in Sass)
* Built-in server with fast restart gives fast development feedback
* No bundling necessary - modern ES Modules can be used

Cons:
* Bundlers like WebPack, Rollup or Parcel are _probably_ more mature