import { IsArray, IsInt, IsString } from 'class-validator';

export class CreateIamCredentialsRequestDto {
  @IsArray()
  @IsString({ each: true })
  actions: string[];

  @IsString({ each: true })
  resources: string[] | string;

  @IsInt()
  duration_in_milliseconds: number;
}
