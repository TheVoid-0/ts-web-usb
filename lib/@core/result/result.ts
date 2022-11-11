import { CombinedError } from '../../errors/combined.error';
import { GuardUtil } from '../../utils/guard.util';

export class Result<TValue, TError = Error> {
  private constructor(private readonly value: TValue, private readonly error: TError) {
    //
  }

  getValueOrThrow(): TValue {
    if (!GuardUtil.isNil(this.error)) throw this.error;
    return this.value;
  }

  isFailure(): this is Result<never, TError> {
    return !GuardUtil.isNil(this.error);
  }

  getError(): TError {
    return this.error;
  }

  getValue(): TValue {
    return this.value;
  }

  static create<TValue, TError>(value: TValue, error: TError): Result<TValue, TError> {
    return new Result<TValue, TError>(value, error);
  }

  static ok(): Result<void, never>;
  static ok<TValue>(value: TValue): Result<TValue, never>;
  static ok<TValue>(value?: TValue): Result<TValue | null, null> {
    if (GuardUtil.isNil(value)) {
      return new Result(null, null);
    }

    return new Result(value, null);
  }

  static fail<TError>(err: TError): Result<never, TError> {
    return new Result(null as never, err);
  }

  static merge<TValue, TError>(...results: Result<TValue, TError>[]): Result<TValue[], CombinedError> {
    const values: TValue[] = [];
    const errors: TError[] = [];
    results.forEach(result => {
      if (result.isFailure()) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        errors.push(result.getError()!);
        return;
      }
      values.push(result.getValueOrThrow());
    });

    return errors.length > 0 ? Result.fail(new CombinedError(errors as Error[])) : Result.ok(values);
  }

  static mergeErrors<TError>(...results: Result<never, TError>[]): Result<never, CombinedError> {
    return Result.fail(new CombinedError(results.map(result => result.getError()) as Error[]));
  }

  static isAllOk<TValue, TError>(results: Result<TValue, TError>[]): boolean {
    return results.every(result => !result.isFailure());
  }
}
