import { ArrowDownIcon, ArrowUpIcon } from "@/assets/icons";
import { cn } from "@/lib/utils";
import type { JSX, SVGProps } from "react";

type PropsType = {
  label: string;
  data: {
    value: number | string;
    growthRate: number;
  };
  Icon: (props: SVGProps<SVGSVGElement>) => JSX.Element;
};

export function OverviewCard({ label, data, Icon }: PropsType) {
  const isDecreasing = data.growthRate < 0;
  const isFlat = data.growthRate === 0;
  const signedRate = `${data.growthRate > 0 ? "+" : ""}${data.growthRate}%`;

  return (
    <div className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark">
      <Icon />

      <div className="mt-6 flex items-end justify-between">
        <dl>
          <dt className="mb-1.5 text-heading-6 font-bold text-dark dark:text-white">
            {data.value}
          </dt>

          <dd className="text-sm font-medium text-dark-6">{label}</dd>
        </dl>

        <dl
          className={cn(
            "text-sm font-medium",
            isFlat ? "text-dark-5" : isDecreasing ? "text-red" : "text-green",
          )}
          title="Variation des créations vs les 30 jours précédents"
        >
          <dt className="flex items-center gap-1.5">
            {signedRate}
            {!isFlat &&
              (isDecreasing ? (
                <ArrowDownIcon aria-hidden />
              ) : (
                <ArrowUpIcon aria-hidden />
              ))}
          </dt>

          <dd className="sr-only">
            {label}{" "}
            {isFlat
              ? "stable"
              : isDecreasing
                ? "en baisse"
                : "en hausse"}{" "}
            de {Math.abs(data.growthRate)}% sur 30 jours
          </dd>
        </dl>
      </div>
    </div>
  );
}
