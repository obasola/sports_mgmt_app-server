export class NotAuthenticatedError extends Error {
  public readonly code = "NOT_AUTHENTICATED";
  constructor(message = "Authentication required.") {
    super(message);
  }
}

export class ForbiddenError extends Error {
  public readonly code = "FORBIDDEN";
  constructor(message = "Forbidden.") {
    super(message);
  }
}

export class NotFoundError extends Error {
  public readonly code = "NOT_FOUND";
  constructor(message = "Not found.") {
    super(message);
  }
}

export class ValidationError extends Error {
  public readonly code = "VALIDATION_ERROR";
  constructor(message = "Validation error.") {
    super(message);
  }
}
