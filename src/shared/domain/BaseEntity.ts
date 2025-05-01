/**
 * Base Entity Abstract Class
 * Implements common methods and properties for all domain entities
 */
export abstract class BaseEntity<T> {
  protected readonly props: T;

  protected constructor(props: T) {
    this.props = props;
  }

  public equals(entity?: BaseEntity<T>): boolean {
    if (entity === null || entity === undefined) {
      return false;
    }

    if (this === entity) {
      return true;
    }

    return JSON.stringify(this.props) === JSON.stringify(entity.props);
  }
}
