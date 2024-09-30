import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const locationSearch = {
  currencyFrom: 'curF',
  currencyTo: 'curT',
  roundRatio: 'roundRatio',
  timeValue: 'timeVal',
  timeMeasure: 'timeMeasure'
};

export const DEFAULT_LOCATION_SEARCH = {
  [locationSearch.currencyFrom]: 'SUI',
  [locationSearch.currencyTo]: 'USDT',
  [locationSearch.roundRatio]: 5,
  [locationSearch.timeValue]: 60,
  [locationSearch.timeMeasure]: 'minutes'
};

function SearchParamsConfigurator() {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    let isSearchParamsUpdated = false;
    Object
      .values(locationSearch)
      .forEach(locationSearchKey => {
        if (!searchParams.has(locationSearchKey)) {
          searchParams.set(locationSearchKey, DEFAULT_LOCATION_SEARCH[locationSearchKey]);
          isSearchParamsUpdated = true;
        }
      });
    if (isSearchParamsUpdated) {
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams]);
}

export default SearchParamsConfigurator;
