import { UserRepository } from '@app/shared';
import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'apps/users/src/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { AuthDto } from './dto/auth.dto';
import { Auth, ConfirmEmail } from './entities/auth.entity';
import { ConfigService } from '@nestjs/config';
import { EmailsService } from './emails/emails.service';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private emailService: EmailsService,
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
    const confirmationToken = await this.jwtService.sign(user.email, {
      secret: this.configService.get<string>('SECRET_EMAIL_TOKEN'),
    });

    //updating user
    const updateUser = {
      ...user,
      refresh_token,
      email_confirmation_token: confirmationToken,
    };
    await this.usersRepository.update(user.id, updateUser);

    //send confirmation email to the user via email

    await this.emailService.sendConfirmationEmail(
      user.email,
      confirmationToken,
    );

    return {
      access_token,
      refresh_token,
      message:
        'Registration successful. Please check your email to confirm your account',
      user,
    };
  }

  //confirming email service
  async confirmEmail(confirmationToken: string): Promise<ConfirmEmail> {
    const user = await this.usersRepository.firstFirst(confirmationToken);

    if (!user) throw new ForbiddenException('Invalid token');

    //updating user
    const updateUser = {
      ...user,
      is_email_confirmed: true,
      email_confirmation_token: null,
    };

    await this.usersRepository.update(user.id, updateUser);

    return { message: 'Email confirmed successfully. You can now log in' };
  }
}
