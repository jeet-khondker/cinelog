import { Controller, Get, Query } from '@nestjs/common';
import { MovieService } from './movie.service';

@Controller('movies')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Get('search')
  async search(@Query('title') title: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.movieService.search(title);
  }

  @Get('detail')
  async getDetail(@Query('id') id: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.movieService.getDetail(id);
  }
}
