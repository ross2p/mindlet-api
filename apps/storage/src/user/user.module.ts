import { Module } from "@nestjs/common";
import { StorageClientModule } from "../storage-client/storage-client.module";
import {
  USER_AVATARS_BUCKET,
  USER_BANNERS_BUCKET,
} from "./user-buckets.constants";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";

@Module({
  imports: [
    StorageClientModule.register({ bucket: USER_AVATARS_BUCKET }),
    StorageClientModule.register({ bucket: USER_BANNERS_BUCKET }),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
