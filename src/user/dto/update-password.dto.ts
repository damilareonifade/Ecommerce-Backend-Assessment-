import { IsString, Matches, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePasswordDto {
  @ApiProperty({
    example: 'Password123!',
    description:
      'The new password of the user (min 8 chars, includes number and special character)',
  })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[0-9])(?=.*[!@#$%^&*])/, {
    message:
      'newPassword must contain at least one number and one special character',
  })
  newPassword!: string;

  @ApiProperty({
    example: 'password123',
    description: 'The old password of the user',
  })
  @IsString()
  oldPassword!: string;
}
