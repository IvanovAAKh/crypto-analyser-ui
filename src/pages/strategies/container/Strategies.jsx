import React, {useEffect, useMemo, useRef, useState} from 'react';
import { createUseStyles } from 'react-jss';
import requestsStrategies from '../requests/strategies';
import useTheme from 'misc/hooks/useTheme';
import Button from 'components/Button';
import Card from 'components/Card';
import CardActions from 'components/CardActions';
import CardContent from 'components/CardContent';
import CardTitle from 'components/CardTitle';
import Dialog from 'components/Dialog';
import IconButton from 'components/IconButton';
import IconClose from 'components/icons/Close';
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
  dialogContentPairContainer: {
    display: 'flex',
    gap: `${theme.spacing(2)}px`,
  },
  dialogContentPairLeft: {
    justifyContent: 'center',
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    gap: `${theme.spacing(1)}px`,
  },
  dialogContentPairRight: {
    justifyContent: 'end',
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    gap: `${theme.spacing(1)}px`,
    width: '100%',
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
    editableStrategy: null,
    openEditDialog: false,
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
  
  const onCancelEditStrategy = () => {
    setState({
      ...state,
      editableStrategy: null,
      openEditDialog: false,
    });
  };

  const onStartCreateStrategy = () => {
    setState({
      ...state,
      editableStrategy: {
        ...state.editableStrategy,

      },
      openEditDialog: true,
    })
  };

  const onChangeRectangleShiftRatio = (value) => {
    setState({
      ...state,
      editableStrategy: {
        ...state.editableStrategy,
        trendsConfig: {
          ...state.editableStrategy?.trendsConfig,
          rectangleShiftRatio: value,
        },
      },
    });
  };

  const onSaveStrategy = () => {
    setState({
      ...state,
      editableStrategy: null,
      openEditDialog: false,
    })
  };

  useEffect(() => {
    fetchStrategies();
    fetchPossibleValues();
  }, []);

  return (
    <div className={classes.container}>
      <div>
        <Button onClick={onStartCreateStrategy}>
          Create Strategy
        </Button>
      </div>
      <Dialog open={state.openEditDialog}>
        <Card variant="edit">
          <CardTitle>
            <Typography variant="title">
              {state.editableStrategy?.id
                ? 'Update Strategy'
                : 'Create Strategy'}
            </Typography>
            <IconButton onClick={onCancelEditStrategy}>
              <IconClose size={24} />
            </IconButton>
          </CardTitle>
          <CardContent>
            <Typography variant="subTitle">
              <strong>
                Конфигурация трендов:
              </strong>
            </Typography>
            <div className={classes.dialogContentPairContainer}>
              <div className={classes.dialogContentPairLeft}>
                <Typography>
                  - Множитель сдвига для a, b у прямоугольника тренда:
                </Typography>
              </div>
              <div className={classes.dialogContentPairRight}>
                <TextField
                  inputType="number"
                  onChange={({ target }) => onChangeRectangleShiftRatio(target.value)}
                  value={state.editableStrategy?.trendsConfig?.rectangleShiftRatio}
                />
              </div>
            </div>
          </CardContent>
          <CardActions>
            <div>
              <Button
                colorVariant="secondary"
                onClick={onCancelEditStrategy}
                variant="secondary"
              >
                Cancel
              </Button>
            </div>
            <div>
              <Button
                onClick={onSaveStrategy}
                variant="primary"
              >
                Save
              </Button>
            </div>
          </CardActions>
        </Card>
      </Dialog>
    </div>
  );
}

export default Strategies;