import {
  DeleteObjectsCommand,
  GetObjectCommand,
  GetObjectCommandInput,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import config from '@/config';
import { HmacSHA256, enc } from 'crypto-js';
import { BadRequest } from '@tsed/exceptions';
import { PlatformContext } from '@tsed/common';
import { Inject, Injectable, InjectContext } from '@tsed/di';
import type { PlatformMulterFile } from '@tsed/platform-multer';
import { Request } from 'express';
import { addMinutes, format } from 'date-fns';
import { extname } from 'node:path';
import { MEDIA_TYPE } from '@/generated/prisma';
import { MediaService } from '@/services/media.service';
import { uuid } from '@/utils';
import { MAX_UPLOAD_BYTES, UPLOAD_FOLDERS, UPLOAD_MIME_TYPES, UploadFolder } from '@/utils/constants';

const DEFAULT_EXTENSIONS: Record<string, string> = {
  'audio/mpeg': '.mp3',
  'audio/mp3': '.mp3',
  'audio/wav': '.wav',
  'audio/x-wav': '.wav',
  'audio/ogg': '.ogg',
  'audio/webm': '.webm',
  'audio/mp4': '.m4a',
  'audio/aac': '.aac',
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
};

const s3Client = new S3Client({ region: config.AWS_REGION });
const serviceName = 's3';
const S3_DELETE_BATCH = 1000;

@Injectable()
export class S3Service {
  @InjectContext()
  private context!: PlatformContext;

  @Inject()
  private mediaService!: MediaService;

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

  async uploadFile(dataBuffer: Buffer, folder = 'default', fileName: string, contentType?: string) {
    const key = `${folder}/${format(new Date(), 'yyyyMMdd')}/${fileName}`;

    return await this.putObject(key, dataBuffer, contentType);
  }

  async putObject(key: string, body: Buffer, contentType?: string) {
    const command = new PutObjectCommand({
      Bucket: config.AWS_S3_BUCKET,
      Key: key,
      Body: body,
      ...(contentType ? { ContentType: contentType } : {}),
    });
    await s3Client.send(command);

    return key;
  }

  async deleteObjects(keys: string[]) {
    const unique = [...new Set(keys.filter(Boolean))];

    if (!unique.length || !config.AWS_S3_BUCKET) {
      return 0;
    }

    for (let index = 0; index < unique.length; index += S3_DELETE_BATCH) {
      const chunk = unique.slice(index, index + S3_DELETE_BATCH);

      await s3Client.send(
        new DeleteObjectsCommand({
          Bucket: config.AWS_S3_BUCKET,
          Delete: { Objects: chunk.map(Key => ({ Key })), Quiet: true },
        }),
      );
    }

    return unique.length;
  }

  assetUrl(key: string) {
    const path = key
      .split('/')
      .map((segment) => encodeURIComponent(segment))
      .join('/');

    return `${config.publicApiUrl}/s3/file/${path}`;
  }

  async generatePolicy(folder: string, contentType: string, fileName: string) {
    if (!UPLOAD_FOLDERS.includes(folder as UploadFolder)) {
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

  async upload(folder: string, file?: PlatformMulterFile) {
    if (!file) {
      throw new BadRequest('file is required');
    }

    if (!UPLOAD_FOLDERS.includes(folder as UploadFolder)) {
      throw new BadRequest(`folder must be one of: ${UPLOAD_FOLDERS.join(', ')}`);
    }

    if (!config.AWS_S3_BUCKET) {
      throw new BadRequest('file storage is not configured on the server');
    }

    const mimeType = file.mimetype?.split(';')[0].trim().toLowerCase() ?? '';
    const type = UPLOAD_MIME_TYPES[mimeType];

    if (!type) {
      throw new BadRequest(`unsupported file type: ${file.mimetype}`);
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      throw new BadRequest(`file is larger than ${Math.floor(MAX_UPLOAD_BYTES / (1024 * 1024))} MB`);
    }

    const extension = extname(file.originalname || '').toLowerCase() || DEFAULT_EXTENSIONS[mimeType] || '';
    const key = await this.uploadFile(file.buffer, folder, `${uuid()}${extension}`, mimeType);

    const { data } = await this.mediaService.register({
      type: MEDIA_TYPE[type],
      url: this.assetUrl(key),
      key,
      originalName: file.originalname || key,
      mimeType,
      size: file.size,
    });

    return { success: true, _message: 'file uploaded', data };
  }
}
