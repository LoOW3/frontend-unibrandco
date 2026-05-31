interface AppEnv {
  cognitoUserPoolId: string;
  cognitoClientId: string;
  awsRegion: string;
  adminApiBaseUrl: string;
}

function requireEnv(name: keyof ImportMetaEnv): string {
  const value = import.meta.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const env: AppEnv = {
  cognitoUserPoolId: requireEnv('VITE_COGNITO_USER_POOL_ID'),
  cognitoClientId: requireEnv('VITE_COGNITO_CLIENT_ID'),
  awsRegion: import.meta.env.VITE_AWS_REGION ?? 'us-east-1',
  adminApiBaseUrl: requireEnv('VITE_ADMIN_API_BASE_URL').replace(/\/+$/, ''),
};
