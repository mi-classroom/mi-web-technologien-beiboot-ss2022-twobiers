# Programming Language - TypeScript

## Status

Accepted

## Context

A programming language must be choosen in order to program. Since we are going to implement a web application it should be a proggramming language designed for the web.
A few possible options are:
- [JavaScript](https://www.ecma-international.org/publications-and-standards/standards/ecma-262/)
- [TypeScript](https://www.typescriptlang.org/)
- A language that compiles to [WebAssembly](https://webassembly.org/), for example [Rust](https://www.rust-lang.org/)
- [PyScript](https://pyscript.net/)

## Decision

Since PyScript is pretty young and is not really intended for webdevelopment it is not considered as a valid option. Languages that compile to WebAssembly sound like a nice idea
and it would be very interesting to try it out but I have doubts regarding the ecosystem as it is still a pretty young technology. 
JavaScript and TypeScript were considered as valid options and the deecision is:
* Use [TypeScript](https://www.typescriptlang.org/)

## Consequences

Pros: 
* Compile-time type-safety
* Custom typing brings secure use of custom data structures
* Catching potentional bugs compile-time
* Better autocompletion in IDE
* Targetting of specific ECMAScript Versions 

Cons:
* Typing can bring developing overhead
    * ... but is still optional
* Additional Tooling and dependencies required (TypeScript Compiler, type packages)
* Error stacktraces will lead to compiled js line numbers unless configured else
* Additional Configuration necessary