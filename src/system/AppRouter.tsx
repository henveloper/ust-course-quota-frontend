import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { MainView } from '../components/views/MainView/MainView';

export const AppRouter = () => {
    return <BrowserRouter>
        <Switch>
            <Route>
                <MainView/>
            </Route>
        </Switch>
    </BrowserRouter>;
};
