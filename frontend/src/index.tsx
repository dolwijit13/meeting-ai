import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { HomePage } from './pages/HomePage/HomePage';
import { ResultPage } from './pages/ResultPage/ResultPage';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Switch>
        <Route path='/result' component={() => <ResultPage />} />
        <Route path='/' component={() => <HomePage />} />
      </Switch>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
