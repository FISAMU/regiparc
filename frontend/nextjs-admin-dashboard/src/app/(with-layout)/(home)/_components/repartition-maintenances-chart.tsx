"use client";

import { compactFormat } from "@/lib/format-number";
import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

type RepartitionItem = {
  name: string;
  amount: number;
};

const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export function RepartitionMaintenancesChart({
  data,
}: {
  data: RepartitionItem[];
}) {
  const options: ApexOptions = {
    chart: {
      type: "donut",
      fontFamily: "inherit",
    },
    colors: ["#5750F1", "#5475E5", "#8099EC", "#80CAEE", "#3FD97F"],
    labels: data.map((item) => item.name),
    dataLabels: {
      enabled: false,
    },
    legend: {
      position: "bottom",
      fontFamily: "inherit",
      itemMargin: {
        horizontal: 10,
        vertical: 6,
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "78%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Maintenances",
              fontSize: "16px",
              fontWeight: "400",
            },
            value: {
              show: true,
              fontSize: "28px",
              fontWeight: "700",
              formatter: (value) => compactFormat(Number(value)),
            },
          },
        },
      },
    },
    responsive: [
      {
        breakpoint: 640,
        options: {
          chart: {
            width: "100%",
          },
        },
      },
    ],
  };

  return (
    <Chart
      options={options}
      series={data.map((item) => item.amount)}
      type="donut"
      height={320}
    />
  );
}
