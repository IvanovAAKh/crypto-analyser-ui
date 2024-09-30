import React, {useEffect, useState} from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom';
import { addAxiosInterceptors } from 'misc/requests';
import HistoricalDataAnalysis from 'pages/historicalDataAnalysis';
import ThemeProvider from 'misc/providers/ThemeProvider';

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
          <Routes>
            <Route
              element={<HistoricalDataAnalysis />}
              path="/historicalData"
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
        )}
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
