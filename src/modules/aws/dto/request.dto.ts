import { IsArray, IsInt, IsString } from 'class-validator';

export class CreateIamCredentialsRequestDto {
  /**
   * @example ["ec2:CreateInstances"]
   */
  @IsArray()
  @IsString({ each: true })
  actions: string[];

  /**
   * @example ["*"]
   */
  @IsString({ each: true })
  resources: string[];

  /**
   * @example 20000
   */
  @IsInt()
  duration_in_milliseconds: number;
}

export class DeleteIamUserRequestDto {
  /**
   * @example steve1234-1733228731425
   */
  @IsString()
  iam_username: string;
}

export class DeleteProgrammaticCredentialsRequestDto {
  /**
   * @example steve1234-1733228731425
   */
  @IsString()
  iam_username: string;

  /**
   * @example AKIA5FTZFMYWNNWZS5V4
   */
  @IsString()
  access_key_id: string;
}
