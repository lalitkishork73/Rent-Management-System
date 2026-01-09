import { Injectable } from '@nestjs/common';
import { PrismaService } from '../..//prisma/prisma.service';

@Injectable()
export class Authorization {
  constructor(private readonly prisma: PrismaService) {}

  async getUserRBAC(userId: string) {
    const roles = await this.prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    

    const roleNames = roles.map((r) => r.role.name);

    const permissionNames = roles.flatMap((r) =>
      r.role.permissions.map((p) => p.permission.name),
    );

    return {
      roles: [...new Set(roleNames)],
      permissions: [...new Set(permissionNames)],
    };
  }
  
}
