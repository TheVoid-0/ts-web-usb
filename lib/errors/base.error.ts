export type ErrorOptions = Record<string, unknown> | Array<Record<string, unknown>> | string | Error | unknown;
export class BaseError extends Error {
  /**
   * Contém os dados originais pasados para o BaseError na sua criação
   */
  protected data: unknown;

  constructor(errorOptions: ErrorOptions) {
    if (typeof errorOptions === 'string') {
      super(errorOptions);
      this.data = errorOptions;
      return this;
    }

    if (errorOptions instanceof Error) {
      super(errorOptions.message);
      this.data = errorOptions;
      this.stack = errorOptions.stack;
      return this;
    }

    super(JSON.stringify(errorOptions, null, 2));
    this.data = errorOptions;
  }

  getName(): string {
    return this.constructor.name;
  }

  getInformation(): unknown {
    return this.data;
  }
}
