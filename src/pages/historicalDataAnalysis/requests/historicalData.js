import axios from 'misc/requests';
import config from 'config';

const getHistoricalData = ({
  aggregateInMinutes=1,
  timestampFrom,
  timestampTo,
}) => {
  const {
    CRYPTO_ANALYSER,
  } = config;

  return axios.get(
    `${CRYPTO_ANALYSER}/historicalData/_list`,
    {
      params: {
        aggregateInMinutes,
        timestampFrom,
        timestampTo,
      },
    },
  );
};

const getBinanceHistoricalData = ({
  endTime,
  interval,
  limit = 999,
  symbol,
  startTime,
}) => {
  return axios.get(
    `https://api.binance.com/api/v3/klines`,
    {
      params: {
        endTime,
        interval,
        limit,
        symbol,
        startTime,
      },
    },
  );
};

const fetchHistoricalData = ({
  aggregateInMinutes=1,
  onFailed = () => {},
  onRequest = () => {},
  onSuccess = () => {},
  timestampFrom,
  timestampTo,
}) => {
  onRequest();
  return getHistoricalData({
    aggregateInMinutes,
    timestampFrom,
    timestampTo,
  }).then(response => onSuccess(response))
    .catch(error => onFailed(error));
};

const fetchBinanceHistoricalData = ({
  aggregateInMinutes = 1,
  currencyFrom,
  currencyTo,
  onFailed = () => {},
  onRequest = () => {},
  onSuccess = () => {},
  timestampFrom,
  timestampTo,
}) => {
  onRequest();
  const limitPoints = 1000;
  const oneMinuteAsTimestamp = 60 * 1000;
  const rangeInMinutes = (timestampTo - timestampFrom) / oneMinuteAsTimestamp;
  const desiredPointsCount = rangeInMinutes / aggregateInMinutes;
  const requestsCount = Math.ceil(desiredPointsCount / limitPoints);
  const requestShiftForTimestampTo = limitPoints * aggregateInMinutes * oneMinuteAsTimestamp;
  const shiftForAvoidOverlap = oneMinuteAsTimestamp * aggregateInMinutes;
  const promises = Array
    .from(new Array(requestsCount).keys())
    .map((requestIndex) => {
      const partialTimestampFrom = timestampFrom + (requestIndex * requestShiftForTimestampTo) + shiftForAvoidOverlap;
      const partialTimestampTo = partialTimestampFrom - shiftForAvoidOverlap + requestShiftForTimestampTo;
      const dateFrom = new Date(partialTimestampFrom);
      const dateTo = new Date(partialTimestampTo);
      return getBinanceHistoricalData({
        endTime: partialTimestampTo,
        interval: `${aggregateInMinutes}m`,
        limit: limitPoints,
        startTime: partialTimestampFrom,
        symbol: `${currencyFrom}${currencyTo}`,
      });
    });
  return Promise.all(promises)
    .then((response) => {
      const combinedResponses = response
        .reduce((acc, requestResponse) => {
          return acc.concat(requestResponse);
        }, []);
      onSuccess(combinedResponses);
    })
    .catch((error) => onFailed(error))
};

export default {
  fetchBinanceHistoricalData,
  fetchHistoricalData,
};
