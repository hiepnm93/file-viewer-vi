const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/docx-preview-CVpJhhZw.js","assets/chunk-CMxvf4Kt.js","assets/jszip.min-Bm_16osY.js"])))=>i.map(i=>d[i]);
import{o as e}from"./chunk-CMxvf4Kt.js";import{b as t,p as n,v as r}from"./styles-CmFBY4Cl.js";import{a as i,o as a}from"./assets-BCT_H1IV.js";import{t as o}from"./preload-helper-zJ_50EbN.js";import{i as s,n as c,r as l,t as u}from"./printLayout-C9NUCua_.js";var d={width:794,height:1123},f=2,p=12e4,m=.24,h=3,g=.15,_=9525,v=(()=>{let e={module:null,async load(){return this.module||=o(()=>import(`./docx-preview-CVpJhhZw.js`),__vite__mapDeps([0,1,2])),this.module}};return async()=>await e.load()})(),y=(e,t,n)=>{let r=t?.options?.docx,o=e.ownerDocument.URL||void 0,s=r?.worker!==!1,c=r?.visualPagination===!0;return{debug:!1,experimental:!1,useWorker:s,workerUrl:s?a(r,o):void 0,workerJsZipUrl:s?i(r,o):void 0,workerFallback:!0,workerTimeout:r?.workerTimeout??p,renderPageBatchSize:r?.renderPageBatchSize??(r?.progressive===!1?2**53-1:f),renderYieldEveryMs:r?.renderYieldEveryMs??16,strictWordCompatibility:r?.strictWordCompatibility??!0,paginationTolerance:r?.paginationTolerance??2,breakPages:c,maxDynamicPaginationPasses:c?r?.maxDynamicPaginationPasses??1e3:0,awaitLayout:r?.awaitLayout??c,preserveComplexFieldResults:r?.preserveComplexFieldResults??!0,updatePageReferences:r?.updatePageReferences??!1,hideWebHiddenContent:r?.hideWebHiddenContent??!1,ignoreLastRenderedPageBreak:r?.ignoreLastRenderedPageBreak??!c,progress:e=>{(e.phase===`render`||e.phase===`layout`||e.phase===`done`)&&n()}}},b=e=>e.ownerDocument.defaultView,x=(e,t)=>{let n=b(t)?.HTMLElement;return n?e instanceof n:e instanceof HTMLElement},ee=e=>e?.options?.docx?.visualPagination===!0,S=`
.docx-fit-viewer {
  box-sizing: border-box;
  height: 100%;
  overflow: auto;
  background: #ececec;
}
.docx-fit-viewer .docx-wrapper {
  box-sizing: border-box;
  min-width: 0 !important;
  width: 100% !important;
  padding: 24px 14px 40px !important;
  background: #e7e9ec !important;
}
.docx-fit-viewer .docx-page-frame {
  position: relative;
  width: 100%;
  min-width: 0;
  margin: 0 auto 24px;
  overflow: visible;
}
.docx-fit-viewer .docx-flow-frame {
  position: relative;
  width: 100%;
  min-width: 0;
  margin: 0 auto 28px;
  overflow: visible;
}
.docx-fit-viewer .docx-page-frame > section.docx,
.docx-fit-viewer .docx-flow-frame > section.docx {
  position: absolute;
  top: 0;
  left: 50%;
  margin: 0 !important;
  background: #ffffff !important;
  box-shadow: 0 2px 14px rgba(25, 35, 48, 0.18);
  box-sizing: border-box;
  color: #111827;
  overflow: hidden;
  transform-origin: top center;
}
.docx-fit-viewer .docx-flow-frame > section.docx {
  height: auto !important;
  min-height: 0 !important;
  overflow: visible !important;
}
.docx-fit-viewer .docx-page-frame > section.docx > article,
.docx-fit-viewer .docx-flow-frame > section.docx > article {
  position: relative;
  z-index: 1;
}
.docx-fit-viewer .docx-vml-watermark {
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.28;
  filter: saturate(0.72) brightness(1.24);
  pointer-events: none;
  user-select: none;
}
.docx-fit-viewer .docx-vml-fallback,
.docx-fit-viewer .docx-chart-fallback {
  display: block;
  max-width: 100%;
  margin: 12px auto;
  break-inside: avoid;
  page-break-inside: avoid;
}
.docx-fit-viewer .docx-vml-fallback {
  text-align: center;
}
.docx-fit-viewer .docx-vml-fallback img {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 0 auto;
}
.docx-fit-viewer .docx-chart-fallback {
  box-sizing: border-box;
  overflow: hidden;
  border: 1px solid #d7dee8;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 1px 6px rgba(15, 23, 42, 0.08);
}
.docx-fit-viewer .docx-chart-fallback svg {
  display: block;
  width: 100%;
  height: auto;
}
`;function C(e){return e.localName||e.tagName.split(`:`).pop()||e.tagName}function w(e,t){return Array.from(e.querySelectorAll(`*`)).filter(e=>C(e)===t)}function T(e,t){return w(e,t)[0]}function E(e,t,n){return(n?e.getAttributeNS(n,t):null)||e.getAttribute(t)||e.getAttribute(`r:${t}`)}function D(e){return e?(e.textContent||``).replace(/\s+/g,` `).trim():``}function O(e,t){let n=e?.parentElement||null;for(;n;){if(C(n)===t)return n;n=n.parentElement}return null}function k(e){let t=C(e)===`p`?e:O(e,`p`);if(!t)return;let n=0,r=t.previousElementSibling;for(;r;)C(r)===`p`&&(n+=1),r=r.previousElementSibling;return n}function A(e,t){let n=b(t)?.DOMParser||globalThis.DOMParser;if(!n)return null;let r=new n().parseFromString(e,`application/xml`);return r.querySelector(`parsererror`)?null:r}function j(e){let t=[];return e.split(`/`).forEach(e=>{if(!(!e||e===`.`)){if(e===`..`){t.pop();return}t.push(e)}}),t.join(`/`)}function M(e){let t=e.lastIndexOf(`/`);return t>=0?e.slice(0,t):``}function N(e){let t=M(e);return j(`${t}/_rels/${e.slice(t?t.length+1:0)}.rels`)}function P(e,t){return t.startsWith(`/`)?j(t.slice(1)):j(`${M(e)}/${t}`)}function F(e){switch(e.split(`.`).pop()?.toLowerCase()){case`png`:return`image/png`;case`jpg`:case`jpeg`:return`image/jpeg`;case`gif`:return`image/gif`;case`bmp`:return`image/bmp`;case`webp`:return`image/webp`;case`svg`:return`image/svg+xml`;default:return`application/octet-stream`}}function I(e){if(!e)return;let t=e.trim().match(/^(-?\d+(?:\.\d+)?)(px|pt|in|cm|mm)?$/i);if(!t)return;let n=Number(t[1]);if(!(!Number.isFinite(n)||n<=0))switch((t[2]||`px`).toLowerCase()){case`pt`:return n*96/72;case`in`:return n*96;case`cm`:return n*96/2.54;case`mm`:return n*96/25.4;default:return n}}function te(e){let t=new Map;return e&&e.split(`;`).forEach(e=>{let n=e.indexOf(`:`);n<=0||t.set(e.slice(0,n).trim().toLowerCase(),e.slice(n+1).trim())}),t}function ne(e){let t=te(e);return{width:I(t.get(`width`)),height:I(t.get(`height`))}}function re(e){let t=O(e,`inline`)||O(e,`anchor`),n=t?T(t,`extent`):void 0,r=Number(n?.getAttribute(`cx`)),i=Number(n?.getAttribute(`cy`));return{width:Number.isFinite(r)&&r>0?r/_:void 0,height:Number.isFinite(i)&&i>0?i/_:void 0}}async function L(e,t,n){let r=e.file(N(t)),i=new Map;if(!r)return i;let a=A(await r.async(`text`),n);return a&&w(a,`Relationship`).forEach(e=>{let t=e.getAttribute(`Id`),n=e.getAttribute(`Target`);!t||!n||i.set(t,{id:t,type:e.getAttribute(`Type`)||``,target:n,targetMode:e.getAttribute(`TargetMode`)||void 0})}),i}async function ie(e,t){let n=e.file(t);if(!n)return;let r=await n.async(`base64`);return`data:${F(t)};base64,${r}`}function ae(e){return Object.keys(e.files).filter(e=>e===`word/document.xml`||/^word\/header\d+\.xml$/i.test(e)||/^word\/footer\d+\.xml$/i.test(e)).sort((e,t)=>e===`word/document.xml`?-1:t===`word/document.xml`?1:e.localeCompare(t))}function R(e,t,n){let r=`${t?.getAttribute(`id`)||``} ${t?.getAttribute(`o:spid`)||``}`.toLowerCase(),i=(n||``).toLowerCase();return e.includes(`/header`)&&(r.includes(`watermark`)||i.includes(`z-index:-`)||i.includes(`mso-position-horizontal:center`))?`watermark`:t?.getAttribute(`o:ole`)===`t`||t?.getAttribute(`ole`)===`t`?`ole-preview`:`vml-image`}async function z(e,t){let n=[],r=new Set;for(let i of ae(e)){let a=e.file(i);if(!a)continue;let o=A(await a.async(`text`),t);if(!o)continue;let s=await L(e,i,t);for(let t of w(o,`imagedata`)){let a=E(t,`id`,`http://schemas.openxmlformats.org/officeDocument/2006/relationships`),o=a?s.get(a):void 0;if(!o||o.targetMode===`External`||!o.type.includes(`/image`))continue;let c=P(i,o.target),l=await ie(e,c);if(!l)continue;let u=O(t,`shape`),d=u?.getAttribute(`style`)||void 0,f=R(i,u,d),p=f===`watermark`?`${f}:${c}`:`${f}:${i}:${c}:${k(t)??`end`}`;r.has(p)||(r.add(p),n.push({role:f,key:p,dataUrl:l,sourcePath:c,partPath:i,title:t.getAttribute(`o:title`)||t.getAttribute(`title`)||void 0,style:d,...ne(d),paragraphIndex:i===`word/document.xml`?k(t):void 0}))}}return n}function B(e){return e?w(e,`pt`).sort((e,t)=>Number(e.getAttribute(`idx`)||0)-Number(t.getAttribute(`idx`)||0)).map(e=>D(T(e,`v`))).filter(Boolean):[]}function V(e){let t=B(T(T(e,`tx`)||e,`strCache`))[0]||B(T(T(e,`tx`)||e,`numCache`))[0]||`Series`,n=B(T(T(e,`cat`)||e,`strCache`)),r=B(T(T(e,`cat`)||e,`numCache`)),i=B(T(T(e,`val`)||e,`numCache`)).map(e=>Number(e)).filter(e=>Number.isFinite(e));return{name:t,categories:n.length?n:r,values:i}}function H(e,t,n,r){let i=[`lineChart`,`barChart`,`pieChart`,`areaChart`,`scatterChart`].map(t=>w(e,t)[0]).find(Boolean),a=i?C(i):`chart`,o=D(T(T(e,`title`)||e,`t`))||t.split(`/`).pop()||`Chart`,s=w(i||e,`ser`).map(V).filter(e=>e.values.length),{width:c,height:l}=re(n);if(s.length)return{key:`chart:${t}:${r??`end`}`,title:o,type:a,sourcePath:t,series:s,width:c,height:l,paragraphIndex:r}}async function U(e,t){let n=`word/document.xml`,r=e.file(n);if(!r)return[];let i=A(await r.async(`text`),t);if(!i)return[];let a=await L(e,n,t),o=[],s=new Set;for(let r of w(i,`chart`)){let i=E(r,`id`,`http://schemas.openxmlformats.org/officeDocument/2006/relationships`),c=i?a.get(i):void 0;if(!c||c.targetMode===`External`||!c.type.includes(`/chart`))continue;let l=P(n,c.target),u=e.file(l);if(!u)continue;let d=A(await u.async(`text`),t),f=k(r),p=d?H(d,l,r,f):void 0;!p||s.has(p.key)||(s.add(p.key),o.push(p))}return o}function W(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`)}function G(e){let t=Math.max(360,Math.round(e.width||520)),n=Math.max(220,Math.round(e.height||320)),r={top:52,right:30,bottom:56,left:54},i=t-r.left-r.right,a=n-r.top-r.bottom,o=e.series.flatMap(e=>e.values),s=Math.max(...o,1),c=Math.min(...o,0),l=Math.max(s-c,1),u=[`#2563eb`,`#10b981`,`#f97316`,`#8b5cf6`,`#ef4444`],d=Math.max(...e.series.map(e=>e.values.length),1),f=e=>r.left+(d===1?i/2:e*i/(d-1)),p=e=>r.top+a-(e-c)/l*a,m=e.series.map((e,t)=>{let n=u[t%u.length];return`<polyline points="${e.values.map((e,t)=>`${f(t).toFixed(1)},${p(e).toFixed(1)}`).join(` `)}" fill="none" stroke="${n}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>${e.values.map((t,r)=>`<circle cx="${f(r).toFixed(1)}" cy="${p(t).toFixed(1)}" r="3.5" fill="${n}"><title>${W(e.name)}: ${W(String(t))}</title></circle>`).join(``)}`}).join(``),h=(e.series.find(e=>e.categories.length)?.categories||[]).slice(0,d).map((e,t)=>{let r=f(t),i=e.length>14?`${e.slice(0,13)}...`:e;return`<text x="${r.toFixed(1)}" y="${n-22}" text-anchor="middle" fill="#64748b" font-size="11">${W(i)}</text>`}).join(``),g=e.series.slice(0,5).map((e,t)=>`<g transform="translate(${r.left+t*98} 30)"><rect width="10" height="10" rx="2" fill="${u[t%u.length]}"/><text x="15" y="9" fill="#475569" font-size="11">${W(e.name)}</text></g>`).join(``);return`<svg viewBox="0 0 ${t} ${n}" role="img" aria-label="${W(e.title)}">
    <rect x="0" y="0" width="${t}" height="${n}" rx="8" fill="#ffffff"/>
    <text x="${r.left}" y="22" fill="#0f172a" font-size="15" font-weight="700">${W(e.title)}</text>
    ${g}
    <line x1="${r.left}" y1="${r.top+a}" x2="${r.left+i}" y2="${r.top+a}" stroke="#cbd5e1"/>
    <line x1="${r.left}" y1="${r.top}" x2="${r.left}" y2="${r.top+a}" stroke="#cbd5e1"/>
    <text x="${r.left-8}" y="${r.top+4}" text-anchor="end" fill="#64748b" font-size="11">${W(s.toFixed(1))}</text>
    <text x="${r.left-8}" y="${r.top+a}" text-anchor="end" fill="#64748b" font-size="11">${W(c.toFixed(1))}</text>
    ${m}
    ${h}
  </svg>`}function K(e){return Array.from(e.querySelectorAll(`section.docx`))}function q(e){return Array.from(e.querySelectorAll(`section.docx > article`))}function oe(e,t){if(t===void 0)return;let n=Array.from(e.querySelectorAll(`section.docx > article p`));return n[Math.min(Math.max(t,0),Math.max(n.length-1,0))]}function J(e,t,n){let r=oe(e,n);if(r){r.after(t);return}let i=q(e)[0];i&&i.appendChild(t)}function se(e,t){let n=K(e);n.length&&t.forEach(t=>{if(t.role===`watermark`){n.forEach(n=>{let r=e.ownerDocument.createElement(`img`);r.className=`docx-vml-watermark`,r.src=t.dataUrl,r.alt=t.title||``,r.dataset.docxFallback=t.key,n.prepend(r)});return}let r=e.ownerDocument.createElement(`figure`);r.className=`docx-vml-fallback`,r.dataset.docxFallback=t.key,t.width&&(r.style.width=`${Math.round(t.width)}px`);let i=e.ownerDocument.createElement(`img`);i.src=t.dataUrl,i.alt=t.title||(t.role===`ole-preview`?`Embedded object preview`:`Document image`),t.width&&(i.style.width=`${Math.round(t.width)}px`),t.height&&(i.style.height=`${Math.round(t.height)}px`),r.appendChild(i),J(e,r,t.paragraphIndex)})}function ce(e,t){t.forEach(t=>{let n=e.ownerDocument.createElement(`figure`);n.className=`docx-chart-fallback`,n.dataset.docxFallback=t.key,t.width&&(n.style.width=`${Math.round(t.width)}px`),n.innerHTML=G(t),J(e,n,t.paragraphIndex)})}async function le(t,n){try{let{default:r}=await o(async()=>{let{default:t}=await import(`./jszip.min-Bm_16osY.js`).then(t=>e(t.t(),1));return{default:t}},__vite__mapDeps([2,1])),i=await r.loadAsync(t.slice(0)),[a,s]=await Promise.all([z(i,n),U(i,n)]);a.length&&se(n,a),s.length&&ce(n,s)}catch(e){console.warn(`[file-viewer] DOCX 兼容增强解析失败，已保留 @file-viewer/docx 原始渲染结果。`,e)}}function ue(e){let t=e.ownerDocument.createElement(`style`);return t.textContent=S,e.prepend(t),t}function Y(e,t,n){let r=e.cloneNode(!1);r.innerHTML=``,r.dataset.docxPaginated=`true`,r.style.minHeight=`${n}px`,r.style.height=`${n}px`,r.style.overflow=`hidden`;let i=t.cloneNode(!1);return r.appendChild(i),Array.from(e.children).forEach(e=>{e!==t&&r.appendChild(e.cloneNode(!0))}),{page:r,article:i}}function de(e){let t=e.ownerDocument.defaultView?.getComputedStyle(e),n=t?parseFloat(t.minHeight):0;return Number.isFinite(n)&&n>0?n:e.offsetHeight}function fe(e){let t=e.querySelector(`.docx-wrapper`);t&&Array.from(t.children).forEach(t=>{if(!x(t,e)||!t.matches(`section.docx`))return;let n=t.querySelector(`:scope > article`);if(!x(n,e))return;let r=de(t),i=Array.from(n.childNodes);if(!r||i.length<2||t.scrollHeight<=r*1.15)return;let a=Y(t,n,r);t.before(a.page),i.forEach(e=>{a.article.appendChild(e),!(a.page.scrollHeight<=r+1||a.article.childNodes.length===1)&&(a.article.removeChild(e),a=Y(t,n,r),t.before(a.page),a.article.appendChild(e))}),t.remove()})}function pe(e,t){let n=e.querySelector(`.docx-wrapper`);return n?Array.from(n.children).flatMap(n=>{if(!x(n,e)||!n.matches(`section.docx`))return[];let r=e.ownerDocument.createElement(`div`);return r.className=t?`docx-page-frame`:`docx-flow-frame`,n.before(r),r.appendChild(n),[r]}):[]}function me(e,i){e.classList.add(`docx-fit-viewer`);let a=ue(e),o=ee(i);o&&fe(e);let s=pe(e,o),c=b(e),l=c?.ResizeObserver,u=0,d=1,f=1,p=1,_=n(),v=e=>Math.min(h,Math.max(m,Number(e.toFixed(2)))),y=()=>{c&&(c.cancelAnimationFrame(u),u=c.requestAnimationFrame(()=>{let t=1;s.forEach(n=>{let r=n.firstElementChild;if(!x(r,e))return;r.style.transform=`translateX(-50%)`;let i=r.offsetWidth,a=o?r.offsetHeight:Math.max(r.scrollHeight,r.offsetHeight);if(!i||!a)return;let s=Math.max(e.clientWidth-28,120),c=Math.min(1,Math.max(m,s/i)),l=v(c*d);t=l,p=c,r.style.transform=`translateX(-50%) scale(${l})`,n.style.width=`${Math.ceil(Math.max(i*l,e.clientWidth-28,120))}px`,n.style.maxWidth=`none`,n.style.height=`${Math.ceil(a*l)}px`}),f=t,_.emit()}))},S=()=>({scale:f,label:`${Math.round(f*100)}%`,canZoomIn:f<h,canZoomOut:f>m,canReset:d!==1,minScale:m,maxScale:h}),C=e=>(d=Math.min(6,Math.max(.2,Number(e.toFixed(2)))),y(),S());e.dataset.viewerZoomProvider=`docx`,r(e,{zoomIn:()=>C(d+g),zoomOut:()=>C(d-g),resetZoom:()=>C(1),setZoom:e=>C(e/Math.max(p,.01)),getState:S,subscribe:_.subscribe});let w=l?new l(y):null;return w?.observe(e),s.forEach(e=>{let t=X(e);t&&w?.observe(t)}),y(),()=>{c?.cancelAnimationFrame(u),w?.disconnect(),t(e),a.remove(),e.classList.remove(`docx-fit-viewer`)}}function X(e){let t=e.firstElementChild,n=e.ownerDocument.defaultView?.HTMLElement;return n&&t instanceof n?t:null}function Z(e){return!!e?.classList.contains(`docx-flow-frame`)}function Q(e){let t=e?X(e):null;if(!t)return d;let n=s(t,d);return Z(e)?{width:n.width,height:Math.max(t.scrollHeight||0,t.offsetHeight||0,d.height)}:n}function he(e,t){let n=Z(e),r=l(t.width),i=l(t.height);u(e,t,{heightMode:n?`min`:`fixed`}),e.style.margin=`0 auto 18px`;let a=X(e);a&&(a.style.position=`relative`,a.style.top=`auto`,a.style.left=`auto`,a.style.width=r,a.style.maxWidth=`none`,a.style.minHeight=n?`0`:i,a.style.height=n?`auto`:i,a.style.margin=`0 auto`,a.style.transform=`none`,a.style.transformOrigin=`top left`,a.style.overflow=n?`visible`:`hidden`,a.style.boxShadow=`none`)}function ge(e){let t=e.querySelector(`.docx-page-frame, .docx-flow-frame`),n=Q(t||void 0);return c({selector:t?.classList.contains(`docx-flow-frame`)?`.viewer-export-content .docx-flow-frame`:`.viewer-export-content .docx-page-frame`,width:n.width,height:t?.classList.contains(`docx-flow-frame`)?d.height:n.height,heightMode:t?.classList.contains(`docx-flow-frame`)?`min`:`fixed`})}function $(e){let t=Array.from(e.querySelectorAll(`.docx-page-frame, .docx-flow-frame`)),n=e.cloneNode(!0),r=e.ownerDocument.createElement(`div`);r.className=`docx-print-document`;let i=Array.from(n.querySelectorAll(`style`)).filter(e=>!e.textContent?.includes(`.docx-fit-viewer`)).map(e=>e.outerHTML).join(``);return n.querySelectorAll(`.docx-page-frame, .docx-flow-frame`).forEach((e,n)=>{he(e,Q(t[n])),r.appendChild(e.cloneNode(!0))}),r.childElementCount?`${i}${r.outerHTML}`:n.innerHTML}async function _e(e,t,n){var r;let i=!1,a=()=>{var e;i||(i=!0,(e=n?.onProgressiveRender)==null||e.call(n))},o=y(t,n,a),{defaultOptions:s,renderAsync:c}=await v();t.dataset.docxWorker=o.useWorker?`self`:`false`,await c(e,t,void 0,{...s,...o}),a(),await le(e,t);let l=me(t,n);return(r=n?.registerExportAdapter)==null||r.call(n,{includeDocumentStyles:!1,beforeSnapshot:()=>{let e=b(t);e&&e.dispatchEvent(new e.Event(`resize`))},printStyle:()=>ge(t),toHtml:()=>$(t)}),{$el:t,unmount(){var e;(e=n?.registerExportAdapter)==null||e.call(n,null),l(),delete t.dataset.docxWorker,t.innerHTML=``}}}export{_e as default};