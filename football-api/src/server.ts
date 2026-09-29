import mongoose from "mongoose";
import { createApp } from "./app";
import { config } from "./config";

async function main(): Promise<void> {
  await mongoose.connect(config.mongoUri);
  console.log("MongoDB conectado");
  const app = createApp();
  app.listen(config.port, () => {
    console.log(`football-api en puerto ${String(config.port)}`);
  });
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
