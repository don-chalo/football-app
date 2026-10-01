import type { ButtonHTMLAttributes, InputHTMLAttributes, JSX, ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { mensajeError } from "../api/client";
import { CaretLeftIcon } from "@radix-ui/react-icons";

export function Button(props: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" }): JSX.Element {
  const { variant = "primary", className = "", ...rest } = props;
  const base =
    "min-h-11 px-4 rounded-lg font-medium disabled:opacity-50 active:scale-[0.98] transition flex items-center justify-center gap-2";
  const styles =
    variant === "primary"
      ? "bg-neutral-800 text-white"
      : variant === "danger"
        ? "bg-red-700 text-white"
        : "bg-transparent text-stone-700";
  return <button className={`${base} ${styles} ${className}`} {...rest} />;
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>): JSX.Element {
  const { className = "", ...rest } = props;
  return <input className={`min-h-11 w-full px-3 rounded-lg border border-stone-300 bg-white ${className}`} {...rest} />;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }): JSX.Element {
  return <div className={`bg-neutral-100 rounded-xl border border-neutral-200 p-4 ${className}`}>{children}</div>;
}

export function Title({ children  }: { children: ReactNode }): JSX.Element {
  return (
    <div className="flex items-center gap-x-2">
      <CaretLeftIcon className="w-10 h-10 text-neutral-500 cursor-pointer" onClick={() => { window.history.back(); }} />
      <div className="flex items-center justify-between gap-x-2">
        {children}
      </div>
    </div>
  );
}

export function Badge({ children }: { children: ReactNode }): JSX.Element {
  return (
    <span className="inline-block text-xs px-2 py-1 rounded-full bg-neutral-200 text-neutral-700">{children}</span>
  );
}

export function Loading({ texto = "Cargando..." }: { texto?: string }): JSX.Element {
  return <p className="py-8 text-center text-neutral-500">{texto}</p>;
}

export function ErrorMsg({ error, onRetry }: { error: unknown; onRetry?: () => void }): JSX.Element {
  return (
    <div className="py-4 text-center">
      <p className="text-red-700">{mensajeError(error)}</p>
      {onRetry ? (
        <button className="mt-2 underline text-neutral-700 min-h-11" onClick={onRetry} type="button">
          Reintentar
        </button>
      ) : null}
    </div>
  );
}

export function Empty({ texto }: { texto: string }): JSX.Element {
  return <p className="py-8 text-center text-neutral-500">{texto}</p>;
}

export function ActorLine({ createdBy, createdAt }: { createdBy: { username: string } | null; createdAt: string | null }): JSX.Element {
  if (!createdBy) return <span className="text-neutral-400">sin registro</span>;
  const fecha = createdAt ? new Date(createdAt).toLocaleString("es") : "";
  return (
    <span className="text-xs text-neutral-500">
      {createdBy.username}
      {fecha ? ` · ${fecha}` : ""}
    </span>
  );
}

/** Bottom sheet móvil sobre Radix Dialog. */
export function Sheet({
  open,
  onOpenChange,
  title,
  children,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  children: ReactNode;
}): JSX.Element {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed bottom-0 left-0 right-0 mx-auto max-w-2xl bg-white rounded-t-2xl p-4 pb-8 max-h-[80vh] overflow-y-auto"
        >
          <Dialog.Title className="font-bold text-lg mb-3">{title}</Dialog.Title>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** Toast inferior simple con acción. */
export function Toast({ texto, accionTxt, onAccion }: { texto: string; accionTxt: string; onAccion: () => void }): JSX.Element {
  return (
    <div className="fixed bottom-4 left-3 right-3 mx-auto max-w-2xl bg-stone-900 text-white rounded-xl px-4 py-3 flex items-center justify-between gap-3">
      <span>{texto}</span>
      <button type="button" onClick={onAccion} className="font-bold underline min-h-11 px-2">
        {accionTxt}
      </button>
    </div>
  );
}
