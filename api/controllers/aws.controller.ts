import { Response } from 'express';
import { S3Service } from '@/services/s3.service';
import { Authenticate } from '@/modules/auth';
import { Authorized } from '../middlewares/auth.middleware';
import { Res } from '@tsed/common';
import { Controller, Inject } from '@tsed/di';
import { QueryParams, PathParams, BodyParams } from '@tsed/platform-params';
import { Get, Post } from '@tsed/schema';

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
  @Authorized(Authenticate())
  async upload(@PathParams('folder') folder: string, @BodyParams('UploadFiles') file: any) {
    return await this.s3Service.upload(folder, file);
  }
}
