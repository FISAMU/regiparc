"use client";

import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

type MaintenanceCategorieItem = {
  categorie: string;
  preventive: number;
  curative: number;
  corrective: number;
};

const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export function MaintenancesParCategorieChart({
  data,
}: {
  data: MaintenanceCategorieItem[];
}) {
  const options: ApexOptions = {
    colors: ["#5750F1", "#0ABEF9", "#80CAEE"],
    chart: {
      type: "bar",
      stacked: true,
      height: 340,
      toolbar: {
        show: false,
      },
      fontFamily: "inherit",
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "45%",
        borderRadius: 4,
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
      categories: data.map((item) => item.categorie),
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
    <div className="-ml-3.5 mt-2">
      <Chart
        options={options}
        series={[
          {
            name: "Préventive",
            data: data.map((item) => item.preventive),
          },
          {
            name: "Curative",
            data: data.map((item) => item.curative),
          },
          {
            name: "Corrective",
            data: data.map((item) => item.corrective),
          },
        ]}
        type="bar"
        height={340}
      />
    </div>
  );
}
