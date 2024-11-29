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
  @IsEnum(ListLogsOrderBy)
  order_by: ListLogsOrderBy;

  @IsEnum(OrderByDirection)
  @IsOptional()
  order_by_direction?: OrderByDirection;
}

export class ListLogsRequestDto {
  @IsString()
  @IsOptional()
  method?: string;

  @IsString()
  @IsOptional()
  ip?: string;

  @IsString()
  @IsOptional()
  url?: string;

  @IsString()
  @IsOptional()
  user_agent?: string;

  @Transform(({ value }) => (value ? +value : value))
  @IsNumber()
  @IsOptional()
  response_status_code?: number;

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
