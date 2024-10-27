import axios from 'misc/requests';
import config from 'config';

const startSimulation = ({
  onFailed = () => {},
  onRequest = () => {},
  onSuccess = () => {},
  currencyFrom,
  currencyTo,
  startMoney,
  strategyId,
  timestampFrom,
  timestampTo,
}) => {
  onRequest();
  axios.post(
    `${config.CRYPTO_ANALYSER}/strategySimulator/simulate`,
    {
      currencyFrom,
      currencyTo,
      startMoney,
      strategyId,
      timestampFrom,
      timestampTo,
    },
  )
    .then(result => onSuccess(result))
    .catch(error => onFailed(error));
};

export default {
  startSimulation,
};
