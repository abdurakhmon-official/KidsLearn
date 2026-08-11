import { Controller, Inject } from '@tsed/di';
import { Description, Get } from '@tsed/schema';
import { Authorized, ChildOnly } from '@/middlewares/auth.middleware';
import { ProgressService } from '@/services/progress.service';
import { AwardService } from '@/services/award.service';

@Controller('/progress')
export class ProgressController {
  @Inject()
  private progressService!: ProgressService;

  @Inject()
  private awardService!: AwardService;

  @Get('/me')
  @Authorized(ChildOnly())
  async me() {
    return await this.progressService.me();
  }

  @Get('/me/awards')
  @Authorized(ChildOnly())
  async myAwards() {
    return await this.awardService.me();
  }
}
