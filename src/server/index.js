const Redis = require('ioredis');
const redis_host = GetConvar('redis_host', '127.0.0.1');

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

  deleteUuid(key, uuid) {
    return redis.call('JSON.DEL', key, `$[?(@.uuid==${uuid})]`);
  },

  async read(key, index) {
    const data = await redis.call('JSON.GET', key, `$[${index}]`);
    if (!data) return;
    const [ result ] = JSON.parse(data);
    return result;
  },

  async mReadAll(...keys) {
    const data = await redis.call('JSON.MGET', ...keys, `$`);
    if (!data) return;
    const results = JSON.parse(data);
    const result = {};
    results.forEach(([ item ], index) => {
      result[keys[index]] = item;
    });
    return result; /// {key1:value1,key2:value2,....}
  },

  async readUuid(key, uuid) {
    const data = await redis.call('JSON.GET', key, `$[?(@.uuid==${uuid})]`);
    if (!data) return;
    const [ result ] = JSON.parse(data);
    return result;
  },

  async readAll(key) {
    const data = await redis.call('JSON.GET', key, `$`);
    if (!data) return;
    const [ result ] = JSON.parse(data);
    return result;
  },

  setKey(key, index, objectKey, value) {
    return redis.call('JSON.SET', key, `$[${index}].${objectKey}`, value);
  },

  setKeyUuid(key, uuid, objectKey, value) {
    return redis.call('JSON.SET', key, `$[?(@.uuid==${uuid})].${objectKey}`,
      value);
  },

  set(key, index, value) {
    return redis.call('JSON.SET', key, `$[${index}]`,
      JSON.stringify(value));
  },

  setUuid(key, uuid, value) {
    return redis.call('JSON.SET', key, `$[?(@.uuid==${uuid})]`,
      JSON.stringify(value));
  }
};

const Cache = {

  array: CacheArray,

  getPath(...args) {
    return args.join(':');
  },

  add(key, value, expires) {
    if (expires) {
      return redis.set(key, value, 'EX', expires);
    }
    return redis.set(key, value);
  },

  async read(key) {
    return redis.get(key);
  },

  async delete(key) {
    return redis.del(key);
  }

};
exports('GetInterface', () => {
  return Cache;
});
