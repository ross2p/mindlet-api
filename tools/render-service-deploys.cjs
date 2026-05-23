/**
 * Generates apps/<folder>/deploy/{base,overlays/dev,...} from service metadata.
 * Run from mindlet-api root: node tools/render-service-deploys.cjs
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const SERVICES = [
  { folder: 'auth', workload: 'auth', ingress: 'auth', envService: 'AUTH_SERVICE', hostPort: 3002, pg: true, redis: true, mongo: false, minio: false, prisma: true, db: 'mindlet_auth', extraSecret: { TWO_FACTOR_ENCRYPTION_KEY: 'MTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTI=' } },
  { folder: 'user', workload: 'user', ingress: 'user', envService: 'USER_SERVICE', hostPort: 3003, pg: true, redis: false, mongo: false, minio: false, prisma: true, db: 'mindlet_user' },
  { folder: 'subscription', workload: 'subscription', ingress: 'subscription', envService: 'SUBSCRIPTION_SERVICE', hostPort: 3005, pg: false, redis: false, mongo: false, minio: false, prisma: false, db: null },
  { folder: 'payment', workload: 'payment', ingress: 'payment', envService: 'PAYMENT_SERVICE', hostPort: 3006, pg: false, redis: false, mongo: false, minio: false, prisma: false, db: null, paymentMinimal: true },
  { folder: 'notification', workload: 'notification', ingress: 'notification', envService: 'NOTIFICATION_SERVICE', hostPort: 3007, pg: false, redis: false, mongo: false, minio: false, prisma: false, db: null },
  { folder: 'course', workload: 'course', ingress: 'course', envService: 'COURSE_SERVICE', hostPort: 3008, pg: true, redis: false, mongo: false, minio: false, prisma: true, db: 'mindlet_course' },
  { folder: 'ai', workload: 'ai', ingress: 'ai', envService: 'AI_SERVICE', hostPort: 3009, pg: false, redis: false, mongo: false, minio: false, prisma: false, db: null, extraSecret: { OPENAI_API_KEY: '' } },
  { folder: 'team', workload: 'team', ingress: 'team', envService: 'TEAM_SERVICE', hostPort: 3010, pg: true, redis: false, mongo: false, minio: false, prisma: true, db: 'mindlet_team' },
  { folder: 'lesson', workload: 'lesson', ingress: 'lesson', envService: 'LESSON_SERVICE', hostPort: 3011, pg: true, redis: false, mongo: false, minio: false, prisma: true, db: 'mindlet_lesson' },
  { folder: 'analytics', workload: 'analytics', ingress: 'analytics', envService: 'ANALYTICS_SERVICE', hostPort: 3012, pg: false, redis: false, mongo: false, minio: false, prisma: false, db: null },
  { folder: 'deck', workload: 'deck', ingress: 'deck', envService: 'DECK_SERVICE', hostPort: 3013, pg: true, redis: false, mongo: false, minio: false, prisma: true, db: 'mindlet_deck' },
  { folder: 'test', workload: 'test', ingress: 'test', envService: 'TEST_SERVICE', hostPort: 3014, pg: true, redis: false, mongo: false, minio: false, prisma: true, db: 'mindlet_test' },
  { folder: 'storage', workload: 'storage-api', ingress: 'storage', envService: 'STORAGE_SERVICE', hostPort: 3015, pg: false, redis: false, mongo: false, minio: true, prisma: false, db: null, storageApi: true },
];

function write(rel, content) {
  const full = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content.replace(/\n{3,}/g, '\n\n').trimEnd() + '\n');
}

function postgresYaml(s) {
  const p = `${s.workload}-postgres`;
  return `apiVersion: v1
kind: Secret
metadata:
  name: ${p}-credentials
  namespace: mindlet
  labels:
    mindlet.io/workload: ${s.workload}
    app.kubernetes.io/part-of: mindlet
type: Opaque
stringData:
  POSTGRES_USER: mindlet
  POSTGRES_PASSWORD: mindlet
  POSTGRES_DB: ${s.db}
---
apiVersion: v1
kind: Service
metadata:
  name: ${p}
  namespace: mindlet
  labels:
    mindlet.io/workload: ${s.workload}
    app.kubernetes.io/part-of: mindlet
spec:
  clusterIP: None
  ports:
    - port: 5432
      targetPort: 5432
      name: postgres
  selector:
    app.kubernetes.io/component: postgres
    mindlet.io/workload: ${s.workload}
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: ${p}
  namespace: mindlet
  labels:
    mindlet.io/workload: ${s.workload}
    app.kubernetes.io/part-of: mindlet
spec:
  serviceName: ${p}
  replicas: 1
  selector:
    matchLabels:
      app.kubernetes.io/component: postgres
      mindlet.io/workload: ${s.workload}
  template:
    metadata:
      labels:
        app.kubernetes.io/component: postgres
        mindlet.io/workload: ${s.workload}
        app.kubernetes.io/part-of: mindlet
    spec:
      containers:
        - name: postgres
          image: postgres:16-alpine
          ports:
            - containerPort: 5432
          envFrom:
            - secretRef:
                name: ${p}-credentials
          volumeMounts:
            - name: data
              mountPath: /var/lib/postgresql/data
              subPath: pgdata
          resources:
            requests:
              cpu: 100m
              memory: 256Mi
            limits:
              cpu: "1"
              memory: 512Mi
  volumeClaimTemplates:
    - metadata:
        name: data
      spec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 5Gi`;
}

function redisYaml(s) {
  const r = `${s.workload}-redis`;
  return `apiVersion: v1
kind: Service
metadata:
  name: ${r}
  namespace: mindlet
  labels:
    mindlet.io/workload: ${s.workload}
    app.kubernetes.io/part-of: mindlet
spec:
  ports:
    - port: 6379
      targetPort: 6379
  selector:
    app.kubernetes.io/component: redis
    mindlet.io/workload: ${s.workload}
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${r}
  namespace: mindlet
  labels:
    mindlet.io/workload: ${s.workload}
    app.kubernetes.io/part-of: mindlet
spec:
  replicas: 1
  selector:
    matchLabels:
      app.kubernetes.io/component: redis
      mindlet.io/workload: ${s.workload}
  template:
    metadata:
      labels:
        app.kubernetes.io/component: redis
        mindlet.io/workload: ${s.workload}
        app.kubernetes.io/part-of: mindlet
    spec:
      containers:
        - name: redis
          image: redis:7-alpine
          args: ["redis-server", "--save", "", "--appendonly", "no"]
          ports:
            - containerPort: 6379
          resources:
            requests:
              cpu: 50m
              memory: 64Mi
            limits:
              cpu: 500m
              memory: 256Mi`;
}

function mongoYaml(s) {
  const m = `${s.workload}-mongo`;
  const db = s.mongoDb || 'mindlet';
  return `apiVersion: v1
kind: Service
metadata:
  name: ${m}
  namespace: mindlet
  labels:
    mindlet.io/workload: ${s.workload}
    app.kubernetes.io/part-of: mindlet
spec:
  clusterIP: None
  ports:
    - port: 27017
      targetPort: 27017
      name: mongo
  selector:
    app.kubernetes.io/component: mongo
    mindlet.io/workload: ${s.workload}
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: ${m}
  namespace: mindlet
  labels:
    mindlet.io/workload: ${s.workload}
    app.kubernetes.io/part-of: mindlet
spec:
  serviceName: ${m}
  replicas: 1
  selector:
    matchLabels:
      app.kubernetes.io/component: mongo
      mindlet.io/workload: ${s.workload}
  template:
    metadata:
      labels:
        app.kubernetes.io/component: mongo
        mindlet.io/workload: ${s.workload}
        app.kubernetes.io/part-of: mindlet
    spec:
      containers:
        - name: mongo
          image: mongo:7
          ports:
            - containerPort: 27017
          env:
            - name: MONGO_INITDB_DATABASE
              value: "${db}"
          volumeMounts:
            - name: data
              mountPath: /data/db
          resources:
            requests:
              cpu: 100m
              memory: 512Mi
            limits:
              cpu: "1"
              memory: 1Gi
  volumeClaimTemplates:
    - metadata:
        name: data
      spec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 5Gi`;
}

function minioYaml(s) {
  const m = `${s.workload}-minio`;
  return `apiVersion: v1
kind: Secret
metadata:
  name: ${m}-credentials
  namespace: mindlet
  labels:
    mindlet.io/workload: ${s.workload}
    app.kubernetes.io/part-of: mindlet
type: Opaque
stringData:
  MINIO_ROOT_USER: minioadmin
  MINIO_ROOT_PASSWORD: minioadmin
---
apiVersion: v1
kind: Service
metadata:
  name: ${m}
  namespace: mindlet
  labels:
    mindlet.io/workload: ${s.workload}
    app.kubernetes.io/part-of: mindlet
spec:
  ports:
    - port: 9000
      name: api
      targetPort: 9000
    - port: 9001
      name: console
      targetPort: 9001
  selector:
    app.kubernetes.io/component: minio
    mindlet.io/workload: ${s.workload}
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: ${m}
  namespace: mindlet
  labels:
    mindlet.io/workload: ${s.workload}
    app.kubernetes.io/part-of: mindlet
spec:
  serviceName: ${m}
  replicas: 1
  selector:
    matchLabels:
      app.kubernetes.io/component: minio
      mindlet.io/workload: ${s.workload}
  template:
    metadata:
      labels:
        app.kubernetes.io/component: minio
        mindlet.io/workload: ${s.workload}
        app.kubernetes.io/part-of: mindlet
    spec:
      containers:
        - name: minio
          image: minio/minio:latest
          args: ["server", "/data", "--console-address", ":9001"]
          ports:
            - containerPort: 9000
            - containerPort: 9001
          envFrom:
            - secretRef:
                name: ${m}-credentials
          volumeMounts:
            - name: data
              mountPath: /data
          resources:
            requests:
              cpu: 100m
              memory: 256Mi
            limits:
              cpu: "1"
              memory: 1Gi
  volumeClaimTemplates:
    - metadata:
        name: data
      spec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 5Gi`;
}

function secretStringData(s) {
  const lines = [];
  lines.push(`  SWAGGER_USER: admin`);
  lines.push(`  SWAGGER_PASSWORD: admin`);
  lines.push(`  SENTRY_DSN: https://example.com/placeholder`);
  if (s.pg && s.db) {
    lines.push(`  DATABASE_URL: postgresql://mindlet:mindlet@${s.workload}-postgres:5432/${s.db}`);
  }
  if (s.redis) {
    lines.push(`  REDIS_URL: redis://${s.workload}-redis:6379/0`);
  }
  if (s.mongo) {
    const db = s.mongoDb || 'mindlet';
    lines.push(`  MONGODB_URI: mongodb://${s.workload}-mongo:27017/${db}`);
  }
  if (s.storageApi) {
    lines.push(`  STORAGE_ENDPOINT: http://${s.workload}-minio:9000`);
    lines.push(`  STORAGE_PUBLIC_URL: http://mindlet.localtest.me:9000`);
    lines.push(`  STORAGE_REGION: us-east-1`);
    lines.push(`  STORAGE_ACCESS_KEY: minioadmin`);
    lines.push(`  STORAGE_SECRET_KEY: minioadmin`);
  }
  if (s.extraSecret) {
    for (const [k, v] of Object.entries(s.extraSecret)) {
      lines.push(`  ${k}: ${String(v).replace(/\n/g, '\\n')}`);
    }
  }
  return lines.join('\n');
}

function deploymentYaml(s) {
  const deps = [];
  if (s.pg) deps.push({ name: 'wait-postgres', image: 'postgres:16-alpine', command: ['sh', '-c', `until pg_isready -h ${s.workload}-postgres -U mindlet; do sleep 2; done`] });
  if (s.redis) deps.push({ name: 'wait-redis', image: 'redis:7-alpine', command: ['sh', '-c', `until redis-cli -h ${s.workload}-redis ping; do sleep 2; done`] });
  if (s.mongo) deps.push({ name: 'wait-mongo', image: 'mongo:7', command: ['sh', '-c', `until mongosh --host ${s.workload}-mongo --eval "db.adminCommand('ping')" --quiet; do sleep 2; done`] });
  if (s.minio) deps.push({ name: 'wait-minio', image: 'curlimages/curl:8.5.0', command: ['sh', '-c', `until curl -sf http://${s.workload}-minio:9000/minio/health/live; do sleep 2; done`] });

  const initContainers = deps
    .map(
      (d) => `        - name: ${d.name}
          image: ${d.image}
          command: ${JSON.stringify(d.command)}`
    )
    .join('\n');

  const initBlock =
    deps.length > 0
      ? `
      initContainers:
${initContainers}`
      : '';

  const envFrom = [
    `            - configMapRef:
                name: platform-config`,
    `            - configMapRef:
                name: ${s.workload}-config`,
  ];
  if (!s.paymentMinimal) {
    envFrom.push(`            - secretRef:
                name: ${s.workload}-secret`);
  }

  const probes = s.paymentMinimal
    ? `          livenessProbe:
            tcpSocket:
              port: http
            initialDelaySeconds: 20
            periodSeconds: 15
          readinessProbe:
            tcpSocket:
              port: http
            initialDelaySeconds: 10
            periodSeconds: 10`
    : `          livenessProbe:
            tcpSocket:
              port: http
            initialDelaySeconds: 30
            periodSeconds: 20
          readinessProbe:
            tcpSocket:
              port: http
            initialDelaySeconds: 20
            periodSeconds: 10`;

  return `apiVersion: v1
kind: ServiceAccount
metadata:
  name: ${s.workload}
  namespace: mindlet
  labels:
    app.kubernetes.io/name: ${s.workload}
    app.kubernetes.io/part-of: mindlet
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${s.workload}
  namespace: mindlet
  labels:
    app.kubernetes.io/name: ${s.workload}
    app.kubernetes.io/part-of: mindlet
    mindlet.io/network-policy: default-deny-ingress
spec:
  replicas: 1
  selector:
    matchLabels:
      app.kubernetes.io/name: ${s.workload}
  template:
    metadata:
      labels:
        app.kubernetes.io/name: ${s.workload}
        app.kubernetes.io/part-of: mindlet
        mindlet.io/network-policy: default-deny-ingress
    spec:
      serviceAccountName: ${s.workload}${initBlock}
      terminationGracePeriodSeconds: 30
      containers:
        - name: app
          image: mindlet-${s.folder}:dev
          imagePullPolicy: IfNotPresent
          ports:
            - name: http
              containerPort: 3000
          envFrom:
${envFrom.join('\n')}
          resources:
            requests:
              cpu: 100m
              memory: 256Mi
            limits:
              cpu: "1"
              memory: 1Gi
${probes}`;
}

function migrateJob(s) {
  if (!s.prisma) return null;
  const p = `${s.workload}-postgres`;
  return `apiVersion: batch/v1
kind: Job
metadata:
  name: ${s.workload}-migrate
  namespace: mindlet
  labels:
    app.kubernetes.io/name: ${s.workload}
    app.kubernetes.io/part-of: mindlet
  annotations:
    argocd.argoproj.io/sync-wave: "-1"
spec:
  ttlSecondsAfterFinished: 86400
  backoffLimit: 4
  template:
    spec:
      restartPolicy: OnFailure
      initContainers:
        - name: wait-postgres
          image: postgres:16-alpine
          command:
            - sh
            - -c
            - until pg_isready -h ${p} -U mindlet; do sleep 2; done
      containers:
        - name: migrate
          image: mindlet-${s.folder}:dev
          imagePullPolicy: IfNotPresent
          workingDir: /app
          command: ["npm", "run", "db:migrate:deploy"]
          envFrom:
            - secretRef:
                name: ${s.workload}-secret`;
}

function ingressYaml(s) {
  const annotations =
    s.ingress === 'storage'
      ? `    nginx.ingress.kubernetes.io/proxy-body-size: "12m"
    nginx.ingress.kubernetes.io/rewrite-target: /$2
    nginx.ingress.kubernetes.io/use-regex: "true"`
      : `    nginx.ingress.kubernetes.io/rewrite-target: /$2
    nginx.ingress.kubernetes.io/use-regex: "true"`;
  return `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ${s.workload}
  namespace: mindlet
  labels:
    app.kubernetes.io/name: ${s.workload}
    app.kubernetes.io/part-of: mindlet
  annotations:
${annotations}
spec:
  ingressClassName: nginx
  rules:
    - host: mindlet.localtest.me
      http:
        paths:
          - path: /svc/${s.ingress}(/|$)(.*)
            pathType: ImplementationSpecific
            backend:
              service:
                name: ${s.workload}
                port:
                  number: 3000`;
}

function serviceYaml(s) {
  return `apiVersion: v1
kind: Service
metadata:
  name: ${s.workload}
  namespace: mindlet
  labels:
    app.kubernetes.io/name: ${s.workload}
    app.kubernetes.io/part-of: mindlet
spec:
  selector:
    app.kubernetes.io/name: ${s.workload}
  ports:
    - name: http
      port: 3000
      targetPort: http`;
}

function configMapYaml(s) {
  if (s.paymentMinimal) {
    return `apiVersion: v1
kind: ConfigMap
metadata:
  name: ${s.workload}-config
  namespace: mindlet
  labels:
    app.kubernetes.io/name: ${s.workload}
    app.kubernetes.io/part-of: mindlet
data:
  PORT: "3000"
  NODE_ENV: development`;
  }
  return `apiVersion: v1
kind: ConfigMap
metadata:
  name: ${s.workload}-config
  namespace: mindlet
  labels:
    app.kubernetes.io/name: ${s.workload}
    app.kubernetes.io/part-of: mindlet
data:
  PORT: "3000"
  NODE_ENV: development
  SERVICE_NAME: ${s.envService}
  SWAGGER_USER: admin
  TWO_FACTOR_ISSUER: Mindlet`;
}

function secretYaml(s) {
  return `apiVersion: v1
kind: Secret
metadata:
  name: ${s.workload}-secret
  namespace: mindlet
  labels:
    app.kubernetes.io/name: ${s.workload}
    app.kubernetes.io/part-of: mindlet
type: Opaque
stringData:
${secretStringData(s)}`;
}

function networkPolicyYaml(s) {
  const egress = [
    `    - to:
        - namespaceSelector:
            matchLabels:
              kubernetes.io/metadata.name: kube-system
      ports:
        - protocol: UDP
          port: 53
        - protocol: TCP
          port: 53`,
    `    - to:
        - podSelector:
            matchLabels:
              app.kubernetes.io/name: kafka
      ports:
        - protocol: TCP
          port: 9092`,
    `    - to:
        - podSelector:
            matchLabels:
              app.kubernetes.io/name: zookeeper
      ports:
        - protocol: TCP
          port: 2181`,
    `    - to:
        - podSelector:
            matchLabels:
              app.kubernetes.io/part-of: mindlet
      ports:
        - protocol: TCP
          port: 3000`,
  ];
  if (s.pg) {
    egress.push(`    - to:
        - podSelector:
            matchLabels:
              app.kubernetes.io/component: postgres
              mindlet.io/workload: ${s.workload}
      ports:
        - protocol: TCP
          port: 5432`);
  }
  if (s.redis) {
    egress.push(`    - to:
        - podSelector:
            matchLabels:
              app.kubernetes.io/component: redis
              mindlet.io/workload: ${s.workload}
      ports:
        - protocol: TCP
          port: 6379`);
  }
  if (s.mongo) {
    egress.push(`    - to:
        - podSelector:
            matchLabels:
              app.kubernetes.io/component: mongo
              mindlet.io/workload: ${s.workload}
      ports:
        - protocol: TCP
          port: 27017`);
  }
  if (s.minio) {
    egress.push(`    - to:
        - podSelector:
            matchLabels:
              app.kubernetes.io/component: minio
              mindlet.io/workload: ${s.workload}
      ports:
        - protocol: TCP
          port: 9000`);
  }
  return `apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: ${s.workload}-allow
  namespace: mindlet
  labels:
    app.kubernetes.io/name: ${s.workload}
    app.kubernetes.io/part-of: mindlet
spec:
  podSelector:
    matchLabels:
      app.kubernetes.io/name: ${s.workload}
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              kubernetes.io/metadata.name: ingress-nginx
      ports:
        - protocol: TCP
          port: 3000
  egress:
${egress.join('\n')}`;
}

function hpaYaml(s) {
  if (s.paymentMinimal) return null;
  return `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ${s.workload}
  namespace: mindlet
  labels:
    app.kubernetes.io/name: ${s.workload}
    app.kubernetes.io/part-of: mindlet
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ${s.workload}
  minReplicas: 1
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70`;
}

function pdbYaml(s) {
  return `apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: ${s.workload}
  namespace: mindlet
  labels:
    app.kubernetes.io/name: ${s.workload}
    app.kubernetes.io/part-of: mindlet
spec:
  minAvailable: 0
  selector:
    matchLabels:
      app.kubernetes.io/name: ${s.workload}`;
}

function contracts(s) {
  return `# Placeholder — replace with real AsyncAPI when events are formalized.
asyncapi: 3.0.0
info:
  title: ${s.workload} events
  version: 0.0.1
channels: {}
`;
}

function openapi(s) {
  return `openapi: 3.0.3
info:
  title: ${s.workload} HTTP API
  version: 0.0.1
paths: {}
`;
}

function composeFragment(s) {
  const prefix = s.folder;
  const serviceName = `${prefix}-service`;
  const dbName = `${prefix}-db`;
  const cacheName = `${prefix}-cache`;
  const migratorName = `${prefix}-migrator`;
  const minioName = `${prefix}-minio`;
  const dbHostname = `${prefix}_db`;
  const cacheHostname = `${prefix}_cache`;
  const minioHostname = `${prefix}_minio`;
  const volDb = `${prefix}_db_data`;
  const volCache = `${prefix}_cache_data`;
  const volMinio = `${prefix}_storage_data`;

  const blocks = [];
  const volumes = [];
  const serviceDepends = [];
  const envLines = [];

  if (s.pg) {
    blocks.push(`  ${dbName}:
    image: postgres:17
    hostname: ${dbHostname}
    ports:
      - "\${DATABASE_PORT:-5432}:5432"
    environment:
      POSTGRES_USER: \${DATABASE_USERNAME}
      POSTGRES_PASSWORD: \${DATABASE_PASSWORD}
      POSTGRES_DB: \${DATABASE_NAME}
      PGDATA: /var/lib/postgresql/data/pgdata
    env_file:
      - ./.env
    volumes:
      - ${volDb}:/var/lib/postgresql/data
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \${DATABASE_USERNAME} -d \${DATABASE_NAME}"]
      interval: 10s
      timeout: 5s
      retries: 5`);
    volumes.push(`  ${volDb}:`);
    serviceDepends.push(`      ${dbName}:\n        condition: service_healthy`);
    envLines.push(
      `      DATABASE_HOST: ${dbHostname}`,
      '      DATABASE_PORT: 5432',
      `      DATABASE_URL: postgresql://\${DATABASE_USERNAME}:\${DATABASE_PASSWORD}@${dbHostname}:5432/\${DATABASE_NAME}?schema=public`
    );
  }

  if (s.redis) {
    blocks.push(`  ${cacheName}:
    image: redis:7-alpine
    hostname: ${cacheHostname}
    ports:
      - "\${REDIS_PORT:-6379}:6379"
    volumes:
      - ${volCache}:/data
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5`);
    volumes.push(`  ${volCache}:`);
    serviceDepends.push(`      ${cacheName}:\n        condition: service_healthy`);
    envLines.push(
      `      REDIS_HOST: ${cacheHostname}`,
      '      REDIS_PORT: 6379',
      `      REDIS_URL: redis://${cacheHostname}:6379`
    );
  }

  if (s.minio) {
    blocks.push(`  ${minioName}:
    image: minio/minio:latest
    hostname: ${minioHostname}
    command: server /data --console-address ":9001"
    ports:
      - "\${STORAGE_PORT:-9000}:9000"
      - "\${STORAGE_CONSOLE_PORT:-9001}:9001"
    environment:
      MINIO_ROOT_USER: \${STORAGE_ROOT_USER}
      MINIO_ROOT_PASSWORD: \${STORAGE_ROOT_PASSWORD}
    env_file:
      - ./.env
    volumes:
      - ${volMinio}:/data
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 10s
      timeout: 5s
      retries: 5`);
    volumes.push(`  ${volMinio}:`);
    serviceDepends.push(`      ${minioName}:\n        condition: service_healthy`);
    envLines.push(
      `      STORAGE_ENDPOINT: http://${minioName}:9000`,
      '      STORAGE_PUBLIC_URL: ${STORAGE_PUBLIC_URL:-http://localhost:9000}',
      '      STORAGE_REGION: ${STORAGE_REGION:-us-east-1}',
      '      STORAGE_ACCESS_KEY: ${STORAGE_ROOT_USER}',
      '      STORAGE_SECRET_KEY: ${STORAGE_ROOT_PASSWORD}'
    );
  }

  if (s.prisma && s.pg) {
    blocks.push(`  ${migratorName}:
    build:
      context: .
      dockerfile: Dockerfile
      target: builder
    command: npx prisma migrate deploy
    env_file:
      - ./.env
    environment:
      DATABASE_URL: postgresql://\${DATABASE_USERNAME}:\${DATABASE_PASSWORD}@${dbHostname}:5432/\${DATABASE_NAME}?schema=public
    depends_on:
      ${dbName}:
        condition: service_healthy
    networks:
      - app-network`);
  }

  const dependsBlock =
    serviceDepends.length > 0 ? `\n    depends_on:\n${serviceDepends.join('\n')}` : '';

  const environmentBlock =
    envLines.length > 0 ? `\n    environment:\n${envLines.join('\n')}` : '';

  blocks.push(`  ${serviceName}:
    build:
      dockerfile: Dockerfile
    hostname: ${serviceName}
    ports:
      - "\${BACKEND_PORT:-${s.hostPort}}:3000"
    env_file:
      - ./.env${environmentBlock}${dependsBlock}
    networks:
      - app-network
    command: npm run start:prod
    restart: unless-stopped`);

  const volumesBlock =
    volumes.length > 0
      ? `\n\nvolumes:\n${volumes.join('\n')}`
      : '';

  return `version: "3.8"

services:
${blocks.join('\n\n')}

networks:
  app-network:
    driver: bridge${volumesBlock}
`;
}

for (const s of SERVICES) {
  const base = `apps/${s.folder}/deploy/base`;
  const resources = [
    'deployment.yaml',
    'service.yaml',
    'ingress.yaml',
    'configmap.yaml',
  ];
  if (!s.paymentMinimal) resources.push('secret.yaml');
  resources.push('networkpolicy.yaml', 'pdb.yaml');
  if (!s.paymentMinimal) resources.push('hpa.yaml');
  if (s.pg) resources.push('postgres.yaml');
  if (s.redis) resources.push('redis.yaml');
  if (s.mongo) resources.push('mongo.yaml');
  if (s.minio) resources.push('minio.yaml');
  const mj = migrateJob(s);
  if (mj) {
    write(`${base}/migrate-job.yaml`, mj);
    resources.push('migrate-job.yaml');
  }

  write(`${base}/deployment.yaml`, deploymentYaml(s));
  write(`${base}/service.yaml`, serviceYaml(s));
  write(`${base}/ingress.yaml`, ingressYaml(s));
  write(`${base}/configmap.yaml`, configMapYaml(s));
  if (!s.paymentMinimal) {
    write(`${base}/secret.yaml`, secretYaml(s));
  }
  write(`${base}/networkpolicy.yaml`, networkPolicyYaml(s));
  write(`${base}/pdb.yaml`, pdbYaml(s));
  const hpa = hpaYaml(s);
  if (hpa) write(`${base}/hpa.yaml`, hpa);
  if (s.pg) write(`${base}/postgres.yaml`, postgresYaml(s));
  if (s.redis) write(`${base}/redis.yaml`, redisYaml(s));
  if (s.mongo) write(`${base}/mongo.yaml`, mongoYaml(s));
  if (s.minio) write(`${base}/minio.yaml`, minioYaml(s));

  const kustom = `apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
namespace: mindlet
resources:
${resources.map((r) => `  - ${r}`).join('\n')}
`;
  write(`${base}/kustomization.yaml`, kustom);

  write(
    `apps/${s.folder}/deploy/overlays/dev/kustomization.yaml`,
    `apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - ../../base
images:
  - name: mindlet-${s.folder}
    newTag: dev
`
  );

  write(`apps/${s.folder}/deploy/overlays/staging/.gitkeep`, '');
  write(`apps/${s.folder}/deploy/overlays/prod/.gitkeep`, '');
  const ev = `apps/${s.folder}/contracts/events.asyncapi.yaml`;
  const api = `apps/${s.folder}/contracts/rest.openapi.yaml`;
  if (!fs.existsSync(path.join(ROOT, ev))) write(ev, contracts(s));
  if (!fs.existsSync(path.join(ROOT, api))) write(api, openapi(s));
  write(`apps/${s.folder}/compose.yaml`, composeFragment(s));
}

const platformCompose = `services:
  zookeeper:
    image: confluentinc/cp-zookeeper:7.2.15
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000
    healthcheck:
      test: ["CMD", "bash", "-c", "nc -z localhost 2181"]
      interval: 10s
      timeout: 5s
      retries: 5

  kafka:
    image: confluentinc/cp-kafka:7.5.0
    depends_on:
      zookeeper:
        condition: service_healthy
    ports:
      - "9092:9092"
      - "29092:29092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_LISTENERS: PLAINTEXT://0.0.0.0:29092,PLAINTEXT_HOST://0.0.0.0:9092
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:29092,PLAINTEXT_HOST://localhost:9092
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT
      KAFKA_INTER_BROKER_LISTENER_NAME: PLAINTEXT
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
    healthcheck:
      test: ["CMD", "bash", "-c", "nc -z localhost 9092"]
      interval: 10s
      timeout: 5s
      retries: 10

  kafka-ui:
    image: provectuslabs/kafka-ui:latest
    ports:
      - "3000:8080"
    environment:
      KAFKA_CLUSTERS_0_NAME: local
      KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS: kafka:29092
    depends_on:
      kafka:
        condition: service_healthy
`;

write('infra/platform/compose.yaml', platformCompose);

const includeLines = ['  - path: infra/platform/compose.yaml'];
for (const s of SERVICES) {
  includeLines.push(`  - path: apps/${s.folder}/compose.yaml`);
}
write(
  'docker-compose.yml',
  `# Mindlet local stack — paths are relative to this file.
# Regenerate per-service fragments: node tools/render-service-deploys.cjs
include:
${includeLines.join('\n')}
`
);

console.log('Rendered deploy manifests for', SERVICES.length, 'services.');
