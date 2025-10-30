import { IsNotEmpty,IsEmail,IsString,MinLength } from "class-validator";



export class OtpVerifyDto {
    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail({}, { message: 'Invalid email address' })
    email: string;


    @IsNotEmpty({ message: 'OTP is required' })
    @IsString({ message: 'OTP must be a string' })
    @MinLength(6, { message: 'OTP must be at least 6 characters long' })
    otp: string;
}