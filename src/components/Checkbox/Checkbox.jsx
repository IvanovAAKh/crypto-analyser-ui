import React from 'react';
import CheckboxMUI from '@mui/material/Checkbox';
import useTheme from 'misc/hooks/useTheme';

const Checkbox = ({
  checked = false,
  disabled = false,
  disableHoverSpace = false,
  onChange,
}) => {
  const { theme } = useTheme();
  return (
    <CheckboxMUI
      checked={checked}
      disabled={disabled}
      onChange={onChange}
      size="small"
      sx={{ margin: disableHoverSpace ? `-${theme.spacing(1)}px` : '0px' }}
    />
  );
};

export default Checkbox;
