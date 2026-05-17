import { Inject, Injectable } from "@nestjs/common";
import type { Express } from "express";
import { UrlDto } from "@ross2p/types";
import { StorageClient } from "../storage-client/storage-client.service";
import { getStorageClientToken } from "../storage-client/storage-client.tokens";
import {
  USER_AVATARS_BUCKET,
  USER_BANNERS_BUCKET,
} from "./user-buckets.constants";

@Injectable()
export class UserService {
  constructor(
    @Inject(getStorageClientToken(USER_AVATARS_BUCKET))
    private readonly userAvatarsStorageClient: StorageClient,
    @Inject(getStorageClientToken(USER_BANNERS_BUCKET))
    private readonly userBannersStorageClient: StorageClient,
  ) {}

  public async uploadUserAvatar(file: Express.Multer.File): Promise<UrlDto> {
    const key = this.userAvatarsStorageClient.generateKey(file);
    return this.userAvatarsStorageClient.upload(file, key);
  }

  public async uploadUserBanner(file: Express.Multer.File): Promise<UrlDto> {
    const key = this.userBannersStorageClient.generateKey(file);
    return this.userBannersStorageClient.upload(file, key);
  }
}
