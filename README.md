# core-coupler

Couple the peers of cores. Useful for coordinating cores which are loosely connected.

```
npm install core-coupler
```

## Usage

``` js
const CoreCoupler = require('core-coupler')

const store = new Corestore('./store')

const target = store.get({ name: 'target' })
const other = store.get({ name: 'other' })

const a = new CoreCoupler(target, function (stream, cores) {
  console.log('a: should wakeup', cores.length)
})
a.add(other)
```

## API

#### `const coupler = new CoreCoupler(target, wakeup)`

Create a core coupler that watches a `target` Hypercore's peers and calls the `wakeup` function whenever a peer without a coupled core is detected. If the peer is already replicating the core, it will be skipped.

`wakeup` has the signature, `(stream, cores) => {}` receiving a peer's stream (with a [`Protomux`](https://github.com/holepunchto/protomux) attached) and the current cores that are being woken up.

#### `coupler.coupled`

A Set of cores coupled to `target`.

#### `coupler.add(core)`

Couple `core` to the `target` core. This method is idempotent, i.e. it will not trigger the `wakeup` function if readding a `core`.

#### `coupler.remove(core)`

Remove coupling of `core` to the `target` core.

#### `coupler.destroy()`

Destroy the coupler removing the `peer-add` event from the `target` core.

#### `await coupler.update(stream)`

Update a peer via it's `stream` ensuring all coupled cores will call `wakeup` if unavailable from the peer.

## License

Apache-2.0
