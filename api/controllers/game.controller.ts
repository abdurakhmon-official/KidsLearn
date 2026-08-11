import { Controller, Inject } from '@tsed/di';
import { BodyParams, PathParams, QueryParams } from '@tsed/platform-params';
import { Delete, Description, Get, Post, Put } from '@tsed/schema';
import { AdminOnly, Authenticate, Authorized, ChildOnly } from '@/middlewares/auth.middleware';
import { GameService } from '@/services/game.service';
import { CreateGameInput, GameItemInput, GameSearch, SubmitGameInput, UpdateGameInput } from '@/inputs/game.input';
import { BasicSearch } from '@/inputs';

@Controller('/games')
export class GameController {
  @Inject()
  private gameService!: GameService;

  @Get('/paginated')
  @Authorized(Authenticate())
  async pagination(@QueryParams() query: BasicSearch, @QueryParams() filters: GameSearch) {
    return await this.gameService.pagination(query, filters);
  }

  @Get('/for-me')
  @Authorized(ChildOnly())
  async forChild() {
    return await this.gameService.forChild();
  }

  @Get('/:id')
  @Authorized(Authenticate())
  async get(@PathParams('id') id: string) {
    return await this.gameService.get(id);
  }

  @Get('/:id/play')
  @Authorized(ChildOnly())
  async play(@PathParams('id') id: string) {
    return await this.gameService.play(id);
  }

  @Post('/:id/submit')
  @Authorized(ChildOnly())
  async submit(@PathParams('id') id: string, @BodyParams() data: SubmitGameInput) {
    return await this.gameService.submit(id, data);
  }

  @Post('')
  @Authorized(AdminOnly())
  async create(@BodyParams() data: CreateGameInput) {
    return await this.gameService.create(data);
  }

  @Put('/:id')
  @Authorized(AdminOnly())
  async update(@PathParams('id') id: string, @BodyParams() data: UpdateGameInput) {
    return await this.gameService.update(id, data);
  }

  @Delete('/:id')
  @Authorized(AdminOnly())
  async delete(@PathParams('id') id: string) {
    return await this.gameService.delete(id);
  }

  @Get('/:id/items')
  @Authorized(AdminOnly())
  async listItems(@PathParams('id') id: string) {
    return await this.gameService.listItems(id);
  }

  @Post('/:id/items')
  @Authorized(AdminOnly())
  async addItem(@PathParams('id') id: string, @BodyParams() data: GameItemInput) {
    return await this.gameService.addItem(id, data);
  }

  @Put('/:id/items/:itemId')
  @Authorized(AdminOnly())
  async updateItem(@PathParams('id') id: string, @PathParams('itemId') itemId: string, @BodyParams() data: GameItemInput) {
    return await this.gameService.updateItem(id, itemId, data);
  }

  @Delete('/:id/items/:itemId')
  @Authorized(AdminOnly())
  async deleteItem(@PathParams('id') id: string, @PathParams('itemId') itemId: string) {
    return await this.gameService.deleteItem(id, itemId);
  }
}
