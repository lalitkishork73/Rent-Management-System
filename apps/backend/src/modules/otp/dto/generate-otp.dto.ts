import { IsString, IsNotEmpty } from 'class-validator';

export class GenerateOtpDto {
  @IsNotEmpty({ message: 'Email should not be empty' })
  @IsString({ message: 'Email must be a string' })
  email: string;
}
