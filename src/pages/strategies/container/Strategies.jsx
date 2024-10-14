import React, {useEffect, useMemo, useRef, useState} from 'react';
import { createUseStyles } from 'react-jss';

import requestsStrategies from '../requests/strategies';
import useLocationSearch from 'misc/hooks/useLocationSearch';
import useTheme from 'misc/hooks/useTheme';
import Button from 'components/Button';
import Select from 'components/Select';
import MenuItem from 'components/MenuItem';
import TextField from 'components/TextField';
import Typography from 'components/Typography';

const getClasses = createUseStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${theme.spacing(2)}px`,
    height: '100%',
  },
}));

const strategiesToUI = (strategiesBE) => {
  return strategiesBE.map(strategy => ({
    id: strategy.id,
    name: strategy.name,
    trendsConfig: {
      rectangleShiftRatio: strategy.trendsConfig.rectangleShiftRatio,
      subTrendsShiftPercent: strategy.trendsConfig.subTrendsShiftPercent,
      trends: strategy.trendsConfig.trends.map(trend => ({
        measure: trend.measure,
        value: trend.value,
      })),
    },
    triggersAndActions: strategy.triggersAndActions.map(item => ({
      action: {
        behavior: {
          type: item.action.behavior.behaviorType,
          value: item.action.behavior.value,
        },
        type: item.action.actionType,
      },
      comment: item.comment,
      triggersOR: item.triggersOR.map(triggerOR => ({
        triggersAND: triggerOR.andConditions.map(triggerAND => ({
          comment: triggerAND.comment,
          expectedValue: triggerAND.expectedValue,
          operationType: triggerAND.operationType,
          operator: triggerAND.operator,
          dataSourceType: triggerAND.dataSourceType,
        })),
      })),
    })),
  }));
};

const possibleValuesToUI = (possibleValuesBE) => {
  return {
    actionTypes: possibleValuesBE.actionTypes,
    behaviorTypes: possibleValuesBE.behaviorTypes,
    dataSourceTypes: possibleValuesBE.dataSourceTypes,
    measures: possibleValuesBE.measures,
    operationTypes: possibleValuesBE.operationTypes,
    operators: possibleValuesBE.operators,
  };
};

function Strategies() {
  const { theme } = useTheme();
  const classes = getClasses({ theme });

  const [strategies, setStrategies] = useState({
    errorMsg: '',
    isFailed: false,
    isFetching: false,
    list: null,
  });

  const [possibleValues, setPossibleValues] = useState({
    errorMsg: '',
    isFailed: false,
    isFetching: false,
    data: null,
  });

  const [state, setState] = useState({

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

  const fetchPossibleValues = () => {
    requestsStrategies.getPossibleValues({
      onFailed: (error) => setPossibleValues({
        ...possibleValues,
        errorMsg: error,
        isFailed: true,
        isFetching: false,
      }),
      onRequest: () => setPossibleValues({
        ...possibleValues,
        isFailed: false,
        isFetching: true,
      }),
      onSuccess: (response) => setPossibleValues({
        ...possibleValues,
        isFetching: false,
        data: possibleValuesToUI(response),
      }),
    });
  };

  useEffect(() => {
    fetchStrategies();
    fetchPossibleValues();
  }, []);

  return (
    <div className={classes.container}>
      huy
    </div>
  );
}

export default Strategies;