# Frontend Tooling - Vite

## Status

Try

## Context

For local development a frontend tooling should be used that is capable of serving the application and reacting to file changes and also bundle the application for deployment.
Possible options are:
- [WebPack](https://webpack.js.org/)
- [rollup.js](https://rollupjs.org/guide/en/)
- [Parcel](https://parceljs.org/)
- [Vite](https://vitejs.dev/)
- [Gulp](https://gulpjs.com/)

## Decision

Webpack, rollup and gulp are fairly complex and feel they are getting on in years. Because of that I want to try something new and modern. Therfore, I focused my decision on [Parcel](https://parceljs.org/) (especially v2) and [Vite](https://vitejs.dev/).
Because Vite brings some nice and useful features out of the box and [esbuild (used by Vite) is way faster than Parcel 2](https://esbuild.github.io/faq/#benchmark-details), I'd give Vite a chance.

## Consequences

Pros:
* TypeScript support out of the box (overcomes cons from [ADR - Programming Language - TypeSecript](./1_language_ts.md))
* built-in support for Sass (provided styles are in Sass)
* Built-in server with fast restart gives fast development feedback
* No bundling necessary - modern ES Modules can be used (at least for development builds)

Cons:
* Bundlers like WebPack, Rollup or Parcel are _probably_ more mature
* Vite still bundles the application during production due to compatibility reasons
    * However, the production build can be slower, that is okay. Since the application is not bundled in development mode we overcome this issue mostly and benefit from fast feedback times.