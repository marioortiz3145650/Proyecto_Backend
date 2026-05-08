import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { RequestConInquilino } from './request-inquilino.interface';

@Injectable()
export class InquilinoInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<RequestConInquilino>();
    const inquilinoId = request.headers['x-inquilino-id'] as string;

    if (inquilinoId) {
      request.inquilinoId = inquilinoId;
    }

    return next.handle();
  }
}