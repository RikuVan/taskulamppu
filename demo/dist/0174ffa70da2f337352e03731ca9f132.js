// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

require = (function (modules, cache, entry) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof require === "function" && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof require === "function" && require;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      function localRequire(x) {
        return newRequire(localRequire.resolve(x));
      }

      localRequire.resolve = function (x) {
        return modules[name][1][x] || x;
      };

      var module = cache[name] = new newRequire.Module;
      modules[name][0].call(module.exports, localRequire, module, module.exports);
    }

    return cache[name].exports;
  }

  function Module() {
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  // Override the current require with this new one
  return newRequire;
})({5:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.h = h;
exports.render = render;
function clone(target, source) {
  var obj = {};

  for (var i in target) {
    obj[i] = target[i];
  }for (var i in source) {
    obj[i] = source[i];
  }return obj;
}

function eventListener(event) {
  return event.currentTarget.events[event.type](event);
}

function updateAttribute(element, name, value, oldValue, isSVG) {
  if (name === "key") {} else {
    if (name[0] === "o" && name[1] === "n") {
      if (!element.events) {
        element.events = {};
      }
      element.events[name = name.slice(2)] = value;

      if (value) {
        if (!oldValue) {
          element.addEventListener(name, eventListener);
        }
      } else {
        element.removeEventListener(name, eventListener);
      }
    } else if (name in element && name !== "list" && !isSVG) {
      element[name] = value == null ? "" : value;
    } else if (value != null && value !== false) {
      element.setAttribute(name, value);
    }

    if (value == null || value === false) {
      element.removeAttribute(name);
    }
  }
}

function createElement(node, lifecycle, isSVG) {
  var element = typeof node === "string" || typeof node === "number" ? document.createTextNode(node) : (isSVG = isSVG || node.name === "svg") ? document.createElementNS("http://www.w3.org/2000/svg", node.name) : document.createElement(node.name);

  var attributes = node.attributes;
  if (attributes) {
    if (attributes.oncreate) {
      lifecycle.push(function () {
        attributes.oncreate(element);
      });
    }

    for (var i = 0; i < node.children.length; i++) {
      element.appendChild(createElement(node.children[i], lifecycle, isSVG));
    }

    for (var name in attributes) {
      updateAttribute(element, name, attributes[name], null, isSVG);
    }
  }

  return element;
}

function updateElement(element, oldAttributes, attributes, lifecycle, isSVG) {
  for (var name in clone(oldAttributes, attributes)) {
    if (attributes[name] !== (name === "value" || name === "checked" ? element[name] : oldAttributes[name])) {
      updateAttribute(element, name, attributes[name], oldAttributes[name], isSVG);
    }
  }

  if (attributes.onupdate) {
    lifecycle.push(function () {
      attributes.onupdate(element, oldAttributes);
    });
  }
}

function removeChildren(element, node) {
  var attributes = node.attributes;
  if (attributes) {
    for (var i = 0; i < node.children.length; i++) {
      removeChildren(element.childNodes[i], node.children[i]);
    }

    if (attributes.ondestroy) {
      attributes.ondestroy(element);
    }
  }
  return element;
}

function removeElement(parent, element, node) {
  function done() {
    parent.removeChild(removeChildren(element, node));
  }

  var cb = node.attributes && node.attributes.onremove;
  if (cb) {
    cb(element, done);
  } else {
    done();
  }
}

function getKey(node) {
  return node ? node.key : null;
}

function patch(parent, element, oldNode, node, lifecycle, isSVG) {
  if (node === oldNode) {} else if (oldNode == null || oldNode.name !== node.name) {
    var newElement = parent.insertBefore(createElement(node, lifecycle, isSVG), element);

    if (oldNode != null) {
      removeElement(parent, element, oldNode);
    }

    element = newElement;
  } else if (oldNode.name == null) {
    element.nodeValue = node;
  } else {
    updateElement(element, oldNode.attributes, node.attributes, lifecycle, isSVG = isSVG || node.name === "svg");

    var oldKeyed = {};
    var newKeyed = {};
    var oldElements = [];
    var oldChildren = oldNode.children;
    var children = node.children;

    for (var i = 0; i < oldChildren.length; i++) {
      oldElements[i] = element.childNodes[i];

      var oldKey = getKey(oldChildren[i]);
      if (oldKey != null) {
        oldKeyed[oldKey] = [oldElements[i], oldChildren[i]];
      }
    }

    var i = 0;
    var k = 0;

    while (k < children.length) {
      var oldKey = getKey(oldChildren[i]);
      var newKey = getKey(children[k]);

      if (newKeyed[oldKey]) {
        i++;
        continue;
      }

      if (newKey != null && newKey === getKey(oldChildren[i + 1])) {
        if (oldKey == null) {
          removeElement(element, oldElements[i], oldChildren[i]);
        }
        i++;
        continue;
      }

      if (newKey == null) {
        if (oldKey == null) {
          patch(element, oldElements[i], oldChildren[i], children[k], lifecycle, isSVG);
          k++;
        }
        i++;
      } else {
        var keyed = oldKeyed[newKey] || [];

        if (oldKey === newKey) {
          patch(element, keyed[0], keyed[1], children[k], lifecycle, isSVG);
          i++;
        } else if (keyed[0]) {
          patch(element, element.insertBefore(keyed[0], oldElements[i]), keyed[1], children[k], lifecycle, isSVG);
        } else {
          patch(element, oldElements[i], null, children[k], lifecycle, isSVG);
        }

        newKeyed[newKey] = children[k];
        k++;
      }
    }

    while (i < oldChildren.length) {
      if (getKey(oldChildren[i]) == null) {
        removeElement(element, oldElements[i], oldChildren[i]);
      }
      i++;
    }

    for (var i in oldKeyed) {
      if (!newKeyed[i]) {
        removeElement(element, oldKeyed[i][0], oldKeyed[i][1]);
      }
    }
  }
  return element;
}

function h(name, attributes) {
  var rest = [];
  var children = [];
  var length = arguments.length;

  while (length-- > 2) {
    rest.push(arguments[length]);
  }while (rest.length) {
    var node = rest.pop();
    if (node && node.pop) {
      for (length = node.length; length--;) {
        rest.push(node[length]);
      }
    } else if (node != null && node !== true && node !== false) {
      children.push(node);
    }
  }

  return {
    name: name,
    attributes: attributes || {},
    children: children,
    key: attributes && attributes.key
  };
}

function render(node, container) {
  var lifecycle = [];
  var element = container.children[0];

  patch(container, element, element && element.node, node, lifecycle).node = node;

  while (lifecycle.length) {
    lifecycle.pop()();
  }
}
},{}],3:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.computed = computed;
exports.observe = observe;
const PROXIED = exports.PROXIED = Symbol('proxied');
const DISPOSED = Symbol('disposed');
const SCHEMA = Symbol('schema');

