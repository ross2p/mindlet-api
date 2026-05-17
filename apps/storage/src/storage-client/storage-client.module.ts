import { DynamicModule, Module, Provider } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { StorageClient } from "./storage-client.service";
import { getStorageClientToken } from "./storage-client.tokens";

export class StorageClientModule {
  public static register(options: { bucket: string }): DynamicModule {
    const token = getStorageClientToken(options.bucket);
    const providers: Provider[] = [
      {
        provide: token,
        inject: [ConfigService],
        useFactory: async (config: ConfigService) => {
          const client = new StorageClient(config, options.bucket);
          await client.ensureBucketReady();
          return client;
        },
      },
    ];

    @Module({})
    class StorageClientBucketModule {}

    return {
      module: StorageClientBucketModule,
      providers,
      exports: [token],
    };
  }
}
