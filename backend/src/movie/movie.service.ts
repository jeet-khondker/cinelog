import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MovieService {
  private readonly apiKey = process.env.OMDB_API_KEY;
  private readonly baseUrl = 'http://www.omdbapi.com/';

  constructor(private readonly httpService: HttpService) {}

  /**
   * タイトルで映画を検索する
   */
  async search(title: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(this.baseUrl, {
          params: {
            apikey: this.apiKey,
            s: title, // 's' は search の意味
          },
        }),
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (response.data.Response === 'False') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        throw new HttpException(response.data.Error, HttpStatus.NOT_FOUND);
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return response.data;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'OMDb API エラー',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * ID (imdbID) で詳細情報を取得する
   */
  async getDetail(id: string) {
    const response = await firstValueFrom(
      this.httpService.get(this.baseUrl, {
        params: {
          apikey: this.apiKey,
          i: id, // 'i' は id の意味
          plot: 'full',
        },
      }),
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return response.data;
  }
}
