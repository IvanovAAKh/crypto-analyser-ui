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
  timestampFrom: inputTimestampFrom,
  timestampTo: inputTimestampTo,
}) => {
  onRequest();
  const limitPoints = 1000;
  const oneMinuteAsTimestamp = 60 * 1000;
  const timestampFrom = Math.floor(inputTimestampFrom / oneMinuteAsTimestamp) * oneMinuteAsTimestamp;
  const timestampTo = Math.floor(inputTimestampTo / oneMinuteAsTimestamp) * oneMinuteAsTimestamp;
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

const fetchDepth = () => {
  return axios.get(
    `https://api.binance.com/api/v3/depth`,
    {
      params: {
        symbol: 'BNXUSDT',
        limit: 5000,
      },
    },
  ).then(data => {
    console.log(data.asks
      .filter(([, currencyCount]) => currencyCount > 5000)
      .sort(([, val_a], [, val_b]) => val_a - val_b)
    )
  });
};

const fetchTrades = () => {
  return axios.get(
    `https://api.binance.com/api/v3/trades`,
    {
      params: {
        symbol: 'BNXUSDT',
        limit: 100,
      },
    },
  ).then(data => {
    let currentPrice = 0;
    const priceGroups = [];
    let priceGroupsPushIndex = -1;
    data.forEach(item => {
      if (currentPrice !== item.price) {
        priceGroupsPushIndex = priceGroupsPushIndex + 1;
      }
      if (!priceGroups[priceGroupsPushIndex]) {
        priceGroups[priceGroupsPushIndex] = [];
      }
      priceGroups[priceGroupsPushIndex].push(item);
      currentPrice = item.price;
    });
    console.log(priceGroups);
    const aggregatedPriceGroups = priceGroups.reduce((acc, group) => {
      const aggregatedGroup = group.reduce((groupAcc, item) => {
        let buyedCoinsCount = groupAcc.buyedCoinsCount || 0;
        let spendUSDTSum = groupAcc.spendUSDTSum || 0;
        let soldCoinsCount = groupAcc.soldCoinsCount || 0;
        let gainedUSDTSum = groupAcc.gainedUSDTSum || 0;
        if (item.isBuyerMaker) {
          buyedCoinsCount = buyedCoinsCount + +item.qty;
          spendUSDTSum = spendUSDTSum + +item.quoteQty;
        } else {
          soldCoinsCount = soldCoinsCount + +item.qty;
          gainedUSDTSum = gainedUSDTSum + +item.quoteQty;
        }
        return ({
          buyedCoinsCount,
          soldCoinsCount,
          spendUSDTSum,
          gainedUSDTSum,
          price: item.price,
        });
      }, {});
      acc.push(aggregatedGroup);
      return acc;
    }, []);
    console.log(aggregatedPriceGroups);
  });
};

export default {
  fetchBinanceHistoricalData,
  fetchHistoricalData,
  fetchTrades,
};
