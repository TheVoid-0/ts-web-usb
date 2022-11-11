/* eslint-disable @typescript-eslint/no-explicit-any */

// I don't know a better way to refer to a Class constructor, it would be optimal to be able to keep the constructor argument types
export type Class<T> = new (...args: any[]) => T;

export type ClassConstructor<T extends abstract new (...args: any[]) => any> = T extends abstract new (...args: infer P) => any
  ? new (...args: P) => InstanceType<T>
  : never;

export type Nil = undefined | null;
