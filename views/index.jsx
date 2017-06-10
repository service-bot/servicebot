import React from 'react';
import {render} from 'react-dom';
import AppRouter from "./router.jsx";
import { AppContainer } from 'react-hot-loader'
import ReactDOM from 'react-dom'


render((
    <AppContainer>
        <AppRouter/>
    </AppContainer>
), document.getElementById('app'));

if (module.hot) {
    module.hot.accept('./router.jsx', () => {
        const NextApp = require('./router.jsx').default;
        ReactDOM.render(
            <AppContainer>
                <NextApp/>
            </AppContainer>,
            document.getElementById('app')
        );
    });
}
