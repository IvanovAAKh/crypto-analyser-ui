import React, {useEffect, useMemo, useRef, useState} from 'react';
import Highstock from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';

import requestsHistoricalData from '../requests/historicalData';
import useLocationSearch from 'misc/hooks/useLocationSearch';

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
  const locationSearch = useLocationSearch();

  const [historicalData, setHistoricalData] = useState({
    errorMsg: '',
    isFailed: false,
    isFetching: false,
    list: null,
  });

  const [historicalDataParams, setHistoricalDataParams] = useState({
    currencyFrom: locationSearch.curF,
    currencyTo: locationSearch.curT,
    timeMeasure: locationSearch.timeMeasure,
    timeValue: locationSearch.timeVal,
    roundRatio: locationSearch.roundRatio,
  });

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
            count: 0.5,
            text: '30m',
          },
          {
            type: 'hour',
            count: 1,
            text: '1h'
          },
          {
            type: 'hour',
            count: 2,
            text: '2h'
          },
          {
            type: 'hour',
            count: 3,
            text: '3h'
          },
          {
            type: 'hour',
            count: 4,
            text: '4h'
          },
          {
            type: 'hour',
            count: 5,
            text: '5h'
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
          const difference = Math.abs(this.point.close - this.point.open).toFixed(historicalDataParams.roundRatio);
          const differenceStr = `<span style="color:${this.point.color}"><b>${difference}</b></span>`;
          return '' +
            `<span style="color:${this.point.color}"> ● </span>` +
            `<b>${formattedDate}</b>` +
            '<br/>' +
            `<br/>Open: <b>${Number(this.point.open.toFixed(historicalDataParams.roundRatio)).toLocaleString('ru-RU')}</b>` +
            `<br/>Close: <b>${Number(this.point.close.toFixed(historicalDataParams.roundRatio)).toLocaleString('ru-RU')}</b>` +
            '<br/>' +
            '<br/>Difference: ' + differenceStr;
        },
      },
      navigator: {
        enabled: false,
      },
      xAxis: {
        overscroll: 500000,
        range: 4 * 200000,
        gridLineWidth: 1,
        ordinal: false,
      },
      yAxis: {
        alignTicks: true,
        tickAmount: 7,
        crosshair: {
          label: {
            backgroundColor: '#00b0ff',
            enabled: true,
            format: `{value:.${historicalDataParams.roundRatio}f}`,
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
          groupPadding: 0,
          lineWidth: 0.3,
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
          yAxis: 0,
        },
        {
          type: 'line',
          states: {
            inactive: {
              opacity: 1
            },
            hover: {
              enabled: false // Отключает эффект при наведении
            }
          },
          data: [
            [1727437680000, 1.7067],
            [1727605800000, 1.678],
          ],
          enableMouseTracking: false, // Отключает наведение
          showInLegend: false, // Убирает из легенды
          events: {
            legendItemClick: function() {
              return false; // Отключает клик в легенде (если она все же отображается)
            }
          },
          marker: {
            enabled: false // Отключает маркеры точек
          }
        }
      ],
    };
  }, [historicalData.list]);

  useEffect(() => {
    const timestampTo = Date.now();
    console.log('REQUEST_----------------');
    fetchBinanceHistoricalData({
      aggregateInMinutes: 1,
      currencyFrom: historicalDataParams.currencyFrom,
      currencyTo: historicalDataParams.currencyTo,
      timestampTo,
      timestampFrom: getTimestampBefore({
        currentTimestamp: timestampTo,
        timeMeasure: historicalDataParams.timeMeasure,
        value: historicalDataParams.timeValue,
        withMillis: true,
      }),
    });
  }, [
    historicalDataParams.currencyFrom,
    historicalDataParams.currencyTo,
    historicalDataParams.timeMeasure,
    historicalDataParams.timeValue,
  ]);

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