import { Injectable } from '@nestjs/common';
import { AuditRepository } from './audit.repository';
import { ListLogsDetails } from './audit.types';
import { RequestResponseHistory } from '../../entities/request-history.entity';

@Injectable()
export class AuditService {
  constructor(private readonly auditRepository: AuditRepository) {}

  /**
   * passes the details to `AuditRepository` and return all the data.
   * @param listLogsDetails
   */
  async listLogs(
    listLogsDetails: ListLogsDetails,
  ): Promise<RequestResponseHistory[]> {
    return await this.auditRepository.getLogs(listLogsDetails);
  }
}
