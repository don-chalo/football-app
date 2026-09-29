import mongoose from "mongoose";
import { config } from "./config";
import { UserModel } from "./models/user.model";
import { LigaModel } from "./models/liga.model";
import { MongooseAsignacionesRepo } from "./repositories/asignaciones.repository";

/**
 * Backfill idempotente: asigna cada admin_partidos a todas las ligas.
 * Seguro de re-ejecutar (salta asignaciones existentes).
 */
async function main(): Promise<void> {
  await mongoose.connect(config.mongoUri);
  const asignaciones = new MongooseAsignacionesRepo();

  const admins = await UserModel.find({ role: "admin_partidos" }).lean();
  const ligas = await LigaModel.find().lean();
  let creadas = 0;
  let existentes = 0;
  for (const a of admins) {
    for (const l of ligas) {
      const userId = String(a._id);
      const ligaId = String(l._id);
      if (await asignaciones.exists(userId, ligaId)) {
        existentes += 1;
      } else {
        await asignaciones.create(userId, ligaId);
        creadas += 1;
      }
    }
  }
  console.log(JSON.stringify({ admins: admins.length, ligas: ligas.length, creadas, existentes }));
  await mongoose.disconnect();
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
