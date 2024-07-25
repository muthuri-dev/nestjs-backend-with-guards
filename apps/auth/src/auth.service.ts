import { UserRepository } from '@app/shared';
import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'apps/users/src/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { AuthDto } from './dto/auth.dto';
import { Auth } from './entities/auth.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  //register, login, confirmEmail, logout -> verifyUser, generateTokens, updateToken,

  //validate user
  async verifyUser(id: string): Promise<User> {
    return await this.usersRepository.findUnique({ id });
  }

  //generate access_token
  async generateAccessToken(user: User): Promise<string> {
    const payload = {
      username: user.username,
      user_id: user.id,
      email: user.email,
    };

    const access_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
      expiresIn: '20m',
    });
    return access_token;
  }

  //generate refresh_token
  async generateRefreshToken(
    access_token: string,
    user: User,
  ): Promise<string> {
    const payload = {
      username: user.username,
      user_id: user.id,
      email: user.email,
      access_token,
    };

    const refresh_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      expiresIn: '7d',
    });
    return refresh_token;
  }

  //  register user
  async register(authDto: AuthDto): Promise<Auth> {
    //check if user already exists
    const isEmail = await this.usersRepository.findUnique({
      email: authDto.email,
    });

    if (isEmail)
      throw new ConflictException('User with email already exists. Login');

    //hashing password
    const hashedPassword = await bcrypt.hash(authDto.password, 10);

    const createUserDto = { ...authDto, password: hashedPassword };

    //saving user
    const user = await this.usersRepository.create(createUserDto);

    //getting tokens
    const access_token = await this.generateAccessToken(user);
    const refresh_token = await this.generateRefreshToken(access_token, user);

    //updating user
    const updateUser = { ...user, refresh_token };
    await this.usersRepository.update(user.id, updateUser);

    return { access_token, refresh_token, user };
  }
}
