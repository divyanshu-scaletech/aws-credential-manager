import { UUID } from 'crypto';
import { ListLogsOrderBy, OrderByDirection } from 'src/constants/enums';

type OrderByDetails = {
  order_by: ListLogsOrderBy;
  order_by_direction?: OrderByDirection;
};

export type ListLogsDetails = {
  method?: string;
  ip?: string;
  url?: string;
  user_agent?: string;
  response_status_code?: number;
  user_id?: UUID;
  order_by_details?: OrderByDetails[];
};
