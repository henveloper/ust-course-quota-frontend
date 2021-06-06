import { Grid, Typography } from '@material-ui/core';
import { SvgIconComponent } from '@material-ui/icons';
import { createElement } from 'react';

export const LabeledIcon = (props: { icon: SvgIconComponent, label: string, labelColor: string }) => {
    return <Grid container alignItems='center' spacing={ 1 }>
        <Grid item>
            { createElement<SvgIconComponent>(props.icon) }
        </Grid>
        <Grid item>
            <Typography variant='caption' style={{color: props.labelColor}}>
                {props.label}
            </Typography>
        </Grid>
    </Grid>;
};
