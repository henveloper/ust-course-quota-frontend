import {
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  FormControlLabel,
  Grid,
  TextField,
  Typography,
} from "@material-ui/core";
import { SportsKabaddi } from "@material-ui/icons";
import { useAppContext } from "../../../system/Container";
import { useSnackbar } from "notistack";
import { ApiService, SectionQuota } from "../../../services/ApiService";
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
  const [showTypes, setShowTypes] = useState<Record<string, boolean>>({
    L: true,
    LA: false,
    T: false,
  });
  const [aggregate, setAggregate] = useState(false);

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
      {/* options */}
      <Box py={1}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item xs={6}>
            <TextField
              onChange={(v) =>
                store.set("ustQuotaViewer:endPoint", v.target.value)
              }
              defaultValue={store.get("ustQuotaViewer:endPoint")}
              label="endpoint?"
              type="password"
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

      <Divider />

      {/* options */}
      <Box>
        <Typography variant="h6">Options</Typography>
        <Grid container spacing={1}>
          <Grid item>
            <FormControlLabel
              control={
                <Checkbox
                  checked={showExtra}
                  onChange={() => setShowExtra((p) => !p)}
                  color="primary"
                />
              }
              label="quota/enrol?"
            />
          </Grid>
          <Divider orientation="vertical" flexItem />
          <Grid item>
            {Object.entries(showTypes).map(([t, d]) => {
              return (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={d}
                      onChange={() => {
                        setShowTypes((r) => ({ ...r, [t]: !d }));
                      }}
                      color="primary"
                    />
                  }
                  label={t}
                />
              );
            })}
          </Grid>
          <Divider orientation="vertical" flexItem />
          <Grid item>
            <FormControlLabel
              control={
                <Checkbox
                  checked={aggregate}
                  onChange={() => {
                    setAggregate((p) => !p);
                  }}
                  color="primary"
                />
              }
              label="sum?"
            />
          </Grid>
        </Grid>
      </Box>

      {/* graphs */}
      <Grid container spacing={1}>
        {courseSections &&
          Object.keys(courseSections)
            .sort()
            .map((course, k1) => {
              return (
                <Grid item xs={aggregate ? 6 : 12}>
                  <Grid container>
                    <Grid item xs={12}>
                      <Typography variant="h4">{course}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Grid container spacing={2}>
                        {!aggregate &&
                          Array.from(courseSections[course] ?? []).map(
                            (section, k2) => {
                              const regexMatchArr =
                                section.match(/^(L|LA|T).*/);
                              if (regexMatchArr) {
                                const [, t] = regexMatchArr;
                                if (!showTypes[t]) {
                                  return null;
                                }
                              }
                              return (
                                <Grid item xs={6}>
                                  <QuotaChart
                                    quotas={(quotas ?? []).filter(
                                      (r) =>
                                        r.section === section &&
                                        r.courseCode === course
                                    )}
                                    course={course}
                                    section={section}
                                    key={`${k1}_${k2}`}
                                    showExtra={showExtra}
                                  />
                                </Grid>
                              );
                            }
                          )}
                        {aggregate && (
                          <Grid item xs={12}>
                            <QuotaChart
                              quotas={(quotas ?? [])
                                .filter((r) => r.courseCode === course)
                                .reduce<SectionQuota[]>((p, c) => {
                                  const e = p.find((q) => q.t === c.t);
                                  if (e) {
                                    e.quota += c.quota;
                                    e.avail += c.avail;
                                    e.enrol += c.enrol;
                                    e.wait += c.wait;
                                    return p;
                                  }
                                  p.push(c);
                                  return p;
                                }, [])}
                              course={course}
                              section="sum"
                              key={k1}
                              showExtra={showExtra}
                            />
                          </Grid>
                        )}
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              );
            })}
      </Grid>
    </Container>
  );
};
