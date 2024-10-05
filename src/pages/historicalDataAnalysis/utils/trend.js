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

const calculateTrend = ({
  data,
  xStart,
  xEnd,
  yStart,
  yEnd,
}) => {
  const iterationsCount = 50;
  const height = Math.abs(yEnd - yStart);
  const aMin = -(height * 5) + height;
  const aMax = height * 5;
  const bMin = aMin;
  const bMax = aMax;
  const step = (aMax - aMin) / iterationsCount;
  let bestA = 0;
  let bestB = 0;
  let currentA = aMin;
  let currentB = bMin;
  let bestIntersectionsCount = 0;
  let confidencePercent = 0;
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
        confidencePercent = intersectionsCount / data.length * 100;
        bestA = currentA;
        bestB = currentB;
      }
      currentB = currentB + step;
    }
    currentA = currentA + step;
    currentB = bMin;
  }
  return {
    confidencePercent,
    xStart,
    xEnd,
    yStart: bestA + yStart,
    yEnd: bestB + yStart,
  };
};

export default {
  calculateTrend,
}
