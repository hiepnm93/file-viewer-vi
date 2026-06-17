var e=`vendor/libarchive/worker-bundle.js`,t=`wasm/cad/`,n=`wasm/cad/dwg-worker.js`,r=`wasm/cad/dwfv-render.wasm`,i=()=>typeof document<`u`&&document.baseURI?document.baseURI:typeof location<`u`&&location.href?location.href:`http://localhost/`,a=(e,t,n={})=>{let r=e?String(e):t,a=n.baseUrl?n.baseUrl.endsWith(`/`)?n.baseUrl:`${n.baseUrl}/`:n.documentBaseUrl||i(),o=n.baseUrl?new URL(a,n.documentBaseUrl||i()).href:a,s=new URL(r,o).href;return n.trimTrailingSlash?s.replace(/\/+$/,``):s},o=(t,n)=>a(t?.workerUrl,e,{baseUrl:n}),s=(e,t=``)=>e?.wasmUrl?a(e.wasmUrl,t||e.wasmUrl):t,c=(e,i)=>({wasmPath:a(e?.wasmPath,t,{documentBaseUrl:i,trimTrailingSlash:!0}),workerUrl:a(e?.workerUrl,n,{documentBaseUrl:i}),dwfWasmUrl:a(e?.dwfWasmUrl,r,{documentBaseUrl:i})}),l=(e,t=[])=>e?.compilerWasmUrl||t.find(Boolean)||`https://cdn.jsdelivr.net/npm/@myriaddreamin/typst-ts-web-compiler@0.7.0/pkg/typst_ts_web_compiler_bg.wasm`,u=`zip.zipx.7z.rar.tar.gz.gzip.tgz.bz2.bzip2.tbz.tbz2.xz.txz.lzma.zst.tzst.cab.ar.cpio.iso.xar.lha.lzh.jar.war.ear.apk.cbz.cbr`.split(`.`),d=`glb.gltf.obj.stl.ply.fbx.dae.3ds.3mf.amf.usd.usda.usdc.usdz.kmz.step.stp.iges.igs.ifc.3dm.pcd.wrl.vrml.xyz.vtk.vtp`.split(`.`),f=`txt.json.js.mjs.cjs.css.java.py.html.htm.jsx.ts.tsx.xml.log.vue.yaml.yml.ini.sh.bash.sql.go.rs.php.c.cpp.cc.h.hpp.cs.diff.jsonc.json5.ipynb.toml.proto.hcl.tex.gv.http.react.rb.swift.kt`.split(`.`),p=[`gif`,`jpg`,`jpeg`,`bmp`,`tiff`,`tif`,`png`,`svg`,`webp`,`avif`,`ico`,`heic`,`heif`,`jxl`],m=[{id:`office-word-openxml`,label:`Word OpenXML`,category:`office`,extensions:[`docx`,`docm`,`dotx`,`dotm`],async:!0,capabilities:{download:!0,print:`adapter`,exportHtml:`adapter`,zoom:`provider`,search:!0}},{id:`office-word-binary`,label:`Word Binary`,category:`office`,extensions:[`doc`,`dot`],async:!0,capabilities:{download:!0,print:`adapter`,exportHtml:`adapter`,zoom:`provider`,search:!0}},{id:`office-presentation`,label:`PowerPoint`,category:`office`,extensions:[`pptx`,`pptm`,`potx`,`potm`,`ppsx`,`ppsm`],async:!0,capabilities:{download:!0,print:!0,exportHtml:!0,zoom:`provider`,search:!0}},{id:`open-document`,label:`Open Document`,category:`office`,extensions:[`rtf`,`odt`,`odp`],async:!0,capabilities:{download:!0,print:!0,exportHtml:!0,zoom:`provider`,search:!0}},{id:`spreadsheet-openxml`,label:`Spreadsheet`,category:`office`,extensions:[`xlsx`,`xltx`,`xlsm`,`xlsb`,`xls`,`xlt`,`xltm`,`csv`,`ods`,`fods`,`numbers`],async:!0,capabilities:{download:!0,print:!1,exportHtml:!1,zoom:`provider`,search:!0}},{id:`pdf`,label:`PDF`,category:`document`,extensions:[`pdf`],async:!0,capabilities:{download:!0,print:`adapter`,exportHtml:`adapter`,zoom:`provider`,search:`provider`}},{id:`ofd`,label:`OFD`,category:`document`,extensions:[`ofd`],async:!0,capabilities:{download:!0,print:!0,exportHtml:!0,zoom:`provider`,search:!0}},{id:`typst`,label:`Typst`,category:`document`,extensions:[`typ`,`typst`],async:!0,capabilities:{download:!0,print:`adapter`,exportHtml:`adapter`,zoom:`provider`,search:!0}},{id:`archive`,label:`Archive`,category:`archive`,extensions:u,async:!0,capabilities:{download:!0,print:!1,exportHtml:!1,zoom:!1,search:!0}},{id:`email`,label:`Email`,category:`email`,extensions:[`eml`,`msg`,`mbox`],async:!0,capabilities:{download:!0,print:!1,exportHtml:!0,zoom:!1,search:!0}},{id:`eda`,label:`EDA`,category:`eda`,extensions:[`olb`,`dra`],async:!0,capabilities:{download:!0,print:!0,exportHtml:!0,zoom:!1,search:!0}},{id:`cad`,label:`CAD`,category:`cad`,extensions:[`dxf`,`dwg`,`dwf`,`dwfx`,`xps`],async:!0,capabilities:{download:!0,print:!0,exportHtml:!0,zoom:`provider`,search:!1}},{id:`model`,label:`3D Model`,category:`model`,extensions:d,async:!0,capabilities:{download:!0,print:!1,exportHtml:!1,zoom:`provider`,search:!1}},{id:`geo`,label:`Geospatial`,category:`geo`,extensions:[`geojson`,`kml`,`gpx`,`shp`],async:!0,capabilities:{download:!0,print:!0,exportHtml:!0,zoom:`provider`,search:!0}},{id:`drawing`,label:`Drawing`,category:`drawing`,extensions:[`excalidraw`,`drawio`,`dio`],async:!0,capabilities:{download:!0,print:!0,exportHtml:!0,zoom:`provider`,search:!0}},{id:`epub`,label:`EPUB`,category:`ebook`,extensions:[`epub`],async:!0,capabilities:{download:!0,print:!1,exportHtml:!0,zoom:!1,search:`provider`}},{id:`umd`,label:`UMD`,category:`ebook`,extensions:[`umd`],async:!0,capabilities:{download:!0,print:!0,exportHtml:!0,zoom:`provider`,search:!0}},{id:`image`,label:`Image`,category:`image`,extensions:p,async:!0,capabilities:{download:!0,print:!0,exportHtml:!0,zoom:`provider`,search:!1}},{id:`markdown`,label:`Markdown`,category:`markdown`,extensions:[`md`,`markdown`],async:!0,capabilities:{download:!0,print:!0,exportHtml:!0,zoom:!1,search:!0}},{id:`code`,label:`Code and Text`,category:`code`,extensions:f,async:!0,capabilities:{download:!0,print:!0,exportHtml:!0,zoom:!1,search:!0}},{id:`video`,label:`Video`,category:`media`,extensions:[`mp4`,`webm`,`m3u8`],async:!0,capabilities:{download:!0,print:!1,exportHtml:!1,zoom:!1,search:!1}},{id:`audio`,label:`Audio`,category:`media`,extensions:[`mp3`,`mpeg`,`wav`,`ogg`,`oga`,`opus`,`m4a`,`aac`,`flac`,`weba`,`midi`,`mid`],async:!0,capabilities:{download:!0,print:!1,exportHtml:!1,zoom:!1,search:!1}},{id:`data-asset`,label:`Data Asset`,category:`asset`,extensions:[`ttf`,`otf`,`woff`,`woff2`,`psd`,`ai`,`eps`,`sqlite`,`wasm`,`parquet`,`avro`,`webarchive`],async:!0,capabilities:{download:!0,print:!1,exportHtml:!0,zoom:!1,search:!0}}];Object.freeze(Array.from(new Set(m.flatMap(e=>e.extensions))).sort());var h=(e={})=>{let t=Number.isFinite(e.scale)&&e.scale?Number(e.scale):1;return{scale:t,label:e.label||`${Math.round(t*100)}%`,canZoomIn:e.canZoomIn??!1,canZoomOut:e.canZoomOut??!1,canReset:e.canReset??!1,minScale:e.minScale,maxScale:e.maxScale}},ee=e=>e===!1?{enabled:!1}:e===!0||e===void 0?{}:e,g=(e=``)=>({query:e,total:0,currentIndex:-1,current:null,matches:[]}),_=e=>e===!1?{enabled:!1,collectText:!1}:e===!0||e===void 0?{}:e,v=(e,t)=>{let n=_(t);if(n.enabled===!1||n.collectText===!1)return[];let r=Math.max(200,n.chunkSize||1200),i=Math.max(0,Math.min(r-1,n.chunkOverlap??160)),a=Math.max(0,n.maxTextLength||0),o=[];return e.forEach(e=>{let t=a?e.text.slice(0,a):e.text;if(!t)return;if(t.length<=r){o.push({id:`${e.id}-chunk-1`,text:t,anchor:e,startLine:e.line,endLine:e.line});return}let n=0,s=1;for(;n<t.length;){let a=t.slice(n,n+r);if(o.push({id:`${e.id}-chunk-${s}`,text:a,anchor:e,startLine:e.line,endLine:e.line}),n+r>=t.length)break;n+=r-i,s+=1}}),o},y=`[data-viewer-anchor-id],.pdfViewer .page,.docx-wrapper section,.docx p,.docx li,.docx table,.markdown-body h1,.markdown-body h2,.markdown-body h3,.markdown-body h4,.markdown-body h5,.markdown-body h6,.markdown-body p,.markdown-body li,.markdown-body pre,.markdown-body table,article h1,article h2,article h3,article h4,article h5,article h6,article p,article li,article pre,article table,pre code,p,li,tr,h1,h2,h3,h4,h5,h6,pre,table`.split(`,`).join(`,`),b=[`.viewer-actions`,`.viewer-watermark`,`.state-panel`,`.pdf-toolbar`,`.pdf-nav-pane`,`.flyfish-search-match`].join(`,`),x=new WeakMap,S=new WeakMap,C=e=>typeof CSS<`u`&&typeof CSS.escape==`function`?CSS.escape(e):e.replace(/["\\]/g,`\\$&`),w=(e,t=160)=>{let n=e.replace(/\s+/g,` `).trim();return n.length>t?`${n.slice(0,t-1)}…`:n},T=e=>{let t=e.getBoundingClientRect();return t.width>0||t.height>0},E=e=>!!e.closest(b),te=e=>{let t=e.closest(`[data-page-number], [data-page]`),n=t?.dataset.pageNumber||t?.dataset.page,r=n?Number.parseInt(n,10):NaN;return Number.isFinite(r)?r:void 0},ne=e=>e.matches(`.pdfViewer .page, [data-page-number], [data-page]`)?`page`:e.matches(`p, li, tr, pre, code`)?`line`:`block`,re=(e,t)=>{let n=e.parentElement;for(;n;){if(t.has(n))return!0;n=n.parentElement}return!1},D=e=>{if(!e)return[];let t=e.getBoundingClientRect(),n=new Set,r=[];return Array.from(e.querySelectorAll(y)).forEach(i=>{if(E(i)||!T(i))return;let a=w(i.textContent||``,1e3);if(!a||re(i,n)&&!i.matches(`p, li, tr, pre, code`))return;n.add(i);let o=i.dataset.viewerAnchorId||`viewer-anchor-${r.length+1}`;i.dataset.viewerAnchorId=o,i.dataset.viewerLine=String(r.length+1);let s=i.getBoundingClientRect();r.push({id:o,index:r.length,line:r.length+1,type:ne(i),label:w(a,96),text:a,page:te(i),top:s.top-t.top+e.scrollTop,left:s.left-t.left+e.scrollLeft,width:s.width,height:s.height})}),r},ie=(e,t,n)=>{if(!e)return null;let r=e.closest(`[data-viewer-anchor-id]`);if(r?.dataset.viewerAnchorId){let e=t.find(e=>e.id===r.dataset.viewerAnchorId);if(e)return e}if(!n)return null;let i=n.getBoundingClientRect(),a=e.getBoundingClientRect().top-i.top+n.scrollTop,o=null;for(let e of t){if(e.top<=a+1){o=e;continue}break}return o},ae=(e,t)=>{if(!e||!t.length)return null;let n=e.scrollTop+e.clientHeight*.42,r=t[0];for(let e of t){if(e.top<=n){r=e;continue}break}return r},oe=(e,t)=>{if(!e||t==null)return!1;let n=typeof t==`object`?`[data-viewer-anchor-id="${C(t.id)}"]`:typeof t==`number`?`[data-viewer-line="${t}"]`:`[data-viewer-anchor-id="${C(t)}"]`,r=e.querySelector(n);return r?(r.scrollIntoView({block:`center`,inline:`nearest`}),!0):typeof t==`object`?(e.scrollTo({top:Math.max(0,t.top-e.clientHeight*.18),left:Math.max(0,Math.min(t.left,e.scrollWidth-e.clientWidth)),behavior:`smooth`}),!0):!1},se=(e,t)=>{x.set(e,t),e.__flyfishViewerSearchProvider=t},ce=e=>{e&&(x.delete(e),delete e.__flyfishViewerSearchProvider)},le=e=>{if(!e)return null;let t=x.get(e)||e.__flyfishViewerSearchProvider;if(t)return t;let n=e.querySelector(`[data-viewer-search-provider]`);return n&&(x.get(n)||n.__flyfishViewerSearchProvider)||null},ue=(e,t)=>{S.set(e,t),e.dataset.viewerZoomProvider=e.dataset.viewerZoomProvider||`custom`,e.__flyfishViewerZoomProvider=t},de=e=>{e&&(S.delete(e),delete e.dataset.viewerZoomProvider,delete e.__flyfishViewerZoomProvider)},fe=e=>{if(!e)return null;let t=S.get(e)||e.__flyfishViewerZoomProvider;if(t)return t;let n=e.querySelector(`[data-viewer-zoom-provider]`);return n&&(S.get(n)||n.__flyfishViewerZoomProvider)||null},pe=[`script`,`style`,`textarea`,`input`,`select`,`button`,`.viewer-actions`,`.viewer-watermark`,`.state-panel`,`.pdf-toolbar`,`.pdf-nav-pane`,`.flyfish-search-match`,`.textLayer`,`.annotationLayer`,`.xfaLayer`,`svg`,`canvas`,`iframe`,`video`,`audio`].join(`,`),O=e=>({...e,anchor:e.anchor?{...e.anchor}:null}),me=e=>({query:e.query,total:e.total,currentIndex:e.currentIndex,current:e.current?O(e.current):null,matches:e.matches.map(O)}),k=e=>e.replace(/[.*+?^${}()|[\]\\]/g,`\\$&`),he=e=>e.replace(/\s+/g,` `).trim(),ge=(e,t)=>{let n=t.wholeWord?`\\b${k(e)}\\b`:k(e);return new RegExp(n,t.caseSensitive?`g`:`gi`)},_e=e=>e.map(({element:e,...t})=>t),ve=e=>{let t=e.parentNode;if(t){for(;e.firstChild;)t.insertBefore(e.firstChild,e);t.removeChild(e),t.normalize()}},ye=(e,t)=>{let n=e.parentElement;return!n||n.closest(pe)?!0:!t.contains(n)||!e.data.trim()},A=(e,t)=>{let n=e.ownerDocument.defaultView?.NodeFilter||(typeof NodeFilter<`u`?NodeFilter:void 0);return n?n[t]:t===`SHOW_TEXT`?4:t===`FILTER_REJECT`?2:1},be=e=>{let t=[],n=e.ownerDocument.createTreeWalker(e,A(e,`SHOW_TEXT`),{acceptNode(t){return ye(t,e)?A(e,`FILTER_REJECT`):A(e,`FILTER_ACCEPT`)}}),r=n.nextNode();for(;r;)ye(r,e)||t.push(r),r=n.nextNode();return t},xe=e=>e?.ownerDocument?.defaultView?.MutationObserver||(typeof MutationObserver<`u`?MutationObserver:void 0),Se=e=>e?.ownerDocument?.defaultView||(typeof window<`u`?window:void 0),Ce=e=>{if(Math.max(0,e.scrollHeight-e.clientHeight)<=2)return!1;let t=e.ownerDocument.defaultView||(typeof window<`u`?window:void 0);if(!t?.getComputedStyle)return!0;let n=t.getComputedStyle(e),r=n.overflowY||n.overflow;return[`auto`,`scroll`,`overlay`,`visible`].includes(r)},we=({root:e,options:t,waitForDomUpdate:n,preferredScrollContainer:r})=>{let i=[],a=[],o=new Set,s=g(),c=null,l=!1,u=null,d=!1,f=()=>ee(t?.()),p=()=>{let e=_e(a);s.total=e.length,s.currentIndex=e.length?Math.max(0,Math.min(s.currentIndex,e.length-1)):-1,s.current=s.currentIndex>=0?e[s.currentIndex]:null,s.matches=e},m=e=>(s.query=e.query,s.total=e.total,s.currentIndex=e.currentIndex,s.current=e.current?O(e.current):null,s.matches=e.matches.map(O),s),h=()=>{Array.from(o).forEach(ve),o.clear(),a=[],s.total=0,s.currentIndex=-1,s.current=null,s.matches=[]},_=async(t,n=s.query)=>{let r=le(e());return r?(h(),m(await t(r)||r.getState?.()||g(n))):null},v=()=>{c?.disconnect(),c=null},y=t=>{let n=e()||null,i=r?.()||null;if(i&&(i===t||i.contains(t)))return i;let a=t.parentElement;for(;a;){if(Ce(a))return a;if(a===n)break;a=a.parentElement}return n},b=e=>{let t=y(e);if(!t){e.scrollIntoView({block:`center`,inline:`nearest`});return}let n=t.scrollLeft,r=t.getBoundingClientRect(),i=e.getBoundingClientRect(),a=i.top-r.top+t.scrollTop-t.clientHeight/2+i.height/2,o=Math.max(0,t.scrollHeight-t.clientHeight),s=Math.max(0,Math.min(a,o));typeof t.scrollTo==`function`?t.scrollTo({top:s,left:n,behavior:`auto`}):(t.scrollTop=s,t.scrollLeft=n),t.scrollLeft=n},x=(e,t=!0)=>{let n=f();if(!a.length)return p(),s;let r=(e%a.length+a.length)%a.length;a.forEach(e=>{e.element.classList.remove(n.activeClassName||`flyfish-search-match--active`)});let i=a[r];return i.element.classList.add(n.activeClassName||`flyfish-search-match--active`),s.currentIndex=r,p(),t&&b(i.element),s},S=(t,n,r,a)=>{let s=e();if(!s)return;let c=f(),l=t.data,u=0,d,p=t.ownerDocument.createDocumentFragment(),m=!1;for(n.lastIndex=0;(d=n.exec(l))&&a.length<r;){if(!d[0]){n.lastIndex+=1;continue}d.index>u&&p.appendChild(t.ownerDocument.createTextNode(l.slice(u,d.index)));let e=t.ownerDocument.createElement(`mark`);e.className=c.className||`flyfish-search-match`,e.textContent=d[0],e.dataset.searchMatchId=`viewer-search-match-${a.length+1}`,o.add(e),p.appendChild(e),m=!0;let r=ie(t.parentElement,i,s);a.push({id:e.dataset.searchMatchId,index:a.length,text:d[0],anchor:r,line:r?.line,page:r?.page,element:e}),u=d.index+d[0].length}m&&(u<l.length&&p.appendChild(t.ownerDocument.createTextNode(l.slice(u))),t.parentNode?.replaceChild(p,t))},C=()=>{v();let t=e(),n=xe(t);!l||!t||!n||(c=new n(E),c.observe(t,{childList:!0,subtree:!0,characterData:!0}))},w=()=>{if(!l)return;let t=Se(e());if(t?.setTimeout){t.setTimeout(C,0);return}setTimeout(C,0)},T=async(t,r=0)=>{let o=he(t),c=f();s.query=o,v(),d=!0;try{h();let t=e();if(!o||c.enabled===!1||!t)return await _(e=>e.clear?.(),o)||s;let l=await _(e=>e.search(o,c),o);if(l)return l;await n?.();let u=e();if(!u)return s;i=D(u);let d=ge(o,c),f=Math.max(1,c.maxMatches||1e3),m=[],ee=be(u);for(let e of ee){if(m.length>=f)break;S(e,d,f,m)}a=m,p(),m.length&&x(r,!0)}finally{d=!1,w()}return s},E=()=>{let e=f();!s.query||d||e.enabled===!1||(u!==null&&clearTimeout(u),u=setTimeout(()=>{u=null,T(s.query,Math.max(0,s.currentIndex))},e.debounce??180))};return{get anchors(){return i},state:s,getInternalMatches:()=>a,observe(){l=!0,C()},async refreshAnchors(){return await n?.(),i=D(e()||null),i},search:e=>T(e,0),next:async()=>await _(e=>e.next?.()||e.getState?.())||x(s.currentIndex+1),previous:async()=>await _(e=>e.previous?.()||e.getState?.())||x(s.currentIndex-1),clear:async()=>{s.query=``,v(),d=!0;try{return h(),await _(e=>e.clear?.(),``)||s}finally{d=!1,w()}},destroy(){l=!1,v(),u!==null&&(clearTimeout(u),u=null),h()}}},j=e=>({scale:e.scale,label:e.label,canZoomIn:e.canZoomIn,canZoomOut:e.canZoomOut,canReset:e.canReset,minScale:e.minScale,maxScale:e.maxScale}),Te=e=>e?.ownerDocument?.defaultView?.MutationObserver||(typeof MutationObserver<`u`?MutationObserver:void 0),Ee=({root:e,enabled:t,beforeZoom:n})=>{let r=null,i=null,a=null,o=h(),s=e=>{let t=h(e||{});o.scale=t.scale,o.label=t.label,o.canZoomIn=t.canZoomIn,o.canZoomOut=t.canZoomOut,o.canReset=t.canReset,o.minScale=t.minScale,o.maxScale=t.maxScale},c=()=>{i?.(),i=null,r=null,s(null)},l=()=>{if(t?.()===!1)return c(),null;let n=fe(e());return n!==r&&(i?.(),r=n,i=n?.subscribe?.(()=>{s(n.getState())})||null),s(n?.getState?.()||null),n},u=()=>{a?.disconnect(),a=null},d=async(e,t)=>{let r=l();return!r||n&&await n(e)===!1||s(await t(r)||r.getState()),j(o)};return{get provider(){return r},state:o,hasProvider(){return!!l()},refreshProvider:l,observe(){u();let t=e(),n=Te(t);if(!t||!n){l();return}a=new n(()=>{l()}),a.observe(t,{childList:!0,subtree:!0}),l()},clearProvider:c,getState(){return j(o)},zoomIn:()=>d(`zoom-in`,e=>e.zoomIn()),zoomOut:()=>d(`zoom-out`,e=>e.zoomOut()),resetZoom:()=>d(`zoom-reset`,e=>e.resetZoom()),destroy(){u(),c()}}},M=e=>!!e&&typeof e==`object`&&!Array.isArray(e),De=e=>typeof URL<`u`&&e instanceof URL,N=e=>{if(e===void 0||typeof e==`function`||typeof e==`symbol`)return;if(e===null||typeof e==`string`||typeof e==`boolean`)return e;if(typeof e==`number`)return Number.isFinite(e)?e:void 0;if(typeof e==`bigint`)return e.toString();if(e instanceof Date)return e.toISOString();if(De(e))return e.toString();if(Array.isArray(e))return e.map(e=>N(e)).filter(e=>e!==void 0);if(!M(e))return;let t={};return Object.entries(e).forEach(([e,n])=>{let r=N(n);r!==void 0&&(t[e]=r)}),Object.keys(t).length?t:void 0},Oe=e=>{let{beforeOperation:t,hooks:n,...r}=e;if(M(r.toolbar)){let{beforeOperation:e,beforeDownload:t,beforePrint:n,beforeExportHtml:i,...a}=r.toolbar;r.toolbar=a}return r},ke=e=>{if(!M(e))return;let t=N(Oe(e));if(M(t))return t},Ae=e=>{if(e){if(typeof e==`string`)try{return ke(JSON.parse(e))}catch{return}return ke(e)}},P=e=>e.trim().replace(/^\./,``).toLowerCase(),je=e=>{try{return decodeURIComponent(e)}catch{return e}},F=e=>{let t=e.split(/[?#]/)[0]||e,n=t.lastIndexOf(`.`);return n===-1?``:P(t.slice(n+1))},I=(e,t=`preview.bin`)=>{let n=(e||``).split(/[?#]/)[0].trim();if(!n)return t;let r=Math.max(n.lastIndexOf(`/`),n.lastIndexOf(`\\`));return je(r===-1?n:n.slice(r+1))},Me=e=>e.file?`file`:e.buffer?`buffer`:e.url?`url`:`empty`,Ne=e=>e&&`name`in e&&typeof e.name==`string`?e.name:void 0,Pe=e=>{let t=Me(e),n=I(e.filename||Ne(e.file)||e.url,e.type?`preview.${P(e.type)}`:`preview.bin`),r=P(e.type||F(n)),i=typeof e.size==`number`?e.size:e.file?e.file.size:e.buffer?e.buffer.byteLength:void 0;return{kind:t,filename:n,extension:r,url:e.url,file:e.file,buffer:e.buffer,size:i}},Fe=(e,t=`preview.bin`)=>{if(typeof File<`u`&&e instanceof File)return e;let n=I(t||`preview.bin`);if(typeof Blob<`u`&&e instanceof Blob)return new File([e],n,{type:e.type});if(e instanceof ArrayBuffer)return new File([e],n,{});throw Error(`Unsupported file source input.`)},Ie=async e=>typeof e.arrayBuffer==`function`?e.arrayBuffer():new Promise((t,n)=>{let r=new FileReader;r.onload=e=>{let r=e.target?.result;if(r instanceof ArrayBuffer){t(r);return}n(Error(`Failed to read file as ArrayBuffer.`))},r.onerror=e=>n(e),r.readAsArrayBuffer(e)});Object.freeze({download:!1,print:!1,exportHtml:!1,zoom:!1,zoomIn:!1,zoomOut:!1,zoomReset:!1});var Le=[`docx`,`docm`,`dotx`,`dotm`,`doc`,`dot`,`pdf`,`typ`,`typst`],Re=[`pptx`,`pptm`,`potx`,`potm`,`ppsx`,`ppsm`,`ofd`,`dxf`,`dwg`,`dwf`,`dwfx`,`xps`,`excalidraw`,`drawio`,`dio`,`umd`,`md`,`markdown`,`olb`,`dra`,...f,...p],ze=[`xlsx`,`xltx`,`xlsm`,`xlsb`,`xls`,`xlt`,`xltm`,`csv`,`ods`,`fods`,`numbers`,...u,`eml`,`msg`,`epub`,`mp4`,`mp3`,`mpeg`,`wav`,`ogg`,`oga`,`opus`,`m4a`,`aac`,`flac`,`weba`,...d],L=(e,t)=>e.includes(P(t)),Be=e=>L(Le,e),Ve=e=>L(Re,e),He=e=>L(ze,e),Ue=(e,t,n)=>{if(!n)return!1;if(t){if(t.print===!1)return!1;if(t.toHtml)return!0}return Be(e)||He(e)?!1:Ve(e)},We={"load-start":`onLoadStart`,"load-complete":`onLoadComplete`,"unload-start":`onUnloadStart`,"unload-complete":`onUnloadComplete`},Ge={download:`下载原始文件`,print:`打印完整渲染内容`,"export-html":`导出渲染 HTML`,"zoom-in":`放大预览`,"zoom-out":`缩小预览`,"zoom-reset":`还原预览比例`},Ke=({phase:e,version:t,source:n,filename:r,file:i,url:a,size:o,bufferSize:s,startedAt:c,duration:l,timestamp:u,reason:d})=>{let f=I(i?.name||r||a||``),p=u??Date.now();return{phase:e,type:F(f),filename:f,source:n,url:a,file:i||void 0,size:o??i?.size??s,version:t,timestamp:p,duration:l??(e===`load-complete`&&c?p-c:void 0),reason:d}},qe=(e,t,n=Date.now())=>{let{phase:r,...i}=t;return{...i,operation:e,label:Ge[e],timestamp:n}},Je=e=>We[e],Ye=async(e,t,n)=>{let r=t?.[Je(e.phase)];if(r)try{await r(e)}catch(t){n?.(t,e)}},Xe=(e,t)=>{let n=e?.toolbar;if(!n||typeof n!=`object`)return[e?.beforeOperation];let r=t===`download`?n.beforeDownload:t===`print`?n.beforePrint:t===`export-html`?n.beforeExportHtml:void 0;return[e?.beforeOperation,n.beforeOperation,r]},Ze=async({context:e,options:t,onBefore:n,onCancel:r,onError:i})=>{n?.(e);try{for(let n of Xe(t,e.operation))if(n&&await n(e)===!1)return r?.(e),!1}catch(t){return i?.(t,e),r?.(e),!1}return!0},Qe=e=>{let{file:t,...n}=e;return{...n,hasFile:!!e.file}},$e=(e,t,n)=>({type:e,event:t,payload:Qe(n)}),et=(e,t,n)=>({type:e,event:t,payload:n}),tt=(e,t=`*`,n=typeof window<`u`?window:void 0)=>!n||n.parent===n?!1:(n.parent.postMessage(e,t),!0),nt=e=>{let t=e?.toolbar;return t===!1?{download:!1,print:!1,exportHtml:!1,zoom:!1}:t&&typeof t==`object`?{download:t.download!==!1,print:t.print!==!1,exportHtml:t.exportHtml!==!1,zoom:t.zoom!==!1}:{download:!0,print:!0,exportHtml:!0,zoom:!0}},rt=({extension:e,hasOriginalSource:t,renderedReady:n,hasError:r=!1,adapter:i,zoomState:a})=>{let o=n&&!r,s=o&&(a.canZoomIn||a.canZoomOut||a.canReset);return{download:t,print:o&&Ue(e,i??null,n),exportHtml:o&&i?.exportHtml!==!1,zoom:s,zoomIn:s&&a.canZoomIn,zoomOut:s&&a.canZoomOut,zoomReset:s&&a.canReset}},it=(e,t)=>({download:e.download&&t.download,print:e.print&&t.print,exportHtml:e.exportHtml&&t.exportHtml,zoom:e.zoom&&t.zoom}),at=(e,t)=>{let n=e?.toolbar,r=n&&typeof n==`object`?n.position:`auto`;return r===`top`||r===`bottom-right`?r:t===`pdf`?`bottom-right`:`top`},R=e=>e.replace(/&/g,`&amp;`).replace(/"/g,`&quot;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`),ot=`
  * { box-sizing: border-box; }
  html, body { margin: 0; min-height: 100%; background: #f2f4f7; color: #172033; font-family: Aptos, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
  body { padding: 24px; }
  .viewer-export-shell { position: relative; min-height: calc(100vh - 48px); overflow: visible; background: #f2f4f7; }
  .viewer-export-content { position: relative; z-index: 1; contain: none; width: 100%; min-height: 100%; overflow: visible; }
  .viewer-export-content .file-render,
  .viewer-export-content .file-viewer,
  .viewer-export-content .viewer-stage,
  .viewer-export-content .content,
  .viewer-export-content .pdf-shell,
  .viewer-export-content .pdf-content,
  .viewer-export-content .pdf-viewport,
  .viewer-export-content .pdf-wrapper,
  .viewer-export-content .docx-fit-viewer,
  .viewer-export-content .docx-wrapper,
  .viewer-export-content .msdoc-stage,
  .viewer-export-content .code-viewer,
  .viewer-export-content .markdown-viewer,
  .viewer-export-content .email-shell,
  .viewer-export-content .archive-shell,
  .viewer-export-content .eda-shell,
  .viewer-export-content .ebook-shell,
  .viewer-export-content .umd-shell,
  .viewer-export-content .drawing-shell,
  .viewer-export-content .audio-shell,
  .viewer-export-content .cad-shell,
  .viewer-export-content .cad-body,
  .viewer-export-content .cad-canvas-wrap,
  .viewer-export-content .dwg-preview-frame {
    position: relative !important;
    inset: auto !important;
    contain: none !important;
    width: 100% !important;
    height: auto !important;
    min-height: 0 !important;
    max-height: none !important;
    overflow: visible !important;
  }
  .viewer-export-content .docx-wrapper {
    display: block !important;
    padding: 0 !important;
    background: transparent !important;
  }
  .viewer-export-content .docx-print-document {
    display: block !important;
    width: fit-content !important;
    max-width: 100% !important;
    height: auto !important;
    overflow: visible !important;
    margin: 0 auto !important;
  }
  .viewer-export-content .docx-page-frame {
    position: relative !important;
    width: var(--viewer-print-page-width, fit-content) !important;
    height: var(--viewer-print-page-height, auto) !important;
    min-height: var(--viewer-print-page-height, 0) !important;
    max-width: 100% !important;
    margin: 0 auto 18px !important;
    overflow: hidden !important;
    break-inside: avoid;
    page-break-inside: avoid;
    break-after: page;
    page-break-after: always;
  }
  .viewer-export-content .msdoc-page {
    position: relative !important;
    width: var(--viewer-print-page-width, 794px) !important;
    min-height: var(--viewer-print-page-height, 1123px) !important;
    max-width: 100% !important;
    height: auto !important;
    margin: 0 auto 18px !important;
    overflow: visible !important;
    break-after: page;
    page-break-after: always;
  }
  .viewer-export-content .docx-page-frame:last-child,
  .viewer-export-content .msdoc-page:last-child {
    break-after: auto;
    page-break-after: auto;
  }
  .viewer-export-content .docx-page-frame > section.docx {
    position: relative !important;
    top: auto !important;
    left: auto !important;
    width: var(--viewer-print-page-width, auto) !important;
    min-height: var(--viewer-print-page-height, auto) !important;
    max-width: none !important;
    margin: 0 auto !important;
    overflow: visible !important;
    transform: none !important;
    box-shadow: none !important;
    break-inside: avoid;
    page-break-inside: avoid;
  }
  .viewer-export-content .msdoc-stage {
    display: block !important;
    padding: 0 !important;
    background: transparent !important;
  }
  .viewer-export-content .msdoc-page > .msdoc-root {
    margin: 0 auto !important;
    box-shadow: none !important;
    overflow: visible !important;
  }
  .viewer-export-content .pdf-toolbar,
  .viewer-export-content .pdf-nav-pane,
  .viewer-export-content .viewer-actions,
  .viewer-export-content .code-toolbar,
  .viewer-export-content .umd-toolbar,
  .viewer-export-content .drawing-toolbar,
  .viewer-export-content .cad-toolbar {
    display: none !important;
  }
  .viewer-export-content .pdf-content,
  .viewer-export-content .pdf-shell--nav-hidden .pdf-content,
  .viewer-export-content .cad-body.without-layers {
    display: block !important;
    grid-template-columns: none !important;
  }
  .viewer-export-content .pdfViewer { padding: 0 !important; }
  .viewer-export-content .pdfViewer .page {
    margin: 0 auto 16px !important;
    border: 0 !important;
    box-shadow: none !important;
    break-after: page;
    page-break-after: always;
  }
  .viewer-export-content .pdfViewer .page:last-child {
    break-after: auto;
    page-break-after: auto;
  }
  .viewer-export-content .pdf-export-document {
    display: grid;
    justify-items: center;
    gap: 18px;
    padding: 4px 0;
  }
  .viewer-export-content .pdf-export-page {
    width: var(--viewer-print-page-width, auto);
    height: var(--viewer-print-page-height, auto);
    max-width: 100%;
    overflow: hidden;
    background: #ffffff;
    box-shadow: 0 12px 32px rgba(15, 23, 42, 0.12);
    break-inside: avoid;
    page-break-inside: avoid;
    break-after: page;
    page-break-after: always;
  }
  .viewer-export-content .pdf-export-page:last-child {
    break-after: auto;
    page-break-after: auto;
  }
  .viewer-export-content .pdf-export-page img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .viewer-export-content .pptx-wrapper {
    width: 100% !important;
    max-width: 100% !important;
    height: auto !important;
    overflow: visible !important;
    transform: none !important;
  }
  .viewer-export-content .pptx-wrapper .slide {
    margin: 0 auto 18px !important;
    break-inside: avoid;
    page-break-inside: avoid;
    break-after: page;
    page-break-after: always;
    box-shadow: none !important;
  }
  .viewer-export-content .pptx-wrapper .slide:last-child {
    break-after: auto;
    page-break-after: auto;
  }
  .viewer-export-content .ofd-stage {
    padding: 0 !important;
    overflow: visible !important;
  }
  .viewer-export-content .ofd-page,
  .viewer-export-content .drawing-svg,
  .viewer-export-content .cad-canvas-wrap,
  .viewer-export-content .dwg-preview-frame {
    break-inside: avoid;
    page-break-inside: avoid;
    break-after: page;
    page-break-after: always;
    box-shadow: none !important;
  }
  .viewer-export-content .ofd-page:last-child,
  .viewer-export-content .drawing-svg:last-child,
  .viewer-export-content .cad-canvas-wrap:last-child,
  .viewer-export-content .dwg-preview-frame:last-child {
    break-after: auto;
    page-break-after: auto;
  }
  .viewer-export-content .code-area {
    overflow: visible !important;
    white-space: pre-wrap !important;
    word-break: break-word !important;
  }
  .viewer-export-content .umd-body,
  .viewer-export-content .umd-stage-wrap,
  .viewer-export-content .umd-stage {
    display: block !important;
    height: auto !important;
    max-height: none !important;
    overflow: visible !important;
  }
  .viewer-export-content .umd-toc {
    display: none !important;
  }
  img, canvas, svg, video { max-width: 100%; }
  @media print {
    @page { margin: 12mm; }
    html, body { min-height: auto; background: #ffffff; }
    body { padding: 0; }
    .viewer-export-shell,
    .viewer-export-content {
      min-height: 0;
      overflow: visible;
      background: #ffffff;
    }
    .viewer-export-content .pdf-export-document {
      display: block;
      padding: 0;
    }
    .viewer-export-content .pdf-export-page {
      width: var(--viewer-print-page-width, auto) !important;
      height: var(--viewer-print-page-height, auto) !important;
      max-width: none !important;
      margin: 0;
      overflow: hidden;
      box-shadow: none;
    }
    .viewer-export-content .docx-page-frame {
      width: var(--viewer-print-page-width, auto) !important;
      height: var(--viewer-print-page-height, auto) !important;
      min-height: var(--viewer-print-page-height, 0) !important;
      max-width: none !important;
      margin: 0 !important;
      overflow: hidden !important;
    }
    .viewer-export-content .msdoc-page {
      width: var(--viewer-print-page-width, 794px) !important;
      min-height: var(--viewer-print-page-height, 1123px) !important;
      max-width: none !important;
      margin: 0 !important;
      overflow: visible !important;
    }
    .viewer-export-content .docx-page-frame > section.docx,
    .viewer-export-content .msdoc-page > .msdoc-root {
      width: var(--viewer-print-page-width, 100%) !important;
      max-width: none !important;
      border: 0 !important;
    }
    .viewer-export-content .pptx-wrapper .slide,
    .viewer-export-content .ofd-page,
    .viewer-export-content .drawing-svg,
    .viewer-export-content .cad-canvas-wrap,
    .viewer-export-content .dwg-preview-frame {
      box-shadow: none !important;
    }
  }
`,st=()=>Array.from(document.querySelectorAll(`style, link[rel="stylesheet"]`)).map(e=>e instanceof HTMLStyleElement?`<style>${e.textContent||``}</style>`:e.href?`<link rel="stylesheet" href="${R(e.href)}" />`:``).filter(Boolean).join(`
`),ct=({contentHtml:e,includeDocumentStyles:t=!0,printStyle:n=``,title:r,watermarkInlineStyle:i=``})=>{let a=i?`<div class="viewer-export-watermark" style="${i}"></div>`:``,o=t?st():``,s=n?`<style data-viewer-print-style>${n}</style>`:``;return`<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${R(r)}</title>
  ${o}
  <style>${ot}</style>
</head>
<body>
  <main class="viewer-export-shell">
    <div class="viewer-export-content">${e}</div>
    ${a}
  </main>
  ${s}
</body>
</html>`},z=(e,t)=>{let n=URL.createObjectURL(e),r=document.createElement(`a`);r.href=n,r.download=t,r.rel=`noopener`,document.body.appendChild(r),r.click(),r.remove(),window.setTimeout(()=>URL.revokeObjectURL(n),4e3)},lt=(e,t)=>{let n=document.createElement(`a`);n.href=e,n.download=t,n.rel=`noopener`,n.target=`_blank`,document.body.appendChild(n),n.click(),n.remove()},ut=(e,t)=>{let n=Array.from(e.querySelectorAll(`canvas`));Array.from(t.querySelectorAll(`canvas`)).forEach((e,t)=>{let r=n[t];if(r)try{let t=document.createElement(`img`);t.src=r.toDataURL(`image/png`),t.alt=`rendered canvas`,t.style.maxWidth=`100%`,t.style.display=`block`,t.style.margin=`0 auto`,e.replaceWith(t)}catch{}})},dt=()=>new Promise(e=>{window.requestAnimationFrame(()=>{window.requestAnimationFrame(()=>e())})}),ft=async e=>{let t=Array.from(e.querySelectorAll(`img`));await Promise.all(t.map(async e=>{if(!e.complete){if(`decode`in e)try{await e.decode();return}catch{}await new Promise(t=>{e.addEventListener(`load`,()=>t(),{once:!0}),e.addEventListener(`error`,()=>t(),{once:!0})})}}))},pt=async e=>{let{document:t}=e;t.readyState!==`complete`&&await new Promise(t=>{e.addEventListener(`load`,()=>t(),{once:!0}),e.setTimeout(()=>t(),1200)}),await Promise.all(Array.from(t.images).map(async t=>{if(!t.complete){if(`decode`in t)try{await t.decode();return}catch{}await new Promise(n=>{t.addEventListener(`load`,()=>n(),{once:!0}),t.addEventListener(`error`,()=>n(),{once:!0}),e.setTimeout(()=>n(),1500)})}})),await new Promise(t=>{e.requestAnimationFrame(()=>{e.requestAnimationFrame(()=>t())})})},B=async(e,t)=>t.mode!==`print`||!e?.printStyle?``:typeof e.printStyle==`function`?await e.printStyle(t):e.printStyle,mt=async(e,t)=>{await t?.beforeSnapshot?.(),await dt(),await ft(e)},ht=async({source:e,mode:t=`export`,title:n,adapter:r=null,watermarkInlineStyle:i=``})=>{let a={mode:t,title:n},o=r?.toHtml;if(o){let e=await o(a),t=await B(r,a);return ct({contentHtml:e,includeDocumentStyles:r.includeDocumentStyles!==!1,printStyle:t,title:n,watermarkInlineStyle:i})}await mt(e,r);let s=e.cloneNode(!0);ut(e,s);let c=await B(r,a);return ct({contentHtml:s.innerHTML,printStyle:c,title:n,watermarkInlineStyle:i})},gt=e=>e&&`name`in e&&typeof e.name==`string`?e.name:``,_t=(e,t=`preview`)=>e.filename||gt(e.file)||t,vt=e=>!!e.buffer||!!e.file||!!e.url,V=async(e,t)=>e?await e(t):!0,H=async(e,{source:t,title:n,filename:r,adapter:i=null,watermarkInlineStyle:a})=>{if(!t)throw Error(`当前没有可导出的预览内容`);return ht({source:t,mode:e,title:n||r||`file-viewer-preview`,adapter:i,watermarkInlineStyle:a})},yt=async({source:e,filename:t,beforeOperation:n,throwOnMissingSource:r=!0})=>{if(!vt(e)){if(r)throw Error(`当前没有可下载的源文件`);return!1}if(!await V(n,`download`))return!1;let i=t||_t(e,`preview.bin`);return e.buffer?(z(new Blob([e.buffer],{type:e.mimeType||e.file?.type||`application/octet-stream`}),i),!0):e.file?(z(e.file,i),!0):(lt(e.url,i),!0)},bt=async({download:e=!0,filename:t,beforeOperation:n,...r})=>{if(!await V(n,`export-html`))return``;let i=await H(`export`,{...r,filename:t});if(e!==!1){let e=t||r.title||`preview`;z(new Blob([i],{type:`text/html;charset=utf-8`}),`${e}.rendered.html`)}return i},xt=async({autoPrint:e=!0,beforeOperation:t,openWindow:n,printAvailable:r=!0,printWindow:i,...a})=>{if(!r)throw Error(`当前文件类型不支持完整打印，请下载原文件后在本地应用中打印`);if(!await V(t,`print`))return!1;let o=await H(`print`,a),s=i||n?.()||(typeof window<`u`?window.open(``,`_blank`):null);if(!s)throw Error(`浏览器拦截了打印窗口`);return s.document.open(),s.document.write(o),s.document.close(),s.focus(),await pt(s),e!==!1&&s.print(),!0},St=96,U=e=>!Number.isFinite(e)||e<=0?0:Number(e.toFixed(3)),W=e=>`${U(e)}px`,G=e=>`${Number((U(e)/St).toFixed(4))}in`,K=e=>{let t=parseFloat(e);return Number.isFinite(t)&&t>0?t:0},Ct=(e,t={})=>{let n=window.getComputedStyle(e),r=K(n.width)||e.offsetWidth||t.width||e.getBoundingClientRect().width,i=K(n.height)||K(n.minHeight)||e.offsetHeight||t.height||e.getBoundingClientRect().height;return{width:U(r),height:U(i)}},wt=(e,t,n={})=>{let r=W(t.width),i=W(t.height),a=n.heightMode||`fixed`;e.classList.add(`viewer-print-page`),e.style.setProperty(`--viewer-print-page-width`,r),e.style.setProperty(`--viewer-print-page-height`,i),e.style.width=r,e.style.maxWidth=`none`,e.style.minHeight=i,a===`fixed`?(e.style.height=i,e.style.overflow=`hidden`):(e.style.height=`auto`,e.style.overflow=`visible`)},Tt=({selector:e,width:t,height:n,heightMode:r=`fixed`})=>{let i=W(t),a=W(n),o=r===`fixed`?`height:${a}!important;min-height:${a}!important;overflow:hidden!important;`:`height:auto!important;min-height:${a}!important;overflow:visible!important;`;return`
    @page { size: ${G(t)} ${G(n)}; margin: 0; }
    @media print {
      html, body {
        width: ${i};
        min-width: ${i};
        background: #ffffff !important;
      }
      ${e} {
        width: ${i}!important;
        max-width: none!important;
        ${o}
        margin: 0!important;
        box-shadow: none!important;
        border: 0!important;
        break-after: page;
        page-break-after: always;
      }
      ${e}:last-child {
        break-after: auto;
        page-break-after: auto;
      }
    }
  `},Et=e=>({...e,extensions:e.extensions.map(P)}),q=(e=m)=>{let t=new Map,n=new Map,r=e=>{let r=Et(e),i=t.get(r.id);i&&i.extensions.forEach(e=>{n.get(e)?.id===i.id&&n.delete(e)}),t.set(r.id,r),r.extensions.forEach(e=>{let t=n.get(e);if(t&&t.id!==r.id)throw Error(`File extension "${e}" is already registered by renderer "${t.id}".`);n.set(e,r)})};return e.forEach(r),{register:r,unregister(e){let r=t.get(e);return r?(r.extensions.forEach(t=>{n.get(t)?.id===e&&n.delete(t)}),t.delete(e),!0):!1},getById(e){return t.get(e)},getByExtension(e){return n.get(P(e))},hasExtension(e){return n.has(P(e))},list(){return Array.from(t.values())},listExtensions(){return Array.from(n.keys()).sort()}}},Dt={accent:`#5f6f82`,soft:`rgba(95, 111, 130, 0.12)`,badge:`DOC`,label:`文件内容`,hint:`正在整理内容结构并生成预览。`},Ot={doc:{accent:`#2b78f6`,soft:`rgba(43, 120, 246, 0.12)`,badge:`W`,label:`Word 文档`,hint:`正在准备分页、文本样式和文档结构。`},docx:{accent:`#2b78f6`,soft:`rgba(43, 120, 246, 0.12)`,badge:`W`,label:`Word 文档`,hint:`正在通过 Worker 准备文档结构、文本样式和分页结果。`},xls:{accent:`#21a366`,soft:`rgba(33, 163, 102, 0.12)`,badge:`X`,label:`Excel 表格`,hint:`正在准备工作表、样式和可视区数据。`},xlsx:{accent:`#21a366`,soft:`rgba(33, 163, 102, 0.12)`,badge:`X`,label:`Excel 表格`,hint:`正在准备工作表、样式和可视区数据。`},csv:{accent:`#21a366`,soft:`rgba(33, 163, 102, 0.12)`,badge:`X`,label:`表格数据`,hint:`正在准备行列数据和基础样式。`},ppt:{accent:`#f28b27`,soft:`rgba(242, 139, 39, 0.12)`,badge:`P`,label:`PPT 演示文稿`,hint:`正在构建幻灯片布局和媒体内容。`},pptx:{accent:`#f28b27`,soft:`rgba(242, 139, 39, 0.12)`,badge:`P`,label:`PPT 演示文稿`,hint:`正在构建幻灯片布局和媒体内容。`},pdf:{accent:`#e5534b`,soft:`rgba(229, 83, 75, 0.12)`,badge:`PDF`,label:`PDF 文档`,hint:`正在载入页面位图、文本层和缩放视图。`},ofd:{accent:`#c2410c`,soft:`rgba(194, 65, 12, 0.12)`,badge:`OFD`,label:`OFD 版式文件`,hint:`正在解析国产版式文档和页面对象。`},zip:{accent:`#a15c07`,soft:`rgba(161, 92, 7, 0.12)`,badge:`ZIP`,label:`压缩包`,hint:`正在启动 Worker 并读取压缩包目录。`},rar:{accent:`#a15c07`,soft:`rgba(161, 92, 7, 0.12)`,badge:`RAR`,label:`压缩包`,hint:`正在启动 Worker 并读取压缩包目录。`},"7z":{accent:`#a15c07`,soft:`rgba(161, 92, 7, 0.12)`,badge:`7Z`,label:`压缩包`,hint:`正在启动 Worker 并读取压缩包目录。`},tar:{accent:`#a15c07`,soft:`rgba(161, 92, 7, 0.12)`,badge:`TAR`,label:`压缩包`,hint:`正在启动 Worker 并读取压缩包目录。`},gz:{accent:`#a15c07`,soft:`rgba(161, 92, 7, 0.12)`,badge:`GZ`,label:`压缩包`,hint:`正在启动 Worker 并读取压缩包目录。`},eml:{accent:`#2563eb`,soft:`rgba(37, 99, 235, 0.12)`,badge:`EML`,label:`邮件文件`,hint:`正在解析邮件头、正文和附件。`},msg:{accent:`#2563eb`,soft:`rgba(37, 99, 235, 0.12)`,badge:`MSG`,label:`邮件文件`,hint:`正在解析 Outlook 邮件和附件。`},olb:{accent:`#0d7884`,soft:`rgba(13, 120, 132, 0.12)`,badge:`OLB`,label:`EDA 文件`,hint:`正在读取 EDA 容器结构和可读属性。`},dra:{accent:`#0d7884`,soft:`rgba(13, 120, 132, 0.12)`,badge:`DRA`,label:`EDA 文件`,hint:`正在读取 EDA 容器结构和可读属性。`},dxf:{accent:`#0f766e`,soft:`rgba(15, 118, 110, 0.12)`,badge:`CAD`,label:`CAD 图纸`,hint:`正在准备 CAD 图层、几何对象和画布视图。`},dwg:{accent:`#0f766e`,soft:`rgba(15, 118, 110, 0.12)`,badge:`CAD`,label:`CAD 图纸`,hint:`正在通过 Worker 加载 DWG 几何和 LibreDWG WASM。`},dwf:{accent:`#0f766e`,soft:`rgba(15, 118, 110, 0.12)`,badge:`DWF`,label:`CAD 图纸`,hint:`正在加载 DWF native renderer 与 W2D/W3D 图形。`},dwfx:{accent:`#0f766e`,soft:`rgba(15, 118, 110, 0.12)`,badge:`DWFx`,label:`CAD 图纸`,hint:`正在加载 DWFx/XPS native renderer 与页面图形。`},xps:{accent:`#0f766e`,soft:`rgba(15, 118, 110, 0.12)`,badge:`XPS`,label:`CAD 图纸`,hint:`正在加载 XPS native renderer 与嵌入字体。`},drawio:{accent:`#0f766e`,soft:`rgba(15, 118, 110, 0.12)`,badge:`DIO`,label:`draw.io 图纸`,hint:`正在解析图元、连线和 SVG 预览。`},dio:{accent:`#0f766e`,soft:`rgba(15, 118, 110, 0.12)`,badge:`DIO`,label:`draw.io 图纸`,hint:`正在解析图元、连线和 SVG 预览。`},excalidraw:{accent:`#6d28d9`,soft:`rgba(109, 40, 217, 0.12)`,badge:`EX`,label:`Excalidraw 图纸`,hint:`正在解析手绘图元并生成安全 SVG。`},epub:{accent:`#7c3aed`,soft:`rgba(124, 58, 237, 0.12)`,badge:`EPUB`,label:`EPUB 电子书`,hint:`正在解析目录、章节资源和阅读分页。`},umd:{accent:`#0284c7`,soft:`rgba(2, 132, 199, 0.12)`,badge:`UMD`,label:`UMD 电子书`,hint:`正在解析移动电子书结构、目录和压缩正文。`},png:{accent:`#7c5cff`,soft:`rgba(124, 92, 255, 0.12)`,badge:`IMG`,label:`图片文件`,hint:`正在解码像素数据并生成预览。`},jpg:{accent:`#7c5cff`,soft:`rgba(124, 92, 255, 0.12)`,badge:`IMG`,label:`图片文件`,hint:`正在解码像素数据并生成预览。`},jpeg:{accent:`#7c5cff`,soft:`rgba(124, 92, 255, 0.12)`,badge:`IMG`,label:`图片文件`,hint:`正在解码像素数据并生成预览。`},gif:{accent:`#7c5cff`,soft:`rgba(124, 92, 255, 0.12)`,badge:`IMG`,label:`图片文件`,hint:`正在解码像素数据并生成预览。`},webp:{accent:`#7c5cff`,soft:`rgba(124, 92, 255, 0.12)`,badge:`IMG`,label:`图片文件`,hint:`正在解码像素数据并生成预览。`},svg:{accent:`#7c5cff`,soft:`rgba(124, 92, 255, 0.12)`,badge:`IMG`,label:`图片文件`,hint:`正在解码像素数据并生成预览。`},bmp:{accent:`#7c5cff`,soft:`rgba(124, 92, 255, 0.12)`,badge:`IMG`,label:`图片文件`,hint:`正在解码像素数据并生成预览。`},mp4:{accent:`#0f766e`,soft:`rgba(15, 118, 110, 0.12)`,badge:`VID`,label:`视频文件`,hint:`正在准备媒体资源和播放组件。`},mp3:{accent:`#0f766e`,soft:`rgba(15, 118, 110, 0.12)`,badge:`AUD`,label:`音频文件`,hint:`正在准备音频资源和播放控件。`},mpeg:{accent:`#0f766e`,soft:`rgba(15, 118, 110, 0.12)`,badge:`AUD`,label:`音频文件`,hint:`正在准备音频资源和播放控件。`},wav:{accent:`#0f766e`,soft:`rgba(15, 118, 110, 0.12)`,badge:`AUD`,label:`音频文件`,hint:`正在准备音频资源和播放控件。`},ogg:{accent:`#0f766e`,soft:`rgba(15, 118, 110, 0.12)`,badge:`AUD`,label:`音频文件`,hint:`正在准备音频资源和播放控件。`},oga:{accent:`#0f766e`,soft:`rgba(15, 118, 110, 0.12)`,badge:`AUD`,label:`音频文件`,hint:`正在准备音频资源和播放控件。`},opus:{accent:`#0f766e`,soft:`rgba(15, 118, 110, 0.12)`,badge:`AUD`,label:`音频文件`,hint:`正在准备音频资源和播放控件。`},m4a:{accent:`#0f766e`,soft:`rgba(15, 118, 110, 0.12)`,badge:`AUD`,label:`音频文件`,hint:`正在准备音频资源和播放控件。`},aac:{accent:`#0f766e`,soft:`rgba(15, 118, 110, 0.12)`,badge:`AUD`,label:`音频文件`,hint:`正在准备音频资源和播放控件。`},flac:{accent:`#0f766e`,soft:`rgba(15, 118, 110, 0.12)`,badge:`AUD`,label:`音频文件`,hint:`正在准备音频资源和播放控件。`},weba:{accent:`#0f766e`,soft:`rgba(15, 118, 110, 0.12)`,badge:`AUD`,label:`音频文件`,hint:`正在准备音频资源和播放控件。`},mov:{accent:`#0f766e`,soft:`rgba(15, 118, 110, 0.12)`,badge:`VID`,label:`视频文件`,hint:`正在准备媒体资源和播放组件。`},avi:{accent:`#0f766e`,soft:`rgba(15, 118, 110, 0.12)`,badge:`VID`,label:`视频文件`,hint:`正在准备媒体资源和播放组件。`},webm:{accent:`#0f766e`,soft:`rgba(15, 118, 110, 0.12)`,badge:`VID`,label:`视频文件`,hint:`正在准备媒体资源和播放组件。`},m4v:{accent:`#0f766e`,soft:`rgba(15, 118, 110, 0.12)`,badge:`VID`,label:`视频文件`,hint:`正在准备媒体资源和播放组件。`}},J=(e=``)=>Ot[e.trim().toLowerCase()]||Dt,Y=e=>({"--viewer-accent":e.accent,"--viewer-soft":e.soft}),kt=(e=``)=>{let t=J(e);return{loading:!1,error:``,message:``,theme:t,styleVars:Y(t)}},X=e=>({loading:e.loading,error:e.error,message:e.message,theme:{...e.theme},styleVars:{...e.styleVars}}),At=(e=``)=>{let t=kt(e),n=e=>{t.theme=J(e),t.styleVars=Y(t.theme)};return{state:t,setExtension(e=``){return n(e),X(t)},startLoading(e){return t.loading=!0,t.message=e,t.error=``,X(t)},setLoadingMessage(e){return t.message=e,X(t)},stopLoading(){return t.loading=!1,t.message=``,X(t)},showError(e){return t.loading=!1,t.message=``,t.error=e,X(t)},clearError(){return t.error=``,X(t)},resetLoading(){return t.loading=!1,t.message=``,t.error=``,X(t)},getState(){return X(t)}}},jt=({registry:e=q(m),handlers:t,fallbackHandler:n,fallbackKey:r=`error`})=>{let i=Array.from(t).reduce((e,t)=>(e.set(t.rendererId,t.handler),e),new Map),a=new Map,o=[];e.list().forEach(e=>{let t=i.get(e.id);if(!t){o.push(e.id);return}e.extensions.forEach(e=>{a.set(P(e),t)})}),n&&r&&a.set(P(r),n);let s=e=>a.get(P(e));return{handlersByRendererId:i,handlersByExtension:a,missingRendererIds:o,get:s,resolve(e){return s(e)||(r?s(r):void 0)},has(e){return a.has(P(e))},listExtensions(){return Array.from(a.keys()).sort()}}},Mt=(e,t)=>({rendered:e,destroy:()=>t?t():Nt(e)}),Nt=e=>{if(!e||typeof e!=`object`)return;let t=e;if(typeof t.unmount==`function`)return t.unmount();if(typeof t.$destroy==`function`)return t.$destroy();if(typeof t.destroy==`function`)return t.destroy()},Pt=({source:e,options:t,registerExportAdapter:n,renderContext:r})=>({filename:e.filename,url:e.url,streamUrl:e.url,options:t,registerExportAdapter:n,...r}),Ft=async({dispatcher:e,buffer:t,target:n,type:r=``,context:i,throwOnMissingHandler:a=!1})=>{let o=P(r),s=e.resolve(o);if(!s){if(a)throw Error(`No file viewer renderer is registered for "${o}".`);return}return s(t,n,o,i)},It=({handler:e,getTarget:t=e=>e.surface.container,createContext:n=Pt,destroy:r})=>async i=>{let{source:a}=i;if(!a.buffer)throw Error(`FileRenderHandler renderer requires an ArrayBuffer source.`);let o=t(i),s=await e(a.buffer,o,a.extension,n(i));return Mt(s,()=>r?r(s,i):Nt(s))},Lt=({definitions:e=m,handlers:t,getTarget:n,createContext:r,destroy:i})=>{let a=q(e),o=jt({registry:a,handlers:t});return{registry:q(a.list().map(e=>{let t=o.handlersByRendererId.get(e.id);return t?{...e,load:It({handler:t,getTarget:n,createContext:r,destroy:i})}:e})),dispatcher:o,missingRendererIds:o.missingRendererIds}},Rt=Object.freeze({downloading:`正在下载文件资源...`,streamingPdf:`正在建立 PDF 流式预览...`,reading:`正在解析文件内容...`}),Z=Object.freeze({accent:`#5f6f82`,soft:`rgba(95, 111, 130, 0.12)`,badge:`DOC`,label:`文件内容`,hint:`正在整理内容结构并生成预览。`}),zt=`支持 Office、PDF、OFD、Typst、压缩包、邮件、OLB/DRA、CAD、地理数据、3D 模型、Excalidraw、draw.io、EPUB、UMD、Markdown、代码/文本、图片、音视频、字体和数据资产的在线预览`,Bt=e=>{let t=P(e);return t?`.${t}`:`当前`},Vt=({state:e,extension:t=``,title:n,message:r,description:i,theme:a=Z,recoverable:o})=>({state:e,extension:P(t),title:n,message:r,description:i,theme:a,recoverable:o}),Ht=(e=``,t=Z)=>Vt({state:`unsupported`,extension:e,title:`暂不支持在线预览`,message:`不支持${Bt(e)}格式的在线预览，请下载后预览或转换为支持的格式。`,description:zt,theme:t,recoverable:!0}),Ut=e=>e instanceof Error?e.message:String(e),Wt=(e,t)=>`${e}：${Ut(t)}`,Gt=(e=``,t=`未知错误`,n=Z)=>Vt({state:`error`,extension:e,title:`预览失败`,message:Ut(t),theme:n,recoverable:!0}),Q=e=>e.replace(/&/g,`&amp;`).replace(/"/g,`&quot;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`),Kt=e=>`url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(e)}")`,$=(e,t,n,r)=>Math.min(r,Math.max(n,typeof e==`number`&&Number.isFinite(e)?e:t)),qt=e=>e?e===!0?{enabled:!0,text:`Flyfish Viewer`}:e.enabled===!1||!e.text&&!e.image?null:{enabled:!0,...e}:null,Jt=e=>{let t=$(e.gapX,260,96,800),n=$(e.gapY,180,80,800),r=$(e.width,e.image?160:220,32,t),i=$(e.height,(e.image,72),24,n),a=$(e.rotate,-24,-75,75),o=$(e.opacity,.18,.02,.8),s=(t-r)/2,c=(n-i)/2,l=t/2,u=n/2;if(e.image)return`<svg xmlns="http://www.w3.org/2000/svg" width="${t}" height="${n}" viewBox="0 0 ${t} ${n}"><g opacity="${o}" transform="rotate(${a} ${l} ${u})"><image href="${Q(e.image)}" x="${s}" y="${c}" width="${r}" height="${i}" preserveAspectRatio="xMidYMid meet"/></g></svg>`;let d=Q(e.text||`Flyfish Viewer`),f=$(e.fontSize,20,10,72);return`<svg xmlns="http://www.w3.org/2000/svg" width="${t}" height="${n}" viewBox="0 0 ${t} ${n}"><g opacity="${o}" transform="rotate(${a} ${l} ${u})"><text x="${l}" y="${u}" text-anchor="middle" dominant-baseline="middle" fill="${Q(e.color||`#355070`)}" font-family="${Q(e.fontFamily||`Aptos, 'Segoe UI', sans-serif`)}" font-size="${f}" font-weight="700">${d}</text></g></svg>`},Yt=e=>{let t=qt(e);return t?Kt(Jt(t)):``},Xt=e=>{let t=Yt(e);return t?`position:absolute;inset:0;pointer-events:none;background-image:${t};background-repeat:repeat;z-index:20;`:``},Zt=64*1024,Qt=()=>{let e=0,t=null;return{get version(){return e},createVersion(){return e+=1,t?.abort(),t=null,e},isCurrent(t){return t===e},createAbortController(){return t=typeof AbortController==`function`?new AbortController:null,t},clearAbortController(e){t===e&&(t=null)},abort(){t?.abort(),t=null}}},$t=e=>{if(typeof DOMException<`u`&&e instanceof DOMException&&e.name===`AbortError`)return!0;if(!e||typeof e!=`object`)return!1;let t=e;return t.__CANCEL__===!0||t.code===`ERR_CANCELED`||t.name===`AbortError`||t.name===`CanceledError`},en=e=>e===!0||e===!1||e===`same-origin`?e:`same-origin`,tn=(e,t)=>{try{let n=new URL(e,t),r=new URL(t);return n.origin===r.origin}catch{return!1}},nn=({extension:e,pageHref:t,streaming:n,url:r})=>{if(e.toLowerCase()!==`pdf`)return!1;let i=en(n);return i===!1?!1:i===!0?!0:tn(r,t)},rn=class{constructor(e,t=null){if(typeof e==`string`){this.name=e,this.worker=t;return}this.name=``,this.worker=e}defaults(e){return this.worker||=e(),this.worker}},an=(e,t=!1)=>new rn(e,null);export{de as $,et as A,Pe as B,yt as C,Ke as D,dt as E,it as F,Ee as G,Fe as H,Ze as I,ae as J,me as K,Ye as L,tt as M,rt as N,qe as O,at as P,ce as Q,F as R,Ct as S,xt as T,Ae as U,Ie as V,j as W,ue as X,se as Y,oe as Z,X as _,nn as a,s as at,Tt as b,qt as c,l as ct,Ht as d,v as et,Wt as f,jt as g,Ft as h,$t as i,e as it,nt as j,$e as k,Rt as l,Mt as m,Zt as n,h as nt,Yt as o,o as ot,Lt as p,we as q,Qt as r,m as rt,Xt as s,c as st,an as t,g as tt,Gt as u,At as v,bt as w,W as x,wt as y,I as z};