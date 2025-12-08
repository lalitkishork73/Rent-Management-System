import { IsIn, IsOptional, IsString } from 'class-validator';

export class LogoutDto {
  @IsOptional()
  @IsIn(['web', 'mobile'])
  clientType?: 'web' | 'mobile';

  @IsOptional()
  @IsString()
  refreshToken?: string;
}
