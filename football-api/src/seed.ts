import mongoose from "mongoose";
import { config } from "./config";
import { defaultRepos, buildServices } from "./app";

/** Seed barrial minimo para probar el contrato (ver README). */
async function main(): Promise<void> {
  await mongoose.connect(config.mongoUri);
  const repos = defaultRepos();
  const s = buildServices(repos);

  await s.users.create({ username: "super", password: "super123", role: "admin_usuarios" });
  const plan = await s.users.create({ username: "plan", password: "plan1234", role: "admin_partidos" });
  const actorPlan = { userId: plan.id, username: plan.username, role: "admin_partidos" as const };

  const liga = await s.ligas.create({ nombre: "Apertura 2026", formato: "liga" }, actorPlan);
  const pibes = await s.equipos.create("Los Pibes");
  const catorce = await s.equipos.create("La 14");
  const juan = await s.jugadores.create("Juan Perez");
  const pedro = await s.jugadores.create("Pedro Gomez");

  const partido = await s.partidos.create({
    ligaId: liga.id,
    localId: pibes.id,
    visitaId: catorce.id,
    fecha: new Date().toISOString(),
    fase: "fecha 1",
  }, actorPlan);
  await s.convocatorias.convocar(partido.id, juan.id, pibes.id, actorPlan);
  await s.convocatorias.convocar(partido.id, pedro.id, catorce.id, actorPlan);
  await s.partidos.cambiarEstado(partido.id, "en_juego");
  await s.eventos.registrar(partido.id, { jugadorId: juan.id, equipoId: pibes.id, tipo: "gol" }, actorPlan);
  await s.eventos.registrar(partido.id, { jugadorId: pedro.id, equipoId: catorce.id, tipo: "penal" }, actorPlan);
  await s.partidos.cambiarEstado(partido.id, "finalizado");

  console.log(JSON.stringify({ liga: liga.id, partido: partido.id }, null, 2));
  await mongoose.disconnect();
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
