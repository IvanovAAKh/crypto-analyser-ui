import { createUseStyles } from 'react-jss';
import React from 'react';
import AccordionSummaryMui from '@mui/material/AccordionSummary';
import useTheme from 'hooks/useTheme';

const getClasses = createUseStyles({
  paddingNone: {
    padding: '0px',
  },
});

const AccordionSummary = ({
  children,
  disablePadding = false,
  expandIcon,
}) => {
  const { theme } = useTheme();
  const { classes } = getClasses(theme);
  return (
    <AccordionSummaryMui
      className={disablePadding ? classes.paddingNone : ''}
      expandIcon={expandIcon}
    >
      {children}
    </AccordionSummaryMui>
  );
};

export default AccordionSummary;
