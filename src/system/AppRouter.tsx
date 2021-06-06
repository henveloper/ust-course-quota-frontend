import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { MainView } from '../views/MainView';

export const AppRouter = () => {
    return <BrowserRouter>
        <Switch>
            <Route>
                <MainView/>
            </Route>
        </Switch>
    </BrowserRouter>;
};
