export class GuardUtil {
  private constructor() {
    //
  }

  static isNil(value: unknown): value is undefined | null {
    return value === null || value === undefined;
  }

  static isArray(value: unknown): value is Array<unknown> {
    return Array.isArray(value);
  }
}
