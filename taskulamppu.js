const PROXIED = Symbol('proxied')
const DISPOSED = Symbol('disposed')
const SCHEMA = Symbol('schema')
// WeakMap<Map<state>, Map<property, Set<computedCallback>>>
const observers = new WeakMap()
const compStack = []

/*------------------ UTILS --------------------*/

// From: https://github.com/mweststrate/immer/blob/master/src/common.js
function each(value, cb) {
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) cb(i, value[i])
  } else {
    for (let key in value) cb(key, value[key])
  }
}

// date objects are not proxyable
function isObj(o) {
  return o && typeof o === 'object' && !(o instanceof Date)
}

function dispose(_) {
  return (_[DISPOSED] = true)
}

// we need to watch length to catch pop/push/shift/unshift
const arrayMethods = Object.getOwnPropertyNames(Array.prototype).filter(
  m => m !== 'length'
)

function isArrayMethod(key) {
  return arrayMethods.includes(key)
}

function underscored(string) {
  return string.startsWith('_')
}

function log({ compute, trap, obj, prop, val }) {
  compute && console.group(`%c compute`, `color: red; font-weight: lighter;`)
  trap &&
    console.group(
      `%c ${trap}`,
      `color: ${trap === 'set' ? 'red' : 'gray'}; font-weight: lighter;`
    )
  obj && console.log('%c obj', 'color: #9E9E9E; font-weight: bold;', obj)
  prop && console.log('%c prop', 'color: #03A9F4; font-weight: bold;', prop)
  val && console.log('%c value', 'color: #4CAF50; font-weight: bold;', val)
  console.groupEnd()
}

// TODO: make batching optional
const batcher = {
  timeout: null,
  queue: new Set(),
  process() {
    batcher.queue.forEach(t => t())
    batcher.queue.clear()
    batcher.timeout = null
  },
  enqueue(task) {
    if (batcher.timeout === null)
      batcher.timeout = setTimeout(batcher.process, 0)
    batcher.queue.add(task)
  }
}

/*------------------- VALIDATE ---------------------*/

function createTypeError(prop, given, expected, array) {
  throw new TypeError(
    `The value you are assigning to "${
      array ? `[${prop}]` : prop
    }" is of the wrong type. Given: "${given}". Expected: "${expected}"`
  )
}

function validate(schema, obj, prop, val) {
  let givenType = typeof val
  const objectType = typeof obj[prop] === 'object'
  if (Array.isArray(obj) && Array.isArray(schema)) {
    if (givenType !== schema[0]) {
      createTypeError(prop, givenType, schema[0], true)
      return true
    }
  } else if (givenType === 'object' && objectType) {
    givenType = Array.isArray(val) ? 'array' : givenType
    createTypeError(prop, givenType, 'object')
  } else if (schema[prop] && givenType !== schema[prop]) {
    createTypeError(prop, givenType, schema[prop])
    return true
  }
  return false
}

/*------------------ COMPUTED --------------------*/

function createComputation(target, thisArg, argsList) {
  return (fn = null) => {
    // add function to stack when its property getters are called
    compStack.unshift(proxy)
    const result = fn ? fn() : target.apply(thisArg, argsList)
    compStack.shift()
    return result
  }
}

export function computed(fn, { autorun = true, async = false } = {}) {
  const proxy = new Proxy(fn, {
    apply(target, thisArg, argsList) {
      const doComputation = createComputation(target, thisArg, argsList)
      // if case compute function should be async to, e.g., support computing after a promise resolves
      // we inject a callback
      // computed(({computeSync}) => {
      //  delay(10).then(v => computeAsync(() => app(state)))
      // }
      if (async) {
        argsList.push({
          computeAsync: function(target) {
            return doComputation(target)
          }
        })
      }

      return doComputation()
    }
  })
  // function must be called first time to register dependencies
  if (autorun) return proxy()
  return proxy
}

const proxy = (state, schema, loggingMode) => {
  // over proxied state has map of Props and each prop a list of computations to run when to prop is updated
  // Map<state>, Map<prop, Set<comp>>
  observers.set(state, new Map())
  state[PROXIED] = true
  if (schema) {
    state[SCHEMA] = schema
  }

  return new Proxy(state, {
    get(obj, prop) {
      // ignnore pop, reduce, map, etc.
      if (isArrayMethod(prop)) return obj[prop]
      // ignore underscored props
      if (underscored(prop)) return obj[prop]
      if (loggingMode) log({ trap: 'get', obj, prop })

      const propsMap = observers.get(state)
      // a new computation to be added to deps of a property?
      if (compStack.length) {
        if (!propsMap.has(prop)) propsMap.set(prop, new Set())
        const computedDeps = propsMap.get(prop)
        propsMap.get(prop).add(compStack[0])
      }
      return obj[prop]
    },
    set(obj, prop, val) {
      if (loggingMode) log({ trap: 'set', obj, prop, val })
      // check if assigned value matches schema
      if (state[SCHEMA] && validate(state[SCHEMA], obj, prop, val)) return false
      // ignore underscored props which are unwatched
      if (underscored(prop)) return true
      const propsMap = observers.get(state)
      // trick from https://github.com/sindresorhus/on-change
      try {
        result = observe(val)
        state[prop] = result
      } catch (e) {
        state[prop] = val
      }
      // handle computations
      if (propsMap.has(prop)) {
        const computedDeps = propsMap.get(prop)
        // you may want to dispose of a dep if, e.g., a component is unmounted
        for (const dep of computedDeps) {
          if (dep[DISPOSED]) {
            dependentComputations.delete(dep)
          } else if (dep !== compStack[0]) {
            if (loggingMode) log({ prop, compute: true })
            // Run the computed functions in batches
            batcher.enqueue(dep)
          }
        }
      }
      return true
    },
    deleteProperty(obj, prop) {
      const propsMap = observers.get(state)
      if (propsMap.has(prop)) propsMap.delete(prop)
      delete obj[prop]
      return true
    }
  })
}

export function observe(state, schema = null, log = false) {
  if (state[PROXIED]) return
  // iterate through the state to observe all nested objects
  // could make this optional if you want only shallow, more performant observe
  each(state, (key, val) => {
    if (isObj(val)) {
      const s = schema ? schema[key] : null
      state[key] = observe(val, s, log)
    }
  })
  return proxy(state, schema, log)
}
