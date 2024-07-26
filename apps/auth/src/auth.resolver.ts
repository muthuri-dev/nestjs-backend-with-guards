import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { Auth, ConfirmEmail, LogOut } from './entities/auth.entity';
import { AuthDto, LoginDto } from './dto/auth.dto';

@Resolver(() => Auth)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => Auth)
  async register(@Args('authInput') authDto: AuthDto): Promise<Partial<Auth>> {
    return await this.authService.register(authDto);
  }

  @Mutation(() => ConfirmEmail)
  async confirmEmail(
    @Args('token') confirmationToken: string,
  ): Promise<ConfirmEmail> {
    return await this.authService.confirmEmail(confirmationToken);
  }

  @Mutation(() => Auth)
  async login(@Args('authInput') loginDto: LoginDto): Promise<Auth> {
    return await this.authService.login(loginDto);
  }

  @Mutation(() => LogOut)
  async logout(@Args('user_id') user_id: string): Promise<LogOut> {
    return await this.authService.logout(user_id);
  }
}
