!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t(e.taskulamppu={})}(this,function(e){"use strict";const t=Symbol("proxied"),o=Symbol("disposed"),n=Symbol("schema"),r=new WeakMap,u=[],c={timeout:null,queue:new Set,process(){c.queue.forEach(e=>e()),c.queue.clear(),c.timeout=null},enqueue(e){null===c.timeout&&(c.timeout=setTimeout(c.process,0)),c.queue.add(e)}};function s({compute:e,trap:t,obj:o,prop:n,val:r}){e&&console.group("%c compute","color: red; font-weight: lighter;"),t&&console.group(`%c ${t}`,`color: ${"set"===t?"red":"gray"}; font-weight: lighter;`),o&&console.log("%c obj","color: #9E9E9E; font-weight: bold;",o),n&&console.log("%c prop","color: #03A9F4; font-weight: bold;",n),r&&console.log("%c value","color: #4CAF50; font-weight: bold;",r),console.groupEnd()}const l=Object.getOwnPropertyNames(Array.prototype).filter(e=>"length"!==e);function i(e,t,o){throw TypeError(`The value you are assigning to "${e}" is incorrect. Given: "${t}". Expected : "${o}"`)}const p=(e,p,a)=>(r.set(e,new Map),e[t]=!0,p&&(e[n]=p),new Proxy(e,{get(t,o){if(n=o,l.includes(n))return t[o];var n;a&&s({trap:"get",obj:t,prop:o});const c=r.get(e);if(u.length){c.has(o)||c.set(o,new Set);c.get(o);c.get(o).add(u[0])}return t[o]},set(t,l,p){if(a&&s({trap:"set",obj:t,prop:l,val:p}),e[n]&&function(e,t,o,n){const r=typeof n;if(Array.isArray(t)&&Array.isArray(e)){if(r!==e[0])return i(o,r,e[0]),!0}else if(e[o]&&r!==e[o])return i(o,r,e[o]),!0;return!1}(e[n],t,l,p))return!1;const d=r.get(e);try{result=f(p),e[l]=result}catch(t){e[l]=p}if(d.has(l)){const e=d.get(l);for(const t of e)t[o]?dependentComputations.delete(t):t!==u[0]&&(a&&s({prop:l,compute:!0}),c.enqueue(t))}return!0},deleteProperty(t,o){const n=r.get(e);return n.has(o)&&n.delete(o),delete t[o],!0}}));function f(e,o=null,n=!1){var r;if(!e[t])return function(e,t){if(Array.isArray(e))for(let o=0;o<e.length;o++)t(o,e[o]);else for(let o in e)t(o,e[o])}(e,(t,u)=>{if((r=u)&&"object"==typeof r&&!(r instanceof Date)){const r=o?o[t]:null;e[t]=f(u,r,n)}}),p(e,o,n)}e.PROXIED=t,e.computed=function(e,{autorun:t=!0,async:o=!1}){const n=new Proxy(e,{apply(e,t,r){const c=(o=null)=>{u.unshift(n);const c=o?o():e.apply(t,r);return u.shift(),c};return o&&r.push({computeAsync:function(e){return c(e)}}),c()}});return t?n():n},e.observe=f,Object.defineProperty(e,"__esModule",{value:!0})});