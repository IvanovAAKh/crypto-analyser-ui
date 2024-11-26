const formula = ({
  a,
  b,
  x,
  xStart,
  xEnd,
  yStart,
  yEnd,
}) => yStart + ((yEnd - yStart) * ((x - xStart) / (xEnd - xStart)) * (b / (yEnd - yStart))) + (a * (1 - ((x - xStart) / (xEnd - xStart))));

const getIntersectionsCount = ({
  data,
  a,
  b,
  xStart,
  xEnd,
  yStart,
  yEnd,
}) => {
  return data.reduce((acc, item) => {
    const y = formula({
      a,
      b,
      x: item.timestamp,
      xStart,
      xEnd,
      yStart,
      yEnd,
    });
    const minY = Math.min(item.close, item.open);
    const maxY = Math.max(item.close, item.open);
    if (y >= minY && y <= maxY) {
      return acc + 1;
    }
    return acc;
  }, 0)
};

const SHIFT_DIRECTIONS = {
  down: 'down',
  up: 'up',
};

const prolongateTrend = ({
  trend,
  timestampTo,
  yStart,
  yEnd,
}) => {
  const newTrend = {
    ...trend,
    xEnd: timestampTo,
    yEnd: formula({
      a: trend.a,
      b: trend.b,
      x: timestampTo,
      xStart: trend.xStart,
      xEnd: trend.xEnd,
      yStart,
      yEnd,
    }),
  };
  return newTrend;
};

const shiftTrend = ({
  confidencePercent,
  direction,
  data,
  a,
  b,
  step,
  xStart,
  xEnd,
  yStart,
  yEnd,
}) => {
  const confidenceShiftPercent = 90;
  const confidencePercentLimit = confidencePercent - (confidencePercent * confidenceShiftPercent / 100);
  let currentConfidencePercent = confidencePercent;
  let currentA = a;
  let currentB = b;
  let bestA;
  let bestB;
  let bestConfidencePercent;
  while (currentConfidencePercent > confidencePercentLimit) {
    bestA = currentA;
    bestB = currentB;
    bestConfidencePercent = currentConfidencePercent;
    currentA = direction === SHIFT_DIRECTIONS.down
      ? currentA - step
      : currentA + step;
    currentB = direction === SHIFT_DIRECTIONS.down
      ? currentB - step
      : currentB + step;
    const intersectionsCount = getIntersectionsCount({
      data,
      a: currentA,
      b: currentB,
      xStart,
      xEnd,
      yStart,
      yEnd,
    });
    currentConfidencePercent = intersectionsCount / data.length * 100;
  }
  return {
    a: bestA,
    b: bestB,
    confidencePercent: bestConfidencePercent,
    xStart,
    xEnd,
    yStart: bestA + yStart,
    yEnd: bestB + yStart,
  };
};

const calculateTrend = ({
  data,
  xStart,
  xEnd,
  yStart,
  yEnd,
  predictionTimestampTo,
}) => {
  const iterationsCount = 100;
  const threshold = 1;
  const height = Math.abs(yEnd - yStart);
  const aMin = -(height * threshold) + height;
  const aMax = height * threshold;
  const bMin = aMin;
  const bMax = aMax;
  const step = (aMax - aMin) / iterationsCount;
  let bestA = 0;
  let bestB = 0;
  let currentA = aMin;
  let currentB = bMin;
  let bestIntersectionsCount = 0;
  while (currentA <= aMax) {
    while (currentB <= bMax) {
      const intersectionsCount = getIntersectionsCount({
        data,
        a: currentA,
        b: currentB,
        xStart,
        xEnd,
        yStart,
        yEnd,
      });
      if (intersectionsCount > bestIntersectionsCount) {
        bestIntersectionsCount = intersectionsCount;
        bestA = currentA;
        bestB = currentB;
      }
      currentB = currentB + step;
    }
    currentA = currentA + step;
    currentB = bMin;
  }
  const confidencePercent = bestIntersectionsCount / data.length * 100;
  const trendDown = shiftTrend({
    confidencePercent,
    direction: SHIFT_DIRECTIONS.down,
    data,
    a: bestA,
    b: bestB,
    step: step / 2,
    xStart,
    xEnd,
    yStart,
    yEnd,
  });
  const trendMiddle = {
    a: bestA,
    b: bestB,
    confidencePercent,
    xStart,
    xEnd,
    yStart: bestA + yStart,
    yEnd: bestB + yStart,
  };
  const trendUp = shiftTrend({
    confidencePercent,
    direction: SHIFT_DIRECTIONS.up,
    data,
    a: bestA,
    b: bestB,
    step: step /2,
    xStart,
    xEnd,
    yStart,
    yEnd,
  });
  const anglePercent = (bestB - bestA) * 100 / (aMax - aMin);
  const trend = [trendDown, trendMiddle, trendUp].map(trendPart => ({
    ...trendPart,
    anglePercent,
  }));
  return predictionTimestampTo
    ? trend.map(item => prolongateTrend({
      timestampTo: predictionTimestampTo,
      trend: item,
      yStart,
      yEnd,
    }))
    : trend;
};

const splitArrayByPortions = (arr, portionsCount) => {
  const portionLength = Math.ceil(arr.length / portionsCount);
  const portions = [];
  let portion = [];
  for(let i = arr.length - 1; i >= 0; i--) {
    if (portion.length === portionLength) {
      portions.push(portion.reverse());
      portion = [];
    }
    portion.push(arr[i]);
  }
  if (portion.length) {
    portions.push(portion);
  }
  return portions.reverse();
};

const getMinMaxPrices = (historicalData) => {
  let minPrice = 9999999;
  let maxPrice = -999999;
  historicalData.forEach(point => {
    if (point.low < minPrice) {
      minPrice = point.low;
    }
    if (point.high > maxPrice) {
      maxPrice = point.high
    }
  });
  return {
    min: minPrice,
    max: maxPrice,
  };
};

const buildZipTrends = ({
  data,
  piecesCount
}) => {
  const trends = splitArrayByPortions(data, piecesCount)
    .map(dataPart => {
      const firstPoint = dataPart[0];
      const lastPoint = dataPart.at(-1);
      const minMaxPrices = getMinMaxPrices(dataPart);
      return calculateTrend({
        data: dataPart,
        xStart: firstPoint.timestamp,
        xEnd: lastPoint.timestamp,
        yStart: minMaxPrices.min,
        yEnd: minMaxPrices.max,
      });
    });
  return trends;
};

const buildTrend = ({
  data,
}) => {
  const firstPoint = data[0];
  const lastPoint = data.at(-1);
  const minMaxPrices = getMinMaxPrices(data);
  return calculateTrend({
    data,
    xStart: firstPoint.timestamp,
    xEnd: lastPoint.timestamp,
    yStart: minMaxPrices.min,
    yEnd: minMaxPrices.max,
  });
};

export default {
  buildTrend,
  buildZipTrends,
}
