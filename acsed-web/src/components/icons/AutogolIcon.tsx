import type { JSX } from "react";

export function AutogolIcon(props: { className?: string }): JSX.Element {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 20" aria-hidden="true" className={props.className}>
      <circle cx="8" cy="10" r="6" fill="none" stroke="#A16207" strokeWidth="1.5" />
      <path d="M5 5 L11 15 M11 5 L5 15" stroke="#A16207" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
