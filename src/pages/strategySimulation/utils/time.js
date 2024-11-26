export const TIME_MEASURES = {
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

const timeMeasureToTimestamp = ({
  timeMeasure,
  value,
  withMillis = true,
}) => {
  const converter = minutesConvertersToTimeMeasures[timeMeasure];
  const minutes = converter(value);
  return minutes * 60 * (withMillis ? 1000 : 1);
};

const getTimestampBefore = ({
  currentTimestamp,
  timeMeasure,
  value,
  withMillis = false,
}) => {
  return currentTimestamp - timeMeasureToTimestamp({
    timeMeasure,
    value,
    withMillis,
  });
};

export default {
  getTimestampBefore,
}