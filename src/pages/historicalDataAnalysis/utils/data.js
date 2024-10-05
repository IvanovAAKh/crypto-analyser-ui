const getDataInterval = ({
  data,
  timestampFrom,
  timestampTo,
}) => {
  if (!data) {
    return data;
  }
  return data.filter(item => item.timestamp >= timestampFrom && item.timestamp <= timestampTo);
};

export default {
  getDataInterval,
}