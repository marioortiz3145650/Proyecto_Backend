import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class InquilinosMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const inquilinoId = req.headers['x-inquilino-id'] as string;
    
    if (inquilinoId) {
      (req as any).inquilinoId = inquilinoId;
    }
    
    next();
  }
}