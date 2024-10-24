import React from 'react';
import { createUseStyles } from 'react-jss';
import useTheme from 'misc/hooks/useTheme';
import MenuItem from 'components/MenuItem';
import Select from 'components/Select';
import TextField from 'components/TextField';

const getClasses = createUseStyles((theme) => ({
  container: {
    alignItems: 'center',
    display: 'flex',
    gap: `${theme.spacing(1)}px`,
  },
}));

const operandTypes = {
  byDataSource: 'byDataSource',
  byValue: 'byValue',
};

const getOperandType = (operand) => {
  if (operand?.byDataSource) {
    return operandTypes.byDataSource;
  } else if (operand?.byValue) {
    return operandTypes.byValue;
  }
  return null;
};

function Operand({
  onChange,
  operand,
  possibleDataSourceTypes,
  possibleDataValueTypes,
}) {
  const { theme } = useTheme();
  const classes = getClasses({ theme });

  const onChangeOperandType = (operandType) => {
    let operandPart = {};
    if (operandType === operandTypes.byDataSource) {
      operandPart = {
        byDataSource: {
          type: null,
        },
        byValue: null,
      };
    } else if (operandType === operandTypes.byValue) {
      operandPart = {
        byDataSource: null,
        byValue: {
          value: null,
          type: null,
        },
      };
    }
    onChange({
      ...operand,
      ...operandPart,
    });
  };

  const onChangeDataSourceType = (value) => {
    onChange({
      ...operand,
      byDataSource: {
        ...operand.byDataSource,
        type: value
      },
    });
  };

  const onChangeValueType = (value) => {
    onChange({
      ...operand,
      byValue: {
        ...operand.byValue,
        type: value
      },
    });
  };

  const onChangeValueValue = (value) => {
    onChange({
      ...operand,
      byValue: {
        ...operand.byValue,
        value,
      },
    });
  };

  const operandType = getOperandType(operand);

  return (
    <div className={classes.container}>
      <Select
        label="Тип операнда"
        onChange={({ target }) => onChangeOperandType(target.value)}
        value={operandType}
      >
        {Object.values(operandTypes).map(type => (
          <MenuItem value={type}>
            {type}
          </MenuItem>
        ))}
      </Select>
      {operandType === operandTypes.byDataSource && (
        <Select
          label="Источник данных"
          onChange={({ target }) => onChangeDataSourceType(target.value)}
          value={operand.byDataSource.type}
        >
          {Object.values(possibleDataSourceTypes).map(type => (
            <MenuItem value={type}>
              {type}
            </MenuItem>
          ))}
        </Select>
      )}
      {operandType === operandTypes.byValue && (
        <TextField
          label="Значение"
          inputType="number"
          onChange={({ target }) => onChangeValueValue(target.value)}
          value={operand.byValue.value}
        />
      )}
      {operandType === operandTypes.byValue && (
        <Select
          label="Тип значения"
          onChange={({ target }) => onChangeValueType(target.value)}
          value={operand.byValue.type}
        >
          {Object.values(possibleDataValueTypes).map(type => (
            <MenuItem value={type}>
              {type}
            </MenuItem>
          ))}
        </Select>
      )}
    </div>
  );
}

export default Operand;