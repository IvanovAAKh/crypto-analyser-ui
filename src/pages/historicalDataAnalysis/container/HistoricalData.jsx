import React, {useEffect, useMemo, useRef, useState} from 'react';
import Highstock from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';

import requestsHistoricalData from '../requests/historicalData';

const historicalDataBEtoUI = (response) => {
  const list = response.list.map(item => ({
    high: item.high,
    close: item.close,
    low: item.low,
    open: item.open,
    timestamp: item.timestamp * 1000,
  }));

  return list;
};

const historicalDataBinanceToUI = (response) => {
  const list = response.map(([timestamp, open, high, low, close]) => ({
    high: Number(high),
    close: Number(close),
    low: Number(low),
    open: Number(open),
    timestamp,
  }));
  console.log(list);
  return list;
};

const minMaxTimestampBEtoUI = (response) => {
  return {
    min: response.collectionMetadata.timestamp.min,
    max: response.collectionMetadata.timestamp.max,
  };
};

const TIME_MEASURES = {
  minutes: 'minutes',
  hours: 'hours',
  days: 'days',
  weeks: 'weeks',
  months: 'months',
};

const minutesConvertersToTimeMeasures = {
  [TIME_MEASURES.minutes]: minutes => minutes,
  [TIME_MEASURES.hours]: hours => hours * 60,
  [TIME_MEASURES.days]: days => days * 60 * 24,
  [TIME_MEASURES.weeks]: weeks => weeks * 60 * 24 * 7,
  [TIME_MEASURES.months]: months => months * 60 * 24 * 31,
};

const getTimestampBefore = ({
  currentTimestamp,
  timeMeasure,
  value,
  withMillis = false,
}) => {
  const converter = minutesConvertersToTimeMeasures[timeMeasure];
  const minutesBefore = converter(value);
  return currentTimestamp - minutesBefore * 60 * (withMillis ? 1000: 1);
};

