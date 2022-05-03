# Programming Language - TypeScript

## Status

Accepted

## Context

A programming language must be choosen in order to program.

## Decision

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