#!/usr/bin/env bash
# Generate a Nest microservice scaffold from apps/token into .scaffold-cache/<name>.
# Usage: ./scripts/generate-service-scaffold.sh <folder-name> <SERVICE_NAME_VALUE> [extra-env-lines]
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
NAME="$1"
SERVICE_NAME_VAL="${2:-}"
shift 2 || true
EXTRA_ENV=("$@")

SRC="$ROOT/apps/token"
DST="$ROOT/.scaffold-cache/$NAME"

rm -rf "$DST"
mkdir -p "$DST"
rsync -a \
  --exclude node_modules \
  --exclude dist \
  --exclude .git \
  --exclude coverage \
  --exclude .husky \
  "$SRC/" "$DST/"

rm -rf "$DST/src/user-token" "$DST/src/base-token"

# Minimal app entry
cat >"$DST/src/app.module.ts" <<'EOF'
import { Module } from '@nestjs/common';

@Module({
  imports: [],
})
export class AppModule {}
EOF

cat >"$DST/src/main.ts" <<'EOF'
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
EOF

# package.json: name + npm deps (Docker-friendly)
node -e "
const fs = require('fs');
const p = JSON.parse(fs.readFileSync('$DST/package.json', 'utf8'));
p.name = '$NAME';
p.dependencies = p.dependencies || {};
p.dependencies['@ross2p/common'] = '^0.1.8';
p.dependencies['@ross2p/types'] = '^0.0.5';
delete p.dependencies['@nestjs/jwt'];
delete p.dependencies['jsonwebtoken'];
delete p.devDependencies['@types/jsonwebtoken'];
fs.writeFileSync('$DST/package.json', JSON.stringify(p, null, 2) + '\n');
"

# .env.example
cat >"$DST/.env.example" <<EOF
#----------------------------------#
#             SERVER               #
#----------------------------------#
PORT=3000
BASE_URL=http://localhost:3000
NODE_ENV=development

#----------------------------------#
#          MICROSERVICE            #
#----------------------------------#
SERVICE_NAME=${SERVICE_NAME_VAL}

#----------------------------------#
#             KAFKA                #
#----------------------------------#
KAFKA_BROKER=localhost:9092

#----------------------------------#
#             SWAGGER              #
#----------------------------------#
SWAGGER_USER=admin
SWAGGER_PASSWORD=admin

#----------------------------------#
#             SENTRY               #
#----------------------------------#
SENTRY_DSN=https://example.com/placeholder

$(printf '%s\n' "${EXTRA_ENV[@]:-}")
EOF

cat >"$DST/README.md" <<EOF
# mindlet-$NAME

Mindlet microservice (\`$SERVICE_NAME_VAL\`). NestJS + Kafka.

## Local

Copy \`.env.example\` to \`.env\`, adjust values, then:

\`\`\`bash
npm ci
npm run start:dev
\`\`\`
EOF

# E2E placeholder (avoids HTTP assumptions)
cat >"$DST/test/app.e2e-spec.ts" <<'EOF'
describe('App (e2e)', () => {
  it('placeholder', () => {
    expect(true).toBe(true);
  });
});
EOF

echo "Scaffold ready: $DST"
