import { Controller, Inject } from '@tsed/di';
import { BodyParams, PathParams, QueryParams } from '@tsed/platform-params';
import { Delete, Description, Get, Post } from '@tsed/schema';
import { AdminOnly, Authorized } from '@/middlewares/auth.middleware';
import { MediaService } from '@/services/media.service';
import { MediaSearch, RegisterMediaInput } from '@/inputs/media.input';
import { BasicSearch } from '@/inputs';

@Controller('/media')
export class MediaController {
  @Inject()
  private mediaService!: MediaService;

  @Get('/paginated')
  @Authorized(AdminOnly())
  async pagination(@QueryParams() query: BasicSearch, @QueryParams() filters: MediaSearch) {
    return await this.mediaService.pagination(query, filters);
  }

  @Get('/:id')
  @Authorized(AdminOnly())
  async get(@PathParams('id') id: string) {
    return await this.mediaService.get(id);
  }

  @Post('')
  @Authorized(AdminOnly())
  async register(@BodyParams() data: RegisterMediaInput) {
    return await this.mediaService.register(data);
  }

  @Delete('/:id')
  @Authorized(AdminOnly())
  async remove(@PathParams('id') id: string) {
    return await this.mediaService.remove(id);
  }
}
