import { ObjectType, Field } from '@nestjs/graphql';
import { User } from 'apps/users/src/entities/user.entity';

@ObjectType()
export class Auth {
  @Field()
  access_token: string;

  @Field()
  refresh_token: string;

  @Field()
  message: string;

  @Field(() => User, { nullable: true })
  user: User | null;
}

@ObjectType()
export class ConfirmEmail {
  @Field()
  message: string;
}
