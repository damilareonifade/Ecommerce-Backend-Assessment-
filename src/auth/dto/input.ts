import {
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginRequest {
  @ApiProperty({
    example: 'user@example.com',
    description: 'The email of the user',
  })
  @IsString()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'The password of the user',
  })
  @IsString()
  password: string;
}

export class RegistrationRequest {
  @ApiProperty({
    example: 'user@example.com',
    description: 'The email of the user',
  })
  @IsString()
  email!: string;

  @ApiProperty({
    example: 'password123',
    description: 'The password of the user',
  })
  @IsString()
  password!: string;

  @ApiProperty({
    example: 'John',
    description: 'The first name of the user',
  })
  @IsString()
  first_name!: string;

  @ApiProperty({
    example: 'Femilade',
    description: 'The last name of the user',
  })
  @IsString()
  last_name!: string;
  // @ApiProperty({
  //   example: 'Doe',
  //   description: 'The last name of the user',
  // })
  // @IsString()
  // lastName!: string;

  @ApiPropertyOptional({
    example: '+1234567890',
    description: 'The phone number of the user',
  })
  @IsString()
  @IsOptional()
  phone_number?: string;

  @ApiPropertyOptional({
    example: ['ADMIN', 'USER'],
    description: 'Roles assigned to the user',
    isArray: true,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  roles: string[];
}

export class InviteRequest {
  @ApiProperty({
    example: 'user@example.com',
    description: 'The email of the user',
  })
  @IsString()
  email!: string;

  @ApiProperty({
    example: 'John',
    description: 'The first name of the user',
  })
  @IsString()
  fullName!: string;

  // @ApiProperty({
  //   example: 'Doe',
  //   description: 'The last name of the user',
  // })
  // @IsString()
  // lastName!: string;

  @ApiPropertyOptional({
    example: ['ADMIN', 'USER'],
    description: 'Roles assigned to the user',
    isArray: true,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  roles: string[];

  @ApiPropertyOptional({
    example: 'c56a4180-65aa-42ec-a945-5fd21dec0538',
    description: 'The ID of the organization the user belongs to',
  })
  @IsUUID()
  @IsOptional()
  organizationId: string;
}

export class SendOtpDto {
  @ApiProperty({
    example: 'example@email.com',
    description: 'The email of the user',
  })
  @IsEmail()
  email!: string;
}

export class VerifyOtpDto {
  @ApiProperty({
    example: 'example@email.com',
    description: 'The email of the user',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: '1234',
    description: 'The OTP code sent to the user',
  })
  @IsString()
  @Length(4, 4)
  otp!: string;
}

export class RefreshTokenDto {
  refreshToken: string;
}
