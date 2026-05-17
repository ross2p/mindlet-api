import { Module } from "@nestjs/common";
import { StorageClientModule } from "../storage-client/storage-client.module";
import {
  TEAM_AVATARS_BUCKET,
  TEAM_BANNERS_BUCKET,
} from "./team-buckets.constants";
import { TeamController } from "./team.controller";
import { TeamService } from "./team.service";

@Module({
  imports: [
    StorageClientModule.register({ bucket: TEAM_AVATARS_BUCKET }),
    StorageClientModule.register({ bucket: TEAM_BANNERS_BUCKET }),
  ],
  controllers: [TeamController],
  providers: [TeamService],
})
export class TeamModule {}
