import { useState, type FormEvent, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import * as PasswordToggleField from "@radix-ui/react-password-toggle-field";
import { mensajeError } from "../api/client";
import { useSession } from "../auth/Session";
import { Button, Card, Input } from "../components/ui";
import { EyeClosedIcon, EyeOpenIcon } from "@radix-ui/react-icons";

export function LoginPage(): JSX.Element {
  const { login } = useSession();
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<unknown>(null);
  const [enviando, setEnviando] = useState(false);

  async function onSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      await login(username.trim(), password);
      nav("/admin", { replace: true });
    } catch (err) {
      setError(err);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto pt-10">
      <Card>
        <h1 className="text-xl font-bold mb-4">Ingresar</h1>
        <form onSubmit={(e) => { void onSubmit(e); }} className="flex flex-col gap-3">
          <Input aria-label="Usuario" placeholder="Usuario" value={username} onChange={(e) => { setUsername(e.target.value); }} autoComplete="username" />
          <PasswordToggleField.PasswordToggleField>
            <div className="Root grid grid-cols-6">
              <PasswordToggleField.Input
                aria-label="Contraseña"
                className="Input col-span-5 px-3 min-h-11 rounded-lg border border-cancha-950/20 bg-white"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => { setPassword(e.target.value); }}
              />
              <PasswordToggleField.Toggle className="Toggle col-span-1 flex items-center justify-center cursor-pointer">
                <PasswordToggleField.Icon
                  visible={<EyeOpenIcon />}
                  hidden={<EyeClosedIcon />}
                />
              </PasswordToggleField.Toggle>
            </div>
          </PasswordToggleField.PasswordToggleField>
          {error ? <p className="text-red-700">{mensajeError(error)}</p> : null}
          <Button disabled={enviando || !username || !password}>{enviando ? "Ingresando..." : "Ingresar"}</Button>
        </form>
      </Card>
    </div>
  );
}
