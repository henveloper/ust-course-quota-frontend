import {
    Box,
    Container,
    Grid,
    IconButton,
    LinearProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    useTheme
} from '@material-ui/core';
import { useAppContext } from '../../../system/Container';
import { useSnackbar } from 'notistack';
import { ApiService, IApiCourseReport, IApiRegisteredCourses } from '../../../services/ApiService';
import { createRef, useEffect, useMemo, useState } from 'react';
import { SportsKabaddi, Timeline } from '@material-ui/icons';
import * as d3 from 'd3';
import dayjs from 'dayjs';
import { LabeledIcon } from './LabeledButton';

export const MainView = () => {
    const appContext = useAppContext();
    const theme = useTheme();
    const { enqueueSnackbar } = useSnackbar();

    const [ registeredCourses, setRegisteredCourses ] = useState<IApiRegisteredCourses['courseData'] | undefined>();
    const [ selectedCourse, setSelectedCourse ] = useState<string | undefined>();
    const [ courseReport, setCourseReport ] = useState<IApiCourseReport['aggregatedData'] | undefined | null>(null);
    const graphRef = createRef<HTMLDivElement>();

    const chartColorMap = useMemo(() => ({
        quota: theme.palette.getContrastText(theme.palette.background.default),
        enrol: theme.palette.secondary.main,
        avail: theme.palette.primary.main,
        wait: theme.palette.primary.contrastText,
    }), [ theme ]);

    useEffect(() => {
        appContext.getService(ApiService).registeredCourses()
            .then(r => setRegisteredCourses(r.courseData.sort((a, b) => a._id > b._id ? 1 : -1)))
            .catch(err => enqueueSnackbar(err.message));
    }, []);

    useEffect(() => {
        if (!selectedCourse) {
            return;
        }

        appContext.getService(ApiService).courseReport(selectedCourse)
            .then(r => setCourseReport(r.aggregatedData.sort((a, b) => a._id - b._id)))
            .catch(err => enqueueSnackbar(err.message));
    }, [ selectedCourse ]);

    useEffect(() => {
        if (!courseReport) {
            return;
        }

        // set the dimensions and margins of the graph
        const margin = { top: 50, right: 50, bottom: 50, left: 50 },
            width = 1000 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

        // append the svg object to the body of the page
        const selection = d3.select(graphRef.current);
        selection.selectChildren('*').remove();
        const svg = selection
            .append('svg')
            .attr('viewBox', `0 0 ${ width + margin.left + margin.right } ${ height + margin.top + margin.bottom }`)
            .append('g')
            .attr('transform',
                'translate(' + margin.left + ',' + margin.top + ')');

        svg.append('text')
            .attr('x', (width / 2))
            .attr('y', 0 - (margin.top / 2))
            .attr('text-anchor', 'middle')
            .style('font-size', '16px')
            .style('fill', theme.palette.getContrastText(theme.palette.background.default))
            .style('text-decoration', 'underline')
            .text(selectedCourse ?? '');


        const x = d3.scaleTime()
            .domain(d3.extent(courseReport, d => dayjs.unix(d._id).toDate()).map(x => x ?? new Date()))
            .range([ 0, width ]);
        svg.append('g')
            .attr('transform', 'translate(0,' + height + ')')
            .call(d3.axisBottom(x));

        const y = d3.scaleLinear()
            .domain([ 0, 1.2 * (d3.max(courseReport, d => d.quota) ?? 0) ])
            .range([ height, 0 ]);
        svg.append('g')
            .call(d3.axisLeft(y));

        // Add the lines
        svg.append('path')
            .datum(courseReport)
            .attr('fill', 'none')
            .attr('stroke', chartColorMap.quota)
            .attr('stroke-width', 1)
            .attr('d', d3.line<typeof courseReport[number]>()
                .x(d => x(dayjs.unix(d._id).toDate()))
                .y(d => y(d.quota))
            );

        svg.append('path')
            .datum(courseReport)
            .attr('fill', 'none')
            .attr('stroke', chartColorMap.wait)
            .attr('stroke-width', 1)
            .attr('d', d3.line<typeof courseReport[number]>()
                .x(d => x(dayjs.unix(d._id).toDate()))
                .y(d => y(d.wait))
            );

        svg.append('path')
            .datum(courseReport)
            .attr('fill', 'none')
            .attr('stroke', chartColorMap.avail)
            .attr('stroke-width', 1)
            .attr('d', d3.line<typeof courseReport[number]>()
                .x(d => x(dayjs.unix(d._id).toDate()))
                .y(d => y(d.avail))
            );

        svg.append('path')
            .datum(courseReport)
            .attr('fill', 'none')
            .attr('stroke', chartColorMap.enrol)
            .attr('stroke-width', 1)
            .attr('d', d3.line<typeof courseReport[number]>()
                .x(d => x(dayjs.unix(d._id).toDate()))
                .y(d => y(d.enrol))
            );


    }, [ courseReport, theme ]);

    const handlePing = () => {
        appContext.getService(ApiService).root()
            .then(() => enqueueSnackbar('PONG!', { variant: 'success' }))
            .catch(err => enqueueSnackbar(err.message));
    };

    return <Container maxWidth='md'>
        <Box py={ 3 }>
            <img
                alt='nuke' src='https://i.pinimg.com/originals/61/47/3d/61473dee800fdb5dd272b119a6f80fb0.png'
                width='100%' height={ 300 }
                onClick={ () => {
                    appContext.setIsDarkTheme(p => !p);
                    enqueueSnackbar('Changed theme!', { variant: 'info' });
                    handlePing();
                } }
                style={ { cursor: 'pointer' } }
            />
        </Box>

        { registeredCourses && <Box py={ 1 }>
            <TableContainer component={ Paper } style={ { maxHeight: 400 } }>
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
                        { registeredCourses
                            .sort((a, b) => a > b ? 1 : -1)
                            .filter(r => r.recordCount)
                            .map(course => (
                                <TableRow key={ course._id }>
                                    <TableCell component="th" scope="row"> { course.courseTitle } </TableCell>
                                    <TableCell align="right">{ course.isQuotaLogged.toString() }</TableCell>
                                    <TableCell align="right">{ course.recordCount }</TableCell>
                                    <TableCell align="right"> TODO </TableCell>
                                    <TableCell align="center">
                                        <IconButton
                                            disabled={ !course.recordCount }
                                            size='small' color="secondary" aria-label="add an alarm"
                                            onClick={ () => {
                                                setSelectedCourse(course._id);
                                            } }
                                        >
                                            <SportsKabaddi/>
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            )) }
                    </TableBody>
                </Table>
            </TableContainer>
        </Box> }

        { !registeredCourses && <Box>
            <LinearProgress/>
        </Box> }

        { courseReport === undefined && <Box>
            <LinearProgress/>
        </Box> }

        { courseReport && <Box>
            <div ref={ graphRef }/>

            <Grid container justify='space-around'>
                { Object.entries(chartColorMap).map(([ k, v ]) => {
                    return <Grid item>
                        <LabeledIcon icon={ Timeline } label={ k } labelColor={ v }/>
                    </Grid>;
                }) }
            </Grid>
        </Box> }
    </Container>;
};
