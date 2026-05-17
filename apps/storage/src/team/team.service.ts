import { Inject, Injectable } from "@nestjs/common";
import type { Express } from "express";
import { UrlDto } from "@ross2p/types";
import { StorageClient } from "../storage-client/storage-client.service";
import { getStorageClientToken } from "../storage-client/storage-client.tokens";
import {
  TEAM_AVATARS_BUCKET,
  TEAM_BANNERS_BUCKET,
} from "./team-buckets.constants";

@Injectable()
export class TeamService {
  constructor(
    @Inject(getStorageClientToken(TEAM_AVATARS_BUCKET))
    private readonly teamAvatarsStorageClient: StorageClient,
    @Inject(getStorageClientToken(TEAM_BANNERS_BUCKET))
    private readonly teamBannersStorageClient: StorageClient,
  ) {}

  public async uploadTeamAvatar(file: Express.Multer.File): Promise<UrlDto> {
    const key = this.teamAvatarsStorageClient.generateKey(file);
    return this.teamAvatarsStorageClient.upload(file, key);
  }

  public async uploadTeamBanner(file: Express.Multer.File): Promise<UrlDto> {
    const key = this.teamBannersStorageClient.generateKey(file);
    return this.teamBannersStorageClient.upload(file, key);
  }
}
