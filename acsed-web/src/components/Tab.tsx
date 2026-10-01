import { Trigger } from "@radix-ui/react-tabs";

export type TabProps = {
  value: string;
  label: string;
  selected?: boolean;
  onClick?: () => void;
};

export function Tab({ value, label, selected, onClick }: TabProps): JSX.Element {
  const tabClass = selected ? "bg-neutral-800" : "bg-neutral-500";
  return (
    <Trigger className={`w-full py-2 first-of-type:mr-2 last-of-type:ml-2 rounded text-neutral-300 ${!selected && 'hover:bg-neutral-600'} ${tabClass}`} value={value} onClick={onClick}>
      {label}
    </Trigger>
  );
}
