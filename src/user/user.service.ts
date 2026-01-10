import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { hashPassword, PasswordUtil } from 'src/utils/password.util';
import { User } from './entities/user.entities';
import { CreateUserDto } from './dto';
import { UserRole } from 'src/roles/entities/user-role.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly passwordUtil: PasswordUtil,
  ) {}

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async findByEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['roles', 'roles.role'],
    });
    return user;
  }

  async createUser(data: CreateUserDto, manager: EntityManager) {
    const existingUser = await manager.findOne(User, {
      where: { email: data.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await hashPassword(data.password);

    const user = manager.create(User, {
      email: data.email,
      firstName: data.first_name,
      password: hashedPassword,
      isActive: data.isActive ?? true,
    });

    if (data.roles?.length) {
      user.roles = data.roles.map((roleId) =>
        manager.create(UserRole, { roleId }),
      );
    }

    return manager.save(User, user);
  }
}
