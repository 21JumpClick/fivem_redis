const { createClient } = require('redis');
const redis_host = GetConvar('redis_host', '127.0.0.1');

const redis = createClient({
  url: `redis://${redis_host}:6379`
});

const CacheArray = {

  add(key, value) {
    return redis.json.arrAppend(key, '$', value);
  },

  new(key) {
    return redis.json.set(key, '$', []);
  },

  delete(key, index) {
    return redis.json.del(key, `$[${index}]`);
  },

  deleteUuid(key, uuid) {
    return redis.json.del(key, `$[?(@.uuid==${uuid})]`);
  },

  async read(key, index) {
    return redis.json.get(key, `$[${index}]`);
  },

  async mReadAll(...keys) {
    const data = await redis.json.MGET(keys, '$') || [];
    if (!data) return;
    const results = data.flat();
    const result = {};
    results.forEach((item, index) => {
      result[keys[index]] = item;
    });
    return result; /// {key1:value1,key2:value2,....}
  },

  async readUuid(key, uuid) {
    return redis.json.get(key, { path: `$[?(@.uuid==${uuid})]` }).then(result => result?.[0] || null);
  },

  async readAll(key) {
    return redis.json.get(key, `$`);
  },

  setKey(key, index, objectKey, value) {
    return redis.json.set(key, `$[${index}].${objectKey}`, value);
  },

  setKeyUuid(key, uuid, objectKey, value) {
    return redis.json.set(key, `$[?(@.uuid==${uuid})].${objectKey}`, value);
  },

  set(key, index, value) {
    return redis.json.set(key, `$[${index}]`, value);
  },

  setUuid(key, uuid, value) {
    return redis.json.set(key, `$[?(@.uuid==${uuid})]`, value);
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
exports('GetInterface', async () => {
  if(!redis.isOpen){
    await redis.connect();
  }
  return Cache;
});