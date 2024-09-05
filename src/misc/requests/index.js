import axios from 'axios';

const addAxiosInterceptors = () => {
  axios.interceptors.response.use(
    (response) => response.data,
    (error) => {
      throw error.response.data;
    }
  );
};

export {
  addAxiosInterceptors,
};

export default axios;
