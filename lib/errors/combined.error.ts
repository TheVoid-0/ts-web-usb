export class CombinedError extends Error {
  constructor(errors: Error[]) {
    super(errors.map(error => error.message).join('; '));

    this.stack = errors.map(error => error.stack).join('');
  }
}
