import React, {useEffect, useState} from 'react';
import { addAxiosInterceptors } from 'misc/requests';

import HistoricalDataAnalysis from './pages/historicalDataAnalysis';

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
    <>
      {state.componentDidMount && (
        <HistoricalDataAnalysis />
      )}
    </>
  );
}

export default App;
