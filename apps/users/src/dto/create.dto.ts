import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

@InputType()
export class CreateUserDto {
  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Username cannnot be empty' })
  username: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Email cannnot be empty' })
  @IsEmail({}, { message: 'Enter valid email' })
  email: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Password cannnot be empty' })
  @MinLength(3, { message: 'Enter alteast 3-characters' })
  password: string;
}
