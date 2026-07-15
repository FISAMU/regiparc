import { RegidesoLogo } from "./regideso-logo";

export function Logo() {
  return (
    <div className="relative flex h-12 max-w-[12rem] items-center">
      <RegidesoLogo width={150} height={48} className="object-contain brightness-0 invert" />
    </div>
  );
}
