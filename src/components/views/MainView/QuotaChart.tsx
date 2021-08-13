import { Paper } from "@material-ui/core";
import { Chart } from "chart.js";
import { useEffect, useState } from "react";
import { IAPIGetQuotas } from "../../../services/ApiService";

interface IProps {
  quotas: IAPIGetQuotas["quotas"]; // already filtered
  course: string;
  section: string;
}

export const QuotaChart = (props: IProps) => {
  const { quotas, course, section } = props;
  const id = `${course}_${section}`;
  const [chart, setChart] = useState<Chart | undefined>();
  console.log(quotas);

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
            backgroundColor: "blue",
            data: quotas.map((d) => {
              return { x: d.t, y: d.quota };
            }),
          },
        ],
      },
      options: {
        scales: {
          x: {
            type: "timeseries",
          },
          y: {
            beginAtZero: true,
          },
        },
      },
    });
    setChart(_chart);
  }, [quotas]);

  return (
    <Paper>
      {`${course} ${section}`}
      <canvas id={id} width={400} height={200} />
    </Paper>
  );
};
