import { Response } from 'express';
import { S3Service } from '@/services/s3.service';
import { Authenticate } from '@/modules/auth';
import { AdminOnly, Authorized } from '../middlewares/auth.middleware';
import { Res } from '@tsed/common';
import { Controller, Inject } from '@tsed/di';
import { MulterOptions, MultipartFile, type PlatformMulterFile } from '@tsed/platform-multer';
import { QueryParams, PathParams } from '@tsed/platform-params';
import { Get, Post } from '@tsed/schema';
import { MAX_UPLOAD_BYTES } from '@/utils/constants';

@Controller('/s3')
export class AwsController {
  @Inject() s3Service!: S3Service;

  @Get('/file/*key')
  async sign(
    @PathParams('key') allParams: string[],
    @QueryParams('attachment') attachment: boolean,
    @QueryParams('fileName') fileName: string,
    @Res() res: Response,
  ) {
    const url = await this.s3Service.sign(allParams, fileName, attachment);
    res.redirect(url);
  }

  @Get('/generate-policy')
  @Authorized(Authenticate())
  async generatePolicy(
    @QueryParams('folder') folder: string,
    @QueryParams('contentType') contentType: string,
    @QueryParams('filename') filename: string,
  ) {
    return await this.s3Service.generatePolicy(folder, contentType, filename);
  }

  @Post('/:folder/upload')
  @Authorized(AdminOnly())
  @MulterOptions({ limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 } })
  async upload(@PathParams('folder') folder: string, @MultipartFile('file') file: PlatformMulterFile) {
    return await this.s3Service.upload(folder, file);
  }
}
