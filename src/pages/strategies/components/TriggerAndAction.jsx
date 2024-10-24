import React from 'react';
import { createUseStyles } from 'react-jss';
import useTheme from 'misc/hooks/useTheme';
import Button from 'components/Button';
import Card from 'components/Card';
import CardContent from 'components/CardContent';
import CardTitle from 'components/CardTitle';
import Divider from 'components/Divider';
import IconButton from 'components/IconButton';
import IconDelete from 'components/icons/Delete';
import TextField from 'components/TextField';
import Typography from 'components/Typography';

import Action from './Action';
import Trigger from './Trigger';

const getClasses = createUseStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${theme.spacing(2)}px`,
  },
  contentPairContainer: {
    display: 'flex',
    gap: `${theme.spacing(2)}px`,
  },
  contentPairLeft: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    gap: `${theme.spacing(1)}px`,
  },
  contentPairRight: {
    display: 'flex',
    flex: 4,
    flexDirection: 'column',
    gap: `${theme.spacing(1)}px`,
  },
  dividerORLabelContainer: {
    alignItems: 'center',
    borderRadius: '16px',
    display: 'flex',
    justifyContent: 'center',
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
    background: theme.colors.background.tertiary,
  },
  dividerANDLabelContainer: {
    alignItems: 'center',
    borderRadius: '16px',
    display: 'flex',
    justifyContent: 'center',
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
    background: theme.colors.background.tertiary,
  },
  verticalCenter: {
    alignItems: 'center',
    display: 'flex',
    height: '100%',
  },
  triggersORContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${theme.spacing(2)}px`,
  },
  triggersANDContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${theme.spacing(2)}px`,
    paddingBottom: `${theme.spacing(1)}px`,
  },
  triggerTitleContainer: {
    alignItems: 'center',
    display: 'flex',
    gap: `${theme.spacing(2)}px`,
    width: '100%',
  },
}));

function TriggerAndAction({
  onChange,
  possibleActionTypes,
  possibleBehaviorTypes,
  possibleDataSourceTypes,
  possibleDataValueTypes,
  possibleOperationTypes,
  possibleOperators,
  triggerAndAction,
}) {
  const { theme } = useTheme();
  const classes = getClasses({ theme });

  const onAddTriggerOR = () => {
    onChange({
      ...triggerAndAction,
      triggersOR: triggerAndAction.triggersOR.concat({
        triggersAND: [{
          comment: '',
          operandA: {
            byDataSource: null,
            byValue: null,
          },
          operandB: {
            byDataSource: null,
            byValue: null,
          },
          expectedResult: {
            byDataSource: null,
            byValue: null,
          },
          operationType: null,
          operator: null,
        }],
      }),
    });
  };

  const onAddTriggerAND = (indexOR) => {
    onChange({
      ...triggerAndAction,
      triggersOR: triggerAndAction.triggersOR
        .map((triggerOR, index) => index === indexOR
          ? ({
            ...triggerOR,
            triggersAND: triggerOR.triggersAND.concat({
              comment: '',
              operandA: {
                byDataSource: null,
                byValue: null,
              },
              operandB: {
                byDataSource: null,
                byValue: null,
              },
              expectedResult: {
                byDataSource: null,
                byValue: null,
              },
              operationType: null,
              operator: null,
            }),
          })
          : triggerOR
        ),
    });
  };

  const onDeleteTrigger = ({
    indexOR: inputIndexOR,
    indexAND: inputIndexAND,
  }) => {
    onChange({
      ...triggerAndAction,
      triggersOR: triggerAndAction.triggersOR
        .reduce((acc, triggerOR, indexOR) => {
          if (indexOR !== inputIndexOR) {
            acc.push(triggerOR);
          } else {
            const triggersAND = triggerOR.triggersAND
              .filter((_, indexAND) => indexAND !== inputIndexAND);
            if (triggersAND.length) {
              acc.push({
                ...triggerOR,
                triggersAND,
              });
            }
          }
          return acc;
        }, []),
    });
  };

  const onChangeTrigger = ({
    indexAND: inputIndexAND,
    indexOR: inputIndexOR,
    trigger,
  }) => {
    onChange({
      ...triggerAndAction,
      triggersOR: triggerAndAction.triggersOR
        .map((triggerOR, indexOR) => indexOR === inputIndexOR
          ? ({
            ...triggerOR,
            triggersAND: triggerOR.triggersAND
              .map((triggerAND, indexAND) => indexAND === inputIndexAND
                ? ({
                  ...triggerAND,
                  ...trigger,
                })
                : triggerAND
              ),
          })
          : triggerOR
        ),
    });
  };

  const onChangeAction = (action) => {
    onChange({
      ...triggerAndAction,
      action,
    })
  };

  return (
    <div className={classes.container}>
      <div className={classes.contentPairContainer}>
        <div className={classes.contentPairLeft}>
          <Typography>
            Действие:
          </Typography>
        </div>
        <div className={classes.contentPairRight}>
          <Card>
            <CardContent>
              <Card variant="edit">
                <CardContent>
                  <Action
                    action={triggerAndAction.action}
                    onChange={(action) => onChangeAction(action)}
                    possibleActionTypes={possibleActionTypes}
                    possibleBehaviorTypes={possibleBehaviorTypes}
                  />
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className={classes.contentPairContainer}>
        <div className={classes.contentPairLeft}>
          <Typography>
            Триггеры:
          </Typography>
        </div>
        <div className={classes.contentPairRight}>
          <div className={classes.triggersORContainer}>
            {triggerAndAction.triggersOR.map((triggerOR, indexOR) => (
              <>
                {indexOR > 0 && (
                  <Divider showLine={false}>
                    <div className={classes.dividerORLabelContainer}>
                      <Typography color="primaryContrast">
                        <strong>
                          OR
                        </strong>
                      </Typography>
                    </div>
                  </Divider>
                )}
                <Card>
                  <CardContent>
                    <div className={classes.triggersANDContainer}>
                      {triggerOR.triggersAND.map((triggerAND, indexAND) => (
                        <>
                          {indexAND > 0 && (
                            <Divider showLine={false}>
                              <div className={classes.dividerANDLabelContainer}>
                                <Typography color="primaryContrast">
                                  <strong>
                                    AND
                                  </strong>
                                </Typography>
                              </div>
                            </Divider>
                          )}
                          <Card variant="edit">
                            <CardTitle>
                              <div className={classes.triggerTitleContainer}>
                                <Typography variant="subtitle">
                                  Название:
                                </Typography>
                                <TextField
                                  onChange={({ target }) => onChangeTrigger({
                                    indexAND,
                                    indexOR,
                                    trigger: {
                                      ...triggerAND,
                                      comment: target.value,
                                    },
                                  })}
                                  fullWidth
                                  value={triggerAND.comment}
                                />
                              </div>
                              <IconButton onClick={()=> onDeleteTrigger({
                                indexOR,
                                indexAND,
                              })}>
                                <IconDelete size={24} />
                              </IconButton>
                            </CardTitle>
                            <CardContent>
                              <Trigger
                                onChange={(changedTrigger) => onChangeTrigger({
                                  indexAND,
                                  indexOR,
                                  trigger: changedTrigger,
                                })}
                                possibleDataSourceTypes={possibleDataSourceTypes}
                                possibleDataValueTypes={possibleDataValueTypes}
                                possibleOperationTypes={possibleOperationTypes}
                                possibleOperators={possibleOperators}
                                trigger={triggerAND}
                              />
                            </CardContent>
                          </Card>
                        </>
                      ))}
                      <Divider showLine={false}>
                        <div className={classes.dividerANDLabelContainer}>
                          <Typography color="primaryContrast">
                            <strong>
                              AND
                            </strong>
                          </Typography>
                        </div>
                      </Divider>
                      <div>
                        <Button onClick={() => onAddTriggerAND(indexOR)}>
                          Add trigger
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ))}
            {!!triggerAndAction.triggersOR.length && (
              <Divider showLine={false}>
                <div className={classes.dividerORLabelContainer}>
                  <Typography color="primaryContrast">
                    <strong>
                      OR
                    </strong>
                  </Typography>
                </div>
              </Divider>
            )}
            <Button onClick={onAddTriggerOR}>
              Add trigger
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TriggerAndAction;