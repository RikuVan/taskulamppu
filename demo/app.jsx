import { h, render } from 'ultradom/ultradom.m.js'
import { observe, computed } from '../taskulamppu'

const state = { num: 0, otherNums: [1, 2, 3], ignoredNum: 3 }
const schema = { num: 'number', otherNums: ['number'] }

const store = observe(state, schema, true)

const dec = s => s.num--
const inc = s => s.num++
const exclaim = s => (s.num = s.num + '!')
const pushNum = s => s.otherNums.push(100)

const view = s => (
  <div>
    <h1>{s.num}</h1>
    <h1>{s.otherNums.reduce((v, n) => v + n, 0)}</h1>
    <button onclick={() => dec(s)}>-</button>
    <button onclick={() => inc(s)}>+</button>
    <button onclick={() => exclaim(s)}>!</button>
    <button onclick={() => pushNum(s)}>+100</button>
  </div>
)

function app(store) {
  render(view(store), document.body)
}

computed(() => app(store), { log: true })
