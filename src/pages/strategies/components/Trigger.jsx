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

function Trigger({
  onChange,
  possibleDataSourceTypes,
  possibleOperationTypes,
  possibleOperators,
  trigger,
}) {
  const { theme } = useTheme();
  const classes = getClasses({ theme });

  const onChangeExpectedValue = (value) => {
    onChange({
      ...trigger,
      expectedValue: value,
    });
  };

  const onChangeOperationType = (value) => {
    onChange({
      ...trigger,
      operationType: value,
    });
  };

  const onChangeOperator = (value) => {
    onChange({
      ...trigger,
      operator: value,
    });
  };

  const onChangeDataSourceType = (value) => {
    onChange({
      ...trigger,
      dataSourceType: value,
    });
  };

  return (
    <div className={classes.container}>
      <div className={classes.contentPairContainer}>
        <div className={classes.contentPairLeft}>
          <Typography>
            Источник информации:
          </Typography>
        </div>
        <div className={classes.contentPairRight}>
          <Select
            onChange={({ target }) => onChangeDataSourceType(target.value)}
            value={trigger.dataSourceType}
          >
            {Object.values(possibleDataSourceTypes).map(dataSourceType => (
              <MenuItem value={dataSourceType}>
                {dataSourceType}
              </MenuItem>
            ))}
          </Select>
        </div>
      </div>
      <div className={classes.contentPairContainer}>
        <div className={classes.contentPairLeft}>
          <Typography>
            Тип операции:
          </Typography>
        </div>
        <div className={classes.contentPairRight}>
          <Select
            onChange={({ target }) => onChangeOperationType(target.value)}
            value={trigger.operationType}
          >
            {Object.values(possibleOperationTypes).map(operationType => (
              <MenuItem value={operationType}>
                {operationType}
              </MenuItem>
            ))}
          </Select>
        </div>
      </div>
      <div className={classes.contentPairContainer}>
        <div className={classes.contentPairLeft}>
          <Typography>
            Оператор:
          </Typography>
        </div>
        <div className={classes.contentPairRight}>
          <Select
            onChange={({ target }) => onChangeOperator(target.value)}
            value={trigger.operator}
          >
            {Object.values(possibleOperators).map(operator => (
              <MenuItem value={operator}>
                {operator}
              </MenuItem>
            ))}
          </Select>
        </div>
      </div>
      <div className={classes.contentPairContainer}>
        <div className={classes.contentPairLeft}>
          <Typography>
            Ожидаемое значение:
          </Typography>
        </div>
        <div className={classes.contentPairRight}>
          <TextField
            inputType="number"
            onChange={({ target }) => onChangeExpectedValue(target.value)}
            value={trigger.expectedValue}
          />
        </div>
      </div>
    </div>
  );
}

export default Trigger;