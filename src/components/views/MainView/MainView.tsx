import {
  AppBar,
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  Slider,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@material-ui/core";
import { Refresh, SportsKabaddi, Storage } from "@material-ui/icons";
import { useAppContext } from "../../../system/Container";
import { useSnackbar } from "notistack";
import { ApiService, SectionQuota } from "../../../services/ApiService";
import store from "store";
import { useMemo, useState } from "react";
import { QuotaChart } from "./QuotaChart";
import { sectionQuotas } from "../../../data/sectionQuotas";

export const MainView = () => {
  const appContext = useAppContext();
  const { enqueueSnackbar } = useSnackbar();

  const [isFetchingQuota, setIsFetchingQuota] = useState(false);
  const [quotas, setQuotas] = useState<SectionQuota[] | undefined>(undefined);
  const [hour, setHour] = useState(6);
  const [showExtra, setShowExtra] = useState(true);
  const [showTypes, setShowTypes] = useState<Record<string, boolean>>({
    L: true,
    LA: false,
    T: false,
  });
  const [aggregate, setAggregate] = useState(true);
  const [subjectTabValue, setSubjectTabValue] = useState("");

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

  const subjects = useMemo(() => {
    if (!courseSections) {
      return;
    }

    const retVal = Array.from(
      new Set(Object.keys(courseSections).map((r) => r.substr(0, 4)))
    ).sort();
    if (retVal.length) {
      setSubjectTabValue(retVal[0]);
    }
    return retVal;
  }, [courseSections]);

  const fetchData = (useStatic?: boolean) => {
    if (isFetchingQuota) {
      return;
    }
    setIsFetchingQuota(true);

    if (useStatic) {
      setQuotas(
        sectionQuotas.map((q) => ({
          t: q[0],
          courseCode: q[1],
          section: q[2],
          quota: q[3],
          enrol: q[4],
          avail: q[5],
          wait: q[6],
        }))
      );
      setIsFetchingQuota(false);
      return;
    }

    appContext
      .getService(ApiService)
      .getQuotas(hour)
      .then((resp) => {
        resp.quotas.sort((a, b) => a.t - b.t);
        setQuotas(resp.quotas);
      })
      .catch((e) => {
        enqueueSnackbar(e.message);
      })
      .then(() => setIsFetchingQuota(false));
  };

  const handlePing = () => {
    appContext
      .getService(ApiService)
      .root()
      .then(() => fetchData())
      .then(() => enqueueSnackbar("Loading canvas...", { variant: "info" }))
      .catch((err) => enqueueSnackbar(err.message, { variant: "error" }));
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
            enqueueSnackbar("Changed theme!", { variant: "success" });
          }}
          style={{ cursor: "pointer" }}
        />
      </Box>

      {/* component:connection-options */}
      <Box py={1}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item xs>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Storage />}
              disabled={!!quotas || isFetchingQuota}
              onClick={() => fetchData(true)}
            >
              Use example data
            </Button>
          </Grid>
          <Grid item xs>
            <TextField
              onChange={(v) =>
                store.set("ustQuotaViewer:endPoint", v.target.value)
              }
              InputProps={{
                endAdornment: (
                  <Button
                    size="small"
                    color="primary"
                    startIcon={<SportsKabaddi />}
                    disabled={!!quotas || isFetchingQuota}
                    onClick={handlePing}
                  >
                    {!quotas ? "PING?" : "PONG!"}
                  </Button>
                ),
              }}
              defaultValue={store.get("ustQuotaViewer:endPoint")}
              label="endpoint?"
              type="password"
              fullWidth
            />
          </Grid>
        </Grid>
      </Box>

      <Divider />

      {/* component:options */}
      <Box>
        <Typography variant="h6">Options</Typography>
        <Grid container spacing={1}>
          <Grid item>
            <IconButton color="primary" onClick={() => fetchData()}>
              <Refresh />
            </IconButton>
          </Grid>
          <Divider orientation="vertical" flexItem />
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
            {Object.entries(showTypes).map(([t, d], i) => {
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
                  key={i.toString()}
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
          <Divider orientation="vertical" flexItem />
          <Grid item>
            <div style={{ width: 300 }}>
              <Slider
                value={hour}
                valueLabelDisplay="auto"
                step={null}
                onChange={(_, v) => setHour(v as number)}
                marks={[
                  { value: 1 },
                  { value: 3 },
                  { value: 6 },
                  { value: 12 },
                  { value: 24 },
                ]}
                min={1}
                max={72}
              />
            </div>
          </Grid>
        </Grid>
      </Box>

      {/* component:tab */}
      {subjects && (
        <AppBar position="static">
          <Tabs
            value={subjectTabValue}
            onChange={(_, v) => setSubjectTabValue(v)}
          >
            {subjects.map((s, i) => (
              <Tab label={s} value={s} key={i} />
            ))}
          </Tabs>
        </AppBar>
      )}

      {/* component:graphs */}
      <Grid container spacing={1}>
        {courseSections &&
          Object.keys(courseSections)
            .sort()
            .map((course, k1) => {
              if (subjectTabValue && course.substr(0, 4) !== subjectTabValue) {
                return null;
              }
              return (
                <Grid item xs={12} key={k1.toString()}>
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
                                <Grid item xs={6} key={k2}>
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
                                .filter((r) => {
                                  const regexMatchArr =
                                    r.section.match(/^(LA|L|T).*/);
                                  if (regexMatchArr) {
                                    const [, t] = regexMatchArr;
                                    return showTypes[t];
                                  }
                                  return false;
                                })
                                .reduce<SectionQuota[]>((p, c) => {
                                  const e = p.find((q) => q.t === c.t);
                                  if (e) {
                                    e.quota += c.quota;
                                    e.avail += c.avail;
                                    e.enrol += c.enrol;
                                    e.wait += c.wait;
                                    return p;
                                  }

                                  // shallow copy works here because attr. simple
                                  p.push(Object.assign({}, c));
                                  return p;
                                }, [])}
                              course={course}
                              section="sum"
                              key={k1}
                              showExtra={showExtra}
                              sum
                            />
                          </Grid>
                        )}
                      </Grid>
                    </Grid>
                    <Divider />
                  </Grid>
                </Grid>
              );
            })}
      </Grid>
    </Container>
  );
};
