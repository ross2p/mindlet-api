import { NestExpressApplication } from '@nestjs/platform-express';
import { MicroServiceApplicationConfig } from '@ross2p/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app =
    await MicroServiceApplicationConfig.create<NestExpressApplication>(
      AppModule,
    );
  app.init();
  await app.start();
}
void bootstrap();
