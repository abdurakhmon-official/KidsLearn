import { LoginInput, RegisterInput, UpdatePasswordInput, UpdateProfileInput } from '@/inputs/auth.input';
import { Authorized, Authenticate, ParentOnly } from '@/middlewares/auth.middleware';
import { AuthService } from '@/services/auth.service';
import { Controller, Inject } from '@tsed/di';
import { BodyParams, PathParams } from '@tsed/platform-params';
import { Post, Get, Put } from '@tsed/schema';

@Controller('/auth')
export class AuthController {
  @Inject()
  private authService!: AuthService;

  @Post('/register')
  async register(@BodyParams() data: RegisterInput) {
    return await this.authService.register(data);
  }

  @Post('/login')
  async login(@BodyParams() data: LoginInput) {
    return await this.authService.login(data);
  }

  @Post('/logout')
  @Authorized(Authenticate())
  async logout() {
    return await this.authService.logout();
  }

  @Post('/children/:id/select')
  @Authorized(ParentOnly())
  async selectChild(@PathParams('id') id: string) {
    return await this.authService.selectChild(id);
  }

  @Get('/me')
  @Authorized(Authenticate())
  async me() {
    return await this.authService.me();
  }

  @Put('/profile')
  @Authorized(Authenticate())
  async updateProfile(@BodyParams() data: UpdateProfileInput) {
    return await this.authService.updateProfile(data);
  }

  @Put('/password')
  @Authorized(Authenticate())
  async updatePassword(@BodyParams() data: UpdatePasswordInput) {
    return await this.authService.updatePassword(data);
  }
}
