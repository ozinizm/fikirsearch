import { z } from 'zod';

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),
    NEXTAUTH_SECRET: z.string().min(1, 'NEXTAUTH_SECRET is required'),
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
    GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required'),
    GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET is required'),
    ALLOWED_EMAILS: z.string().min(1, 'ALLOWED_EMAILS must include at least one email address'),
    GOOGLE_MAPS_API_KEY: z.string().min(1, 'GOOGLE_MAPS_API_KEY is required'),
  })
  .transform((env) => ({
    ...env,
  }));

const parsed = envSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  DATABASE_URL: process.env.DATABASE_URL,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  ALLOWED_EMAILS: process.env.ALLOWED_EMAILS,
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
});

if (!parsed.success) {
  const formatted = parsed.error.format();
  const issues = Object.entries(formatted)
    .filter((entry): entry is [string, { _errors: string[] }] => Array.isArray(entry[1]?._errors) && entry[1]!._errors.length > 0)
    .map(([key, value]) => `${key}: ${value._errors.join(', ')}`)
    .join('\n');

  throw new Error(`❌ Invalid environment variables:\n${issues}`);
}

export const env = parsed.data;
