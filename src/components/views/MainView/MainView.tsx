import {
  Box,
  Container,
  IconButton,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
} from "@material-ui/core";
import { useAppContext } from "../../../system/Container";
import { useSnackbar } from "notistack";
import {
  ApiService,
  IAPIGetQuotas,
  IAPIGetCourses,
} from "../../../services/ApiService";
import { useEffect, useMemo, useState } from "react";
import { SportsKabaddi } from "@material-ui/icons";

export const MainView = () => {
  const appContext = useAppContext();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const [registeredCourses, setRegisteredCourses] = useState<
    IAPIGetCourses["courses"] | undefined
  >();
  const [selectedCourse, setSelectedCourse] = useState<string | undefined>();
  const [quotas, setQuotas] = useState<
    IAPIGetQuotas["quotas"] | undefined | null
  >(null);

  const chartColorMap = useMemo(
    () => ({
      quota: theme.palette.getContrastText(theme.palette.background.default),
      enrol: theme.palette.secondary.main,
      avail: theme.palette.primary.main,
      wait: theme.palette.primary.contrastText,
    }),
    [theme]
  );

  useEffect(() => {
    appContext
      .getService(ApiService)
      .getCourses()
      .then((r) =>
        setRegisteredCourses(
          r.courses.sort((a, b) => (a.code > b.code ? 1 : -1))
        )
      )
      .catch((err) => enqueueSnackbar(err.message));
  }, [appContext, enqueueSnackbar]);

  useEffect(() => {
    if (!selectedCourse) {
      return;
    }

    appContext
      .getService(ApiService)
      .getQuotas(selectedCourse)
      .then((r) => setQuotas(r.quotas.sort((a, b) => a.t - b.t)))
      .catch((err) => enqueueSnackbar(err.message));
  }, [selectedCourse, appContext, enqueueSnackbar]);

  useEffect(() => {
    const element = document.getElementById("myChart");
    if (!quotas || !element) {
      return;
    }
  }, [quotas, theme]);

  const handlePing = () => {
    appContext
      .getService(ApiService)
      .root()
      .then(() => enqueueSnackbar("PONG!", { variant: "success" }))
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
            handlePing();
          }}
          style={{ cursor: "pointer" }}
        />
      </Box>

      {registeredCourses && (
        <Box py={1}>
          <TableContainer component={Paper} style={{ maxHeight: 400 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Course</TableCell>
                  <TableCell align="right">isTracked</TableCell>
                  <TableCell align="right">recordCount</TableCell>
                  <TableCell align="right">lastUpdated</TableCell>
                  <TableCell align="right">View</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {registeredCourses
                  .sort((a, b) => (a > b ? 1 : -1))
                  .map((course) => (
                    <TableRow key={course.code}>
                      <TableCell component="th" scope="row">
                        {" "}
                        {course.title}{" "}
                      </TableCell>
                      <TableCell align="right">
                        {course.isLogging.toString()}
                      </TableCell>
                      <TableCell align="right"> TODO </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="secondary"
                          aria-label="add an alarm"
                          onClick={() => {
                            setSelectedCourse(course.ref);
                          }}
                        >
                          <SportsKabaddi />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {!registeredCourses && (
        <Box>
          <LinearProgress />
        </Box>
      )}

      {quotas === undefined && (
        <Box>
          <LinearProgress />
        </Box>
      )}

      {quotas && (
        <Box>
          <canvas id="myChart" width={400} height={400} />

          {/*<Grid container justify='space-around'>*/}
          {/*    { Object.entries(chartColorMap).map(([ k, v ]) => {*/}
          {/*        return <Grid item>*/}
          {/*            <LabeledIcon icon={ Timeline } label={ k } labelColor={ v }/>*/}
          {/*        </Grid>;*/}
          {/*    }) }*/}
          {/*</Grid>*/}
        </Box>
      )}
    </Container>
  );
};
