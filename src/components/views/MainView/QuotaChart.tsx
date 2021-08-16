import { Paper } from "@material-ui/core";
import { Chart } from "chart.js";
import { useEffect, useState } from "react";
import { SectionQuota } from "../../../services/ApiService";

interface IProps {
  quotas: SectionQuota[]; // already filtered
  course: string;
  section: string;
  showExtra: boolean;
  sum?: boolean;
}

export const QuotaChart = (props: IProps) => {
  const { quotas, course, section } = props;
  const id = `${course}_${section}`;
  const [chart, setChart] = useState<Chart | undefined>();
  const quotaMax = Math.max(...quotas.map((q) => q.quota));

  useEffect(() => {
    const e = document.getElementById(id) as HTMLCanvasElement;

    if (!quotas) {
      console.error(`No quota data for ${id}.`);
      return;
    }
    if (!e) {
      console.error(`Unable to locate DOM element id=${id}.`);
      return;
    }
    if (chart) {
      chart.destroy();
    }

    const _chart = new Chart(e, {
      type: "line",
      data: {
        datasets: [
          {
            label: "quota",
            backgroundColor: "black",
            borderColor: "black",
            hidden: !props.showExtra,
            data: quotas.map((d) => {
              return { x: d.t * 1000, y: d.quota };
            }),
          },
          {
            label: "enrol",
            backgroundColor: "yellow",
            borderColor: "yellow",
            hidden: !props.showExtra,
            data: quotas.map((d) => {
              return { x: d.t * 1000, y: d.enrol };
            }),
          },
          {
            label: "avail",
            backgroundColor: "blue",
            borderColor: "blue",
            data: quotas.map((d) => {
              return { x: d.t * 1000, y: d.avail };
            }),
          },
          {
            label: "wait",
            backgroundColor: "red",
            borderColor: "red",
            data: quotas.map((d) => {
              return { x: d.t * 1000, y: d.wait };
            }),
          },
        ],
      },
      options: {
        elements: {
          point: {
            radius: 0,
          },
        },
        plugins: {
          title: {
            display: true,
            text: `${course} ${section}`,
          },
        },
        scales: {
          x: {
            type: "time",
            ticks: {
              display: false,
            },
          },
          y: props.sum
            ? {
                ticks: {
                  callback: (v) => {
                    return (+v / quotaMax).toLocaleString("en-GB", {
                      style: "percent",
                    });
                  },
                },
              }
            : {
                beginAtZero: true,
              },
        },
      },
    });
    setChart(_chart);
  }, [quotas]);

  return (
    <Paper>
      <canvas id={id} width={400} height={200} />
    </Paper>
  );
};
