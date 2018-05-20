// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
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

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  return newRequire;
})({6:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.h = h;
exports.render = render;
function clone(target, source) {
  var obj = {};

  for (var i in target) obj[i] = target[i];
  for (var i in source) obj[i] = source[i];

  return obj;
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

  while (length-- > 2) rest.push(arguments[length]);

  while (rest.length) {
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

  while (lifecycle.length) lifecycle.pop()();
}
},{}],4:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.computed = computed;
exports.observe = observe;
var PROXIED = exports.PROXIED = Symbol('proxied');
var DISPOSED = Symbol('disposed');
var SCHEMA = Symbol('schema');

// WeakMap<Map<state>, Map<property, Set<computedCallback>>>
var observers = new WeakMap();
var compStack = [];

/*------------------ UTILS --------------------*/

var batcher = {
  timeout: null,
  queue: new Set(),
  process: function process() {
    batcher.queue.forEach(function (t) {
      return t();
    });
    batcher.queue.clear();
    batcher.timeout = null;
  },
  enqueue: function enqueue(task) {
    if (batcher.timeout === null) batcher.timeout = setTimeout(batcher.process, 0);
    batcher.queue.add(task);
  }
};

// From: https://github.com/mweststrate/immer/blob/master/src/common.js
function each(value, cb) {
  if (Array.isArray(value)) {
    for (var i = 0; i < value.length; i++) {
      cb(i, value[i]);
    }
  } else {
    for (var key in value) {
      cb(key, value[key]);
    }
  }
}

// date objects are not proxyable
function isObj(o) {
  return o && (typeof o === 'undefined' ? 'undefined' : _typeof(o)) === 'object' && !(o instanceof Date);
}

function dispose(_) {
  return _[DISPOSED] = true;
}

function log(_ref) {
  var compute = _ref.compute,
      trap = _ref.trap,
      obj = _ref.obj,
      prop = _ref.prop,
      val = _ref.val;

  compute && console.group('%c compute', 'color: red; font-weight: lighter;');
  trap && console.group('%c ' + trap, 'color: ' + (trap === 'set' ? 'red' : 'gray') + '; font-weight: lighter;');
  obj && console.log('%c obj', 'color: #9E9E9E; font-weight: bold;', obj);
  prop && console.log('%c prop', 'color: #03A9F4; font-weight: bold;', prop);
  val && console.log('%c value', 'color: #4CAF50; font-weight: bold;', val);
  console.groupEnd();
}

// we need to watch length to catch pop/push/shift/unshift
var arrayMethods = Object.getOwnPropertyNames(Array.prototype).filter(function (m) {
  return m !== 'length';
});

function isArrayMethod(key) {
  return arrayMethods.includes(key);
}

function underscored(string) {
  return string.startsWith('_');
}

/*------------------- VALIDATE ---------------------*/

function createTypeError(prop, given, expected) {
  throw TypeError('The value you are assigning to "' + prop + '" is incorrect. Given: "' + given + '". Expected : "' + expected + '"');
}

function validate(schema, obj, prop, val) {
  var givenType = typeof val === 'undefined' ? 'undefined' : _typeof(val);
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

function computed(fn) {
  var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref2$autorun = _ref2.autorun,
      autorun = _ref2$autorun === undefined ? true : _ref2$autorun,
      _ref2$async = _ref2.async,
      async = _ref2$async === undefined ? false : _ref2$async;

  var proxy = new Proxy(fn, {
    apply: function apply(target, thisArg, argsList) {
      var doComputation = function doComputation() {
        var fn = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

        // add function to stack when its property getters are called
        compStack.unshift(proxy);
        var result = fn ? fn() : target.apply(thisArg, argsList);
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
          computeAsync: function computeAsync(target) {
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

var proxy = function proxy(state, schema, loggingMode) {
  // over proxied state has map of Props and each prop a list of computations to run when to prop is updated
  // Map<state>, Map<prop, Set<comp>>
  observers.set(state, new Map());
  state[PROXIED] = true;
  if (schema) {
    state[SCHEMA] = schema;
  }
  return new Proxy(state, {
    get: function get(obj, prop) {
      if (isArrayMethod(prop)) return obj[prop];
      if (underscored(prop)) return obj[prop];
      if (loggingMode) log({ trap: 'get', obj: obj, prop: prop });
      var propsMap = observers.get(state);
      // a new computation to be added to deps of a property?
      if (compStack.length) {
        if (!propsMap.has(prop)) propsMap.set(prop, new Set());
        var computedDeps = propsMap.get(prop);
        propsMap.get(prop).add(compStack[0]);
      }
      return obj[prop];
    },
    set: function set(obj, prop, val) {
      if (loggingMode) log({ trap: 'set', obj: obj, prop: prop, val: val });
      // check if assigned value matches schema
      if (state[SCHEMA] && validate(state[SCHEMA], obj, prop, val)) return false;
      // ignore underscored props which are unwatched
      if (underscored(prop)) return true;
      console.log('HHHHHH', underscored(prop));
      var propsMap = observers.get(state);
      // trick from https://github.com/sindresorhus/on-change
      try {
        result = observe(val);
        state[prop] = result;
      } catch (e) {
        state[prop] = val;
      }
      if (propsMap.has(prop)) {
        var computedDeps = propsMap.get(prop);
        // you may want to dispose of a dep if, e.g., a component is unmounted
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = computedDeps[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var dep = _step.value;

            if (dep[DISPOSED]) {
              dependentComputations.delete(dep);
            } else if (dep !== compStack[0]) {
              if (loggingMode) log({ prop: prop, compute: true });
              // Run the computed functions in batches
              batcher.enqueue(dep);
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }
      return true;
    },
    deleteProperty: function deleteProperty(obj, prop) {
      var propsMap = observers.get(state);
      if (propsMap.has(prop)) propsMap.delete(prop);
      delete obj[prop];
      return true;
    }
  });
};

function observe(state) {
  var schema = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  var log = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  if (state[PROXIED]) return;
  // iterate through the state to observe all nested objects
  // could make this optional if you want only shallow observation
  each(state, function (key, val) {
    if (isObj(val)) {
      var s = schema ? schema[key] : null;
      state[key] = observe(val, s, log);
    }
  });
  return proxy(state, schema, log);
}
},{}],2:[function(require,module,exports) {
'use strict';

var _ultradomM = require('ultradom/ultradom.m.js');

var _taskulamppu = require('./taskulamppu');

var state = { num: 0, otherNums: [1, 2, 3], ignoredNum: 3 };
var schema = { num: 'number', otherNums: ['number'] };

var store = (0, _taskulamppu.observe)(state, schema, true);

var dec = function dec(s) {
  return s._unwatchedNum--;
};
var inc = function inc(s) {
  return s.num++;
};
var exclaim = function exclaim(s) {
  return s.num = s.num + '!';
};
var pushNum = function pushNum(s) {
  return s.otherNums.push(100);
};

var view = function view(s) {
  return (0, _ultradomM.h)(
    'div',
    null,
    (0, _ultradomM.h)(
      'h1',
      null,
      s.num
    ),
    (0, _ultradomM.h)(
      'h1',
      null,
      s.otherNums.reduce(function (v, n) {
        return v + n;
      }, 0)
    ),
    (0, _ultradomM.h)(
      'button',
      { onclick: function onclick() {
          return dec(s);
        } },
      '-'
    ),
    (0, _ultradomM.h)(
      'button',
      { onclick: function onclick() {
          return inc(s);
        } },
      '+'
    ),
    (0, _ultradomM.h)(
      'button',
      { onclick: function onclick() {
          return exclaim(s);
        } },
      '!'
    ),
    (0, _ultradomM.h)(
      'button',
      { onclick: function onclick() {
          return pushNum(s);
        } },
      '+100'
    )
  );
};

function app(store) {
  (0, _ultradomM.render)(view(store), document.body);
}

(0, _taskulamppu.computed)(function () {
  return app(store);
}, { log: true });
},{"ultradom/ultradom.m.js":6,"./taskulamppu":4}],8:[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';

var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };

  module.bundle.hotData = null;
}

module.bundle.Module = Module;

var parent = module.bundle.parent;
if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = '' || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + '50333' + '/');
  ws.onmessage = function (event) {
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      data.assets.forEach(function (asset) {
        hmrApply(global.parcelRequire, asset);
      });

      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          hmrAccept(global.parcelRequire, asset.id);
        }
      });
      // Clear the console after HMR
      console.clear();
    }

    if (data.type === 'reload') {
      ws.close();
      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');

      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);

      removeErrorOverlay();

      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);
  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;

  // html encode message and stack trace
  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;

  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';

  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];
      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
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
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
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

  var cached = bundle.cache[id];
  bundle.hotData = {};
  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);

  cached = bundle.cache[id];
  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAccept(global.parcelRequire, id);
  });
}
},{}]},{},[8,2], null)
//# sourceMappingURL=/app.1ca9f132.map