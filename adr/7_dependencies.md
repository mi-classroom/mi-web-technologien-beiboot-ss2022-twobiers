# Dependencies - Keep at Minimum

## Status

Accepted

## Context

The chosen [3D Framework](./6_3d_framework.md) has a rather big ecosystem containing various libraries and plugins that can be used to improve the usage.
In addition, there are also countless other web libraries that make things easier and reduce the workload.

For example we could use [troika-three-text](https://www.npmjs.com/package/troika-three-text) to display text within the Three.js scene,
use [Preact](https://preactjs.com/) together with [react-three-fiber](https://github.com/pmndrs/react-three-fiber) or use [Lit](https://lit.dev/)
to develop custom web components instead of doing plain JavaScript DOM manipulation.

## Decision

Keep external dependencies at a minumum. This is a drastic and consequential decision but as this project is only prototypical the consequences are tolerable and provide a clearer picture of the technologies used.

## Consequences

Pros:
* Deeper understanding of Three.js, the browser and its architecture
* Smaller bundle size

Cons:
* Harder to maintain a clean codebase
* Repetitive work
* Reinventing wheels
* Lack of performance because of less sophisticated algorithms