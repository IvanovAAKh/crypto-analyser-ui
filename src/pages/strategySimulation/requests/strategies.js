import axios from 'misc/requests';
import config from 'config';

const getStrategies = ({
  onFailed = () => {},
  onRequest = () => {},
  onSuccess = () => {},
}) => {
  onRequest();
  axios.get(`${config.CRYPTO_ANALYSER}/playStrategy/_list`)
    .then(list => onSuccess(list))
    .catch(error => onFailed(error));
};

export default {
  getStrategies,
};
