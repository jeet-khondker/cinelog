import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class FavoriteService {
  constructor(private prisma: PrismaService) {}

  async addFavorite(
    userId: string,
    imdbID: string,
    title: string,
    poster: string,
  ) {
    try {
      return await this.prisma.favorite.create({
        data: { userId, imdbID, title, poster },
      });
    } catch (error: any) {
      // Prisma の一意制約違反（重複）のエラーコードは 'P2002'
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.code === 'P2002') {
        throw new ConflictException(
          'この映画はすでにお気に入りに追加されています',
        );
      }
      // それ以外の予期せぬエラーはそのまま投げる
      throw error;
    }
  }

  async removeFavorite(userId: string, imdbID: string) {
    // deleteMany を使えば、対象が 0 件でもエラーにならず [count: 0] が返るだけなので安全です
    return await this.prisma.favorite.deleteMany({
      where: {
        userId: userId,
        imdbID: imdbID,
      },
    });
  }

  async getFavorites(userId: string) {
    return await this.prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 一時的なテスト用：全削除
  async clearAll() {
    return await this.prisma.favorite.deleteMany({});
  }
}
