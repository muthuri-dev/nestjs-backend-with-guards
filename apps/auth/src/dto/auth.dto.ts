import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

@InputType()
export class AuthDto {
  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Username cannnot be empty' })
  username: string;

  @Field()
  @IsString()
  @IsEmail({}, { message: 'Enter valid email' })
  @IsNotEmpty({ message: 'Email cannnot be empty' })
  email: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Password cannnot be empty' })
  @MinLength(3, { message: 'Enter alteast 3-characters' })
  password: string;
}

@InputType()
export class LoginDto {
  @Field()
  @IsString()
  @IsEmail({}, { message: 'Enter valid email' })
  @IsNotEmpty({ message: 'Email cannnot be empty' })
  email: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Password cannnot be empty' })
  @MinLength(3, { message: 'Enter alteast 3-characters' })
  password: string;
}
