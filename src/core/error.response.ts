import { REASON_PHRASES } from '../constants';
import { StatusCodes } from '../utils/httpStatusCode';

class ErrorResponse extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

class BadRequestError extends ErrorResponse {
  constructor(
    message: string = REASON_PHRASES.BAD_REQUEST,
    statusCode: number = StatusCodes.BAD_REQUEST,
  ) {
    super(message, statusCode);
  }
}

class NotFoundError extends ErrorResponse {
  constructor(
    message: string = REASON_PHRASES.NOT_FOUND,
    statusCode: number = StatusCodes.NOT_FOUND,
  ) {
    super(message, statusCode);
  }
}

class ForbiddenError extends ErrorResponse {
  constructor(
    message: string = REASON_PHRASES.FORBIDDEN,
    statusCode: number = StatusCodes.FORBIDDEN,
  ) {
    super(message, statusCode);
  }
}
class UnAuthorizedError extends ErrorResponse {
  constructor(
    message: string = REASON_PHRASES.UNAUTHORIZED,
    statusCode: number = StatusCodes.UNAUTHORIZED,
  ) {
    super(message, statusCode);
  }
}

export { ForbiddenError, BadRequestError, NotFoundError, ErrorResponse, UnAuthorizedError };
