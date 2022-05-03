# Storage - IndexedDB

## Status

Try

## Context

The data set needs to be supplied. As it is not part of the static assets and must not be, another solution is required.
LocalStorage cannot be considered without manual editing of the data set because of the storage limit.

## Decision

* Let the user supply the data set and try to store it in the browsers internal [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)

## Consequences

Pros:
* User has to supply the data set only once and it is persistet in browsers storage
* Enables SQL-like data handling
* Faster and more resource-friendly than keeping the full data set in runtime heap.
* Access to full data set gives the capability to react fast on future requirements.

Cons: 
* IndexedDB is pretty low-level and not supported in older browsers
    * Dependencies like [LocalForage](https://localforage.github.io/localForage/) overcome that issue.
* Requires Care in schema versioning and migrations