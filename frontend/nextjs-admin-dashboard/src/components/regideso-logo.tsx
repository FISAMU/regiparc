import Image from "next/image";

type RegidesoLogoProps = {
  width?: number;
  height?: number;
  className?: string;
};

export function RegidesoLogo({
  width = 40,
  height = 40,
  className = "object-contain brightness-0 invert",
}: RegidesoLogoProps) {
  return (
    <Image
      src="/logo-regideso.png"
      width={width}
      height={height}
      alt="Regideso"
      className={className}
      priority
    />
  );
}
