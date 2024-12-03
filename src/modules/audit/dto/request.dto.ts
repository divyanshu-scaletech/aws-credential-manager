import { plainToInstance, Transform } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { UUID } from 'crypto';
import { ListLogsOrderBy, OrderByDirection } from '../../../constants/enums';

class ListLogsOrderByDto {
  /**
   * @example request_arrival_time
   */
  @IsEnum(ListLogsOrderBy)
  order_by: ListLogsOrderBy;

  /**
   * @example ASC
   */
  @IsEnum(OrderByDirection)
  @IsOptional()
  order_by_direction?: OrderByDirection;
}

export class ListLogsRequestDto {
  /**
   * @example GET
   */
  @IsString()
  @IsOptional()
  method?: string;

  /**
   * @example ::1
   */
  @IsString()
  @IsOptional()
  ip?: string;

  /**
   * @example /aws/console/credentials
   */
  @IsString()
  @IsOptional()
  url?: string;

  /**
   * @example Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36
   */
  @IsString()
  @IsOptional()
  user_agent?: string;

  /**
   * @example 200
   */
  @Transform(({ value }) => (value ? +value : value))
  @IsNumber()
  @IsOptional()
  response_status_code?: number;

  /**
   * @example 49da9605-dd42-4c8d-a0d0-78d89116902d
   */
  @IsUUID()
  @IsOptional()
  user_id?: UUID;

  @Transform(({ value }) => {
    if (!value) return value;
    if (!Array.isArray(value))
      return plainToInstance(ListLogsOrderByDto, [
        JSON.parse(decodeURIComponent(value)),
      ]);
    return plainToInstance(
      ListLogsOrderByDto,
      value.map((value: string) => JSON.parse(decodeURIComponent(value))),
    );
  })
  @ArrayUnique((value: ListLogsOrderByDto) => value.order_by)
  @ValidateNested({ each: true })
  @IsArray()
  @IsOptional()
  order_by_details?: ListLogsOrderByDto[];
}
