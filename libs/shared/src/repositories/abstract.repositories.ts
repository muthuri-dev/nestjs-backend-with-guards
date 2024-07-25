import { PrismaService } from '@app/prisma';

export abstract class AbstractRepository<T, CreateDto, UpdateDto> {
  constructor(protected readonly prismaService: PrismaService) {}

  protected abstract get Model(): {
    create: (params: { data: CreateDto }) => Promise<T>;

    update: (params: { where: { id: string }; data: UpdateDto }) => Promise<T>;

    findUnique: (params: {
      where: { id?: string; email?: string };
    }) => Promise<T | null>;

    findMany: () => Promise<Array<T | null>>;

    delete: (params: { where: { id: string } }) => Promise<T>;

    findFirst: (params: {
      where: { email_confirmation_token: string };
    }) => Promise<T>;
  };

  //creating functions to interact with database
  async create(data: CreateDto): Promise<T> {
    return await this.Model.create({ data });
  }

  async update(id: string, data: UpdateDto): Promise<T> {
    return await this.Model.update({ where: { id }, data });
  }

  async findUnique(field: { id?: string; email?: string }): Promise<T | null> {
    return await this.Model.findUnique({ where: field });
  }

  async findMany(): Promise<Array<T | null>> {
    return await this.Model.findMany();
  }

  async delete(id: string): Promise<T> {
    return await this.Model.delete({ where: { id } });
  }

  async firstFirst(email_confirmation_token: string): Promise<T> {
    return await this.Model.findFirst({ where: { email_confirmation_token } });
  }
}
