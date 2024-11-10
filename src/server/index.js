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

  add(key, value) {
    return redis.call('JSON.ARRAPPEND', key, '$', JSON.stringify(value));
  },

  new(key) {
    return redis.call('JSON.SET', key, '$', JSON.stringify([]));
  },

  delete(key, index) {
    return redis.call('JSON.DEL', key, `$[${index}]`);
  },

  async read(key,index,cb) {
    const data = await redis.call('JSON.GET', key, `$[${index}]`);
    Callback(cb, data);
  },

  async readAll(key,cb) {
    const data = await redis.call('JSON.GET', key, `$`);
    Callback(cb, data);
  },

  setKey(key, index, objectKey, value) {
    return redis.call('JSON.SET', key, `$[${index}].^${objectKey}`, value);
  },

  set(key, index, value) {
    return redis.call('JSON.SET', key, `$[${index}]`,
      JSON.stringify(value));
  }
};

const Cache = {

  array: CacheArray,

  add(key, value, expires) {
    if (expires) {
      return redis.set(key, value, 'EX', expires);
    }
    return redis.set(key, value);
  },

  async read(key, cb) {
    const data = await redis.get(key);
    Callback(cb, data);
  }

};
exports('GetInterface', () => {
  return Cache;
});
