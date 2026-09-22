import { z } from "zod";
import { existsSync } from "node:fs";

if (existsSync(".env")) {
  process.loadEnvFile();
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(8000),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID must be a non-empty string').optional(),
  GOOGLE_CLIENT_SECRET: z
    .string()
    .min(1, 'GOOGLE_CLIENT_SECRET must be a non-empty string')
    .optional(),

  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL must be a non-empty string")
    .refine(
      (v) => v.startsWith("postgresql://"),
      "DATABASE_URL must start with postgresql://",
    ),
})
.superRefine((value, ctx) => {
    if (
      (value.GOOGLE_CLIENT_ID && !value.GOOGLE_CLIENT_SECRET) ||
      (!value.GOOGLE_CLIENT_ID && value.GOOGLE_CLIENT_SECRET)
    ) {
      ctx.addIssue({
        code: "custom",
        message: 'GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be provided together',
        path: ['GOOGLE_CLIENT_ID'],
      });
    }
  });;

function loadEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("Invalid or missing environment variables:\n");
    for (const issue of result.error.issues) {
      console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
    }
    console.error("\nCheck your .env file (see .env.example) and try again.");
    process.exit(1);
  }

  return result.data;
}

export const env = loadEnv();
export type Env = typeof env;