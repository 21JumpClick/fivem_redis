class CacheArray {

  redis;

  constructor(redis) {
    this.redis = redis;
  }

  add(key, value) {
    return this.redis.call('JSON.ARRAPPEND', key, '$', JSON.stringify(value));
  }

  new(key) {
    return this.redis.call('JSON.SET', key, '$', JSON.stringify([]));
  }

  delete(key, index) {
    return this.redis.call('JSON.DEL', key, `$[${index}]`);
  }

  read(key, index) {
    return this.redis.call('JSON.GET', key, `$[${index}]`);
  }

  readAll(key) {
    return this.redis.call('JSON.GET', key, `$`);
  }

  setKey(key, index, objectKey, value) {
    return this.redis.call('JSON.SET', key, `$[${index}].^${objectKey}`, value);
  }

  set(key, index, value) {
    return this.redis.call('JSON.SET', key, `$[${index}]`,
      JSON.stringify(value));
  }
}

module.exports= { CacheArray };