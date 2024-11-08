import { PrismaService } from './prisma.service';

export class BaseRepository {
  constructor(protected readonly prisma: PrismaService) {}

  public async closeConnection(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
