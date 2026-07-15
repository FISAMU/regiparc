"use client";

import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

type AffectationServiceItem = {
  service: string;
  affectations: number;
  employes: number;
};

const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export function AffectationsParServiceChart({
  data,
}: {
  data: AffectationServiceItem[];
}) {
  const options: ApexOptions = {
    colors: ["#5750F1", "#0ABEF9"],
    chart: {
      type: "area",
      height: 320,
      toolbar: {
        show: false,
      },
      fontFamily: "inherit",
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    fill: {
      gradient: {
        opacityFrom: 0.45,
        opacityTo: 0.05,
      },
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      position: "top",
      horizontalAlign: "left",
      fontFamily: "inherit",
    },
    grid: {
      strokeDashArray: 5,
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    xaxis: {
      categories: data.map((item) => item.service),
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        rotate: -20,
      },
    },
    yaxis: {
      min: 0,
      forceNiceScale: true,
    },
    tooltip: {
      shared: true,
      intersect: false,
    },
  };

  return (
    <div className="-ml-4 h-[320px]">
      <Chart
        options={options}
        series={[
          {
            name: "Affectations",
            data: data.map((item) => item.affectations),
          },
          {
            name: "Employés concernés",
            data: data.map((item) => item.employes),
          },
        ]}
        type="area"
        height={320}
      />
    </div>
  );
}
