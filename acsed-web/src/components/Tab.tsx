import { Trigger } from "@radix-ui/react-tabs";
import type { JSX } from "react";

export type TabProps = {
  value: string;
  label: string;
  selected?: boolean;
  onClick?: () => void;
};

export function Tab({ value, label, selected, onClick }: TabProps): JSX.Element {
  const tabClass = selected ? "bg-cancha-600 text-white font-bold" : "bg-cancha-950/10 text-cancha-950";
  return (
    <Trigger className={`w-full py-2 mr-2 last-of-type:mr-0 rounded ${!selected ? "hover:bg-cancha-950/20" : ""} ${tabClass}`} value={value} onClick={onClick}>
      {label}
    </Trigger>
  );
}
