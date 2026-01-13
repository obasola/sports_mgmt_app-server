export class AccessControlError extends Error {
  public readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

export class NotAuthenticatedError extends AccessControlError {
  constructor() {
    super("NOT_AUTHENTICATED", "User is not authenticated.");
  }
}

export class NotFoundError extends AccessControlError {
  constructor(message: string) {
    super("NOT_FOUND", message);
  }
}

export class ForbiddenError extends AccessControlError {
  constructor(message: string) {
    super("FORBIDDEN", message);
  }
}

export class ValidationError extends AccessControlError {
  constructor(message: string) {
    super("VALIDATION_ERROR", message);
  }
}
