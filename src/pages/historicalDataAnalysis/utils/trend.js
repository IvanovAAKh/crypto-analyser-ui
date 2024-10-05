const formula = ({
  a,
  b,
  x,
  xStart,
  xEnd,
  yStart,
  yEnd,
}) => yStart + ((yEnd - yStart) * ((x - xStart) / (xEnd - xStart)) * (b / (yEnd - yStart))) + (a * (1 - ((x - xStart) / (xEnd - xStart))));

const calculateTrend = ({
  data,
  xStart,
  xEnd,
  yStart,
  yEnd,
}) => {
  // const xStart = data[0].x;
  // const xEnd
  return;
};

export default {
  calculateTrend,
}
