var T=Object.defineProperty,j=Object.defineProperties;var A=Object.getOwnPropertyDescriptors;var g=Object.getOwnPropertySymbols;var N=Object.prototype.hasOwnProperty,x=Object.prototype.propertyIsEnumerable;var D=(e,t,n)=>t in e?T(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,w=(e,t)=>{for(var n in t||(t={}))N.call(t,n)&&D(e,n,t[n]);if(g)for(var n of g(t))x.call(t,n)&&D(e,n,t[n]);return e},E=(e,t)=>j(e,A(t));const $=function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))o(r);new MutationObserver(r=>{for(const s of r)if(s.type==="childList")for(const i of s.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&o(i)}).observe(document,{childList:!0,subtree:!0});function n(r){const s={};return r.integrity&&(s.integrity=r.integrity),r.referrerpolicy&&(s.referrerPolicy=r.referrerpolicy),r.crossorigin==="use-credentials"?s.credentials="include":r.crossorigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function o(r){if(r.ep)return;r.ep=!0;const s=n(r);fetch(r.href,s)}};$();const k=(e,t)=>t.some(n=>e instanceof n);let L,B;function _(){return L||(L=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function F(){return B||(B=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const C=new WeakMap,h=new WeakMap,S=new WeakMap,f=new WeakMap,b=new WeakMap;function V(e){const t=new Promise((n,o)=>{const r=()=>{e.removeEventListener("success",s),e.removeEventListener("error",i)},s=()=>{n(d(e.result)),r()},i=()=>{o(e.error),r()};e.addEventListener("success",s),e.addEventListener("error",i)});return t.then(n=>{n instanceof IDBCursor&&C.set(n,e)}).catch(()=>{}),b.set(t,e),t}function W(e){if(h.has(e))return;const t=new Promise((n,o)=>{const r=()=>{e.removeEventListener("complete",s),e.removeEventListener("error",i),e.removeEventListener("abort",i)},s=()=>{n(),r()},i=()=>{o(e.error||new DOMException("AbortError","AbortError")),r()};e.addEventListener("complete",s),e.addEventListener("error",i),e.addEventListener("abort",i)});h.set(e,t)}let y={get(e,t,n){if(e instanceof IDBTransaction){if(t==="done")return h.get(e);if(t==="objectStoreNames")return e.objectStoreNames||S.get(e);if(t==="store")return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return d(e[t])},set(e,t,n){return e[t]=n,!0},has(e,t){return e instanceof IDBTransaction&&(t==="done"||t==="store")?!0:t in e}};function z(e){y=e(y)}function H(e){return e===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(t,...n){const o=e.call(m(this),t,...n);return S.set(o,t.sort?t.sort():[t]),d(o)}:F().includes(e)?function(...t){return e.apply(m(this),t),d(C.get(this))}:function(...t){return d(e.apply(m(this),t))}}function K(e){return typeof e=="function"?H(e):(e instanceof IDBTransaction&&W(e),k(e,_())?new Proxy(e,y):e)}function d(e){if(e instanceof IDBRequest)return V(e);if(f.has(e))return f.get(e);const t=K(e);return t!==e&&(f.set(e,t),b.set(t,e)),t}const m=e=>b.get(e);function R(e,t,{blocked:n,upgrade:o,blocking:r,terminated:s}={}){const i=indexedDB.open(e,t),c=d(i);return o&&i.addEventListener("upgradeneeded",a=>{o(d(i.result),a.oldVersion,a.newVersion,d(i.transaction))}),n&&i.addEventListener("blocked",()=>n()),c.then(a=>{s&&a.addEventListener("close",()=>s()),r&&a.addEventListener("versionchange",()=>r())}).catch(()=>{}),c}const U=["get","getKey","getAll","getAllKeys","count"],X=["put","add","delete","clear"],p=new Map;function v(e,t){if(!(e instanceof IDBDatabase&&!(t in e)&&typeof t=="string"))return;if(p.get(t))return p.get(t);const n=t.replace(/FromIndex$/,""),o=t!==n,r=X.includes(n);if(!(n in(o?IDBIndex:IDBObjectStore).prototype)||!(r||U.includes(n)))return;const s=async function(i,...c){const a=this.transaction(i,r?"readwrite":"readonly");let l=a.store;return o&&(l=l.index(c.shift())),(await Promise.all([l[n](...c),r&&a.done]))[0]};return p.set(t,s),s}z(e=>E(w({},e),{get:(t,n,o)=>v(t,n)||e.get(t,n,o),has:(t,n)=>!!v(t,n)||e.has(t,n)}));const J="lucascranach",G=1,Q=e=>{e.createObjectStore("items",{keyPath:"objectId"})},I=R(J,G,{upgrade(e,t,n,o){const r=e;switch(t){case 0:Q(r)}}}),Y=async e=>{const t=await I;if(e.length===0)return[];if(e.length===1)return[await t.add("items",e[0],e[0].objectId)];const n=t.transaction("items","readwrite"),o=await Promise.all(e.map(r=>n.store.add(r)));return await n.done,o},Z=async()=>await(await I).count("items")>0,O=()=>I.then(e=>e.getAll("items")).then(e=>e.filter(t=>t.isBestOf).sort((t,n)=>t.sortingNumber.localeCompare(n.sortingNumber))),u=document.querySelector("#app"),q=e=>{const t=document.createElement("div");t.classList.add("item");const n=e.images.overall.images[0].sizes.medium.src,o=e.metadata.title,r=e.metadata.date,s=e.medium.substring(0,e.medium.indexOf("(")).trim(),i=e.repository;return t.innerHTML=`
        <img alt=${o} src=${n} />
        <table class="metadata">
            <tr>
                <td>Titel</td>
                <td>${o}</td>
            </tr>
            <tr>
                <td>Datierung</td>
                <td>${r}</td>
            </tr>
            <tr>
                <td>Art</td>
                <td>${s}</td>
            </tr>
            <tr>
                <td>Besizer</td>
                <td>${i}</td>
            </tr>
        </table>
    `,t},P=e=>{const t=document.createElement("div");t.classList.add("item-stream");for(const n of e)t.appendChild(q(n));u.innerHTML="",u.appendChild(t)},M=()=>{const e=document.createElement("div");return e.classList.add("divider"),e},ee=()=>{const e=document.createElement("div");e.classList.add("upload-banner");const t=document.createElement("div");t.classList.add("upload-content");const n=document.createElement("input");n.id="uploadFile",n.type="file",n.accept="application/json",n.addEventListener("change",async s=>{var c;const i=(c=s.target.files)==null?void 0:c.item(0);if(i){const a=JSON.parse(await i.text()),l=await Y(a.items);console.log(`Successfully saved ${l.length} items in IndexDB`),e.style.display="none",P(await O())}},!1);const o=document.createElement("input");o.classList.add("upload-button"),o.type="button",o.value="Datensatz ausw\xE4hlen...",o.addEventListener("click",()=>n.click());const r=document.createElement("h2");r.innerText="Datensatz hochladen",t.appendChild(r),t.appendChild(n),t.appendChild(o),e.appendChild(M()),e.appendChild(t),e.appendChild(M()),u.innerHTML="",u.appendChild(e)},te=async()=>{await Z()?P(await O()):ee()};te().then(()=>console.log("Initilization completed"));
