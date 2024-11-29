import { IntersectionType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { RequestResponseHistory } from 'src/entities/request-history.entity';
import { User } from 'src/entities/user.entity';

class ListLogsOverride {
  user: {
    id: Pick<User, 'id'>;
  };

  @Transform(({ value }) => (value ? +value : value))
  time_taken: number;
}

export class ListLogsResponseDto extends IntersectionType(
  RequestResponseHistory,
  ListLogsOverride,
) {}