// WeakMap<Map<state>, Map<prop, Set<computed>>>
const observers = new WeakMap();
const compStack = [];

/*------------------ UTILS --------------------*/

const batcher = {
  timeout: null,
  queue: new Set(),
  process() {
    batcher.queue.forEach(t => t());
    batcher.queue.clear();
    batcher.timeout = null;
  },
  enqueue(task) {
    if (batcher.timeout === null) batcher.timeout = setTimeout(batcher.process, 0);
    batcher.queue.add(task);
  }
};

// From: https://github.com/mweststrate/immer/blob/master/src/common.js
function each(value, cb) {
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) cb(i, value[i]);
  } else {
    for (let key in value) cb(key, value[key]);
  }
}

// date objects are not proxyable
function isObj(o) {
  return o && typeof o === 'object' && !(o instanceof Date);
}

function dispose(_) {
  return _[DISPOSED] = true;
}

function log({ compute, trap, obj, prop, val }) {
  compute && console.group(`%c compute`, `color: red; font-weight: lighter;`);
  trap && console.group(`%c ${trap}`, `color: ${trap === 'set' ? 'red' : 'gray'}; font-weight: lighter;`);
  obj && console.log('%c obj', 'color: #9E9E9E; font-weight: bold;', obj);
  prop && console.log('%c prop', 'color: #03A9F4; font-weight: bold;', prop);
  val && console.log('%c value', 'color: #4CAF50; font-weight: bold;', val);
  console.groupEnd();
}

