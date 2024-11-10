import Redis from "ioredis";
import {CacheArray} from "./array";

const redis_host = GetConvar("redis_host", "127.0.0.1");

export function Callback(cb:any, ...args:any) {
  if (typeof cb === 'function') return setImmediate(() => cb(...args));
  else return false;
}

export class Cache extends Redis {
  array: CacheArray

  constructor() {
    super({
      port: 6379,
      host: redis_host,
      family: 4,
      db: 0,
    })
    this.array = new CacheArray(this)
  }

  add(key: string, value: string | number, expires?: number | string) {
    if (expires) {
      return this.set(key, value, 'EX', expires);
    }
    return this.set(key, value);
  }

  async read(key: string, cb:any) {
    const data = await this.get(key);
    Callback(cb, data);
  }

}

exports('GetInterface', () => {
  return new Cache();
});
