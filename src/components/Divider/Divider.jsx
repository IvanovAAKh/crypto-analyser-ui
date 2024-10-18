import { createUseStyles } from 'react-jss';
import React from 'react';
import MuiDivider from '@mui/material/Divider';
import useTheme from 'misc/hooks/useTheme';

const getClasses = createUseStyles((theme) => ({
  container: {
    flexDirection: 'column',
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
  },
  labelContainer: {
    display: 'flex',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    display: 'flex',
    position: 'absolute',
  }
}));

const Divider = ({
  children,
  light = false,
  height = '16px',
  showLine = true,
}) => {
  const { theme } = useTheme();
  const classes = getClasses({ theme });

  return (
    <div
      className={classes.container}
      style={{
        height,
      }}
    >
      {!!children && (
        <div className={classes.labelContainer}>
          <div className={classes.label}>
            {children}
          </div>
        </div>
      )}
      {showLine && (
        <MuiDivider
          light={light}
          sx={{
            width: '100%',
          }}
        />
      )}
    </div>
  );
};

export default Divider;
