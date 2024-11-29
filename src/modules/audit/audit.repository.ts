import { Injectable } from '@nestjs/common';
import { DataSource, FindOptionsOrder, FindOptionsWhere } from 'typeorm';
import { ListLogsDetails } from './audit.types';
import { RequestResponseHistory } from 'src/entities/request-history.entity';

@Injectable()
export class AuditRepository {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * gets all logs stored in database and filters and orders them according to details provided.
   * @param details
   */
  async getLogs(details: ListLogsDetails): Promise<RequestResponseHistory[]> {
    const {
      ip,
      method,
      response_status_code,
      url,
      user_agent,
      user_id,
      order_by_details,
    } = details;

    const whereOptions: FindOptionsWhere<RequestResponseHistory> = {};
    if (ip != null) whereOptions.ip = ip;
    if (method != null) whereOptions.method = method;
    if (response_status_code != null)
      whereOptions.response_status_code = response_status_code;
    if (url != null) whereOptions.url = url;
    if (user_agent != null) whereOptions.user_agent = user_agent;
    if (user_id != null) whereOptions.user = { id: user_id };

    const orderOptions: FindOptionsOrder<RequestResponseHistory> =
      order_by_details
        ? order_by_details.reduce((prevObj, curObj) => {
            return {
              ...prevObj,
              [curObj.order_by]: curObj.order_by_direction ?? 'ASC',
            };
          }, {})
        : {};

    return await this.dataSource.manager.find(RequestResponseHistory, {
      where: whereOptions,
      order: orderOptions,
      relations: {
        user: true,
      },
      select: {
        user: { id: true },
      },
    });
  }
}
