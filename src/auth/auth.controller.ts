import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { LoginRequest, RegistrationRequest } from './dto/input';
import { GenericApiResponse } from 'src/utils';
import { INTERNAL_SERVER_ERROR } from 'src/exception/error.message';
import { GenericCustomExceptionClass } from 'src/exception/exception';
import { User } from 'src/user/entities/user.entities';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() registrationRequest: RegistrationRequest,
  ): Promise<GenericApiResponse<User | string>> {
    try {
      const result = await this.authService.register(registrationRequest);
      return GenericApiResponse.returnCreated<User>(result);
    } catch (error: any) {
      if (error instanceof GenericCustomExceptionClass) {
        return GenericApiResponse.returnBadRequest<string>(error.message);
      } else {
        return GenericApiResponse.returnInternalServerErrorResponse<string>(
          INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Body() loginRequest: LoginRequest) {
    return this.authService.login(loginRequest);
  }

  @Get()
  findAll() {
    return this.authService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(+id, updateAuthDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }
}
