import { ReactNode } from 'react';
import { SnackbarProvider } from 'notistack';

export const Notistack = (props: { children: ReactNode }) => {
    return <SnackbarProvider maxSnack={ 3 } autoHideDuration={2000}>
        { props.children }
    </SnackbarProvider>;
};
