import React, {useEffect, useState} from 'react';
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
import IconDelete from 'components/icons/Delete';
import TextField from 'components/TextField';
import Typography from 'components/Typography';

import Trend from '../components/Trend';
import TriggerAndAction from '../components/TriggerAndAction';

const getClasses = createUseStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${theme.spacing(2)}px`,
    height: '100%',
  },
  dialogContentContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${theme.spacing(2)}px`,
  },
  dialogContentSectionContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${theme.spacing(3)}px`,
  },
  dialogContentPairContainer: {
    display: 'flex',
    gap: `${theme.spacing(2)}px`,
  },
  dialogContentPairLeft: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    gap: `${theme.spacing(1)}px`,
  },
  dialogContentPairRight: {
    display: 'flex',
    flex: 2,
    flexDirection: 'column',
    gap: `${theme.spacing(1)}px`,
  },
  triggerAndActionTitleContainer: {
    alignItems: 'center',
    display: 'flex',
    gap: `${theme.spacing(2)}px`,
    width: '100%',
  },
  trendsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${theme.spacing(2)}px`,
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
          type: item.action.behavior.type,
          value: item.action.behavior.value,
        },
        type: item.action.type,
      },
      comment: item.comment,
      triggersOR: item.triggersOR.map(triggerOR => ({
        triggersAND: triggerOR.triggersAND.map(triggerAND => ({
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

  const [saveStrategy, setSaveStrategy] = useState({
    errorMsg: '',
    isFailed: false,
    isFetching: false,
  });

  const [state, setState] = useState({
    componentDidMount: false,
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

  const fetchSaveStrategy = (strategyToSave) => {
    const saveFunction = strategyToSave.id
      ? requestsStrategies.updateStrategy
      : requestsStrategies.createStrategy;
    saveFunction({
      onFailed: (error) => setSaveStrategy({
        ...saveStrategy,
        errorMsg: error,
        isFailed: true,
        isFetching: false,
      }),
      onRequest: () => setSaveStrategy({
        ...saveStrategy,
        isFailed: false,
        isFetching: true,
      }),
      onSuccess: (savedStrategy) => {
        setSaveStrategy({
          ...saveStrategy,
          isFetching: false,
        });
        const [convertedStrategy] = strategiesToUI([savedStrategy]);
        setStrategies(prev => ({
          ...prev,
          list: strategyToSave.id
            ? prev.list
              .map(strategy => strategy.id === convertedStrategy.id
                ? convertedStrategy
                : strategy)
            : prev.list.concat(convertedStrategy)
        }));
      },
      name: strategyToSave.name,
      trendsConfig: strategyToSave.trendsConfig,
      triggersAndActions: strategyToSave.triggersAndActions,
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
        name: '',
        trendsConfig: {
          rectangleShiftRatio: 1,
          subTrendsShiftPercent: 90,
          trends: (state.editableStrategy?.trendsConfig?.trends || [])
            .concat({
              measure: null,
              value: null,
            }),
        },
        triggersAndActions: [{
          action: {
            behavior: {
              type: null,
              value: null,
            },
            type: null,
          },
          comment: '',
          triggersOR: [{
            triggersAND: [{
              comment: '',
              expectedValue: null,
              operationType: null,
              operator: null,
              dataSourceType: null,
            }],
          }]
        }]
      },
      openEditDialog: true,
    })
  };

  const onChangeName = (value) => {
    setState({
      ...state,
      editableStrategy: {
        ...state.editableStrategy,
        name: value,
      },
    });
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

  const onChangeSubTrendsShiftPercent = (value) => {
    setState({
      ...state,
      editableStrategy: {
        ...state.editableStrategy,
        trendsConfig: {
          ...state.editableStrategy?.trendsConfig,
          subTrendsShiftPercent: value,
        },
      },
    });
  };

  const onChangeTriggerAndAction = ({
    index: inputIndex,
    triggerAndAction: inputTriggerAndAction,
  }) => {
    setState({
      ...state,
      editableStrategy: {
        ...state.editableStrategy,
        triggersAndActions: state.editableStrategy.triggersAndActions
          .map((triggerAndAction, index) => index === inputIndex
            ? inputTriggerAndAction
            : triggerAndAction),
      },
    });
  };

  const onAddTrend = () => {
    setState({
      ...state,
      editableStrategy: {
        ...state.editableStrategy,
        trendsConfig: {
          ...state.editableStrategy?.trendsConfig,
          trends: (state.editableStrategy?.trendsConfig?.trends || [])
            .concat({
              measure: null,
              value: null,
            }),
        },
      },
    });
  };

  const onDeleteTrend = (inputIndex) => {
    setState({
      ...state,
      editableStrategy: {
        ...state.editableStrategy,
        trendsConfig: {
          ...state.editableStrategy?.trendsConfig,
          trends: (state.editableStrategy?.trendsConfig?.trends || [])
            .filter((_, index) => index !== inputIndex),
        },
      },
    });
  };

  const onChangeTrend = ({
    index: inputIndex,
    trend: inputTrend,
  }) => {
    setState({
      ...state,
      editableStrategy: {
        ...state.editableStrategy,
        trendsConfig: {
          ...state.editableStrategy.trendsConfig,
          trends: state.editableStrategy.trendsConfig.trends
            .map((trend, index) => index === inputIndex
              ? inputTrend
              : trend),
        },
      },
    });
  };

  const onAddTriggersAndAction = () => {
    setState({
      ...state,
      editableStrategy: {
        ...state.editableStrategy,
        triggersAndActions: (state.editableStrategy.triggersAndActions || [])
          .concat({
            action: {
              behavior: {
                type: null,
                value: null,
              },
              type: null,
            },
            comment: '',
            triggersOR: [{
              triggersAND: [{
                comment: '',
                expectedValue: null,
                operationType: null,
                operator: null,
                dataSourceType: null,
              }],
            }],
          }),
      },
    });
  };

  const onDeleteTrigger = (inputIndex) => {
    setState({
      ...state,
      editableStrategy: {
        ...state.editableStrategy,
        triggersAndActions: state.editableStrategy.triggersAndActions
          .filter((_, index) => index !== inputIndex),
      },
    });
  };

  const onSaveStrategy = () => {
    fetchSaveStrategy(state.editableStrategy);
  };

  useEffect(() => {
    fetchStrategies();
    fetchPossibleValues();
    setState(prevState => ({
      ...prevState,
      componentDidMount: true,
    }));
  }, []);

  useEffect(() => {
    if (state.componentDidMount
      && !saveStrategy.isFetching
      && !saveStrategy.isFailed
    ) {
      setState(prevState => ({
        ...prevState,
        editableStrategy: null,
        openEditDialog: false,
      }));
    }
  }, [saveStrategy.isFetching]);

  return (
    <div className={classes.container}>
      <div>
        <Button
          disabled={!possibleValues.data}
          onClick={onStartCreateStrategy}
        >
          Create Strategy
        </Button>
      </div>
      {(strategies.list || []).map(strategy => (
        <Typography>
          {strategy.name}
        </Typography>
      ))}
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
            <div className={classes.dialogContentContainer}>
              <div className={classes.dialogContentSectionContainer}>
                <div className={classes.dialogContentPairContainer}>
                  <div className={classes.dialogContentPairLeft}>
                    <Typography variant="subTitle">
                      <strong>
                        Название:
                      </strong>
                    </Typography>
                  </div>
                  <div className={classes.dialogContentPairRight}>
                    <TextField
                      onChange={({ target }) => onChangeName(target.value)}
                      value={state.editableStrategy?.name}
                    />
                  </div>
                </div>
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
                <div className={classes.dialogContentPairContainer}>
                  <div className={classes.dialogContentPairLeft}>
                    <Typography>
                      - Максимальный процент отклонения достоверности для верхнего и нижнего трендов:
                    </Typography>
                  </div>
                  <div className={classes.dialogContentPairRight}>
                    <TextField
                      inputType="number"
                      onChange={({ target }) => onChangeSubTrendsShiftPercent(target.value)}
                      value={state.editableStrategy?.trendsConfig?.subTrendsShiftPercent}
                    />
                  </div>
                </div>
                <div className={classes.dialogContentPairContainer}>
                  <div className={classes.dialogContentPairLeft}>
                    <Typography>
                      - Тренды:
                    </Typography>
                  </div>
                  <div className={classes.dialogContentPairRight}>
                    <div className={classes.trendsContainer}>
                      {(state.editableStrategy?.trendsConfig?.trends || [])
                        .map((trend, index) => (
                          <Card>
                            <CardContent>
                              <Card variant="edit">
                                <CardTitle>
                                  <Typography>
                                    {`Индекс: ${index}`}
                                  </Typography>
                                  <IconButton onClick={()=> onDeleteTrend(index)}>
                                    <IconDelete size={24} />
                                  </IconButton>
                                </CardTitle>
                                <CardContent>
                                  <Trend
                                    onChange={(newTrend) => onChangeTrend({
                                      index,
                                      trend: newTrend,
                                    })}
                                    trend={trend}
                                    possibleMeasures={possibleValues.data.measures}
                                  />
                                </CardContent>
                              </Card>
                            </CardContent>
                          </Card>
                        ))}
                      <Button
                        colorVariant="primary"
                        onClick={onAddTrend}
                        variant="primary"
                      >
                        Добавить тренд
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <div className={classes.dialogContentSectionContainer}>
                <Typography variant="subTitle">
                  <strong>
                    Триггеры и действия:
                  </strong>
                </Typography>
                {state.editableStrategy?.triggersAndActions
                  ?.map((triggerAndAction, index) => (
                    <Card>
                      <CardContent>
                        <Card variant="edit">
                          <CardTitle>
                            <div className={classes.triggerAndActionTitleContainer}>
                              <Typography variant="subtitle">
                                Название:
                              </Typography>
                              <TextField
                                fullWidth
                                onChange={({ target }) => onChangeTriggerAndAction({
                                  index,
                                  triggerAndAction: {
                                    ...triggerAndAction,
                                    comment: target.value,
                                  },
                                })}
                                value={triggerAndAction.comment}
                              />
                            </div>
                            <IconButton onClick={()=> onDeleteTrigger(index)}>
                              <IconDelete size={24} />
                            </IconButton>
                          </CardTitle>
                          <CardContent>
                            <TriggerAndAction
                              onChange={(newData) => onChangeTriggerAndAction({
                                index,
                                triggerAndAction: newData,
                              })}
                              possibleActionTypes={possibleValues.data.actionTypes}
                              possibleBehaviorTypes={possibleValues.data.behaviorTypes}
                              possibleDataSourceTypes={possibleValues.data.dataSourceTypes}
                              possibleOperationTypes={possibleValues.data.operationTypes}
                              possibleOperators={possibleValues.data.operators}
                              triggerAndAction={triggerAndAction}
                            />
                          </CardContent>
                        </Card>
                      </CardContent>
                    </Card>
                  ))}
                <Button
                  colorVariant="secondary"
                  onClick={onAddTriggersAndAction}
                  variant="secondary"
                >
                  Добавить триггеры и действие
                </Button>
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
                isLoading={saveStrategy.isFetching}
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