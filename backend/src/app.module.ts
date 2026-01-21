import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaService } from './prisma.service';
import { MailModule } from './mail/mail.module';
import { MovieModule } from './movie/movie.module';
import { FavoriteModule } from './favorite/favorite.module';

@Module({
  imports: [AuthModule, UserModule, MailModule, MovieModule, FavoriteModule],
  controllers: [],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
