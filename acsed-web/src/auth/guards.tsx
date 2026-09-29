import type { JSX, ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useSession } from "../auth/Session";

/** Solo sesión iniciada (cualquier admin). */
export function RequireAdmin({ children }: { children: ReactNode }): JSX.Element {
  const { user } = useSession();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

/** Solo admin_usuarios (sistema). */
export function RequireSistema({ children }: { children: ReactNode }): JSX.Element {
  const { user, esSistema } = useSession();
  if (!user) return <Navigate to="/login" replace />;
  if (!esSistema) return <Navigate to="/admin" replace />;
  return <>{children}</>;
}
