const taskulamppu = require('./build/taskulamppu.map.js')
const { observe, computed } = taskulamppu

test('simple computation', () => {
  const obj = observe({
    a: 1,
    b: 2
  })

  let result = 0

  const sum = computed(
    () => {
      result = obj.a + obj.b
    },
    { autorun: false }
  )
  sum()

  expect(result).toBe(3)
  obj.a = 2
  setTimeout(() => expect(result).toBe(4), 0)
  obj.b = 3
  setTimeout(() => expect(result).toBe(5), 0)
})

test('auto-run computed function', () => {
  const obj = observe({
    a: 1,
    b: 2
  })

  let result = 0

  computed(() => {
    result = obj.a + obj.b
  })

  expect(result).toBe(3)
})

test('multiple getters', () => {
  const obj = observe(
    {
      a: 1,
      b: 2,
      sum: 0
    },
    { props: ['a', 'b'] }
  )

  computed(
    () => {
      obj.sum += obj.a
      obj.sum += obj.b
      obj.sum += obj.a + obj.b
    },
    { autoRun: true }
  )

  // 1 + 2 + 3
  expect(obj.sum).toBe(6)

  obj.a = 2

  // 6 + 2 + 2 + 4
  setTimeout(() => expect(obj.sum).toBe(14), 0)
})

test('nested functions', () => {
  const obj = observe({
    a: 1,
    b: 2,
    c: 3,
    d: 4
  })

  let result

  const aPlusB = () => obj.a + obj.b
  const cPlusD = () => obj.c + obj.d

  computed(() => {
    result = aPlusB() + cPlusD()
  })

  expect(result).toBe(10)
  obj.a = 2
  setTimeout(() => expect(result).toBe(11), 0)
  obj.d = 5
  setTimeout(() => expect(result).toBe(12), 0)
})

test('ignore underscored properties', () => {
  const obj = observe({
    _b: 2
  })

  let result

  const incB = () => obj._b++

  computed(() => {
    result = obj._b + obj._b
  })

  expect(result).toBe(4)
  obj._b = 4
  setTimeout(() => expect(result).toBe(4), 0)
})

// VALIDATION TESTS

test('throw error if schema is violated', () => {
  const obj = observe(
    {
      b: 2
    },
    { b: 'number' }
  )

  const run = computed(() => {
    obj.b
  })

  try {
    obj.b = '3'
  } catch (e) {
    expect(e.message).toBe(
      'The value you are assigning to "b" is of the wrong type. Given: "string". Expected: "number"'
    )
  }
})

test('throw error if array contains incorrect type', () => {
  const obj = observe(
    {
      b: [2]
    },
    { b: ['number'] }
  )

  const run = computed(() => {
    obj.b
  })

  try {
    obj.b.push('3')
  } catch (e) {
    expect(e.message).toBe(
      'The value you are assigning to "[1]" is of the wrong type. Given: "string". Expected: "number"'
    )
  }
})

test('throw error if object with nested types is replaced', () => {
  const obj = observe(
    {
      a: {
        b: 'hi'
      }
    },
    { a: { b: 'string' } }
  )

  const run = computed(() => obj)

  try {
    obj.a = []
  } catch (e) {
    expect(e.message).toBe(
      'The value you are assigning to "a" is of the wrong type. Given: "array". Expected: "object"'
    )
  }
})

test('throw error if nested types is violated', () => {
  const obj = observe(
    {
      a: {
        b: 'hi'
      }
    },
    { a: { b: 'string' } }
  )

  const run = computed(() => obj)

  try {
    obj.a.b = true
  } catch (e) {
    expect(e.message).toBe(
      'The value you are assigning to "b" is of the wrong type. Given: "boolean". Expected: "string"'
    )
  }
})
