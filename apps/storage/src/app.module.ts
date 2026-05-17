import { Module } from "@nestjs/common";
import { RouterModule } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";
import { TeamModule } from "./team/team.module";
import { UserModule } from "./user/user.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule,
    TeamModule,
    RouterModule.register([
      {
        path: "storage",
        module: UserModule,
      },
      {
        path: "storage",
        module: TeamModule,
      },
    ]),
  ],
})
export class AppModule {}
