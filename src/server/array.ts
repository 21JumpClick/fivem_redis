import {Cache} from './index'

export class CacheArray {

  private redis: Cache;

  constructor(redis: Cache) {
    this.redis = redis;
  }

  add(key: string, value: object) {
    return this.redis.call("JSON.ARRAPPEND", key, "$", JSON.stringify(value));
  }

  new(key: string) {
    return this.redis.call("JSON.SET", key, "$", JSON.stringify([]));
  }

  delete(key: string, index: number) {
    return this.redis.call("JSON.DEL", key, `$[${index}]`);
  }

  read(key: string, index: number) {
    return this.redis.call("JSON.GET", key, `$[${index}]`);
  }

  readAll(key: string) {
    return this.redis.call("JSON.GET", key, `$`);
  }

  setKey(key: string, index: number, objectKey: string, value: any) {
    return this.redis.call("JSON.SET", key, `$[${index}].^${objectKey}`, value);
  }

  set(key: string, index: number, value: any) {
    return this.redis.call("JSON.SET", key, `$[${index}]`, JSON.stringify(value));
  }
}
