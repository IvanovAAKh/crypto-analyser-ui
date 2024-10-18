import { createUseStyles } from 'react-jss';
import React from 'react';
import InputAdornmentMui from '@mui/material/InputAdornment';
import TextFieldMui from '@mui/material/TextField';
import useTheme from 'misc/hooks/useTheme';

const getClasses = createUseStyles((theme) => ({
  caption: theme.typography.variants.caption,
  default: theme.typography.variants.default,
  input: {
    '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
      display: 'none',
    },
    '& input[type=number]': {
      MozAppearance: 'textfield',
    },
  },
  subtitle: theme.typography.variants.subtitle,
  title: theme.typography.variants.title,
}));

const positionOptions = {
  BOTTOM: 'bottom',
  CENTER: 'center',
  TOP: 'top',
};

const adornmentPositionToFlexVariant = {
  [positionOptions.BOTTOM]: 'flex-end',
  [positionOptions.CENTER]: 'center',
  [positionOptions.TOP]: 'flex-start',
};

const TextField = ({
  AdornmentStart,
  AdornmentEnd,
  adornmentPosition = 'center', // 'top' | 'center' | 'bottom'
  autoFocus = false,
  disabled = false,
  fullWidth = false,
  helperText,
  inputRef,
  inputType = 'text',
  isError = false,
  label,
  minRows,
  multiline = false,
  onBlur,
  onChange,
  onSelect,
  placeholder,
  size, // 'medium' | 'small'
  textVariant = 'default', // 'caption' | 'default' | 'subtitle' | 'title'
  value,
  variant = 'standard', // 'filled' | 'outlined' | 'standard'
}) => {
  const { theme } = useTheme();
  const classes = getClasses({ theme });

  return (
    <TextFieldMui
      autoFocus={autoFocus}
      className={classes.input}
      disabled={disabled}
      error={isError}
      fullWidth={fullWidth}
      helperText={helperText}
      InputProps={{
        classes: {
          input: classes[textVariant],
        },
        endAdornment: AdornmentEnd && (
          <InputAdornmentMui position="end">
            {AdornmentEnd}
          </InputAdornmentMui>
        ),
        startAdornment: AdornmentStart && (
          <InputAdornmentMui position="start">
            {AdornmentStart}
          </InputAdornmentMui>
        ),
        sx: { alignItems: adornmentPositionToFlexVariant[adornmentPosition] },
      }}
      inputRef={inputRef}
      label={label}
      minRows={minRows}
      multiline={multiline}
      onBlur={onBlur}
      onChange={onChange}
      onSelect={onSelect}
      placeholder={placeholder}
      size={size}
      type={inputType}
      value={value}
      variant={variant}
    />
  );
};

export default TextField;
