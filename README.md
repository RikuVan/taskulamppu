# `TASKULAMPPU` :flashlight:

> A minimal reactive state managment library built as a hands-on introduction to Javascript Proxies. 'Taskulamppu' because it is easy-to-use and handy (inspired by https://github.com/cowboyd/funcadelic.js/).

## `PROXIES`

**What can you do with Proxies?**

* Enhance objects with new abilities: tamper-proofing, default values, revocability, private properties, immutability, type validation.

* Observe objects: box dangerous code, testing, make objects notify they have changed (observe).

* Virtualized objects: a http service, wrap dom apis, manage browser incompatabilities for an api.

- Some of these things have been achievable with the global Object api, although with more complex code. Also apis like getters and setters with Object api are not dynamic, they will not catch new properties as they are added.

**What are handlers and traps?**

The handler is an object passed as a second argument to the Proxy constructor. It can have any number of traps, for example, `get`, `set`, `deleteProperty`, `has` and `apply` (13 in total). These traps are methods called each time a corresponding operator is used on that object, like a dot assignment or a function call, with relevant arguments, e.g. the object, the property, and the assigned value for `set`. This allows you to take control of the set, get, or call and modify the default behaviour. If you don't use a trap for a behaviour, it will just work as normal.

**When should you use Reflect?**

Reflect is not usually needed inside of traps. It has a few advantages. One is that it does not throw an error if the operation fails. Also, with `Reflect.apply`, there is no danger as there is with fn.call that it was overwritten.

**How do you know an object is Proxied?**

You don't, unless you flag it yourself with, for example, a Symbol.

**How do you 'unproxy' an object?**

Proxies are revocable, If you use the `Proxy.revocable` api instead of `new Proxy`, this will return a `proxy` and `revoke` function. You can save and call this revoke function when you want to stop proxying the object. The proxy is then garbage collectable.

**What can you Proxy and what you not Proxy?**

Objects, arrays, classes, functions are suitable for Proxying. Proxies don't work well with built-in objects, like Date objects. They also don't work with Maps and Sets (and weak versions), although these can be proxied more simply by wrapping their methods with your own higher order functions.

**How fast/slow are Proxies?**

There does not seem to be a straight-forward answer to this question. However, benchmarks in several libraries seem to indicate that they are now faster in Node and at least Chrome than using Object. The fact that performance-sensitive libraries like Vue and MobX are adopting proxies also would seem to indicate their viability. The article below on optimizing them in V8 gives some concrete numbers.

**Proxy resources**

* [ExploringJS](http://exploringjs.com/es6/ch_proxies.html)
* [You Don't Know JS](https://github.com/getify/You-Dont-Know-JS/blob/master/es6%20%26%20beyond/ch7.md#proxies)
* [Google Developers](https://developers.google.com/web/updates/2016/02/es2015-proxies?hl=en)
* [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
* [On optimizing Proxies in V8](https://v8project.blogspot.fi/2017/10/optimizing-proxies.html)

**Examples of libraries built/being built on Proxies**

* [Immer](https://github.com/mweststrate/immer) (has perf benchmark tests of Proxy versus Object.defineProperty versions)
* [jsdom](https://github.com/jsdom/jsdom) (jsdom has Proxy benchmarks here: https://github.com/domenic/jsdom-proxy-benchmark)
* [Vuejs](https://github.com/vuejs)
* [MobX](https://github.com/vuejs) (new version with Proxies is in the works)

**Polyfills**

* [Google Proxy Polyfill](https://github.com/GoogleChrome/proxy-polyfill) [only supports get/set/apply/construct]

## `TASKULAMPPU API`

Comprises two functions built on Proxies: `observe` and `computed`

**Observe**

`observe` proxies nested objects, tracking changes. It only supports plain objects and arrays.

`observe` optionally takes a simple schema of types as a second argument, throwing a type error if an update violates the schema. Currently, the schema supports basic javascript types, e.g. boolean, null, undefined, object, string and number. An array can be represented by ["string"] and must contain the same types.

```js
const schema = {
  name: 'string',
  info: {
    age: 'number',
    contacts: ['string']
    address: {
      street: 'string'
      city: 'string'
      isOwner: 'boolean'
    }
  }
}

const initialState = {
  name: 'Antti',
  info: {
    age: 25,
    contacts: ['Joonas', 'Tommi'],
    address: {
      street: 'Hannulankatu 13'
      city: 'Tampere'
      isOwner: 'boolean'
    }
  }
}
const state = computed(initialState, schema)
```

When the observed properties are mutated, they should trigger callbacks registed via `computed`. If you want a property to not be observed, append an underscore to it: `_ignoredProp`.

**computed**

`computed` registers the passed-in callback with each of the properties it depends on. Any mutation then to a dependency will result in automatic execution of the callback.

```js
computed(() => render(view(state))
```

The second optional argument to `computed` is an options object with two options:

* `autorun` defaults to true. This will call the function immediately once, registering all its dependencies. It must be run one for its dependencies to be registered.

* `async` defaults to false. If true, an asyncComputed function is injected into computed. You must use this to wrap your callback. This allows you to, for example, return promises inside of `computed`.

```js
computed(({ asyncComputed }) =>
  delay(100).then(() => {
    asyncComputed(render(view(state)))
  })
)
```

## `WHAT IS MISSING`

`Taskulamppu` does not support IE. IE support could be accomplished with `Object.createProperty` instead of Proxy traps. See libraries like Vue or MobX for examples. It also does not currently auto-bind computed callbacks, if they are, for example, on a class instance. This should be easy to add. It neither cache results of its computed functions, nor avoid unnecessary computations when the state remains the same. Such optimizations would be a good challenge for further learning. It might also be interesting to add in some kind of decorator/mixin system to add extra functionality, like an event emitter or fancy logging. Finally, a proper react HOC to eastly adapt `Taskulamppu` would be nice.

## `THE DEMO APP`

The demo uses [parcel](https://github.com/parcel-bundler/parcel) to build and the very small but fast [Ultradom](https://github.com/jorgebucaran/ultradom) for the view layer. You should be able to adopt `Taskulamppu` to any view library, from something fancy like React/Preact to something more bare-bones like Snabbdom.
