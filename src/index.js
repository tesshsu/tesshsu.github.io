import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import TagManager from 'react-gtm-module';
import ReactGA from 'react-ga';

ReactGA.initialize('UA-32425664-1');
ReactGA.pageview(window.location.pathname + window.location.search);

const tagManagerArgs = {
    gtmId: 'GTM-NR5TNJN'
}
ReactGA.initialize('G-NME4NFXG6B');
ReactGA.pageview(window.location.pathname + window.location.search);
TagManager.initialize(tagManagerArgs);
ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
