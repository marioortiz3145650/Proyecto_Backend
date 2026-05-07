import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const InquilinoId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.inquilinoId;
  },
);