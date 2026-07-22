import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';
    let details: string | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message || message;
      details = exception.stack;
    } else if (exception instanceof Error) {
      details = exception.stack;
    }

    const payload: any = { message };
    if (process.env.NODE_ENV !== 'production' && details) {
      payload.stack = details;
    }

    response.status(status).json(payload);
  }
}
