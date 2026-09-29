/** Clave de unicidad case-insensitive para nombres (equipos, jugadores, usernames). */
export function uniqueKey(nombre: string): string {
  return nombre.trim().toLocaleLowerCase("es");
}
