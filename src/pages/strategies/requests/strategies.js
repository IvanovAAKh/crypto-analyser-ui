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

const createStrategy = ({
  onFailed = () => {},
  onRequest = () => {},
  onSuccess = () => {},
  name,
  trendsConfig,
  triggersAndActions,
}) => {
  onRequest();
  axios.post(
    `${config.CRYPTO_ANALYSER}/playStrategy/create`,
    {
      name,
      trendsConfig,
      triggersAndActions,
    },
  )
    .then(strategy => onSuccess(strategy))
    .catch(error => onFailed(error));
};

const updateStrategy = ({
  onFailed = () => {},
  onRequest = () => {},
  onSuccess = () => {},
  id,
  name,
  trendsConfig,
  triggersAndActions,
}) => {
  onRequest();
  axios.post(
    `${config.CRYPTO_ANALYSER}/playStrategy/update`,
    {
      id,
      name,
      trendsConfig,
      triggersAndActions,
    },
  )
    .then(strategy => onSuccess(strategy))
    .catch(error => onFailed(error));
};

const deleteStrategy = ({
  onFailed = () => {},
  onRequest = () => {},
  onSuccess = () => {},
  id,
}) => {
  onRequest();
  axios.post(
    `${config.CRYPTO_ANALYSER}/playStrategy/delete`,
    {
      id,
    },
  )
    .then(response => onSuccess(response))
    .catch(error => onFailed(error));
};

const getPossibleValues = ({
  onFailed = () => {},
  onRequest = () => {},
  onSuccess = () => {},
}) => {
  onRequest();
  axios.get(`${config.CRYPTO_ANALYSER}/playStrategy/possibleValues`)
    .then(response => onSuccess(response))
    .catch(error => onFailed(error));
};

export default {
  createStrategy,
  deleteStrategy,
  getPossibleValues,
  getStrategies,
  updateStrategy,
};
