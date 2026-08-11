import { GetObjectCommand, GetObjectCommandInput, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import config from '@/config';
import { HmacSHA256, enc } from 'crypto-js';
import { BadRequest } from '@tsed/exceptions';
import { PlatformContext } from '@tsed/common';
import { Injectable, InjectContext } from '@tsed/di';
import { Request } from 'express';
import { addMinutes, format } from 'date-fns';
import { uuid } from '@/utils';

const s3Client = new S3Client({ region: config.AWS_REGION });
const serviceName = 's3';

@Injectable()
export class S3Service {
  @InjectContext()
  private context!: PlatformContext;

  get req() {
    return this.context.getRequest<Request>();
  }

  get user() {
    return this.req.user;
  }

  async sign(allParams: string[], fileName: string, attachment: boolean) {
    const key = allParams.join('/');
    const filename = fileName || allParams[allParams.length - 1];
    const url = await this.signUrl({ Key: key as string }, { attachment, filename });
    return url;
  }

  async signUrl(
    objParams: { Bucket?: string; Key: string },
    options: {
      attachment?: boolean;
      expiresIn?: number;
      filename?: string;
    } = {},
  ): Promise<string> {
    const commandParams: GetObjectCommandInput = objParams as GetObjectCommandInput;

    if (!objParams.Bucket) {
      commandParams.Bucket = config.AWS_S3_BUCKET;
    }

    if (options.attachment) {
      commandParams.ResponseContentDisposition = 'attachment; filename ="' + options.filename + '"';
    }

    if (!options.expiresIn) {
      options.expiresIn = config.AWS_FILE_VIEW_EXPIRY_MINUTES;
    }

    const command = new GetObjectCommand(commandParams);
    const url = await getSignedUrl(s3Client, command, {
      expiresIn: options.expiresIn,
    });
    return url;
  }

  async getFile(objParams: { Bucket?: string; Key: string }): Promise<any> {
    const commandParams: GetObjectCommandInput = objParams as GetObjectCommandInput;

    if (!objParams.Bucket) {
      commandParams.Bucket = config.AWS_S3_BUCKET;
    }

    const command = new GetObjectCommand(commandParams);
    const response = await s3Client.send(command);
    return await this.readBody(response.Body);
  }

  async readBody(body: any) {
    return new Promise((resolve, reject) => {
      const buffers: any[] = [];
      body.on('data', (data: any) => buffers.push(data));
      body.on('end', () => resolve(Buffer.concat(buffers)));
      body.on('error', (error: any) => reject(error));
    });
  }

  async uploadFile(dataBuffer: Buffer, folder = 'default', fileName: string) {
    const key = `${folder}/${format(new Date(), 'yyyyMMdd')}/${fileName}`;

    const command = new PutObjectCommand({
      Bucket: config.AWS_S3_BUCKET,
      Key: key,
      Body: dataBuffer,
    });
    await s3Client.send(command);

    return key;
  }

  async generatePolicy(folder: string, contentType: string, fileName: string) {
    if (['brands', 'products', 'avatars'].indexOf(folder) < 0) {
      throw new BadRequest('Invalid folder');
    }

    const expiration = addMinutes(new Date(), 15).toISOString();
    const date = format(new Date(), 'yyyyMMdd');
    const fullDate = date + 'T000000Z';
    const amazonCredential = config.AWS_ACCESS_KEY_ID + '/' + date + '/' + config.AWS_REGION + '/' + serviceName + '/aws4_request';

    const s3Policy = {
      expiration: expiration,
      conditions: [
        { bucket: config.AWS_S3_BUCKET },
        ['starts-with', '$key', `${folder}/${date}`],
        { acl: 'public-read' },
        ['starts-with', '$Content-Type', ''],
        { 'x-amz-credential': amazonCredential },
        { 'x-amz-algorithm': 'AWS4-HMAC-SHA256' },
        { 'x-amz-date': fullDate },
      ],
    };

    const base64Policy = Buffer.from(JSON.stringify(s3Policy), 'utf-8').toString('base64');
    const signatureKey = this.getSignatureKey(config.AWS_SECRET_ACCESS_KEY, date, config.AWS_REGION, serviceName);
    const s3Signature = HmacSHA256(base64Policy, signatureKey).toString(enc.Hex);

    const extension = fileName.substring(fileName.lastIndexOf('.'));
    fileName = `${uuid()}${extension}`;
    const key = `${folder}/${date}/${fileName}`;

    const removeAuthKey = uuid();

    return {
      policy: {
        acl: 'public-read',
        'x-amz-algorithm': 'AWS4-HMAC-SHA256',
        'x-amz-signature': s3Signature,
        'x-amz-date': fullDate,
        policy: base64Policy,
        'x-amz-credential': amazonCredential,
        key: key,
        'content-type': decodeURIComponent(contentType),
        bucket: config.AWS_S3_BUCKET,
      },
      removeAuthKey,
      region: config.AWS_REGION,
      url: await this.signUrl({ Key: key }),
    };
  }

  getSignatureKey(key: string, dateStamp: string, regionName: string, serviceName: string) {
    const kDate = HmacSHA256(dateStamp, 'AWS4' + key);
    const kRegion = HmacSHA256(regionName, kDate);
    const kService = HmacSHA256(serviceName, kRegion);
    const kSigning = HmacSHA256('aws4_request', kService);

    return kSigning;
  }

  async upload(folder: string, file: any) {
    const { buffer, originalname, size } = file;

    const key = await this.uploadFile(buffer, folder, originalname);

    return {
      success: true,
      _message: 'Uploaded!',
      key: key,
    };
  }
}
