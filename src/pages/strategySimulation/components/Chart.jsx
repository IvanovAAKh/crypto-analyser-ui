import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { createUseStyles } from 'react-jss';
import Highstock from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';

import useTheme from 'misc/hooks/useTheme';

import timeUtils, { TIME_MEASURES } from '../utils/time';
import trendUtils from '../utils/trend';

const getClasses = createUseStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${theme.spacing(2)}px`,
    height: '100%',
  },
}));

const chartNames = {
  historicalData: 'Historical Data',
  transactions: 'Transactions',
  simulationDataPointTrend: 'Simulation Data Point Trend',
  customTrend: 'Custom Trend',
};

const pointColors = {
  positive: 'rgba(0, 210, 45, 0.3)',    // #00d22d
  negative: 'rgba(255, 127, 127, 0.3)', // #FF7F7F
  selected: 'rgba(0, 0, 255, 0.3)',     // #0000FF
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

const ROUND_RATIO = 5;

const updateChartSeries = ({
  oldSeries,
  newSeries,
}) => {
  oldSeries.setData([], true);
  oldSeries.setData(newSeries, true);
};

const updateChartHistoricalSeries = ({
  chart,
  series: newSeries,
}) => {
  const series = chart.series[0];
  updateChartSeries({
    oldSeries: series,
    newSeries,
  })
};

const updateChartSimulationPointsSeries = ({
  chart,
  series: newSeries,
}) => {
  const series = chart.series[1];
  updateChartSeries({
    oldSeries: series,
    newSeries,
  })
};

const updateChartSimulationPointTrendSeries = ({
  chart,
  series: newSeries,
}) => {
  const series = chart.series[2];
  updateChartSeries({
    oldSeries: series,
    newSeries,
  })
};

const updateChartCustomPointTrendSeries = ({
  chart,
  series: newSeries,
}) => {
  const series = chart.series[3];
  updateChartSeries({
    oldSeries: series,
    newSeries,
  })
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

const buildSimulationPointsChartSeries = ({
  simulationData,
}) => {
  if (!simulationData) {
    return [];
  }
  return simulationData.map(item => ({
    x: item.state.currentTimestamp,
    y: item.state.currentPointPrice,
    comment: item.action.comment,
    color: item.action.type === 'buy'
      ? `rgba(0, 150, 0, ${item.action.isRequested ? 0.3 : 1})`
      : `rgba(255, 0, 0, ${item.action.isRequested ? 0.3 : 1})`,
    walletCurrency: item.wallet.currency,
    walletMoney: item.wallet.money,
    walletReserve: item.wallet.reserve,
  }));
};

const buildSimulationPointTrendChartSeries = ({
  simulationDataPoint,
}) => {
  if (!simulationDataPoint) {
    return [];
  }
  return simulationDataPoint.trends
    .reduce((acc, trend) => {
      trend.forEach(item => {
        acc.push([item.xStart, item.yStart]);
        acc.push([item.xEnd, item.yEnd]);
        acc.push([null, null]);
      });
      return acc;
    }, []);
};

const buildZipTrendChartSeries = ({
  dataPoint,
  historicalData,
  timeBefore = {
    value: 1,
    measure: TIME_MEASURES.days,
  },
  zipPartsCount = 6,
}) => {
  if (!dataPoint || !historicalData) {
    return [];
  }
  const timestampTo = dataPoint.timestamp;
  const timestampFrom = timeUtils.getTimestampBefore({
    currentTimestamp: timestampTo,
    timeMeasure: timeBefore.measure,
    value: timeBefore.value,
    withMillis: true,
  });
  const dataPart = historicalData
    .filter(item => item.timestamp >= timestampFrom && item.timestamp <= timestampTo);
  const zipTrends = trendUtils.buildZipTrends({
    data: dataPart,
    piecesCount: zipPartsCount,
  });
  return zipTrends.reduce((acc, trend) => {
    trend.forEach(item => {
      acc.push([item.xStart, item.yStart]);
      acc.push([item.xEnd, item.yEnd]);
      acc.push([null, null]);
    });
    return acc;
  }, []);
};

const buildStrategyTrendChartSeries = ({
  dataPoint,
  historicalData,
  strategy,
}) => {
  if (!dataPoint || !historicalData) {
    return [];
  }
  const timestampTo = dataPoint.timestamp;
  const trends = strategy.trendsConfig.trends.map(trend => {
    const timestampFrom = timeUtils.getTimestampBefore({
      currentTimestamp: timestampTo,
      timeMeasure: trend.measure,
      value: trend.value,
      withMillis: true,
    });
    const dataPart = historicalData
      .filter(item => item.timestamp >= timestampFrom && item.timestamp <= timestampTo);
    return trendUtils.buildTrend({
      data: dataPart,
    });
  });
  console.log(trends);
  return trends.reduce((acc, trend) => {
    trend.forEach(item => {
      acc.push([item.xStart, item.yStart]);
      acc.push([item.xEnd, item.yEnd]);
      acc.push([null, null]);
    });
    return acc;
  }, []);
};

const Chart = ({
  historicalData,
  simulationData,
  strategy,
}) => {
  const chartRef = useRef(null);
  const containerRef = useRef(null);
  const { theme } = useTheme();
  const classes = getClasses({ theme });
  const [state, setState] = useState({
    componentDidMount: false,
    clickedSimulationDataPoint: null,
    clickedHistoricalDataPoint: null,
  });

  const handleSimulationDataPointClick = ({
    point,
    simulationData: inputSimulationData,
  }) => {
    const foundItem = inputSimulationData.find(item => item.state.currentTimestamp === point.x);
    console.log(foundItem);
    setState(prevState => ({
      ...prevState,
      clickedSimulationDataPoint: foundItem,
    }))
  };

  const handleHistoricalDataPointClick = ({
    point,
    historicalData: inputHistoricalData,
  }) => {
    const foundItem = inputHistoricalData.find(item => item.timestamp === point.x);
    setState(prevState => ({
      ...prevState,
      clickedHistoricalDataPoint: foundItem,
    }));
  };

  const onClickChartArea = useCallback(function() {
    setState(prevState => ({
      ...prevState,
      clickedHistoricalDataPoint: null,
      clickedSimulationDataPoint: null,
    }));
  }, [simulationData, historicalData]);

  const onClickSimulationDataPoint = useCallback(function() {
    handleSimulationDataPointClick({
      point: this,
      simulationData,
    });
  }, [simulationData]);

  const onClickHistoricalDataPoint = useCallback(function() {
    handleHistoricalDataPointClick({
      point: this,
      historicalData,
    });
  }, [historicalData]);

  const chart = useMemo(() => {
    if (!state.componentDidMount) {
      return null;
    }
    return {
      chart: {
        height: containerRef.current.getBoundingClientRect().height,
        events: {
          click: onClickChartArea,
          load: function () {
            // Выполнить максимальное отдаление
            this.xAxis[0].setExtremes(
              this.xAxis[0].dataMin,
              this.xAxis[0].dataMax
            );
          },
        },
      },
      rangeSelector: {
        selected: 0,
      },
      time: {
        timezone: 'Europe/Kiev',
      },
      plotOptions: {
        series: {
          stickyTracking: false, // Убираем область захвата тултипа
        },
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
          let result = '';
          if (this.series.name === chartNames.historicalData) {
            const difference = Math.abs(this.point.close - this.point.open).toFixed(ROUND_RATIO);
            const differenceStr = `<span style="color:${this.point.color}"><b>${difference}</b></span>`;
            result = '' +
              `<span style="color:${this.point.color}"> ● </span>` +
              `<b>${formattedDate}</b>` +
              '<br/>' +
              `<br/>Open: <b>${Number(this.point.open.toFixed(ROUND_RATIO)).toLocaleString('ru-RU')}</b>` +
              `<br/>Close: <b>${Number(this.point.close.toFixed(ROUND_RATIO)).toLocaleString('ru-RU')}</b>` +
              '<br/>' +
              '<br/>Difference: ' + differenceStr;
          } else if (this.series.name === chartNames.transactions) {
            result = '' +
              `<span style="color:${this.point.color}"> ● </span>` +
              `<b>${this.point.comment}</b> ${formattedDate}` +
              '<br/>' +
              `<br/>Price: <b>${Number(this.y.toFixed(ROUND_RATIO)).toLocaleString('ru-RU')}</b>` +
              '<br/>------------------------------------------' +
              `<br/>Money: <b>${Number(this.point.walletMoney.toFixed(ROUND_RATIO)).toLocaleString('ru-RU')}</b>` +
              `<br/>Currency: <b>${Number(this.point.walletCurrency.toFixed(ROUND_RATIO)).toLocaleString('ru-RU')}</b>` +
              `<br/>Reserve: <b>${Number(this.point.walletReserve.toFixed(ROUND_RATIO)).toLocaleString('ru-RU')}</b>` +
              `<br/>Total: <b>${Number((+this.point.walletReserve + +this.point.walletMoney).toFixed(ROUND_RATIO)).toLocaleString('ru-RU')}</b>` +
              '';
          }
          return result;
        },
        hideDelay: 0,
        split: false,
        shared: false, // Тултип не общий для всех точек
        snap: 1
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
            format: `{value:.${ROUND_RATIO}f}`,
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
          },
          point: {
            events: {
              click: onClickHistoricalDataPoint,
            },
          },
          grouping: true,
          groupPadding: 0,
          lineWidth: 0.3,
          name: chartNames.historicalData,
          tooltip: {
            distance: 20,
          },
          type: 'candlestick',
          color: pointColors.negative,
          upColor: pointColors.positive,
          states: {
            hover: {
              enabled: false,
            },
            inactive: {
              enabled: false,
            },
          },
        },
        {
          type: 'scatter', // Точки без линий
          marker: {
            radius: 4, // Размер точек
            symbol: 'circle', // Форма точек
          },
          name: chartNames.transactions,
          point: {
            events: {
              click: onClickSimulationDataPoint,
            },
          },
        },
        {
          type: 'line',
          dataGrouping: {
            enabled: false,
          },
          name: chartNames.simulationDataPointTrend,
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
          color: '#000000',
          name: chartNames.customTrend,
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
  }, [
    state.componentDidMount,
    onClickChartArea,
    onClickSimulationDataPoint,
    onClickHistoricalDataPoint,
  ]);

  const historicalChartSeries = useMemo(
    () =>  buildHistoricalChartSeries({
      historicalData,
    }),
    [historicalData],
  );

  const simulationPointsChartSeries = useMemo(
    () => buildSimulationPointsChartSeries({
      simulationData,
    }),
    [simulationData],
  );

  const simulationPointTrendChartSeries = useMemo(
    () => buildSimulationPointTrendChartSeries({
      simulationDataPoint: state.clickedSimulationDataPoint,
    }),
    [state.clickedSimulationDataPoint],
  );

  const customPointTrendChartSeries = useMemo(
    () => {
      if (strategy) {
        return buildStrategyTrendChartSeries({
          dataPoint: state.clickedHistoricalDataPoint,
          historicalData,
          strategy,
        });
      } else {
        return buildZipTrendChartSeries({
          dataPoint: state.clickedHistoricalDataPoint,
          historicalData,
          timeBefore: {
            measure: TIME_MEASURES.hours,
            value: 4,
          },
          zipPartsCount: 1,
        });
      }
    },
    [state.clickedHistoricalDataPoint, historicalData, strategy],
  );

  useEffect(() => {
    if (state.componentDidMount && historicalChartSeries) {
      updateChartHistoricalSeries({
        chart: chartRef.current.chart,
        series: historicalChartSeries,
      });
    }
  }, [historicalChartSeries, state.componentDidMount]);

  useEffect(() => {
    if (state.componentDidMount && simulationPointsChartSeries) {
      updateChartSimulationPointsSeries({
        chart: chartRef.current.chart,
        series: simulationPointsChartSeries,
      });
    }
  }, [simulationPointsChartSeries, state.componentDidMount]);

  useEffect(() => {
    if (state.componentDidMount && simulationPointTrendChartSeries) {
      updateChartSimulationPointTrendSeries({
        chart: chartRef.current.chart,
        series: simulationPointTrendChartSeries,
      });
    }
  }, [simulationPointTrendChartSeries, state.componentDidMount]);

  useEffect(() => {
    if (state.componentDidMount && customPointTrendChartSeries) {
      updateChartCustomPointTrendSeries({
        chart: chartRef.current.chart,
        series: customPointTrendChartSeries,
      });
    }
  }, [customPointTrendChartSeries, state.componentDidMount]);

  useEffect(() => {
    setState(prevState => ({
      ...prevState,
      componentDidMount: true,
    }));
  }, []);

  return (
    <div
      className={classes.container}
      ref={containerRef}
    >
      {chart && (
        <HighchartsReact
          ref={chartRef}
          constructorType="stockChart"
          highcharts={Highstock}
          options={chart}
        />
      )}
    </div>
  );
};

export default Chart;