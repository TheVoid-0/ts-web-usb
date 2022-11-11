import { CombinedError } from '../../lib/errors/combined.error';
describe('CombinedError', () => {
  it('should create a CombinedError', () => {
    const errors = [new Error('error 1'), new Error('error 2'), new Error('error 3')];

    const combinedError = new CombinedError(errors);

    expect(combinedError.message).toEqual('error 1; error 2; error 3');
    expect(combinedError.stack).toEqual(errors.map(error => error.stack).join(''));
  });
});
