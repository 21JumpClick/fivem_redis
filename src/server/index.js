const Redis = require('ioredis');
const redis_host = GetConvar('redis_host', '127.0.0.1');

function Callback(cb, ...args) {
  if (typeof cb === 'function') return setImmediate(() => cb(...args));
  else return false;
}

const redis = new Redis({
  port: 6379,
  host: redis_host,
  family: 4,
  db: 0
});

const CacheArray = {

  redis,

  constructor(redis) {
    this.redis = redis;
  },

  add(key, value) {
    return this.redis.call('JSON.ARRAPPEND', key, '$', JSON.stringify(value));
  },

  new(key) {
    return this.redis.call('JSON.SET', key, '$', JSON.stringify([]));
  },

  delete(key, index) {
    return this.redis.call('JSON.DEL', key, `$[${index}]`);
  },

  read(key, index) {
    return this.redis.call('JSON.GET', key, `$[${index}]`);
  },

  readAll(key) {
    return this.redis.call('JSON.GET', key, `$`);
  },

  setKey(key, index, objectKey, value) {
    return this.redis.call('JSON.SET', key, `$[${index}].^${objectKey}`, value);
  },

  set(key, index, value) {
    return this.redis.call('JSON.SET', key, `$[${index}]`,
      JSON.stringify(value));
  }
};

const Cache = {
  redis,

  array: CacheArray,

  add(key, value, expires) {
    if (expires) {
      return this.redis.set(key, value, 'EX', expires);
    }
    return this.redis.set(key, value);
  },

  async read(key, cb) {
    const data = await this.get(key);
    Callback(cb, data);
  }

};
exports('GetInterface', () => {
  return Cache;
});
