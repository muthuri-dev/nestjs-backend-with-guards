import { UserRepository } from '@app/shared';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotAcceptableException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'apps/users/src/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { AuthDto, LoginDto } from './dto/auth.dto';
import { Auth, ConfirmEmail, LogOut } from './entities/auth.entity';
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
  async register(authDto: AuthDto): Promise<Partial<Auth>> {
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

    const confirmationToken = await this.jwtService.sign(user.email, {
      secret: this.configService.get<string>('SECRET_EMAIL_TOKEN'),
    });

    //updating user
    const updateUser = {
      ...user,
      email_confirmation_token: confirmationToken,
    };
    await this.usersRepository.update(user.id, updateUser);

    //send confirmation email to the user via email

    await this.emailService.sendConfirmationEmail(
      user.email,
      confirmationToken,
    );

    return {
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

  //login in user service
  async login(loginDto: LoginDto): Promise<Auth> {
    //check if user is registered if email is confirmed
    const user = await this.usersRepository.findUnique({
      email: loginDto.email,
    });

    if (!user) throw new NotAcceptableException('Register first to login');

    if (!user.is_email_confirmed)
      throw new NotAcceptableException('Confirm email to login');

    //comparing pass
    const isPassMatch = await bcrypt.compare(loginDto.password, user.password);
    if (!isPassMatch) throw new NotAcceptableException('Wrong password');

    //getting tokens
    const access_token = await this.generateAccessToken(user);
    const refresh_token = await this.generateRefreshToken(access_token, user);

    return { access_token, refresh_token, user, message: 'Login successful' };
  }

  //logout user service
  async logout(user_id: string): Promise<LogOut> {
    //check user
    const user = await this.usersRepository.findUnique({ id: user_id });

    if (!user) throw new BadRequestException('User does not exist');

    //setting refresh_token to null
    const updateUser = { ...user, refresh_token: null };
    await this.usersRepository.update(user.id, updateUser);

    return { message: 'Logged out successfully' };
  }
}
