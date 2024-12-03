import { IsArray, IsInt, IsString } from 'class-validator';

export class CreateIamCredentialsRequestDto {
  @IsArray()
  @IsString({ each: true })
  actions: string[];

  @IsString({ each: true })
  resources: string[];

  @IsInt()
  duration_in_milliseconds: number;
}

export class DeleteIamUserRequestDto {
  @IsString()
  iam_username: string;
}

export class DeleteProgrammaticCredentialsRequestDto {
  @IsString()
  iam_username: string;

  @IsString()
  access_key_id: string;
}
