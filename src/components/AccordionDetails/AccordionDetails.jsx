import { createUseStyles } from 'react-jss';
import React from 'react';
import AccordionDetailsMui from '@mui/material/AccordionDetails';
import useTheme from 'misc/hooks/useTheme';

const getClasses = createUseStyles({
  paddingNone: {
    padding: '0px',
  },
});

const AccordionDetails = ({
  children,
  disablePadding = false,
}) => {
  const { theme } = useTheme();
  const classes = getClasses({ theme });
  return (
    <AccordionDetailsMui
      className={disablePadding ? classes.paddingNone : ''}
    >
      {children}
    </AccordionDetailsMui>
  );
};

export default AccordionDetails;
