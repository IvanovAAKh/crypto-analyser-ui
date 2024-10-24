import React from 'react';
import AccordionMui from '@mui/material/Accordion';
import useTheme from 'misc/hooks/useTheme';

const Accordion = ({
  expanded,
  children,
  onChange,
}) => {
  const { theme } = useTheme();
  return (
    <AccordionMui
      expanded={expanded}
      onChange={onChange}
      sx={{
        backgroundColor: theme.colors.background.tertiary,
      }}
    >
      {children}
    </AccordionMui>
  );
};

export default Accordion;
