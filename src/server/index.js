const Redis = require('ioredis');
const { CacheArray } = require('./array');

const redis_host = GetConvar("redis_host", "127.0.0.1");

function Callback(cb, ...args) {
  if (typeof cb === 'function') return setImmediate(() => cb(...args));
  else return false;
}

class Cache extends Redis {
  array

  constructor() {
    super({
      port: 6379,
      host: redis_host,
      family: 4,
      db: 0,
    })
    this.array = new CacheArray(this)
  }

  add(key, value, expires) {
    if (expires) {
      return this.set(key, value, 'EX', expires);
    }
    return this.set(key, value);
  }

  async read(key, cb) {
    const data = await this.get(key);
    Callback(cb, data);
  }

}

module.exports = {
  Cache,
  Callback
};

exports('GetInterface', () => {
  return new Cache();
});
