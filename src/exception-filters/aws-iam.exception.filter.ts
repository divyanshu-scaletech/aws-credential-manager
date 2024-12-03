import { IAMServiceException } from '@aws-sdk/client-iam';
import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';

@Catch(IAMServiceException)
export class AwsIamExceptionFilter implements ExceptionFilter {
  catch(exception: IAMServiceException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.json({
      is_error: true,
      message: exception.message,
    });
  }
}
