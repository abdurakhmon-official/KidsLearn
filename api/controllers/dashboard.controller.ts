import { Controller, Inject } from '@tsed/di';
import { QueryParams } from '@tsed/platform-params';
import { Description, Get } from '@tsed/schema';
import { AdminOnly, Authenticate, Authorized, ParentOnly } from '@/middlewares/auth.middleware';
import { DashboardService } from '@/services/dashboard.service';
import { LeaderboardSearch, ParentDashboardQuery } from '@/inputs/dashboard.input';

@Controller('/dashboard')
export class DashboardController {
  @Inject()
  private dashboardService!: DashboardService;

  @Get('/parent')
  @Authorized(ParentOnly())
  async parent(@QueryParams() query: ParentDashboardQuery) {
    return await this.dashboardService.parent(query);
  }

  @Get('/admin')
  @Authorized(AdminOnly())
  async admin() {
    return await this.dashboardService.admin();
  }

  @Get('/leaderboard')
  @Authorized(Authenticate())
  async leaderboard(@QueryParams() query: LeaderboardSearch) {
    return await this.dashboardService.leaderboard(query);
  }
}
