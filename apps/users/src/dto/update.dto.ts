import { CreateUserDto } from './create.dto';
import { InputType, Field, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateUserDto extends PartialType(CreateUserDto) {
  @Field()
  id: string;
}
