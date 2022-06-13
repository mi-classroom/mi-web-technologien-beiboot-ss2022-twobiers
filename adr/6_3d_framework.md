# 3D Framework - Three.js

## Status

Accepted

## Context

In order to implement a 3D-based environment in which the artworks of Lucas Cranach should be presented, some 3D funcionallity is necessary.
There are several ways to achieve this in a browser, startingg from CSS transitions, plain canvas animations or canvas animations using [WebGL](https://www.khronos.org/webgl/).
As plain CSS transitions probably won't scale enough, the focus is set on WebGL technolgies.
In order to use WebGL the following technolgies were considered:
* Plain WebGL (Frameworkless)
* [Three.js](https://threejs.org/)
* [babylon.js](https://www.babylonjs.com/)
* [ogl](https://github.com/oframe/ogl)
* [PlayCanvas](https://playcanvas.com/)

## Decision

The requirements for this project are pretty straightforward and rather simple. It is probably not necessary to use a fully-fledged game engine in the browser. For the moment a 
WebGL framework is feasible. Plain WebGL is a pretty low-level API and although the attraction of sticking to that is pretty high, it is probably way more difficult to get things done.
Due to the time management and also as it would require low-level effort from the review buddies, plain WebGL is probably not the best idea for this project.
After some research on minimalistic WebGL abstractions OGL were considerd as a valid approach. However, OGL is in a very early development staged and its performance is pretty bad in the moment.

**Three.js** seems to be the best compromise

## Consequences

Pros:
* High-Level abstractions
* Flexibility
* Big userbase, documentations and examples available
* TypeScript support

Cons:
* Lock-In, hard to migrate to another framework
* Game-Engine Features like walking around, moving camera might be more difficult to achieve