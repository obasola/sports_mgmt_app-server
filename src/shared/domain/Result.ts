/**
 * Result Class
 * Generic class to handle success/failure results in a functional way
 */
export class Result<T> {
  public isSuccess: boolean;
  public isFailure: boolean;
  public error: string | null;
  private readonly _value: T | null;

  private constructor(isSuccess: boolean, error: string | null, value: T | null) {
    if (isSuccess && error) {
      throw new Error('InvalidOperation: A result cannot be successful and contain an error');
    }
    if (!isSuccess && !error) {
      throw new Error('InvalidOperation: A failing result needs to contain an error message');
    }

    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this.error = error;
    this._value = value;

    Object.freeze(this);
  }

  /**
   * Returns the value if the result is successful, otherwise throws an error
   */
  public getValue(): T {
    if (!this.isSuccess) {
      throw new Error('Cannot get the value of a failed result');
    }

    return this._value as T;
  }

  /**
   * Creates a success result with the given value
   */
  public static ok<U>(value?: U): Result<U> {
    return new Result<U>(true, null, value !== undefined ? value : null);
  }

  /**
   * Creates a failure result with the given error message
   */
  public static fail<U>(error: string): Result<U> {
    return new Result<U>(false, error, null);
  }

  /**
   * Combines multiple results into one
   */
  public static combine(results: Result<any>[]): Result<any> {
    for (const result of results) {
      if (result.isFailure) {
        return result;
      }
    }
    return Result.ok();
  }
}
