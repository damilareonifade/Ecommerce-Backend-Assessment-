import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dtos/create-role.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { AssignRoleDto } from './dtos/assign-role.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('roles')
@UseGuards(JwtAuthGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get('/create-initial')
  async createInitialRoles() {
    console.log('Is it gettinng here');

    return this.rolesService.createInitialRolesAndPermissions();
  }

  @Post('/create-roles')
  @UseGuards(RolesGuard)
  async createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.createRole(createRoleDto);
  }

  @Get('get-all-roles')
  async getAllRoles() {
    return this.rolesService.getAllRoles();
  }

  @Post('assign-role')
  @UseGuards(RolesGuard)
  @Roles('PlatformAdmin', 'OrgAdmin')
  async assignRoleToUser(@Body() assignRoleDto: AssignRoleDto) {
    return this.rolesService.assignRoleToUser(assignRoleDto);
  }

  @Get('permission')
  async getAllPermission() {
    return this.rolesService.getAllPermissions();
  }

  @Get(':id')
  async getRoleById(@Param('id') id: string) {
    return this.rolesService.getRoleById(id);
  }
}
