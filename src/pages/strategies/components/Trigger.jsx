import React from 'react';
import { createUseStyles } from 'react-jss';
import useTheme from 'misc/hooks/useTheme';
import MenuItem from 'components/MenuItem';
import Select from 'components/Select';
import TextField from 'components/TextField';
import Typography from 'components/Typography';

import Operand from './Operand';

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
  possibleDataValueTypes,
  possibleOperationTypes,
  possibleOperators,
  trigger,
}) {
  const { theme } = useTheme();
  const classes = getClasses({ theme });
  console.log(trigger);

  const onChangeExpectedResult = (value) => {
    onChange({
      ...trigger,
      expectedResult: value,
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

  const onChangeOperandA = (value) => {
    onChange({
      ...trigger,
      operandA: value,
    });
  };

  const onChangeOperandB = (value) => {
    onChange({
      ...trigger,
      operandB: value,
    });
  };

  return (
    <div className={classes.container}>
      <div className={classes.contentPairContainer}>
        <div className={classes.contentPairLeft}>
          <Typography>
            Операнд А:
          </Typography>
        </div>
        <div className={classes.contentPairRight}>
          <Operand
            onChange={onChangeOperandA}
            operand={trigger.operandA}
            possibleDataSourceTypes={possibleDataSourceTypes}
            possibleDataValueTypes={possibleDataValueTypes}
          />
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
            Операнд Б:
          </Typography>
        </div>
        <div className={classes.contentPairRight}>
          <Operand
            onChange={onChangeOperandB}
            operand={trigger.operandB}
            possibleDataSourceTypes={possibleDataSourceTypes}
            possibleDataValueTypes={possibleDataValueTypes}
          />
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
          <Operand
            onChange={onChangeExpectedResult}
            operand={trigger.expectedResult}
            possibleDataSourceTypes={possibleDataSourceTypes}
            possibleDataValueTypes={possibleDataValueTypes}
          />
        </div>
      </div>
    </div>
  );
}

export default Trigger;