import { createUseStyles } from 'react-jss';
import * as pages from 'constants/pages';
import IconButton from 'components/IconButton/IconButton';
import IconMenu from 'components/icons/Menu';
import Link from 'components/Link';
import MenuItem from 'components/MenuItem';
import pagesURLs from 'constants/pagesURLs';
import React, { useState } from 'react';
import SwipeableDrawer from 'components/SwipeableDrawer';
import Typography from 'components/Typography';
import useTheme from 'misc/hooks/useTheme';

const getClasses = createUseStyles((theme) => ({
  menuHeaderSpace: {
    height: theme.header.height,
  },
}));

const menuItems = [
  {
    icon: <></>,
    link: `${pagesURLs[pages.historicalData]}`,
    title: `Historical Data`,
  },
  {
    icon: <></>,
    link: `${pagesURLs[pages.strategies]}`,
    title: `Strategies`,
  },
  {
    icon: <></>,
    link: `${pagesURLs[pages.strategySimulation]}`,
    title: `Strategy Simulation`,
  },
];

function LeftNavBar() {
  const { theme } = useTheme();
  const classes = getClasses({ theme });
  const [state, setState] = useState({
    isNavMenuOpened: false,
  });

  const onClose = () => setState({
    ...state,
    isNavMenuOpened: false,
  });

  const filteredItems = menuItems;

  if (!filteredItems.length) {
    return;
  }

  return (
    <>
      <IconButton
        colorVariant="header"
        onClick={() => setState({
          ...state,
          isNavMenuOpened: true,
        })}
      >
        <IconMenu
          color="header"
          size={32}
        />
      </IconButton>
      <SwipeableDrawer
        anchor="left"
        isOpened={state.isNavMenuOpened}
        onClose={onClose}
      >
        <div className={classes.menuHeaderSpace} />
        {filteredItems.map(menuItem => (
          <Link
            onClick={onClose}
            to={{
              pathname: menuItem.link,
            }}
          >
            <MenuItem>
              {menuItem.icon}
              <Typography variant="subTitle">
                {menuItem.title}
              </Typography>
            </MenuItem>
          </Link>
        ))}
      </SwipeableDrawer>
    </>
  );
}

export default LeftNavBar;