// we need to watch length to catch pop/push/shift/unshift
const arrayMethods = Object.getOwnPropertyNames(Array.prototype).filter(m => m !== 'length');

function isArrayMethod(key) {
  return arrayMethods.includes(key);
}

/*------------------- VALIDATE ---------------------*/

function createTypeError(prop, given, expected) {
  throw TypeError(`The value you are assigning to "${prop}" is incorrect. Given: "${given}". Expected : "${expected}"`);
}

function validate(schema, obj, prop, val) {
  const givenType = typeof val;
  if (Array.isArray(obj) && Array.isArray(schema)) {
    if (givenType !== schema[0]) {
      createTypeError(prop, givenType, schema[0]);
      return true;
    }
  } else if (schema[prop] && givenType !== schema[prop]) {
    createTypeError(prop, givenType, schema[prop]);
    return true;
  }
  return false;
}

/*------------------ COMPUTED --------------------*/

function computed(fn, { autorun = true, async = false }) {
  const proxy = new Proxy(fn, {
    apply(target, thisArg, argsList) {
      const doComputation = (fn = null) => {
        // add function to stack when its property getters are called
        compStack.unshift(proxy);
        const result = fn ? fn() : target.apply(thisArg, argsList);
        compStack.shift();
        return result;
      };
      // if case compute function should be async to, e.g., support computing after a promise resolves
      // we inject a callback
      // computed(({computeSync}) => {
      //  delay(10).then(v => computeAsync(() => app(state)))
      // }
      if (async) {
        argsList.push({
          computeAsync: function (target) {
            return doComputation(target);
          }
        });
      }

      return doComputation();
    }
  });
  // function must be called first time to register dependencies
  if (autorun) return proxy();
  return proxy;
}

const proxy = (state, schema, shouldLog) => {
  // over proxied state has map of Props and each prop a list of computations to run when to prop is updated
  // Map<state>, Map<prop, Set<comp>>
  observers.set(state, new Map());
  state[PROXIED] = true;
  if (schema) {
    state[SCHEMA] = schema;
  }
  return new Proxy(state, {
    get(obj, prop) {
      if (isArrayMethod(prop)) return obj[prop];
      if (shouldLog) log({ trap: 'get', obj, prop });
      const propsMap = observers.get(state);
      // a new computation to be added to deps of a property?
      if (compStack.length) {
        if (!propsMap.has(prop)) propsMap.set(prop, new Set());
        const computedDeps = propsMap.get(prop);
        propsMap.get(prop).add(compStack[0]);
      }
      return obj[prop];
    },
    set(obj, prop, val) {
      if (shouldLog) log({ trap: 'set', obj, prop, val });
      if (state[SCHEMA] && validate(state[SCHEMA], obj, prop, val)) return false;
      const propsMap = observers.get(state);
      // trick from https://github.com/sindresorhus/on-change
      try {
        result = observe(val);
        state[prop] = result;
      } catch (e) {
        state[prop] = val;
      }
      if (propsMap.has(prop)) {
        const computedDeps = propsMap.get(prop);
        // you may want to dispose of a dep if, e.g., a component is unmounted with computed deps
        for (const dep of computedDeps) {
          if (dep[DISPOSED]) {
            dependentComputations.delete(dep);
          } else if (dep !== compStack[0]) {
            // Run the computed functions in batches
            shouldLog && log({ prop, compute: true });
            batcher.enqueue(dep);
          }
        }
      }
      return true;
    },
    deleteProperty(obj, prop) {
      const propsMap = observers.get(state);
      if (propsMap.has(prop)) propsMap.delete(prop);
      delete obj[prop];
      return true;
    }
  });
};

