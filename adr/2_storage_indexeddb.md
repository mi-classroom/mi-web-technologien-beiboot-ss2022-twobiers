# Storage - IndexedDB

## Status

Try

## Context

The data set needs to be supplied. As it is not part of the static assets and must not be, another solution is required.
In order to achieve this a few options are being considered.
- Provide a custom backend
- Bundle the dataset during deployment
- Let the user upload the dataset
The most pragmatic solution, which means the least effort and thus saves time to focus on the essential is to let the user upload the dataset and that is how it is done in this project.

However, the user should not be prompted everytime he visits the website, rather store the dataset in the browsers internal storage. 
The browser has multiple storage types that can be used:
- Cookies
- LocalStorage
- SessionStorage
- IndexedDB
- Web SQL

## Decision

Cookies and LocalStorage cannot be considered without manual filtiering of the data set because of the storage limit. We must be able to store about 80MB of data. 
SessionStorage cannot be considered as a valid option since (as the name suggests) it is only persistent during a session.
Web SQL is deprecated and cannot be considered.

* use [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)

## Consequences

Pros:
* User has to supply the data set only once and it is persistet in browsers storage
* Enables SQL-like data handling
* Faster and more resource-friendly than keeping the full data set in runtime heap.
* Access to full data set gives the capability to react fast on future requirements.

Cons: 
* IndexedDB is not supported in older Browsers
* IndexedDB is pretty low-level and not supported in older browsers
    * Dependencies like [LocalForage](https://localforage.github.io/localForage/) overcome that issue. 
    * However, that would simulate a IndexedDB by using the LocalStorage and that would be a problem regarding the storage limit.
* Requires Care in schema versioning and migrations