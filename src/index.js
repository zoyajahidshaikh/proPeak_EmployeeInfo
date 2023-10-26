import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
// import './styles/css/index.css';
// import registerServiceWorker from './registerServiceWorker';
//import Login from './Login';
import App from './app';

ReactDOM.render(<BrowserRouter><App/></BrowserRouter>, document.getElementById('root'));
//ReactDOM.render(<Login />, document.getElementById('root'));


// registerServiceWorker();
