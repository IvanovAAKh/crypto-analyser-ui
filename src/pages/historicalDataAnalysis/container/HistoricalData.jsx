import React, {useEffect, useMemo, useRef, useState} from 'react';
import { createUseStyles } from 'react-jss';
import Highstock from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';

import requestsHistoricalData from '../requests/historicalData';
import useLocationSearch from 'misc/hooks/useLocationSearch';
import useTheme from 'misc/hooks/useTheme';
import Typography from 'components/Typography';

import dataUtils from '../utils/data';

const getClasses = createUseStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${theme.spacing(2)}px`,
    height: '100%',
  },
  input: {
    width: '300px',
  }
}));

const pointColors = {
  positive: '#00d22d',
  negative: '#FF7F7F',
  selected: '#0000FF',
};

const historicalDataBinanceToUI = (response) => {
  const list = response.map(([timestamp, open, high, low, close]) => ({
    high: Number(high),
    close: Number(close),
    low: Number(low),
    open: Number(open),
    timestamp,
  }));
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

const historicalDataFields = {
  close: 'close',
  high: 'high',
  low: 'low',
  open: 'open',
  timestamp: 'timestamp',
};

const historicalDataIndexesToFields = {
  [historicalDataFields.close]: 4,
  [historicalDataFields.high]: 2,
  [historicalDataFields.low]: 3,
  [historicalDataFields.open]: 1,
  [historicalDataFields.timestamp]: 0,
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

const updateChartHistoricalSeries = ({
  chart,
  series: newSeries,
}) => {
  const series = chart.series[0];
  series.setData(newSeries, true);
};

const updateChartRectangleSeries = ({
  chart,
  series: newSeries,
}) => {
  const series = chart.series[1];
  series.setData(newSeries, true);
};

const updateChartTrendSeries = ({
  chart,
  series: newSeries,
}) => {
  const series = chart.series[2];
  series.setData(newSeries, true);
};

const buildTrendParams = ({
  selectedPoints,
  historicalData,
}) => {
  const orderedSelectedPoints = selectedPoints
    .sort((pointA, pointB) => pointA.x - pointB.x);
  const xStart = orderedSelectedPoints[0].x;
  const xEnd = orderedSelectedPoints[1].x;
  const selectedInterval = dataUtils.getDataInterval({
    data: historicalData,
    timestampFrom: xStart,
    timestampTo: xEnd,
  });
  let yStart = 0;
  let yEnd = 9999999;
  selectedInterval.forEach(item => {
    if (item.low < yEnd) {
      yEnd = item.low;
    }
    if (item.high > yStart) {
      yStart = item.high;
    }
  });
  return {
    xStart,
    xEnd,
    yStart,
    yEnd,
  };
};

const buildHistoricalChartSeries = ({
  historicalData,
}) => {
  if (!historicalData) {
    return [];
  }
  return historicalData.map(item => {
    const result = [];
    Object
      .values(historicalDataFields)
      .forEach(field => {
        result[historicalDataIndexesToFields[field]] = item[field];
      });
    return result;
  });
};

const buildRectangleChartSeries = ({
  trendParams,
}) => {
  console.log(trendParams);
  if (!trendParams) {
    return [];
  }
  const {
    xStart,
    xEnd,
    yStart,
    yEnd,
  } = trendParams;
  return [
    [xStart, yStart],
    [xStart, yEnd],
    [xEnd, yEnd],
    [xEnd, yStart],
    [xStart, yStart],
  ];
};

const buildTrendChartSeries = ({
  trend,
}) => {
  if (!trend) {
    return [];
  }
  return [];
};

function HistoricalData() {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const { theme } = useTheme();
  const classes = getClasses({ theme });
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

  const [state, setState] = useState({
    componentDidMount: false,
    selectedPoints: [],
    trendParams: null,
    trend: null,
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
      onRequest: () => {
        setHistoricalData({
          ...historicalData,
          isFailed: false,
          isFetching: true,
        });
        setState({
          ...state,
          selectedPoints: [],
        });
      },
      onSuccess: (response) => setHistoricalData({
        ...historicalData,
        isFetching: false,
        list: historicalDataBinanceToUI(response),
      }),
      timestampTo,
      timestampFrom,
    });
  };

  const onClickPoint = (inputPoint) => {
    setState((prevState) => {
      const selectedPointIds = prevState.selectedPoints.map(point => point.x);
      let pointsToRemove = [];
      let newSelectedPoints = [];
      if (selectedPointIds.includes(inputPoint.x)) {
        newSelectedPoints = prevState.selectedPoints
          .filter(point => point.x !== inputPoint.x);
        pointsToRemove.push(inputPoint);
      } else if (prevState.selectedPoints.length < 2) {
        newSelectedPoints = prevState.selectedPoints.concat(inputPoint);
      } else {
        pointsToRemove = [...prevState.selectedPoints];
        newSelectedPoints = [inputPoint];
      }
      newSelectedPoints.forEach(point => {
        point.update({
          color: 'blue',
        });
      });
      pointsToRemove.forEach(point => {
        point.update({
          color: point.options.open < point.options.close
            ? pointColors.negative
            : pointColors.positive,
        });
      });
      return ({
        ...prevState,
        selectedPoints: newSelectedPoints,
      });
    });
  };

  const chart = useMemo(() => {
    if (!state.componentDidMount) {
      return null;
    }
    return {
      chart: {
        height: containerRef.current?.getBoundingClientRect().height,
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
            enabled: false,
            // units: [
            //   [
            //     'minute',
            //     [1],
            //   ],
            // ],
          },
          grouping: true,
          groupPadding: 0,
          lineWidth: 0.3,
          tooltip: {
            distance: 20,
          },
          type: 'candlestick',
          color: pointColors.negative,
          upColor: pointColors.positive,
          point: {
            events: {
              click: function(e) {
                onClickPoint(this);
              }
            },
          },
        },
        {
          type: 'line',
          dataGrouping: {
            enabled: false,
          },
          states: {
            inactive: {
              opacity: 1
            },
            hover: {
              enabled: false // Отключает эффект при наведении
            }
          },
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
        },
        {
          type: 'line',
          dataGrouping: {
            enabled: false,
          },
          states: {
            inactive: {
              opacity: 1
            },
            hover: {
              enabled: false // Отключает эффект при наведении
            }
          },
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
        },
      ],
    };
  }, [state.componentDidMount]);

  const historicalChartSeries = useMemo(
    () =>  buildHistoricalChartSeries({
      historicalData: historicalData.list,
    }),
    [historicalData.list],
  );

  const trendChartSeries = useMemo(
    () => buildTrendChartSeries({
      trend: state.trend,
    }),
    [state.trend],
  );

  const rectangleChartSeries = useMemo(
    () => buildRectangleChartSeries({
      trendParams: state.trendParams,
    }),
    [state.trendParams],
  );

  useEffect(() => {
    let trendParams = null;
    if (state.selectedPoints.length === 2) {
      trendParams = buildTrendParams({
        selectedPoints: state.selectedPoints,
        historicalData: historicalData.list,
      });
    }
    setState({
      ...state,
      trendParams,
    });
  }, [state.selectedPoints]);

  useEffect(() => {
    if (state.componentDidMount && historicalChartSeries) {
      updateChartHistoricalSeries({
        chart: chartRef.current.chart,
        series: historicalChartSeries,
      });
    }
  }, [historicalChartSeries, state.componentDidMount]);

  useEffect(() => {
    if (state.componentDidMount && rectangleChartSeries) {
      updateChartRectangleSeries({
        chart: chartRef.current.chart,
        series: rectangleChartSeries,
      });
    }
  }, [rectangleChartSeries, state.componentDidMount]);

  useEffect(() => {
    if (state.componentDidMount && trendChartSeries) {
      updateChartTrendSeries({
        chart: chartRef.current.chart,
        series: trendChartSeries,
      });
    }
  }, [trendChartSeries, state.componentDidMount]);

  useEffect(() => {
    const timestampTo = Date.now();
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

  useEffect(() => {
    setState({
      ...state,
      componentDidMount: true,
    });
  }, []);

  return (
    <div className={classes.container}>
      <Typography>
        {`Selected points: ${state.selectedPoints.join(', ')}`}
      </Typography>
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
            ref={chartRef}
          />
        )}
      </div>
    </div>
  );
}

export default HistoricalData;