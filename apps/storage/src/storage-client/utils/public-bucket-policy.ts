export function buildPublicReadBucketPolicy(bucket: string): string {
  const resource = `arn:aws:s3:::${bucket}/*`;
  return JSON.stringify({
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Principal: { AWS: ["*"] },
        Action: ["s3:GetObject"],
        Resource: [resource],
      },
    ],
  });
}
