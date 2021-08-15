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
import {
  ApiService,
  SectionQuota,
} from "../../../services/ApiService";
import store from "store";
import { useEffect, useMemo, useState } from "react";
import { Chart, registerables } from "chart.js";
import { QuotaChart } from "./QuotaChart";
Chart.register(...registerables);

export const MainView = () => {
  const appContext = useAppContext();
  const { enqueueSnackbar } = useSnackbar();

  const [isPinged, setIsPinged] = useState(false);
  const [quotas, setQuotas] = useState<SectionQuota[] | undefined>(undefined);
  const [showExtra, setShowExtra] = useState(false);

  const courseSections = useMemo(() => {
    if (!quotas) {
      return;
    }
    const s: { [course: string]: Set<string> } = {};
    quotas.forEach(({ courseCode, section }) => {
      let set = s[courseCode] ?? new Set();
      set.add(section);
      s[courseCode] = set;
    });
    return s;
  }, [quotas]);

  useEffect(() => {
    if (!isPinged) {
      return;
    }

    try {
      appContext
        .getService(ApiService)
        .getQuotas(24)
        .then((resp) => {
          resp.quotas.sort((a, b) => a.t - b.t);
          setQuotas(resp.quotas);
        });
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }, [isPinged, appContext, enqueueSnackbar]);

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
      {/* nuked image */}
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

      {/* queries */}
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

        <Box py={1}>
          <Button
            onClick={() => setShowExtra((p) => !p)}
            variant={showExtra ? "contained" : "outlined"}
          >
            toggle show extra
          </Button>
        </Box>
      </Box>

      {/* display */}
      {courseSections &&
        Object.keys(courseSections).map((course, k1) => {
          return (
            <Box py={2}>
              <Typography variant="h4">{course}</Typography>
              <Grid container spacing={2}>
                {Array.from(courseSections[course] ?? []).map((section, k2) => {
                  return (
                    <Grid item xs={6}>
                      <QuotaChart
                        quotas={(quotas ?? []).filter(
                          (r) =>
                            r.section === section && r.courseCode === course
                        )}
                        course={course}
                        section={section}
                        key={`${k1}_${k2}`}
                        showExtra={showExtra}
                      />
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          );
        })}
    </Container>
  );
};
