import React from 'react';
import AccordionMui from '@mui/material/Accordion';
import useTheme from 'hooks/useTheme';

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
        backgroundColor: theme.card.background.paper,
      }}
    >
      {children}
    </AccordionMui>
  );
};

export default Accordion;
