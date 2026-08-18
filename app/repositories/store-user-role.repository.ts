import { PrismaService } from "../config/prisma/prisma.service";
import { Inject, Injectable } from "../core/decorators/injectable.decorator";

@Injectable()
export class StoreUserRoleRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  /** True se o usuário tiver, em pelo menos uma loja, alguma das roles informadas (por nome). */
  async userHasAnyRole(userId: string, roleNames: string[]): Promise<boolean> {
    const match = await this.prisma.storeUserRole.findFirst({
      where: {
        userId,
        role: { name: { in: roleNames }, isActive: true },
      },
      select: { userId: true },
    });
    return match !== null;
  }
}
