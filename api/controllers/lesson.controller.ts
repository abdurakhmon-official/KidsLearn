import { Controller, Inject } from '@tsed/di';
import { BodyParams, PathParams, QueryParams } from '@tsed/platform-params';
import { Delete, Description, Get, Post, Put } from '@tsed/schema';
import { AdminOnly, Authenticate, Authorized, ChildOnly } from '@/middlewares/auth.middleware';
import { LessonService } from '@/services/lesson.service';
import { CreateLessonInput, LessonMediaInput, LessonProgressInput, LessonSearch, UpdateLessonInput } from '@/inputs/lesson.input';
import { BasicSearch } from '@/inputs';

@Controller('/lessons')
export class LessonController {
  @Inject()
  private lessonService!: LessonService;

  @Get('/paginated')
  @Authorized(Authenticate())
  async pagination(@QueryParams() query: BasicSearch, @QueryParams() filters: LessonSearch) {
    return await this.lessonService.pagination(query, filters);
  }

  @Get('/for-me')
  @Authorized(ChildOnly())
  async forChild(@QueryParams('categoryId') categoryId?: string) {
    return await this.lessonService.forChild(categoryId);
  }

  @Get('/:id')
  @Authorized(Authenticate())
  async get(@PathParams('id') id: string) {
    return await this.lessonService.get(id);
  }

  @Post('')
  @Authorized(AdminOnly())
  async create(@BodyParams() data: CreateLessonInput) {
    return await this.lessonService.create(data);
  }

  @Put('/:id')
  @Authorized(AdminOnly())
  async update(@PathParams('id') id: string, @BodyParams() data: UpdateLessonInput) {
    return await this.lessonService.update(id, data);
  }

  @Delete('/:id')
  @Authorized(AdminOnly())
  async delete(@PathParams('id') id: string) {
    return await this.lessonService.delete(id);
  }

  @Post('/:id/media')
  @Authorized(AdminOnly())
  async addMedia(@PathParams('id') id: string, @BodyParams() data: LessonMediaInput) {
    return await this.lessonService.addMedia(id, data);
  }

  @Delete('/:id/media/:mediaId')
  @Authorized(AdminOnly())
  async removeMedia(@PathParams('id') id: string, @PathParams('mediaId') mediaId: string) {
    return await this.lessonService.removeMedia(id, mediaId);
  }

  @Post('/:id/progress')
  @Authorized(ChildOnly())
  async saveProgress(@PathParams('id') id: string, @BodyParams() data: LessonProgressInput) {
    return await this.lessonService.saveProgress(id, data);
  }
}
