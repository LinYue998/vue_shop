// 将axios进行二次封装
import axios from 'axios'

let service = axios.create({
    //baseURL会自动加载接口地址上
    baseURL: 'http://127.0.0.1:8888/api/private/v1/',
    //指定请求超时的毫秒数，请求花费的时间超过timeout设置的时间，请求则会被中断
    // timeout: 1000,
    // `withCredentials` 表示跨域请求时是否需要使用凭证
    // withCredentials: true
});

// 导出
export default service