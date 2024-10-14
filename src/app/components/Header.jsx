import React, { useMemo } from 'react';
import { createUseStyles } from 'react-jss';
import Typography from 'components/Typography';
import useCurrentPage from 'misc/hooks/useCurrentPage';
import useTheme from 'misc/hooks/useTheme';

import LeftNavBar from './LeftNavBar';

const getClasses = createUseStyles((theme) => ({
  container: {
    color: theme.header.color.text.primary,
    background: theme.header.color.background,
    boxShadow: '0px 0px 6px 0px',
    display: 'flex',
    height: `${theme.header.height}px`,
    zIndex: 1300,
  },
  content: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
    width: '100%',
  },
  toolBarContainerLeft: {
    alignItems: 'center',
    display: 'flex',
    gap: `${theme.spacing(1)}px`,
  },
  toolBarContainerRight: {
    alignItems: 'center',
    display: 'flex',
    gap: `${theme.spacing(1)}px`,
    justifyContent: 'flex-end',
  },
}));

const rightPanelItemTypes = {
  PAGE_NAME: 'pageName',
  SEPARATOR: 'separator',
};

function Header() {
  const { theme } = useTheme();
  const classes = getClasses({ theme });
  const currentPage = useCurrentPage();

  const actualOrderedRightPanelItemTypes = useMemo(() => {
    const result = [];
    result.push(rightPanelItemTypes.PAGE_NAME);
    return result.reduce((acc, item, index) => {
      if (index > 0) {
        acc.push(rightPanelItemTypes.SEPARATOR);
      }
      acc.push(item);
      return acc;
    }, []);
  }, []);

  return (
    <div className={classes.container}>
      <div className={classes.content}>
        <div className={classes.toolBarContainerLeft}>
          <LeftNavBar />
          {actualOrderedRightPanelItemTypes.map((itemType) => (
            <>
              {itemType === rightPanelItemTypes.PAGE_NAME && (
                <Typography
                  color="paper"
                  noWrap
                  variant="subtitle"
                >
                  {currentPage}
                </Typography>
              )}
            </>
          ))}
        </div>
        <div className={classes.toolBarContainerRight}>
          {actualOrderedRightPanelItemTypes.map((itemType) => (
            <>
              {itemType === rightPanelItemTypes.SEPARATOR && (
                <Typography
                  color="paper"
                  variant="subtitle"
                >
                  <strong>
                    |
                  </strong>
                </Typography>
              )}
            </>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Header;
