import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, ILike, Repository } from 'typeorm';

import { Permission } from './entities/permission.entity';
import { CreateRoleDto } from './dtos/create-role.dto';
import { AssignRoleDto } from './dtos/assign-role.dto';
// import { UserProfilesService } from '../user-profile/user-profile.service';
import { Roles } from './entities/role.entity';
import { UserRole } from './entities/user-role.entity';
import { User } from 'src/user/entities/user.entities';
import { RolePermission } from './entities/role-permission.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Roles)
    private readonly roleRepo: Repository<Roles>,

    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(UserRole)
    private readonly userRoleRepo: Repository<UserRole>,

    @InjectRepository(RolePermission)
    private readonly rolePermissionRepo: Repository<RolePermission>,

    // private readonly userProfilesService: UserProfilesService,
  ) {}

  // =========================
  // FIND ROLE BY NAME
  // =========================
  async findRoleByRole(role: string): Promise<Roles> {
    const existingRole = await this.roleRepo.findOne({
      where: { name: ILike(role.trim()) },
    });

    if (!existingRole) {
      throw new NotFoundException('Role Not Found, Please enter valid role.');
    }

    return existingRole;
  }

  // =========================
  // CREATE ROLE
  // =========================
  async createRole(createRoleDto: CreateRoleDto) {
    const { name, permissions } = createRoleDto;

    const existingRole = await this.roleRepo.findOne({
      where: { name },
    });

    if (existingRole) {
      throw new ConflictException(`Role with name ${name} already exists`);
    }

    const permissionEntities = await this.permissionRepo.find({
      where: { id: In(permissions) },
    });

    const role = this.roleRepo.create({
      name,
      permissions: permissionEntities,
    });

    return this.roleRepo.save(role);
  }

  // =========================
  // GET ALL ROLES
  // =========================
  async getAllRoles() {
    return this.roleRepo.find({
      relations: ['permissions'],
    });
  }

  // =========================
  // GET ROLE BY ID
  // =========================
  async getRoleById(id: string) {
    const role = await this.roleRepo.findOne({
      where: { id },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return role;
  }

  // =========================
  // ASSIGN ROLE TO USER
  // =========================
  async assignRoleToUser(assignRoleDto: AssignRoleDto) {
    const { userId, roleId, profileData } = assignRoleDto;

    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.role'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const role = await this.roleRepo.findOne({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    const alreadyHasRole = user.roles.some((ur) => ur.role.id === roleId);

    if (alreadyHasRole) {
      throw new ConflictException(`User already has the role ${role.name}`);
    }

    const userRole = this.userRoleRepo.create({
      user,
      role,
    });

    await this.userRoleRepo.save(userRole);

    // await this.userProfilesService.createUserProfile({
    //   userId,
    //   roleId,
    //   profileData: {
    //     ...profileData,
    //   },
    // });

    return {
      message: `Role ${role.name} assigned to user successfully`,
      userRole,
    };
  }

  // =========================
  // GET ALL PERMISSIONS
  // =========================
  async getAllPermissions() {
    return this.permissionRepo.find();
  }

  // =========================
  // SEED INITIAL ROLES & PERMISSIONS
  // =========================
  async createInitialRolesAndPermissions() {
    const defaultPermissions = [
      'manage_users',
      'manage_roles',
      'manage_organizations',
      'manage_stations',
      'manage_charge_points',
      'view_reports',
      'manage_payments',
      'manage_transactions',
      'book_stations',
      'view_own_data',
    ];

    for (const name of defaultPermissions) {
      const exists = await this.permissionRepo.findOne({
        where: { name },
      });

      if (!exists) {
        await this.permissionRepo.save(this.permissionRepo.create({ name }));
      }
    }

    const allPermissions = await this.permissionRepo.find();

    const defaultRoles = [
      {
        name: 'PlatformAdmin',
        // description: 'Administrator of the entire platform',
        permissions: allPermissions,
      },
      {
        name: 'OrgAdmin',
        // description: 'Administrator of an organization',
        permissions: allPermissions.filter(
          (p) => p.name !== 'manage_organizations',
        ),
      },
      {
        name: 'StationManager',
        // description: 'Manager of a station',
        permissions: allPermissions.filter((p) =>
          [
            'manage_stations',
            'manage_charge_points',
            'view_reports',
            'view_own_data',
          ].includes(p.name),
        ),
      },
      {
        name: 'AppUser',
        // description: 'Regular application user',
        permissions: allPermissions.filter((p) =>
          ['book_stations', 'view_own_data'].includes(p.name),
        ),
      },
    ];

    for (const roleData of defaultRoles) {
      const exists = await this.roleRepo.findOne({
        where: { name: roleData.name },
      });

      if (!exists) {
        const role = this.roleRepo.create(roleData);
        await this.roleRepo.save(role);

        for (const permission of roleData.permissions) {
          const rolePermission = this.rolePermissionRepo.create({
            role,
            permission,
          });
          await this.rolePermissionRepo.save(rolePermission);
        }
      }
    }

    return {
      message: 'Initial roles and permissions created successfully',
    };
  }
}
