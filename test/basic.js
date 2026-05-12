const test = require('brittle')
const { replicate, createStore } = require('./helpers')
const CoreCoupler = require('../')

test('basic - wakes up when peer has core', async (t) => {
  t.plan(2)
  const store1 = await createStore(t)
  const store2 = await createStore(t)

  const target = store1.get({ name: 'target' })
  const other = store1.get({ name: 'other' })

  await target.ready()
  await other.ready()

  store2.get(target.key)

  replicate(store1, store2, t)

  const a = new CoreCoupler(target, function (stream, cores) {
    t.is(cores.length, 1, 'woke up with 1 core')
    t.is(other.key, cores[0].key, "a woke up from other's key")
  })
  a.add(other)
})

test('basic - skip wakeup if peer already replicating coupled core', async (t) => {
  t.plan(1)
  const store1 = await createStore(t)
  const store2 = await createStore(t)

  const target = store1.get({ name: 'target' })
  const other = store1.get({ name: 'other' })

  await target.ready()
  await other.ready()

  store2.get(target.key)
  store2.get(other.key)

  replicate(store1, store2, t)

  const coupler = new CoreCoupler(target, function (stream, cores) {
    t.fail('Should never trigger wakeup')
  })
  coupler.add(other)

  await new Promise((resolve) => setTimeout(resolve, 10))
  t.ok(coupler.coupled.has(other), 'has coupled core key')
})

test('basic - update - wakeup refires if no channel on peer', async (t) => {
  t.plan(2)
  const store1 = await createStore(t)
  const store2 = await createStore(t)

  const target = store1.get({ name: 'target' })
  const other = store1.get({ name: 'other' })

  await target.ready()
  await other.ready()

  store2.get(target.key)

  replicate(store1, store2, t)

  const coupler = new CoreCoupler(target, function (stream, cores) {
    t.is(other.key, cores[0].key, "a woke up from other's key")
  })
  coupler.add(other)

  await new Promise((resolve) => setTimeout(resolve, 10))

  const stream = target.peers[0].stream
  await coupler.update(stream)
})
