import * as pages from './pages';
import config from 'config';

const result = {
  [pages.defaultPage]: `${config.UI_URL_PREFIX}/${pages.defaultPage}`,
  [pages.historicalData]: `${config.UI_URL_PREFIX}/${pages.historicalData}`,
  [pages.strategies]: `${config.UI_URL_PREFIX}/${pages.strategies}`,
};

export default result;
