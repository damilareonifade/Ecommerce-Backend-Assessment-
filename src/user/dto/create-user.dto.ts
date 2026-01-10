import {
  IsArray,
  IsBoolean,
  // IsDecimal,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
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
  phoneNumber?: string;

  @ApiPropertyOptional({
    example: 'c56a4180-65aa-42ec-a945-5fd21dec0538',
    description: 'The ID of the organization the user belongs to',
  })
  @IsUUID()
  @IsOptional()
  organizationId?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Is the user active?',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    example: ['role-id-1', 'role-id-2'],
    description: 'Role IDs to assign to the user',
    isArray: true,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  roles?: string[];
}
