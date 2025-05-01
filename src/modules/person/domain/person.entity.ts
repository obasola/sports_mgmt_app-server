import { BaseEntity } from '../../../shared/domain/BaseEntity';
import { Result } from '../../../shared/domain/Result';

interface PersonProps {
  pid?: number;
  userName: string;
  emailAddress: string;
  password: string;
  firstName: string;
  lastName: string;
}

export class Person extends BaseEntity<PersonProps> {
  private constructor(props: PersonProps) {
    super(props);
  }

  /**
   * Factory method to create a new Person entity
   */
  public static create(props: PersonProps): Result<Person> {
    // Validation logic
    if (!props.userName || props.userName.trim().length === 0) {
      return Result.fail<Person>('Username is required');
    }

    if (!props.emailAddress || props.emailAddress.trim().length === 0) {
      return Result.fail<Person>('Email address is required');
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(props.emailAddress)) {
      return Result.fail<Person>('Invalid email address format');
    }

    if (!props.password || props.password.trim().length === 0) {
      return Result.fail<Person>('Password is required');
    }

    if (props.password.length < 8) {
      return Result.fail<Person>('Password must be at least 8 characters long');
    }

    if (!props.firstName || props.firstName.trim().length === 0) {
      return Result.fail<Person>('First name is required');
    }

    if (!props.lastName || props.lastName.trim().length === 0) {
      return Result.fail<Person>('Last name is required');
    }

    // Create the person entity
    return Result.ok<Person>(new Person(props));
  }

  // Getters
  public get pid(): number | undefined {
    return this.props.pid;
  }

  public get userName(): string {
    return this.props.userName;
  }

  public get emailAddress(): string {
    return this.props.emailAddress;
  }

  public get password(): string {
    return this.props.password;
  }

  public get firstName(): string {
    return this.props.firstName;
  }

  public get lastName(): string {
    return this.props.lastName;
  }

  public get fullName(): string {
    return `${this.props.firstName} ${this.props.lastName}`;
  }

  // Update methods
  public updatePersonalInfo(firstName: string, lastName: string): Result<Person> {
    if (!firstName || firstName.trim().length === 0) {
      return Result.fail<Person>('First name is required');
    }

    if (!lastName || lastName.trim().length === 0) {
      return Result.fail<Person>('Last name is required');
    }

    const updatedProps = {
      ...this.props,
      firstName,
      lastName,
    };

    return Result.ok<Person>(new Person(updatedProps));
  }

  public updateUsername(userName: string): Result<Person> {
    if (!userName || userName.trim().length === 0) {
      return Result.fail<Person>('Username is required');
    }

    const updatedProps = {
      ...this.props,
      userName,
    };

    return Result.ok<Person>(new Person(updatedProps));
  }

  public updateEmail(emailAddress: string): Result<Person> {
    if (!emailAddress || emailAddress.trim().length === 0) {
      return Result.fail<Person>('Email address is required');
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailAddress)) {
      return Result.fail<Person>('Invalid email address format');
    }

    const updatedProps = {
      ...this.props,
      emailAddress,
    };

    return Result.ok<Person>(new Person(updatedProps));
  }

  public updatePassword(password: string): Result<Person> {
    if (!password || password.trim().length === 0) {
      return Result.fail<Person>('Password is required');
    }

    if (password.length < 8) {
      return Result.fail<Person>('Password must be at least 8 characters long');
    }

    const updatedProps = {
      ...this.props,
      password,
    };

    return Result.ok<Person>(new Person(updatedProps));
  }

  // Convert to a plain object for persistence
  public toObject(): PersonProps {
    return {
      ...this.props
    };
  }
}
