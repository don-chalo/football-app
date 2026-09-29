import "dotenv/config";

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) throw new Error(`Missing env var ${name}`);
  return value;
}

export const config = {
  port: Number(process.env["PORT"] ?? 3000),
  mongoUri: process.env["MONGODB_URI"] ?? "mongodb://localhost:27017/football-api",
  jwtSecret: required("JWT_SECRET", "dev-secret-cambiar-en-produccion"),
  jwtExpiresIn: process.env["JWT_EXPIRES_IN"] ?? "12h",
  corsOrigins: (process.env["CORS_ORIGIN"] ?? "http://localhost:5173")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
};
