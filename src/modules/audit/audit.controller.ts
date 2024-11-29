import { Controller, Get, Query } from '@nestjs/common';
import { ListLogsRequestDto } from './dto/request.dto';
import { CustomResponse } from 'src/types';
import { AuditService } from './audit.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { PermissionsNeeded } from 'src/decorators/permissions-needed.decorator';
import { Permissions } from 'src/constants/enums';
import { plainToInstance } from 'class-transformer';
import { ListLogsResponseDto } from './dto/response.dto';

@PermissionsNeeded(Permissions.AuditLogsAll)
@ApiBearerAuth()
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  /**
   * handles request to list logs with help of `AuditService`.
   * @param listLogsPayload
   */
  @PermissionsNeeded()
  @Get('logs')
  async listLogs(
    @Query() listLogsPayload: ListLogsRequestDto,
  ): Promise<CustomResponse<ListLogsResponseDto[]>> {
    const logs = await this.auditService.listLogs(listLogsPayload);

    return {
      data: plainToInstance(ListLogsResponseDto, logs),
    };
  }
}
