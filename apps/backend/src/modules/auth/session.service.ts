import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Session, User } from '@prisma/client';
import Redis from 'ioredis';
import { randomBytes } from 'crypto';

type SessionMeta = {
  ip?: string;
  userAgent?: string;
  device: string;
  expiresAt: Date;
};

type RefreshTokenData = {
  sessionId: string;
  userId: string;
  expiresAt: Date;
};

@Injectable()
export class SessionService {
  private readonly refreshPrefix = 'refresh:';
  private readonly sessionFreshPrefix = 'session:refresh:';

  constructor(
    @Inject('REDIS') private readonly redis: Redis,
    private readonly prisma: PrismaService,
  ) {}

  private generateRefreshToken(): string {
    return randomBytes(48).toString('hex');
  }

  private buildRefreshKey(token: string): string {
    return `${this.refreshPrefix}${token}`;
  }

  private buildSessionRefreshKey(sessionId: string) {
    return `${this.sessionFreshPrefix}${sessionId}`;
  }

  async createSession(
    user: User,
    meta: SessionMeta,
  ): Promise<{ session: Session; refreshToken: string }> {
    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        device: meta.device,
        userAgent: meta.userAgent,
        ip: meta.ip,
        expiresAt: meta.expiresAt,
      },
    });

    const refreshToken = this.generateRefreshToken();
    const ttlSeconds = Math.floor(
      (meta.expiresAt.getTime() - Date.now()) / 1000,
    );

    const payload: RefreshTokenData = {
      sessionId: session.id,
      userId: user.id,
      expiresAt: meta.expiresAt,
    };

    const refreshKey = this.buildRefreshKey(refreshToken);
    const sessionKey = this.buildSessionRefreshKey(session.id);

    await this.redis
      .multi()
      .set(refreshKey, JSON.stringify(payload), 'EX', ttlSeconds)
      .set(sessionKey, refreshToken, 'EX', ttlSeconds)
      .exec();

    return { session, refreshToken };
  }

  async rotateRefreshToken(oldToken: string) {
    const oldKey = this.buildRefreshKey(oldToken);
    const data = await this.redis.get(oldKey);
    if (!data) return null;

    const parsed = JSON.parse(data) as RefreshTokenData;

    if (parsed.expiresAt < new Date()) {
      await this.redis.del(oldKey);
      return null;
    }

    const session = await this.prisma.session.findUnique({
      where: { id: parsed.sessionId },
    });

    if (!session || session.revoked || session.expiresAt < new Date()) {
      await this.redis.del(oldKey);
      return null;
    }

    const newRefreshToken = this.generateRefreshToken();
    const ttlSeconds = Math.floor(
      (session.expiresAt.getTime() - Date.now()) / 1000,
    );

    const newPayload: RefreshTokenData = {
      sessionId: session.id,
      userId: parsed.userId,
      expiresAt: session.expiresAt,
    };

    const newKey = this.buildRefreshKey(newRefreshToken);
    const sessionKey = this.buildSessionRefreshKey(session.id);

    await this.redis
      .multi()
      .del(oldKey)
      .set(newKey, JSON.stringify(newPayload), 'EX', ttlSeconds)
      .set(sessionKey, newRefreshToken, 'EX', ttlSeconds)
      .exec();

    await this.prisma.session.update({
      where: { id: session.id },
      data: {
        lastUsedAt: new Date(),
      },
    });

    return { session, refreshToken: newRefreshToken };
  }

  async revokeSession(sessionId: string) {
    const sessionKey = this.buildSessionRefreshKey(sessionId);
    const token = await this.redis.get(sessionId);

    if (token) {
      const refreshKey = this.buildRefreshKey(token);
      await this.redis.multi().del(sessionKey).del(refreshKey).exec();
    }

    await this.prisma.session.updateMany({
      where: { id: sessionId },
      data: {
        revoked: true,
      },
    });
  }

  async revokeAllUsers(userId: string) {
    const sessions = await this.prisma.session.findMany({
      where: { userId, revoked: false },
    });

    const ops = this.redis.multi();
    for (const s of sessions) {
      const sessionKey = this.buildSessionRefreshKey(s.id);
      ops.get(sessionKey);
    }

    const res = await ops.exec();

    const tokens: string[] = [];
    if (res) {
      for (const r of res) {
        const val = r[1] as string | null;
        if (val) tokens.push(val);
      }
    }

    const delOps = this.redis.multi();

    for (const token of tokens) {
      delOps.del(this.buildRefreshKey(token));
    }

    for (const s of sessions) {
      delOps.del(this.buildSessionRefreshKey(s.id));
    }

    await delOps.exec();

    await this.prisma.session.updateMany({
      where: { userId },
      data: {
        revoked: true,
      },
    });
  }

  async getSessionFromRefreshToken(token: string) {
    const key = this.buildRefreshKey(token);
    const data = await this.redis.get(key);
    if (!data) return null;

    const parsed:any = JSON.stringify(data);
    const session = await this.prisma.session.findUnique({
      where: { id: parsed.sessionId },
      include: { user: true },
    });

    if (!session || session.revoked || session.expiresAt < new Date()) {
      await this.redis.del(key);
      return null;
    }

    return session;
  }
}
