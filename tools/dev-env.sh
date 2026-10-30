# Shared env for running Mindlet services on the host: `source tools/dev-env.sh`
# Postgres: local server on :5432 (DATABASE_URL comes from each app's .env)
export KAFKA_BROKER=localhost:19092
export REDIS_URL=redis://localhost:6379
export AUTH_GRPC_URL=localhost:50051
export USER_GRPC_URL=localhost:50052
export COURSE_GRPC_URL=localhost:50053
export DECK_GRPC_URL=localhost:50054
export TEAM_GRPC_URL=localhost:50055
export LESSON_GRPC_URL=localhost:50056
export TEST_GRPC_URL=localhost:50057
export NOTIFICATION_GRPC_URL=localhost:50058
export STORAGE_GRPC_URL=localhost:50059
export SUBSCRIPTION_GRPC_URL=localhost:50060
