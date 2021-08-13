import {
  Box,
  Button,
  Container,
  Grid,
  TextField,
  Typography,
} from "@material-ui/core";
import { SportsKabaddi } from "@material-ui/icons";
import { useAppContext } from "../../../system/Container";
import { useSnackbar } from "notistack";
import { ApiService, IAPIGetQuotas } from "../../../services/ApiService";
import store from "store";
import { useEffect, useMemo, useState } from "react";
import { Chart, registerables } from "chart.js";
import { QuotaChart } from "./QuotaChart";
Chart.register(...registerables);

export const MainView = () => {
  const appContext = useAppContext();
  const { enqueueSnackbar } = useSnackbar();

  const courseCodes = [
    "COMP 3111",
    "COMP 3021",
    "MATH 2421",
    "MATH 2023",
    "MATH 2511",
  ];
  const [isPinged, setIsPinged] = useState(false);
  const [quotas, setQuotas] = useState<Record<string, IAPIGetQuotas["quotas"]>>(
    {}
  );

  const courseSections = useMemo(() => {
    if (!courseCodes) {
      return;
    }
    return Object.fromEntries(
      courseCodes.map((c) => {
        const sections = new Set((quotas[c] ?? []).map((s) => s.section));
        return [c, Array.from(sections)];
      })
    );
  }, [quotas]);

  useEffect(() => {
    if (!courseCodes) {
      return;
    }

    try {
      for (const code of courseCodes) {
        appContext
          .getService(ApiService)
          .getQuotas(code)
          .then((resp) => {
            resp.quotas.sort((a, b) => a.t - b.t);
            setQuotas((d) => ({ ...d, [code]: resp.quotas }));
          });
      }
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }, [appContext, enqueueSnackbar]);

  const handlePing = () => {
    appContext
      .getService(ApiService)
      .root()
      .then((v) => {
        console.log(v);
        enqueueSnackbar("PONG!", { variant: "success" });
        setIsPinged(true);
      })
      .catch((err) => enqueueSnackbar(err.message));
  };

  return (
    <Container maxWidth="md">
      <Box py={3}>
        <img
          alt="nuke"
          src="https://i.pinimg.com/originals/61/47/3d/61473dee800fdb5dd272b119a6f80fb0.png"
          width="100%"
          height={300}
          onClick={() => {
            appContext.setIsDarkTheme((p) => !p);
            enqueueSnackbar("Changed theme!", { variant: "info" });
          }}
          style={{ cursor: "pointer" }}
        />
      </Box>

      <Box py={1}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item xs={6}>
            <TextField
              onChange={(v) =>
                store.set("ustQuotaViewer:endPoint", v.target.value)
              }
              defaultValue={store.get("ustQuotaViewer:endPoint")}
              label="endpoint?"
              fullWidth
            />
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SportsKabaddi />}
              disabled={isPinged}
              onClick={handlePing}
            >
              {!isPinged ? "PING?" : "PONG!"}
            </Button>
          </Grid>
        </Grid>
      </Box>

      {courseCodes && (
        <Box>
          {courseCodes.map((course, k1) => {
            return (
              <Box py={2}>
                <Typography variant="h4">{course}</Typography>
                <Grid container spacing={2}>
                  {(courseSections ?? {})[course].map((section, k2) => {
                    return (
                      <Grid item xs={6}>
                        <QuotaChart
                          quotas={quotas[course].filter(
                            (r) => r.section === section
                          )}
                          course={course}
                          section={section}
                          key={`${k1}_${k2}`}
                        />
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            );
          })}
        </Box>
      )}
    </Container>
  );
};
