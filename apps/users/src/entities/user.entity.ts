import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Role } from '@prisma/client';
registerEnumType(Role, { name: 'Role' });
@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  username: string;

  @Field()
  email: string;

  @Field()
  password: string;

  @Field({ nullable: true })
  refresh_token: string | null;

  @Field()
  is_email_confirmed: boolean;

  @Field({ nullable: true })
  email_confirmation_token: string | null;

  @Field()
  created_at: Date;

  @Field()
  updated_at: Date;

  @Field(() => Role)
  role: Role;
}
