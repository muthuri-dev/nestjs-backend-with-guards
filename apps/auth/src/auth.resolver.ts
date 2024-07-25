import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { Auth, ConfirmEmail } from './entities/auth.entity';
import { AuthDto } from './dto/auth.dto';

@Resolver(() => Auth)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => Auth)
  async register(@Args('authDto') authDto: AuthDto): Promise<Auth> {
    return await this.authService.register(authDto);
  }

  @Mutation(() => ConfirmEmail)
  async confirmEmail(
    @Args('token') confirmationToken: string,
  ): Promise<ConfirmEmail> {
    return await this.authService.confirmEmail(confirmationToken);
  }
}
