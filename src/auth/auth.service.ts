import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UpdateAuthDto } from './dto/update-auth.dto';
import * as bcrypt from 'bcrypt';
import { InviteRequest, LoginRequest, RegistrationRequest } from './dto/input';
import { JwtTokenPayload } from './types/jwt.token.payload';
import { Payload } from './types/payload';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Roles } from 'src/roles/entities/role.entity';
import { RolesService } from 'src/roles/roles.service';
import { User } from 'src/user/entities/user.entities';
import { UserService } from 'src/user/user.service';
import { DataSource } from 'typeorm';
import { GenericCustomExceptionClass } from 'src/exception/exception';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly roleService: RolesService,
    private readonly dataSource: DataSource,
  ) {}

  async register(registrationRequest: RegistrationRequest): Promise<User> {
    return this.dataSource.transaction(async (manager) => {
      const { userRoles } = await this.validateCreationAttributes(
        registrationRequest.email,
        registrationRequest.roles,
      );

      const newUser = {
        email: registrationRequest.email,
        first_name: registrationRequest.first_name,
        password: registrationRequest.password,
        roles: userRoles.map((role) => role.id),
        isActive: true,
      };

      const user = await this.userService.createUser(newUser, manager);

      if (!user) {
        throw new InternalServerErrorException(
          'Unable to create account, Try again later.',
        );
      }

      delete (user as any).password;
      return user;
    });
  }

  private async validateCreationAttributes(email: string, roles: string[]) {
    const existingUser: User | null = await this.userService.findByEmail(email);

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const userRoles = await Promise.all(
      roles?.map(async (roleName) => {
        const role = await this.roleService.findRoleByRole(roleName);
        return role;
      }),
    );

    return { userRoles };
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  async validateUser(loginRequest: LoginRequest): Promise<User> {
    const { email, password } = loginRequest;
    const user = await this.userService.findByEmail(email);

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async login(loginRequest: LoginRequest): Promise<JwtTokenPayload> {
    const user = await this.userService.findByEmail(loginRequest.email);

    if (!user) {
      throw new NotFoundException('Invalid credential');
    }

    if (!user.isActive) {
      throw new BadRequestException('You have not been verified');
    }

    const passwordValid = await bcrypt.compare(
      loginRequest.password,
      user.password,
    );

    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate both tokens
    const tokens = await this.generateTokens(user);

    // Create payload for response (this is metadata, not the JWT payload)
    const payload: Payload = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      expiration: Date.now() + 15 * 60 * 1000, // 15 min
    };

    return {
      payload,
      ...tokens,
    };
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  private async generateTokens(user: User) {
    // JWT payload - keep it minimal for security

    const roleName: string = user.roles?.[0]?.role?.name || '';
    const jwtPayload: Record<string, any> = {
      sub: user.id,
      email: user.email,
      role: roleName,
    };

    const refreshSecret: string =
      this.configService.get<string>('JWT_SECRET') || 'default-refresh-secret';

    // Generate tokens in parallel
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(jwtPayload),
      this.jwtService.signAsync(jwtPayload, {
        secret: refreshSecret,
        expiresIn: '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  // public async inviteUser(inviteRequest: InviteRequest): Promise<User> {
  //   const { userRoles: roles } = await this.validateCreationAttributes(
  //     inviteRequest.email,
  //     inviteRequest.roles,
  //   );

  //   const rawPassword = crypto.randomBytes(4).toString('hex');

  //   const newUser = {
  //     email: inviteRequest.email,
  //     fullName: inviteRequest.fullName,
  //     roles: roles.map((role: Role) => role.id),
  //     password: rawPassword,
  //     isActive: false,
  //     organizationId: inviteRequest.organizationId,
  //   };

  //   const sepUser =  this.dataSource.transaction(async (manager) => {

  //   const user: User = await this.userService.createUser(newUser,manager);
  //   delete user.password;

  //   if (!user) {
  //     throw new GenericCustomExceptionClass({
  //       name: ErrorType.UserError,
  //       message: UNABLE_TO_CREATE_USER,
  //     });
  //   }
  // }

  //   //TODO: fix the mf link
  //   const mailOptions = {
  //     to: inviteRequest.email,
  //     subject: `You've been invited to vine charge`,
  //     templateName: 'invite-user',
  //     replacements: {
  //       fullName: inviteRequest.fullName,
  //       email: inviteRequest.email,
  //       password: rawPassword,
  //       loginUrl: 'http://somerandomshii.com',
  //     },
  //   };

  //   // send the mail
  //   await this.mailService.sendMail(mailOptions);

  //   return;
  // }
}
