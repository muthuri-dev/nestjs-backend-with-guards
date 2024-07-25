import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { GraphQLModule } from '@nestjs/graphql';
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { join } from 'path';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from '@app/shared';
import { PrismaService } from '@app/prisma';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      introspection: true,
      sortSchema: true,
      playground: true,
      autoSchemaFile: {
        federation: 2,
        path: join(process.cwd(), 'apps/auth/auth-schema.gql'),
      },
    }),
  ],
  providers: [
    AuthService,
    AuthResolver,
    JwtService,
    ConfigService,
    UserRepository,
    PrismaService,
  ],
})
export class AuthModule {}
