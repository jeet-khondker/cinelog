import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('favorites')
@UseGuards(JwtAuthGuard) // 全てのエンドポイントをログイン必須にする
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Post()
  async add(
    @Request() req,
    @Body() body: { imdbID: string; title: string; poster: string },
  ) {
    // req.user.sub を確実に渡す
    return this.favoriteService.addFavorite(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      req.user.sub,
      body.imdbID,
      body.title,
      body.poster,
    );
  }

  @Delete()
  async remove(@Request() req, @Query('imdbID') imdbID: string) {
    // 第1引数に req.user.sub (userId) を渡しているか確認
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.favoriteService.removeFavorite(req.user.sub, imdbID);
  }

  @Get()
  async findAll(@Request() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.favoriteService.getFavorites(req.user.sub);
  }

  // 一時的なテスト用：全削除
  @Delete('clear-all')
  async clearAll() {
    return this.favoriteService.clearAll();
  }
}
