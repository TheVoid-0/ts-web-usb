export enum PrimitiveSize {
  boolean = 4,
  number = 8,
  null = 4,
}

export class DataUtil {
  private constructor() {
    // private constructor to prevent instantiation
  }

  static sizeof(data: boolean | number | string | null): number {
    if (data == null) {
      return PrimitiveSize.null;
    }
    if (typeof data === 'boolean') {
      return PrimitiveSize.boolean;
    }
    if (typeof data === 'number') {
      return PrimitiveSize.number;
    }
    if (typeof data === 'string') {
      return data.length;
    }
    return 0;
  }

  static isObject(data: unknown): data is object {
    return typeof data === 'object' && data !== null;
  }

  static isRecord(data: unknown): data is Record<string, unknown> {
    return this.isObject(data) && !Array.isArray(data);
  }

  // static isIterable(data: unknown): data is Iterable<unknown> {
  //   // return typeof data[Symbol.iterator] === 'function';
  //   // return this.isObject(data) && Symbol.iterator in data && typeof data[Symbol.iterator] === 'function';
  //   if (data && typeof data === `object`) {
  //     if ('a' in data) {
  //       return data.a === 'function';
  //     }
  //   }
  // }

  // static isArrayBuffer(data: any): data is ArrayBuffer {
  //   return data instanceof ArrayBuffer;
  // }

  // /**
  //  * Estimates rough size of data variable in bytes. OBS: this is not a precise size, but a rough estimate, also it only consider the values, not the keys.
  //  */
  // static dataValueSize(data: unknown): number {
  //   const objectList = new Array<unknown>(0);
  //   const stack = [data];
  //   let bytes = 0;
  //   while (stack.length) {
  //     const value = stack.pop();
  //     if (this.isObject(value) && objectList.indexOf(value) === -1) {
  //       objectList.push(value);
  //       if (this.isArrayBuffer(value)) {
  //         bytes += value.byteLength;
  //         continue;
  //       }

  //       if (this.isIterable(value)) {
  //         for (const v of value) stack.push(v);
  //         continue;
  //       }

  //       Object.keys(value).forEach(k => {
  //         // bytes += k.length * 2; // uncommenting takes into account the keys
  //         stack.push(value[k]);
  //       });

  //       continue;
  //     }

  //     bytes += this.sizeof(value as any);
  //   }
  //   return bytes;
  // }
}
