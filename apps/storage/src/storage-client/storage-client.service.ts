import {
  CreateBucketCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { randomUUID } from "crypto";
import { extname } from "path";
import type { Express } from "express";
import { UrlDto } from "@ross2p/types";
import { buildPublicReadBucketPolicy } from "./utils/public-bucket-policy";

export class StorageClient {
  private readonly logger = new Logger(StorageClient.name);

  private readonly s3: S3Client;

  private readonly publicBaseUrl: string;

  constructor(
    private readonly config: ConfigService,
    private readonly bucket: string,
  ) {
    const endpoint = this.config.getOrThrow<string>("STORAGE_ENDPOINT");
    const region = this.config.get<string>("STORAGE_REGION") ?? "us-east-1";
    const accessKeyId = this.config.getOrThrow<string>("STORAGE_ACCESS_KEY");
    const secretAccessKey =
      this.config.getOrThrow<string>("STORAGE_SECRET_KEY");
    this.publicBaseUrl = this.config
      .getOrThrow<string>("STORAGE_PUBLIC_URL")
      .replace(/\/$/, "");

    this.s3 = new S3Client({
      region,
      endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  public async ensureBucketReady(): Promise<void> {
    const exists = await this.headBucket();
    if (!exists) {
      this.logger.log(`Creating bucket ${this.bucket}`);
      await this.s3.send(
        new CreateBucketCommand({
          Bucket: this.bucket,
        }),
      );
    }
    await this.s3.send(
      new PutBucketPolicyCommand({
        Bucket: this.bucket,
        Policy: buildPublicReadBucketPolicy(this.bucket),
      }),
    );
    this.logger.log(`Bucket ready (public read): ${this.bucket}`);
  }

  public generateKey(file: Express.Multer.File): string {
    const fromName = extname(file.originalname);
    const ext = fromName || this.extensionFromMime(file.mimetype) || ".bin";
    return `${randomUUID()}-${Date.now()}${ext}`;
  }

  public async upload(file: Express.Multer.File, key: string): Promise<UrlDto> {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );
    return { url: `${this.publicBaseUrl}/${this.bucket}/${key}` };
  }

  public async deleteObject(key: string): Promise<void> {
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  private async headBucket(): Promise<boolean> {
    try {
      await this.s3.send(new HeadBucketCommand({ Bucket: this.bucket }));
      return true;
    } catch (error: unknown) {
      const err = error as {
        name?: string;
        $metadata?: { httpStatusCode?: number };
      };
      if (
        err.name === "NotFound" ||
        err.name === "NoSuchBucket" ||
        err.$metadata?.httpStatusCode === 404
      ) {
        return false;
      }
      throw error;
    }
  }

  private extensionFromMime(mimetype: string): string | null {
    const map: Record<string, string> = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
      "image/gif": ".gif",
    };
    return map[mimetype] ?? null;
  }
}
