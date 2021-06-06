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
    useTheme
} from '@material-ui/core';
import { useAppContext } from '../system/Container';
import { useSnackbar } from 'notistack';
import { ApiService, IApiCourseReport, IApiRegisteredCourses } from '../services/ApiService';
import { createRef, useEffect, useState } from 'react';
import { SportsKabaddi } from '@material-ui/icons';
import * as d3 from 'd3';

export const MainView = () => {
    const appContext = useAppContext();
    const theme = useTheme();
    const { enqueueSnackbar } = useSnackbar();

    const [ registeredCourses, setRegisteredCourses ] = useState<IApiRegisteredCourses['courseData'] | undefined>();
    const [ selectedCourse, setSelectedCourse ] = useState<string | undefined>();
    const [ courseReport, setCourseReport ] = useState<IApiCourseReport['aggregatedData'] | undefined | null>(null);
    const graphRef = createRef<HTMLDivElement>();

    useEffect(() => {
        appContext.getService(ApiService).registeredCourses()
            .then(r => setRegisteredCourses(r.courseData))
            .catch(err => enqueueSnackbar(err.message));
    }, []);

    useEffect(() => {
        if (!selectedCourse) {
            return;
        }

        appContext.getService(ApiService).courseReport(selectedCourse)
            .then(r => setCourseReport(r.aggregatedData))
            .catch(err => enqueueSnackbar(err.message));
    }, [ selectedCourse ]);

    useEffect(() => {
        if (!courseReport) {
            return;
        }

        // set the dimensions and margins of the graph
        const margin = { top: 50, right: 50, bottom: 50, left: 50 },
            width = 460 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

        // append the svg object to the body of the page
        const selection = d3.select(graphRef.current);
        selection.selectChildren('*').remove();
        const svg = selection
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform',
                'translate(' + margin.left + ',' + margin.top + ')');

        svg.append('text')
            .attr('x', (width / 2))
            .attr('y', 0 - (margin.top / 2))
            .attr('text-anchor', 'middle')
            .style('font-size', '16px')
            .style('fill', theme.palette.primary.contrastText)
            .style('text-decoration', 'underline')
            .text('Value vs Date Graph');


        const x = d3.scaleLinear()
            .domain(d3.extent(courseReport, d => d._id).map(x => x ?? 0))
            .range([ 0, width ]);
        svg.append('g')
            .attr('transform', 'translate(0,' + height + ')')
            .call(d3.axisBottom(x));

        const y = d3.scaleLinear()
            .domain([ 0, d3.max(courseReport, d => d.quota) ?? 0 ])
            .range([ height, 0 ]);
        svg.append('g')
            .call(d3.axisLeft(y));

        // Add the line
        svg.append('path')
            .datum(courseReport.sort((a, b) => a._id - b._id))
            .attr('fill', 'none')
            .attr('stroke', theme.palette.primary.contrastText)
            .attr('stroke-width', 3.5)
            .attr('d', d3.line<typeof courseReport[number]>()
                .x(d => x(d._id))
                .y(d => y(d.avail))
            );

        svg.append('path')
            .datum(courseReport.sort((a, b) => a._id - b._id))
            .attr('fill', 'none')
            .attr('stroke', 'white')
            .attr('stroke-width', 3.5)
            .attr('d', d3.line<typeof courseReport[number]>()
                .x(d => x(d._id))
                .y(d => y(d.wait))
            );
    }, [ courseReport ]);

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
                                                console.log(course._id);
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

        { courseReport && <div ref={ graphRef }/> }
    </Container>;
};
