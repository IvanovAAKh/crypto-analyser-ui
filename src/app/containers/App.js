import React, {useEffect, useState} from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom';
import { addAxiosInterceptors } from 'misc/requests';
import ThemeProvider from 'misc/providers/ThemeProvider';
import HistoricalDataAnalysis from 'pageProviders/HistoricalDataAnalysis';
import Strategies from 'pageProviders/Strategies';
import * as pages from 'constants/pages';
import pageURLs from 'constants/pagesURLs';

import Header from '../components/Header';
import MissedPage from '../components/MissedPage';
import SearchParamsConfigurator from '../components/SearchParamsConfigurator';

function App() {
  const [state, setState] = useState({
    componentDidMount: false,
  });

  useEffect(() => {
    addAxiosInterceptors({
    });
    setState({
      ...state,
      componentDidMount: true,
    });
  }, []);

  return (
    <ThemeProvider>
      <BrowserRouter>
        <SearchParamsConfigurator />
        {/* This is needed to let first render passed for App's
          * configuration process will be finished (e.g. locationQuery
          * initializing) */}
        {state.componentDidMount && (
          <>
            <Header />
            <Routes>
              <Route
                element={<HistoricalDataAnalysis />}
                path={`${pageURLs[pages.historicalData]}`}
              />
              <Route
                element={<Strategies />}
                path={`${pageURLs[pages.strategies]}`}
              />
              <Route
                element={(
                  <MissedPage
                    redirectPage="/historicalData"
                  />
                )}
                path="*"
              />
            </Routes>
          </>
        )}
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
