import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { MainView } from '../views/MainView';

export const AppRouter = () => {
    return <BrowserRouter>
        <Switch>
            <Route exact path='/test'>
                1231
            </Route>

            <Route>
                <MainView/>
            </Route>
        </Switch>
    </BrowserRouter>;
};
