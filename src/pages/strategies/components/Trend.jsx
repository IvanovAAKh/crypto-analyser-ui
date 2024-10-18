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

function Trend({
  onChange,
  trend,
  possibleMeasures,
}) {
  const { theme } = useTheme();
  const classes = getClasses({ theme });

  const onChangeMeasure = (value) => {
    onChange({
      ...trend,
      measure: value,
    });
  };

  const onChangeValue = (value) => {
    onChange({
      ...trend,
      value: value,
    });
  };

  return (
    <div className={classes.container}>
      <div className={classes.contentPairContainer}>
        <div className={classes.contentPairLeft}>
          <Typography>
            Единица времени:
          </Typography>
        </div>
        <div className={classes.contentPairRight}>
          <Select
            onChange={({ target }) => onChangeMeasure(target.value)}
            value={trend.measure}
          >
            {Object.values(possibleMeasures).map(measure => (
              <MenuItem value={measure}>
                {measure}
              </MenuItem>
            ))}
          </Select>
        </div>
      </div>
      <div className={classes.contentPairContainer}>
        <div className={classes.contentPairLeft}>
          <Typography>
            Значение:
          </Typography>
        </div>
        <div className={classes.contentPairRight}>
          <TextField
            inputType="number"
            onChange={({ target }) => onChangeValue(target.value)}
            value={trend.value}
          />
        </div>
      </div>
    </div>
  );
}

export default Trend;