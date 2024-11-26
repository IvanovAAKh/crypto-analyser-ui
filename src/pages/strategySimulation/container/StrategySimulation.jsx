import React, {useEffect, useState} from 'react';
import { createUseStyles } from 'react-jss';
import requestsHistoricalData from '../requests/historicalData';
import requestsStrategies from '../requests/strategies';
import requestsSimulation from '../requests/simulation';
import useTheme from 'misc/hooks/useTheme';
import Button from 'components/Button';
import MenuItem from 'components/MenuItem';
import Select from 'components/Select';
import TextField from 'components/TextField';

import Chart from '../components/Chart';

const getClasses = createUseStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${theme.spacing(2)}px`,
    height: '100%',
  },
  resultContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${theme.spacing(2)}px`,
    height: '100%',
  },
  requestParamsContainer: {
    display: 'flex',
    gap: `${theme.spacing(2)}px`,
  },
}));

const historicalDataBinanceToUI = (response) => {
  const list = response.map(([timestamp, open, high, low, close]) => ({
    high: Number(high),
    close: Number(close),
    low: Number(low),
    open: Number(open),
    timestamp,
  }));
  return list;
};

const strategiesToUI = (strategiesBE) => {
  return strategiesBE.map(strategy => ({
    id: strategy.id,
    name: strategy.name,
  }));
};

const simulationResultToUI = (result) => {
  return {
    strategy: result.strategy,
    transactionsHistory: result.transactionsHistory,
  };
};

const daysToTimestamp = (days) => days * 24 * 60 * 60 * 1000;

function StrategySimulation() {
  const { theme } = useTheme();
  const classes = getClasses({ theme });

  const [strategies, setStrategies] = useState({
    errorMsg: '',
    isFailed: false,
    isFetching: false,
    list: null,
  });

  const [simulationResult, setSimulationResult] = useState({
    data: null,
    errorMsg: '',
    isFailed: false,
    isFetching: false,
  });

  const [historicalData, setHistoricalData] = useState({
    data: null,
    errorMsg: '',
    isFailed: false,
    isFetching: false,
  });

  const [state, setState] = useState({
    componentDidMount: false,
    requestParams: {
      currencyFrom: 'SUI',
      currencyTo: 'USDT',
      simulationIntervalInDays: 30,
      startMoney: 500,
      strategyId: null,
      // timestampTo: Date.now(),
      timestampTo: (new Date('08.07.2024')).getTime(),
    },
  });

  const fetchStrategies = () => {
    requestsStrategies.getStrategies({
      onFailed: (error) => setStrategies({
        ...strategies,
        errorMsg: error,
        isFailed: true,
        isFetching: false,
      }),
      onRequest: () => setStrategies({
        ...strategies,
        isFailed: false,
        isFetching: true,
      }),
      onSuccess: (response) => setStrategies({
        ...strategies,
        isFetching: false,
        list: strategiesToUI(response),
      }),
    });
  };

  const fetchStartSimulation = () => {
    const timestampFrom = state.requestParams.timestampTo - daysToTimestamp(state.requestParams
      .simulationIntervalInDays);
    requestsSimulation.startSimulation({
      onFailed: (error) => setSimulationResult({
        ...simulationResult,
        errorMsg: error,
        isFailed: true,
        isFetching: false,
      }),
      onRequest: () => setSimulationResult({
        ...simulationResult,
        isFailed: false,
        isFetching: true,
      }),
      onSuccess: (result) => setSimulationResult({
        ...simulationResult,
        isFetching: false,
        data: simulationResultToUI(result),
      }),
      currencyFrom: state.requestParams.currencyFrom,
      currencyTo: state.requestParams.currencyTo,
      startMoney: state.requestParams.startMoney,
      strategyId: state.requestParams.strategyId,
      timestampFrom,
      timestampTo: state.requestParams.timestampTo,
    });
  };

  const fetchHistoricalData = () => {
    const timestampFrom = state.requestParams.timestampTo - daysToTimestamp(state.requestParams
      .simulationIntervalInDays);
    requestsHistoricalData.fetchBinanceHistoricalData({
      aggregateInMinutes: 15,
      currencyFrom: state.requestParams.currencyFrom,
      currencyTo: state.requestParams.currencyTo,
      timestampFrom,
      timestampTo: state.requestParams.timestampTo,
      onFailed: (error) => setHistoricalData({
        ...historicalData,
        errorMsg: error,
        isFailed: true,
        isFetching: false,
      }),
      onRequest: () => setHistoricalData({
        ...historicalData,
        isFailed: false,
        isFetching: true,
      }),
      onSuccess: (result) => setHistoricalData({
        ...historicalData,
        isFetching: false,
        data: historicalDataBinanceToUI(result),
      }),
    });
  };

  const onSetRequestParam = (params) => {
    setState(prevState => ({
      ...prevState,
      requestParams: {
        ...prevState.requestParams,
        ...params,
      },
    }));
  };

  const onSimulate = () => {
    fetchStartSimulation();
    fetchHistoricalData();
  };

  useEffect(() => {
    fetchStrategies();
    setState(prevState => ({
      ...prevState,
      componentDidMount: true,
    }));
  }, []);

  return (
    <div className={classes.container}>
      <div className={classes.requestParamsContainer}>
        <TextField
          inputType="number"
          label="Кол-во USDT"
          onChange={({ target }) => onSetRequestParam({
            startMoney: target.value,
          })}
          value={state.requestParams.startMoney}
        />
        <TextField
          label="Валюта"
          onChange={({ target }) => onSetRequestParam({
            currencyFrom: target.value,
          })}
          value={state.requestParams.currencyFrom}
        />
        <TextField
          label="Бзовая валюта"
          onChange={({ target }) => onSetRequestParam({
            currencyTo: target.value,
          })}
          value={state.requestParams.currencyTo}
        />
        <TextField
          inputType="date"
          label="Конечная Дата"
          onChange={({ target }) => {
            onSetRequestParam({
              timestampTo: (new Date(target.value)).getTime(),
            });
          }}
          value={(new Date(state.requestParams.timestampTo)).toISOString().split('T')[0]}
        />
        <TextField
          inputType="number"
          label="Интервал симуляции (в днях)"
          onChange={({ target }) => onSetRequestParam({
            simulationIntervalInDays: target.value,
          })}
          value={state.requestParams.simulationIntervalInDays}
        />
        <Select
          label="Стратегия"
          onChange={({ target }) => onSetRequestParam({
            strategyId: target.value,
          })}
          value={state.requestParams.strategyId}
        >
          {strategies.list?.map(strategy => (
            <MenuItem value={strategy.id}>
              {strategy.name}
            </MenuItem>
          ))}
        </Select>
        <Button onClick={onSimulate}>
          Simulate
        </Button>
      </div>
      <Chart
        historicalData={historicalData.data}
        simulationData={simulationResult.data?.transactionsHistory}
        strategy={simulationResult.data?.strategy}
      />
    </div>
  );
}

export default StrategySimulation;