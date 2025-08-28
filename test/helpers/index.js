const safetyCatch = require('safety-catch')
const Corestore = require('corestore')

exports.createStore = async function (t, opts = {}) {
  const store = new Corestore(await t.tmp(), opts)
  t.teardown(() => store.close(), { order: 2 })
  return store
}

// const createCore = async function (t, opts = {}) {
//   const store = opts.store || await createStore(t, opts)

//   const core = store.get(opts)
//   await core.ready()

//   return core
// }

exports.replicate = function replicate (a, b, t, opts = {}) {
  const s1 = a.replicate(true, { keepAlive: false, ...opts })
  const s2 = b.replicate(false, { keepAlive: false, ...opts })

  const closed1 = new Promise(resolve => s1.once('close', resolve))
  const closed2 = new Promise(resolve => s2.once('close', resolve))

  s1.on('error', err => {
    safetyCatch(err)
    t.comment(`replication stream error (initiator): ${err}`)
  })
  s2.on('error', err => {
    safetyCatch(err)
    t.comment(`replication stream error (responder): ${err}`)
  })

  if (opts.teardown !== false) {
    t.teardown(async function () {
      s1.destroy()
      s2.destroy()
      await closed1
      await closed2
    })
  }

  s1.pipe(s2).pipe(s1)

  return [s1, s2]
}
