import { Controller, Inject } from '@tsed/di';
import { PathParams, QueryParams } from '@tsed/platform-params';
import { Description, Get, Post, Put } from '@tsed/schema';
import { AdminOnly, Authenticate, Authorized } from '@/middlewares/auth.middleware';
import { NotificationService } from '@/services/notification.service';
import { NotificationSearch } from '@/inputs/notification.input';
import { BasicSearch } from '@/inputs';

@Controller('/notifications')
export class NotificationController {
  @Inject()
  private notificationService!: NotificationService;

  @Get('/paginated')
  @Authorized(Authenticate())
  async pagination(@QueryParams() query: BasicSearch, @QueryParams() filters: NotificationSearch) {
    return await this.notificationService.pagination(query, filters);
  }

  @Put('/:id/read')
  @Authorized(Authenticate())
  async markRead(@PathParams('id') id: string) {
    return await this.notificationService.markRead(id);
  }

  @Put('/read-all')
  @Authorized(Authenticate())
  async markAllRead() {
    return await this.notificationService.markAllRead();
  }

  @Post('/daily-digest')
  @Authorized(AdminOnly())
  async runDailyDigest() {
    return await this.notificationService.runDailyDigest();
  }
}
