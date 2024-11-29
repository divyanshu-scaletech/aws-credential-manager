import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { RequestResponseHistory } from 'src/entities/request-history.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  constructor(private readonly dataSource: DataSource) {}

  async use(
    request: Request & { user?: JwtPayload },
    response: Response,
    next: NextFunction,
  ) {
    const { ip, method, originalUrl } = request;
    const userAgent = request.get('user-agent');

    const insertResult = await this.dataSource.manager.insert(
      RequestResponseHistory,
      {
        ip,
        method,
        url: originalUrl,
        user_agent: userAgent,
      },
    );
    const reqResHistoryId = insertResult.identifiers[0].id;
    const start = Date.now();

    response.on('close', () => {
      const time_taken = Date.now() - start;
      const userId = request.user?.id;

      this.dataSource.manager.update(
        RequestResponseHistory,
        {
          id: reqResHistoryId,
        },
        {
          response_status_code: response.statusCode,
          time_taken,
          user: { id: userId },
        },
      );
    });
    next();
  }
}