function HistoricalData() {
  const containerRef = useRef(null);
  const [historicalData, setHistoricalData] = useState({
    errorMsg: '',
    isFailed: false,
    isFetching: false,
    list: null,
  });
  const [timestampMinMax, setTimestampMinMax] = useState({
    errorMsg: '',
    isFailed: false,
    isFetching: false,
    minMax: null,
  });

  const fetchHistoricalData = ({
    aggregateInMinutes,
    timestampFrom,
    timestampTo,
  }) => {
    requestsHistoricalData.fetchHistoricalData({
      aggregateInMinutes: 1,
      onFailed: (error) => setHistoricalData({
        ...historicalData,
        errorMsg: error,
        isFailed: true,
        isFetching: false,
      }),
      onRequest: () => setHistoricalData({
        ...historicalData,
        isFailed: false,
        isFetching: true,
      }),
      onSuccess: (response) => setHistoricalData({
        ...historicalData,
        isFetching: false,
        list: historicalDataBEtoUI(response),
      }),
      timestampFrom,
      timestampTo,
    });
  };

  const fetchBinanceHistoricalData = ({
    aggregateInMinutes,
    currencyFrom,
    currencyTo,
    timestampFrom,
    timestampTo,
  }) => {
    requestsHistoricalData.fetchBinanceHistoricalData({
      aggregateInMinutes,
      currencyFrom,
      currencyTo,
      onFailed: (error) => setHistoricalData({
        ...historicalData,
        errorMsg: error,
        isFailed: true,
        isFetching: false,
      }),
      onRequest: () => setHistoricalData({
        ...historicalData,
        isFailed: false,
        isFetching: true,
      }),
      onSuccess: (response) => setHistoricalData({
        ...historicalData,
        isFetching: false,
        list: historicalDataBinanceToUI(response),
      }),
      timestampTo,
      timestampFrom,
    });
  };

  const fetchTimestampMinMax = () => {
    requestsHistoricalData.fetchHistoricalData({
      onFailed: (error) => setTimestampMinMax({
        ...timestampMinMax,
        errorMsg: error,
        isFailed: true,
        isFetching: false,
      }),
      onRequest: () => setTimestampMinMax({
        ...timestampMinMax,
        isFailed: false,
        isFetching: true,
      }),
      onSuccess: response => setTimestampMinMax({
        ...timestampMinMax,
        isFetching: false,
        minMax: minMaxTimestampBEtoUI(response),
      }),
      timestampFrom: 0,
      timestampTo: 0,
    });
  };

  const chart = useMemo(() => {
    if (!historicalData.list) {
      return null;
    }
    return {
      chart: {
        height: containerRef.current.getBoundingClientRect().height,
      },
      rangeSelector: {
        buttons: [
          {
            type: 'hour',
            count: 1,
            text: '1h'
          },
          {
            type: 'hour',
            count: 6,
            text: '6h'
          },
          {
            type: 'hour',
            count: 12,
            text: '12h'
          },
          {
            type: 'day',
            count: 1,
            text: '1d'
          },
          {
            type: 'day',
            count: 3,
            text: '3d'
          },
          {
            type: 'day',
            count: 7,
            text: '7d'
          },
          {
            type: 'day',
            count: 14,
            text: '14d'
          },
        ],
        selected: 0,
        inputEnabled: false
      },
      time: {
        timezone: 'Europe/Kiev',
      },
      tooltip: {
        formatter: function () {
          const date = new Date(this.x);
          const formattedDate = date.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });
          const difference = Math.abs(this.point.close - this.point.open).toFixed(2);
          const differenceStr = `<span style="color:${this.point.color}"><b>${difference}</b></span>`;
          return '' +
            `<span style="color:${this.point.color}"> ● </span>` +
            `<b>${formattedDate}</b>` +
            '<br/>' +
            `<br/>Open: <b>${Number(this.point.open.toFixed(0)).toLocaleString('ru-RU')}</b>` +
            `<br/>Close: <b>${Number(this.point.close.toFixed(0)).toLocaleString('ru-RU')}</b>` +
            '<br/>' +
            '<br/>Difference: ' + differenceStr;
        },
      },
      navigator: {
        series: {
          color: '#000000'
        }
      },
      xAxis: {
        overscroll: 500000,
        range: 4 * 200000,
        gridLineWidth: 1
      },
      yAxis: {
        alignTicks: true,
        tickAmount: 7,
        crosshair: {
          label: {
            backgroundColor: '#00b0ff',
            enabled: true,
            format: '{value:.0f}',
            style: {
              fontWeight: 'bold',
              fontSize: '14px',
            },
          },
          snap: false,
        },
        labels: {
          format: '{value}',
          style: {
            fontWeight: 'bold',
            fontSize: '14px',
          },
        },
        offset: 50,
      },
      series: [
        {
          animation: false,
          crisp: false,
          dataGrouping: {
            enabled: true,
            units: [
              [
                'minute',
                [1],
              ],
            ],
          },
          grouping: true,
          lineWidth: 0.2,
          tooltip: {
            distance: 20,
          },
          type: 'candlestick',
          data: historicalData.list.map(item => ([
            item.timestamp,
            item.open,
            item.high,
            item.low,
            item.close,
          ])),
          color: '#FF7F7F',
          upColor: '#00d22d',
        },
      ],
    };
  }, [historicalData.list]);

  useEffect(() => {
    if (timestampMinMax.minMax
      && !timestampMinMax.isFetching
      && !timestampMinMax.isFailed
    ) {
      fetchHistoricalData({
        aggregateInMinutes: 1,
        timestampFrom: getTimestampBefore({
          currentTimestamp: timestampMinMax.minMax.max,
          timeMeasure: TIME_MEASURES.months,
          value: 4,
        }),
        timestampTo:timestampMinMax.minMax.max,
      });
    }
  }, [timestampMinMax]);

  useEffect(() => {
    // fetchTimestampMinMax();
    const timestampTo = Date.now();
    fetchBinanceHistoricalData({
      aggregateInMinutes: 1,
      currencyFrom: 'BTC',
      currencyTo: 'USDT',
      timestampTo,
      timestampFrom: getTimestampBefore({
        currentTimestamp: timestampTo,
        timeMeasure: TIME_MEASURES.days,
        value: 14,
        withMillis: true,
      }),
    });
  }, []);

  return (
    <div
      style={{
        height: '100%',
      }}
      ref={containerRef}
    >
      {chart && (
        <HighchartsReact
          constructorType="stockChart"
          highcharts={Highstock}
          options={chart}
        />
      )}
    </div>
  );
}

export default HistoricalData;