import React from 'react';
import { createUseStyles } from 'react-jss';
import useTheme from 'misc/hooks/useTheme';
import MenuItem from 'components/MenuItem';
import Select from 'components/Select';
import TextField from 'components/TextField';
import Typography from 'components/Typography';

const getClasses = createUseStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${theme.spacing(1)}px`,
  },
  contentPairContainer: {
    display: 'flex',
    gap: `${theme.spacing(2)}px`,
  },
  contentPairLeft: {
    justifyContent: 'center',
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    gap: `${theme.spacing(1)}px`,
  },
  contentPairRight: {
    display: 'flex',
    flex: 2,
    flexDirection: 'column',
    gap: `${theme.spacing(1)}px`,
  },
}));

function Action({
  action,
  onChange,
  possibleActionTypes,
  possibleBehaviorTypes,
}) {
  const { theme } = useTheme();
  const classes = getClasses({ theme });

  const onChangeActionType = (value) => {
    onChange({
      ...action,
      type: value,
    });
  };

  const onChangeBehaviorType = (value) => {
    onChange({
      ...action,
      behavior: {
        ...action.behavior,
        type: value,
        value: value === 'all'
          ? null
          : action.behavior.value,
      },
    });
  };

  const onChangeBehaviorValue = (value) => {
    onChange({
      ...action,
      behavior: {
        ...action.behavior,
        value,
      },
    });
  };

  return (
    <div className={classes.container}>
      <div className={classes.contentPairContainer}>
        <div className={classes.contentPairLeft}>
          <Typography>
            Тип действия:
          </Typography>
        </div>
        <div className={classes.contentPairRight}>
          <Select
            onChange={({ target }) => onChangeActionType(target.value)}
            value={action.type}
          >
            {Object.values(possibleActionTypes).map(actionType => (
              <MenuItem value={actionType}>
                {actionType}
              </MenuItem>
            ))}
          </Select>
        </div>
      </div>
      <div className={classes.contentPairContainer}>
        <div className={classes.contentPairLeft}>
          <Typography>
            Тип поведения:
          </Typography>
        </div>
        <div className={classes.contentPairRight}>
          <Select
            onChange={({ target }) => onChangeBehaviorType(target.value)}
            value={action.behavior.type}
          >
            {Object.values(possibleBehaviorTypes).map(behaviorType => (
              <MenuItem value={behaviorType}>
                {behaviorType}
              </MenuItem>
            ))}
          </Select>
        </div>
      </div>
      {action.behavior.type !== 'all' && (
        <div className={classes.contentPairContainer}>
          <div className={classes.contentPairLeft}>
            <Typography>
              Значение:
            </Typography>
          </div>
          <div className={classes.contentPairRight}>
            <TextField
              inputType="number"
              onChange={({ target }) => onChangeBehaviorValue(target.value)}
              value={action.behavior.value}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Action;