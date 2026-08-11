import { Controller, Inject } from '@tsed/di';
import { BodyParams, PathParams, QueryParams } from '@tsed/platform-params';
import { Delete, Description, Get, Post, Put } from '@tsed/schema';
import { AdminOnly, Authorized } from '@/middlewares/auth.middleware';
import { UserService } from '@/services/user.service';
import { CreateUserInput, UpdateUserInput, UpdateUserStatusInput, UserSearch } from '@/inputs/user.input';
import { BasicSearch } from '@/inputs';

@Controller('/users')
export class UserController {
  @Inject()
  private userService!: UserService;

  @Get('/paginated')
  @Authorized(AdminOnly())
  async pagination(@QueryParams() query: BasicSearch, @QueryParams() filters: UserSearch) {
    return await this.userService.pagination(query, filters);
  }

  @Get('/:id')
  @Authorized(AdminOnly())
  async get(@PathParams('id') id: string) {
    return await this.userService.get(id);
  }

  @Post('')
  @Authorized(AdminOnly())
  async create(@BodyParams() data: CreateUserInput) {
    return await this.userService.create(data);
  }

  @Put('/:id')
  @Authorized(AdminOnly())
  async update(@PathParams('id') id: string, @BodyParams() data: UpdateUserInput) {
    return await this.userService.update(id, data);
  }

  @Put('/:id/status')
  @Authorized(AdminOnly())
  async updateStatus(@PathParams('id') id: string, @BodyParams() data: UpdateUserStatusInput) {
    return await this.userService.updateStatus(id, data);
  }

  @Delete('/:id')
  @Authorized(AdminOnly())
  async delete(@PathParams('id') id: string) {
    return await this.userService.delete(id);
  }
}
