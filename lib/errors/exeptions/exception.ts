import { BaseError, ErrorOptions } from '../base.error';

export abstract class Exception extends BaseError {
  constructor(errorOptions: ErrorOptions) {
    super(errorOptions);
  }
}
