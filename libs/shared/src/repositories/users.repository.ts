import { Injectable } from '@nestjs/common';
import { AbstractRepository } from './abstract.repositories';
import { CreateUserDto } from 'apps/users/src/dto/create.dto';
import { UpdateUserDto } from 'apps/users/src/dto/update.dto';
import { PrismaService } from '@app/prisma';
import { User } from 'apps/users/src/entities/user.entity';

@Injectable()
export class UserRepository extends AbstractRepository<
  User,
  CreateUserDto,
  UpdateUserDto
> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  protected get Model() {
    return this.prismaService.user;
  }
}
