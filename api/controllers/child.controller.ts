import { Controller, Inject } from '@tsed/di';
import { BodyParams, PathParams, QueryParams } from '@tsed/platform-params';
import { Delete, Description, Get, Post, Put } from '@tsed/schema';
import { Authenticate, Authorized, ParentOnly } from '@/middlewares/auth.middleware';
import { ChildService } from '@/services/child.service';
import { ProgressService } from '@/services/progress.service';
import { AwardService } from '@/services/award.service';
import { ChildSearch, CreateChildInput, UpdateChildInput } from '@/inputs/child.input';
import { BasicSearch } from '@/inputs';

@Controller('/children')
export class ChildController {
  @Inject()
  private childService!: ChildService;

  @Inject()
  private progressService!: ProgressService;

  @Inject()
  private awardService!: AwardService;

  @Get('/')
  @Authorized(ParentOnly())
  async list() {
    return await this.childService.listForParent();
  }

  @Get('/paginated')
  @Authorized(Authenticate())
  async pagination(@QueryParams() query: BasicSearch, @QueryParams() filters: ChildSearch) {
    return await this.childService.pagination(query, filters);
  }

  @Get('/:id')
  @Authorized(Authenticate())
  async get(@PathParams('id') id: string) {
    return await this.childService.get(id);
  }

  @Get('/:id/progress')
  @Authorized(Authenticate())
  async progress(@PathParams('id') id: string) {
    return await this.progressService.forChild(id);
  }

  @Get('/:id/awards')
  @Authorized(Authenticate())
  async awards(@PathParams('id') id: string) {
    return await this.awardService.listAccessible(id);
  }

  @Post('')
  @Authorized(ParentOnly())
  async create(@BodyParams() data: CreateChildInput) {
    return await this.childService.create(data);
  }

  @Put('/:id')
  @Authorized(ParentOnly())
  async update(@PathParams('id') id: string, @BodyParams() data: UpdateChildInput) {
    return await this.childService.update(id, data);
  }

  @Delete('/:id')
  @Authorized(ParentOnly())
  async delete(@PathParams('id') id: string) {
    return await this.childService.delete(id);
  }
}
