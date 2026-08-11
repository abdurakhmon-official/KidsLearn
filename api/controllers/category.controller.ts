import { Controller, Inject } from '@tsed/di';
import { BodyParams, PathParams, QueryParams } from '@tsed/platform-params';
import { Delete, Get, Post, Put } from '@tsed/schema';
import { AdminOnly, Authenticate, Authorized } from '@/middlewares/auth.middleware';
import { CategoryService } from '@/services/category.service';
import { CreateCategoryInput, UpdateCategoryInput } from '@/inputs/category.input';

@Controller('/categories')
export class CategoryController {
  @Inject()
  private categoryService!: CategoryService;

  @Get('/')
  @Authorized(Authenticate())
  async list(@QueryParams('all') all?: string) {
    return await this.categoryService.list(all === 'true');
  }

  @Get('/:id')
  @Authorized(Authenticate())
  async get(@PathParams('id') id: string) {
    return await this.categoryService.get(id);
  }

  @Post('')
  @Authorized(AdminOnly())
  async create(@BodyParams() data: CreateCategoryInput) {
    return await this.categoryService.create(data);
  }

  @Put('/:id')
  @Authorized(AdminOnly())
  async update(@PathParams('id') id: string, @BodyParams() data: UpdateCategoryInput) {
    return await this.categoryService.update(id, data);
  }

  @Delete('/:id')
  @Authorized(AdminOnly())
  async delete(@PathParams('id') id: string) {
    return await this.categoryService.delete(id);
  }
}
