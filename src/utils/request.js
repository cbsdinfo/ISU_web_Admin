import Vue from 'vue';
import axios from 'axios'
import store from '../store'
import { setToken, getToken,removeToken } from '@/utils/auth'
import $api from '../api/index.js'
import router from '../router/index'

const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
  timeout: 100000
})

service.interceptors.request.use(config => {
  if (store.getters.token) {
    config.headers['Authorization'] = 'Bearer ' + getToken()
  }

  return config
}, error => {
  Promise.reject(error)
})

service.interceptors.response.use(
  (response) => {
    console.log(response);
    const { code, message } = response.data;
    if (code === 200 ) {
      return response.data;
    } else  {
      console.log("code !== 200");
      Vue.prototype.$swal.fire({
        icon: 'error',
        title: message,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
      });
    }
  },
  (error) => {
    const { response } = error;
    if (response) {
      errorHandle(response.status, response);
      return Promise.reject(error);
    } else {
      return Promise.reject(error)
    }
  });

const errorHandle = (status, response) => {
  switch (status) {
    case 401:
      removeToken()
      Vue.prototype.$swal.fire({
        icon: 'error',
        title: "登入時間超時,憑證失效",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
      });
      router.push('/login')
      break;
    case 400:
      Vue.prototype.$swal.fire({
        icon: 'error',
        title: response.data.errors[0]?.OrganizationIds[0] || response.data.title,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
      });
      break;
    case 404:
      console.log(response)
      break;

    default:
      console.log(response);
      break;
  }
}
// eslint-disable-next-line
const refreshNewToken = (response, error) => {
  const skipApiList = ['/check/getusername']
  if (skipApiList.includes(response.config.url)) return

  $api.login.refresh(`"${getToken()}"`).then((res) => {
    if (!res) return;
    const { code, token } = res;
    console.log('get new token', token);
    if (code === 200) {
      setToken(token);
      store.commit('SET_TOKEN', token)

      error.config.__isRetryRequest = true;
      error.config.headers.Authorization = `Bearer ${token}`;

      return axios(error.config);
    } else {
      window.$nuxt.router.push("/login")
    }
  })
}

export default service