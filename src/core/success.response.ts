import { Response } from 'express';
import { StatusCodes } from '../utils/httpStatusCode';
import { REASON_PHRASES } from '../constants';

interface SuccessResponseOptions {
  message: string;
  statusCode?: number;
  reasonStatusCode?: string;
  metadata: object | void | boolean;
}

class SuccessResponse {
  message: string;
  statusCode: number;
  metadata: object | void | boolean;

  constructor({
    message,
    statusCode = StatusCodes.OK,
    reasonStatusCode = REASON_PHRASES.OK,
    metadata = {},
  }: SuccessResponseOptions) {
    this.message = !message ? reasonStatusCode : message;
    this.statusCode = statusCode;
    this.metadata = metadata;
  }

  send(res: Response) {
    return res.status(this.statusCode).json(this);
  }
}

class OK extends SuccessResponse {
  constructor({ message, metadata }: { message?: string; metadata?: object }) {
    super({ message, metadata, statusCode: StatusCodes.OK, reasonStatusCode: REASON_PHRASES.OK });
  }
}

class CREATED extends SuccessResponse {
  constructor({
    message,
    statusCode = StatusCodes.CREATED,
    reasonStatusCode = REASON_PHRASES.CREATED,
    metadata,
  }: SuccessResponseOptions) {
    super({ message, statusCode, reasonStatusCode, metadata });
  }
}

export { SuccessResponse, OK, CREATED };
