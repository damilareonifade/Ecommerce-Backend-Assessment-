import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class AssignRoleDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  roleId: string;

  @IsString()
  @IsOptional()
  organizationId?: string;

  @IsObject()
  @IsOptional()
  profileData?: Record<string, any>;
}