function observe(state, schema = null, log = false) {
  if (state[PROXIED]) return;
  // iterate through the state to observe all nested objects
  // could make this optional if you want only shallow observation
  each(state, (key, val) => {
    if (isObj(val)) {
      const s = schema ? schema[key] : null;
      state[key] = observe(val, s, log);
    }
  });
  return proxy(state, schema, log);
}
},{}],2:[function(require,module,exports) {
"use strict";

var _ultradomM = require("ultradom/ultradom.m.js");

var _taskulamppu = require("./taskulamppu");

const state = { num: 0, otherNums: [1, 2, 3] };
const schema = { num: 'number', otherNums: ['number'] };

const store = (0, _taskulamppu.observe)(state, schema, true);

const dec = s => s.num--;
const inc = s => s.num++;
const exclaim = s => s.num = s.num + '!';
const pushNum = s => s.otherNums.push(100);

const view = s => (0, _ultradomM.h)(
  "div",
  null,
  (0, _ultradomM.h)(
    "h1",
    null,
    s.num
  ),
  (0, _ultradomM.h)(
    "h1",
    null,
    s.otherNums.reduce((v, n) => v + n, 0)
  ),
  (0, _ultradomM.h)(
    "button",
    { onclick: () => dec(s) },
    "-"
  ),
  (0, _ultradomM.h)(
    "button",
    { onclick: () => inc(s) },
    "+"
  ),
  (0, _ultradomM.h)(
    "button",
    { onclick: () => exclaim(s) },
    "!"
  ),
  (0, _ultradomM.h)(
    "button",
    { onclick: () => pushNum(s) },
    "+100"
  )
);

function app(store) {
  (0, _ultradomM.render)(view(store), document.body);
}

(0, _taskulamppu.computed)(() => app(store), { log: true });
},{"ultradom/ultradom.m.js":5,"./taskulamppu":3}],0:[function(require,module,exports) {
var global = (1,eval)('this');
var OldModule = module.bundle.Module;
function Module() {
  OldModule.call(this);
  this.hot = {
    accept: function (fn) {
      this._acceptCallback = fn || function () {};
    },
    dispose: function (fn) {
      this._disposeCallback = fn;
    }
  };
}

module.bundle.Module = Module;

if (!module.bundle.parent) {
  var ws = new WebSocket('ws://localhost:64646/');
  ws.onmessage = (e) => {
    var data = JSON.parse(e.data);

    if (data.type === 'update') {
      for (let asset of data.assets) {
        hmrApply(global.require, asset);
      }

      for (let asset of data.assets) {
        if (!asset.isNew) {
          hmrAccept(global.require, asset.id);
        }
      }
    }
  };
}

function getParents(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return [];
  }

  let parents = [];
  for (let k in modules) {
    for (let d in modules[k][1]) {
      let dep = modules[k][1][d];
      if (dep === id || (Array.isArray(dep) && dep[dep.length - 1] === id)) {
        parents.push(+k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    let fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAccept(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAccept(bundle.parent, id);
  }

  let cached = bundle.cache[id];
  if (cached && cached.hot._disposeCallback) {
    cached.hot._disposeCallback();
  }

  delete bundle.cache[id];
  bundle(id);

  cached = bundle.cache[id];
  if (cached && cached.hot && cached.hot._acceptCallback) {
    cached.hot._acceptCallback();
    return true;
  }

  return getParents(global.require, id).some(id => hmrAccept(global.require, id));
}
},{}]},{},[0,2])