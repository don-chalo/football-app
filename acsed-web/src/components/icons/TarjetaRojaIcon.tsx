import type { JSX } from "react";

export function TarjetaRojaIcon(props: { className?: string }): JSX.Element {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 20" aria-hidden="true" className={props.className}>
      <rect x="2" y="1" width="12" height="18" rx="2" fill="#DC2626" stroke="#7F1D1D" strokeWidth="1" />
    </svg>
  );
}
